from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend setup
try:
    import resend
    RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
    if RESEND_API_KEY:
        resend.api_key = RESEND_API_KEY
except ImportError:
    resend = None

SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', '')
RESEND_AUDIENCE_ID = os.environ.get('RESEND_AUDIENCE_ID', '')

# Google Calendar setup
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI', '')

# Google Calendar service
google_calendar_service = None
try:
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    from google.auth.transport.requests import Request as GoogleRequest
    GOOGLE_CALENDAR_AVAILABLE = True
except ImportError:
    GOOGLE_CALENDAR_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning("Google Calendar libraries not available")

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class BookingCreate(BaseModel):
    service: str
    property_size: int
    condition: str
    additional_services: List[str] = []
    preferred_date: str
    preferred_time: str
    alternative_date: Optional[str] = None
    customer_name: str
    customer_phone: str
    customer_email: EmailStr
    property_address: str
    notes: Optional[str] = ""
    estimated_price: int
    gdpr_consent: bool = True
    coupon_code: Optional[str] = None

class Booking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    service: str
    property_size: int
    condition: str
    additional_services: List[str] = []
    preferred_date: str
    preferred_time: str
    alternative_date: Optional[str] = None
    customer_name: str
    customer_phone: str
    customer_email: str
    property_address: str
    notes: Optional[str] = ""
    estimated_price: int
    final_price: Optional[int] = None
    discount_applied: int = 0
    coupon_code: Optional[str] = None
    status: str = "pending"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PriceCalculation(BaseModel):
    service: str
    property_size: int
    condition: str
    additional_services: List[str] = []

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    message: str

class EmailSubscription(BaseModel):
    email: EmailStr

class CouponValidation(BaseModel):
    code: str

# ============== COUPON CONFIG ==============

VALID_COUPONS = {}  # Will be populated dynamically

def generate_coupon_code():
    """Generate a unique coupon code"""
    import random
    import string
    return 'SEKNU' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))

# ============== PRICING CONFIG ==============

SERVICE_PRICES = {
    # Sekání trávy (základní služby)
    "lawn_mowing": 2,              # Kč/m² - bez hnojení
    "lawn_with_fertilizer": 3.33,  # Kč/m² - s hnojením
    "overgrown": 3.5,              # Kč/m² - přerostlá tráva (3-4 Kč)
    
    # Fixní ceny
    "garden_work": 350,            # Zahradnické práce - 300-450 Kč/hod (průměr)
    "debris_hourly": 400,          # Odvoz odpadu - 400 Kč/hod
    
    "other": 0
}

# Odstupňované ceny balíčků podle velikosti plochy
PACKAGE_TIERED_PRICING = {
    "spring_package": {  # Jarní balíček
        "small": 12,     # do 200 m²
        "medium": 10,    # 200-500 m²
        "large": 8.5,    # 500+ m²
    },
    "summer_package": {  # Letní balíček (měsíčně)
        "small": 4,
        "medium": 3.5,
        "large": 3,
    },
    "autumn_package": {  # Podzimní balíček
        "small": 14,
        "medium": 12,
        "large": 10,
    },
    "winter_snow": {     # Zimní balíček
        "small": 10,
        "medium": 8,
        "large": 8,
    },
    "vip_annual": {      # Celoroční VIP (roční cena za m²)
        "small": 22,
        "medium": 20,
        "large": 18,
    },
}

def get_size_tier(size):
    """Determine pricing tier based on property size"""
    if size <= 200:
        return "small"
    elif size <= 500:
        return "medium"
    else:
        return "large"

CONDITION_MULTIPLIERS = {
    "normal": 1.0,
    "overgrown": 1.5,
    "very_neglected": 2.0
}

# Příplatky za m²
ADDITIONAL_SERVICE_PRICES_PER_M2 = {
    "mulching": 0.5,               # Mulčování +0,5 Kč/m²
    "salting": 0.5,                # Solení +0,5 Kč/m²
    "snow_clearing": 2,            # Dočištění sněhu 2 Kč/m²
}

# Fixní příplatky
ADDITIONAL_SERVICE_PRICES = {
    "debris_removal": 400,         # Odvoz odpadu - 400 Kč/hod
    "vertikutace": 500,            # Vertikutace extra
    "hnojeni": 200,                # Hnojení extra
}

SERVICE_NAMES_CZ = {
    "lawn_mowing": "Sekání trávy (bez hnojení)",
    "lawn_with_fertilizer": "Sekání trávy (s hnojením)",
    "overgrown": "Hrubé sekání (přerostlá tráva)",
    "spring_package": "🌸 Jarní balíček – Restart trávníku",
    "summer_package": "☀️ Letní balíček – Údržba a hustota",
    "autumn_package": "🍂 Podzimní balíček – Příprava na zimu",
    "winter_snow": "❄️ Zimní balíček – Úklid sněhu",
    "vip_annual": "🌀 Celoroční VIP servis",
    "garden_work": "Zahradnické práce (ruční)",
    "debris_hourly": "Odvoz odpadu (hodinová sazba)",
    "other": "Jiná služba"
}

TIME_NAMES_CZ = {
    "morning": "Dopoledne (8-12h)",
    "afternoon": "Odpoledne (12-16h)",
    "anytime": "Kdykoliv"
}

# ============== EMAIL TEMPLATES ==============

def get_customer_email_html(booking: Booking) -> str:
    service_name = SERVICE_NAMES_CZ.get(booking.service, booking.service)
    time_name = TIME_NAMES_CZ.get(booking.preferred_time, booking.preferred_time)
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222222; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3FA34D, #2d7a38); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✓ Potvrzení rezervace</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">SeknuTo.cz</p>
        </div>
        
        <div style="background: #f8fff9; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="font-size: 16px;">Dobrý den <strong>{booking.customer_name}</strong>,</p>
            <p>Děkujeme za rezervaci! Vaše objednávka byla úspěšně přijata.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h3 style="color: #3FA34D; margin-top: 0;">📋 Detaily rezervace</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Služba:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">{service_name}</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Datum:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">{booking.preferred_date}</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Čas:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">{time_name}</td></tr>
                    <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Adresa:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">{booking.property_address}</td></tr>
                    <tr><td style="padding: 8px 0;"><strong>Odhadovaná cena:</strong></td><td style="padding: 8px 0; color: #3FA34D; font-weight: bold;">{booking.estimated_price} Kč</td></tr>
                </table>
            </div>
            
            <div style="background: #F0FDF4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #166534; margin: 0 0 10px;">📞 Co dál?</h4>
                <p style="margin: 0; color: #166534;">Brzy vás budeme kontaktovat na tel. <strong>{booking.customer_phone}</strong> pro finální potvrzení termínu.</p>
            </div>
            
            <p style="margin-top: 20px;">Máte dotaz? Napište nám:</p>
            <p>💬 WhatsApp: <a href="https://wa.me/420730588372" style="color: #3FA34D;">730 588 372</a><br>
            📧 Email: info@seknuto.cz</p>
        </div>
        
        <div style="background: #222222; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: white; margin: 0;">S pozdravem,<br><strong>Tým SeknuTo.cz</strong></p>
            <p style="color: #3FA34D; margin: 10px 0 0;">🌱 Trávník bez starostí!</p>
        </div>
    </body>
    </html>
    """

def get_admin_email_html(booking: Booking) -> str:
    service_name = SERVICE_NAMES_CZ.get(booking.service, booking.service)
    time_name = TIME_NAMES_CZ.get(booking.preferred_time, booking.preferred_time)
    additional = ", ".join(booking.additional_services) if booking.additional_services else "Žádné"
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222222; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #FF6B35; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🆕 NOVÁ REZERVACE!</h1>
        </div>
        
        <div style="background: #fff; padding: 25px; border: 2px solid #FF6B35; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #222; margin-top: 0;">Zákazník: {booking.customer_name}</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background: #f8f9fa;"><td style="padding: 12px; border: 1px solid #dee2e6;"><strong>📞 Telefon:</strong></td><td style="padding: 12px; border: 1px solid #dee2e6;"><a href="tel:{booking.customer_phone}">{booking.customer_phone}</a></td></tr>
                <tr><td style="padding: 12px; border: 1px solid #dee2e6;"><strong>📧 Email:</strong></td><td style="padding: 12px; border: 1px solid #dee2e6;"><a href="mailto:{booking.customer_email}">{booking.customer_email}</a></td></tr>
                <tr style="background: #f8f9fa;"><td style="padding: 12px; border: 1px solid #dee2e6;"><strong>📍 Adresa:</strong></td><td style="padding: 12px; border: 1px solid #dee2e6;">{booking.property_address}</td></tr>
            </table>
            
            <h3 style="color: #3FA34D;">Detaily objednávky</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Služba:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{service_name}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Velikost:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{booking.property_size} m²</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Stav:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{booking.condition}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Termín:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{booking.preferred_date} - {time_name}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Doplňkové:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{additional}</td></tr>
                <tr><td style="padding: 8px;"><strong>Cena:</strong></td><td style="padding: 8px; color: #3FA34D; font-size: 18px; font-weight: bold;">~{booking.estimated_price} Kč</td></tr>
            </table>
            
            {f'<div style="background: #FFF3CD; padding: 15px; border-radius: 8px; margin: 20px 0;"><strong>📝 Poznámka od zákazníka:</strong><br>{booking.notes}</div>' if booking.notes else ''}
            
            <div style="background: #D4EDDA; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <strong>⚡ AKCE POTŘEBNÁ:</strong><br>
                → Zavolat zákazníkovi pro potvrzení<br>
                → Zapsat do kalendáře
            </div>
        </div>
    </body>
    </html>
    """

# ============== API ENDPOINTS ==============

@api_router.get("/")
async def root():
    return {"message": "SeknuTo.cz API", "status": "running"}

@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate):
    booking = Booking(**booking_data.model_dump())
    doc = booking.model_dump()
    
    await db.bookings.insert_one(doc)
    logger.info(f"New booking created: {booking.id} for {booking.customer_name}")
    
    # Add booking email to Resend Contacts (independent of email sending)
    if resend and RESEND_API_KEY:
        try:
            contact_params = {
                "email": booking.customer_email,
                "first_name": booking.customer_name.split()[0] if booking.customer_name else "",
                "last_name": " ".join(booking.customer_name.split()[1:]) if len(booking.customer_name.split()) > 1 else "",
                "unsubscribed": False
            }
            await asyncio.to_thread(resend.Contacts.create, contact_params)
            logger.info(f"Contact added to Resend: {booking.customer_email}")
        except Exception as contact_error:
            logger.warning(f"Could not add contact to Resend (may already exist): {str(contact_error)}")
        
        # Send customer confirmation email
        try:
            customer_params = {
                "from": SENDER_EMAIL,
                "to": [booking.customer_email],
                "subject": "✓ Potvrzení rezervace - SeknuTo.cz",
                "html": get_customer_email_html(booking)
            }
            await asyncio.to_thread(resend.Emails.send, customer_params)
            logger.info(f"Customer confirmation email sent to {booking.customer_email}")
        except Exception as e:
            logger.error(f"Failed to send customer email: {str(e)}")
        
        # Send admin notification email (separate try block)
        if ADMIN_EMAIL:
            try:
                admin_params = {
                    "from": SENDER_EMAIL,
                    "to": [ADMIN_EMAIL],
                    "subject": f"🆕 Nová rezervace - {booking.customer_name}",
                    "html": get_admin_email_html(booking)
                }
                await asyncio.to_thread(resend.Emails.send, admin_params)
                logger.info(f"Admin notification email sent to {ADMIN_EMAIL}")
            except Exception as e:
                logger.error(f"Failed to send admin email: {str(e)}")
    
    return booking

@api_router.get("/bookings/{booking_id}", response_model=Booking)
async def get_booking(booking_id: str):
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@api_router.get("/bookings", response_model=List[Booking])
async def get_all_bookings():
    bookings = await db.bookings.find({}, {"_id": 0}).to_list(1000)
    return bookings

@api_router.post("/pricing/calculate")
async def calculate_price(data: PriceCalculation):
    # Check if it's a tiered package
    if data.service in PACKAGE_TIERED_PRICING:
        tier = get_size_tier(data.property_size)
        base_price = PACKAGE_TIERED_PRICING[data.service][tier]
        total = int(base_price * data.property_size)
    elif data.service in ["garden_work", "debris_hourly"]:
        # Hodinová sazba × počet hodin (property_size = hodiny)
        base_price = SERVICE_PRICES.get(data.service, 350)
        total = int(base_price * max(data.property_size, 1))
    elif data.service in SERVICE_PRICES:
        base_price = SERVICE_PRICES.get(data.service, 2)
        multiplier = CONDITION_MULTIPLIERS.get(data.condition, 1.0)
        total = int(base_price * data.property_size * multiplier)
    else:
        base_price = 2
        total = int(base_price * data.property_size)
    
    # Příplatky za m² (mulčování, solení)
    additional_cost = 0
    for service in data.additional_services:
        if service in ADDITIONAL_SERVICE_PRICES_PER_M2:
            additional_cost += int(ADDITIONAL_SERVICE_PRICES_PER_M2[service] * data.property_size)
        elif service in ADDITIONAL_SERVICE_PRICES:
            additional_cost += ADDITIONAL_SERVICE_PRICES[service]
    
    total += additional_cost
    
    # Get tier info for packages
    tier_info = None
    if data.service in PACKAGE_TIERED_PRICING:
        tier = get_size_tier(data.property_size)
        tier_info = {
            "tier": tier,
            "tier_label": "do 200 m²" if tier == "small" else ("200-500 m²" if tier == "medium" else "500+ m²"),
            "price_per_m2": PACKAGE_TIERED_PRICING[data.service][tier]
        }
    
    return {
        "estimated_price": total,
        "base_price_per_unit": base_price,
        "property_size": data.property_size,
        "condition_multiplier": CONDITION_MULTIPLIERS.get(data.condition, 1.0),
        "additional_services_cost": additional_cost,
        "tier_info": tier_info
    }

@api_router.get("/availability")
async def get_availability():
    # Return available dates (next 30 days, excluding Sundays)
    from datetime import timedelta
    today = datetime.now(timezone.utc).date()
    available_dates = []
    
    for i in range(1, 31):
        date = today + timedelta(days=i)
        if date.weekday() != 6:  # Exclude Sundays
            available_dates.append(date.isoformat())
    
    return {"available_dates": available_dates}

@api_router.post("/contact")
async def submit_contact_form(form: ContactForm):
    doc = {
        "id": str(uuid.uuid4()),
        "name": form.name,
        "email": form.email,
        "phone": form.phone,
        "message": form.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "new"
    }
    
    await db.contact_messages.insert_one(doc)
    logger.info(f"Contact form submitted by {form.name}")
    
    # Send email notification if configured
    if resend and RESEND_API_KEY and ADMIN_EMAIL:
        try:
            params = {
                "from": SENDER_EMAIL,
                "to": [ADMIN_EMAIL],
                "subject": f"📬 Nová zpráva od {form.name} - SeknuTo.cz",
                "html": f"""
                <h2>Nová zpráva z kontaktního formuláře</h2>
                <p><strong>Jméno:</strong> {form.name}</p>
                <p><strong>Email:</strong> {form.email}</p>
                <p><strong>Telefon:</strong> {form.phone or 'Neuvedeno'}</p>
                <p><strong>Zpráva:</strong></p>
                <p>{form.message}</p>
                """
            }
            await asyncio.to_thread(resend.Emails.send, params)
        except Exception as e:
            logger.error(f"Failed to send contact notification: {str(e)}")
    
    return {"message": "Děkujeme za zprávu! Brzy se vám ozveme.", "id": doc["id"]}

@api_router.post("/subscribe")
async def subscribe_email(data: EmailSubscription):
    """Subscribe to newsletter and get 5% discount coupon"""
    # Check if already subscribed
    existing = await db.subscribers.find_one({"email": data.email}, {"_id": 0})
    if existing:
        return {
            "message": "Tento email je již přihlášen",
            "coupon_code": existing.get("coupon_code", "SEKNU5OFF"),
            "already_subscribed": True
        }
    
    # Generate unique coupon
    coupon_code = generate_coupon_code()
    
    doc = {
        "id": str(uuid.uuid4()),
        "email": data.email,
        "coupon_code": coupon_code,
        "discount_percent": 5,
        "used": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.subscribers.insert_one(doc)
    await db.coupons.insert_one({
        "code": coupon_code,
        "discount_percent": 5,
        "email": data.email,
        "used": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    logger.info(f"New subscriber: {data.email}, coupon: {coupon_code}")
    
    # Add contact to Resend Contacts (no audience needed)
    if resend and RESEND_API_KEY:
        try:
            contact_params = {
                "email": data.email,
                "unsubscribed": False
            }
            await asyncio.to_thread(resend.Contacts.create, contact_params)
            logger.info(f"Contact added to Resend Contacts: {data.email}")
        except Exception as e:
            logger.warning(f"Could not add contact to Resend (may already exist): {str(e)}")
    
    # Send coupon email
    if resend and RESEND_API_KEY:
        try:
            params = {
                "from": SENDER_EMAIL,
                "to": [data.email],
                "subject": "🎁 Váš slevový kupón 5% - SeknuTo.cz",
                "html": f"""
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"></head>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #3FA34D, #2d7a38); padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">🎁 Děkujeme za přihlášení!</h1>
                    </div>
                    
                    <div style="background: #f8fff9; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
                        <p style="text-align: center; font-size: 16px; color: #4B5563;">
                            Jako poděkování za přihlášení k odběru novinek máte nárok na slevu <strong>5%</strong> na vaši první objednávku!
                        </p>
                        
                        <div style="background: white; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; border: 2px dashed #3FA34D;">
                            <p style="color: #9CA3AF; margin: 0 0 10px;">Váš slevový kód:</p>
                            <p style="font-size: 36px; font-weight: bold; color: #3FA34D; margin: 0; letter-spacing: 3px;">
                                {coupon_code}
                            </p>
                        </div>
                        
                        <p style="text-align: center; color: #4B5563;">
                            Zadejte tento kód při objednávce a získejte slevu 5%.
                        </p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="https://seknuto.cz/rezervace" style="display: inline-block; background: #3FA34D; color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold;">
                                Objednat se slevou
                            </a>
                        </div>
                    </div>
                    
                    <p style="text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 20px;">
                        SeknuTo.cz | Trávník bez starostí!
                    </p>
                </body>
                </html>
                """
            }
            await asyncio.to_thread(resend.Emails.send, params)
            logger.info(f"Coupon email sent to {data.email}")
        except Exception as e:
            logger.error(f"Failed to send coupon email: {str(e)}")
    
    return {
        "message": "Úspěšně přihlášeno! Slevový kupón byl odeslán na váš email.",
        "coupon_code": coupon_code
    }

@api_router.post("/coupons/validate")
async def validate_coupon(data: CouponValidation):
    """Validate a coupon code"""
    coupon = await db.coupons.find_one({"code": data.code.upper()}, {"_id": 0})
    
    if not coupon:
        raise HTTPException(status_code=404, detail="Neplatný slevový kód")
    
    if coupon.get("used"):
        raise HTTPException(status_code=400, detail="Tento kupón již byl použit")
    
    return {
        "valid": True,
        "discount_percent": coupon.get("discount_percent", 5),
        "message": f"Kupón platný! Sleva {coupon.get('discount_percent', 5)}%"
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
