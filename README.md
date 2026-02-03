# 🌿 SeknuTo.cz - Webová aplikace pro služby péče o zahrady

## 📋 O projektu

**SeknuTo.cz** je moderní webová aplikace pro lokální firmu poskytující služby péče o zahrady ve Dvoře Králové a okolí. Web obsahuje kompletní rezervační systém, kalkulačku cen, newsletter s kupóny a emailové notifikace.

---

## 🛠️ Technologie a frameworky

### Backend
| Technologie | Verze | Účel |
|-------------|-------|------|
| **Python** | 3.11+ | Hlavní programovací jazyk |
| **FastAPI** | 0.110.1 | REST API framework |
| **MongoDB** | - | NoSQL databáze |
| **Motor** | 3.3.1 | Async MongoDB driver |
| **Pydantic** | 2.12.5 | Validace dat a modely |
| **Uvicorn** | 0.25.0 | ASGI server |
| **Resend** | 2.19.0 | Email služba (transakční emaily + kontakty) |

### Frontend
| Technologie | Verze | Účel |
|-------------|-------|------|
| **React** | 18.x | UI framework |
| **React Router** | 6.x | Routing mezi stránkami |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **shadcn/ui** | - | Komponenty (Button, Card, Calendar, atd.) |
| **Axios** | 1.8.4 | HTTP klient |
| **Lucide React** | - | Ikony |
| **Sonner** | - | Toast notifikace |
| **date-fns** | 4.1.0 | Práce s datumy |

---

## 📁 Struktura projektu

```
/app/
├── backend/                    # Backend (FastAPI)
│   ├── .env                    # Proměnné prostředí (API klíče, DB)
│   ├── requirements.txt        # Python závislosti
│   ├── server.py              # Hlavní API soubor (všechny endpointy)
│   └── tests/                  # Pytest testy
│
├── frontend/                   # Frontend (React)
│   ├── .env                    # Frontend proměnné (REACT_APP_BACKEND_URL)
│   ├── package.json           # Node.js závislosti
│   ├── public/                # Statické soubory
│   └── src/
│       ├── App.js             # Hlavní komponenta + Router
│       ├── index.css          # Globální styly + Tailwind
│       ├── components/        # Znovupoužitelné komponenty
│       │   ├── ui/            # shadcn/ui komponenty
│       │   ├── Header.jsx     # Navigace
│       │   ├── Footer.jsx     # Patička
│       │   ├── EmailPopup.jsx # Newsletter popup
│       │   └── GoogleAnalytics.jsx
│       └── pages/             # Stránky
│           ├── HomePage.jsx   # Domovská stránka
│           ├── ServicesPage.jsx # Služby
│           ├── PricingPage.jsx # Ceník
│           ├── BookingPage.jsx # Rezervační formulář (5 kroků)
│           ├── AboutPage.jsx  # O nás
│           └── ContactPage.jsx # Kontakt
│
├── memory/                     # Dokumentace projektu
│   └── PRD.md                 # Product Requirements Document
│
└── test_reports/              # Výsledky testů
    └── iteration_*.json       # JSON reporty z testování
```

---

## 🔌 API Endpointy

### Rezervace
| Metoda | Endpoint | Popis |
|--------|----------|-------|
| `POST` | `/api/bookings` | Vytvoření nové rezervace |
| `GET` | `/api/bookings` | Seznam všech rezervací |
| `GET` | `/api/bookings/{id}` | Detail rezervace |
| `GET` | `/api/availability` | Dostupné termíny (30 dní, bez neděl) |

### Ceník a kalkulace
| Metoda | Endpoint | Popis |
|--------|----------|-------|
| `POST` | `/api/pricing/calculate` | Výpočet ceny služby |
| `GET` | `/api/pricing` | Kompletní ceník |

### Newsletter a kupóny
| Metoda | Endpoint | Popis |
|--------|----------|-------|
| `POST` | `/api/subscribe` | Přihlášení k newsletteru + vygenerování kupónu |
| `POST` | `/api/coupons/validate` | Ověření slevového kupónu |

### Kontakt
| Metoda | Endpoint | Popis |
|--------|----------|-------|
| `POST` | `/api/contact` | Odeslání kontaktního formuláře |

---

## ⚙️ Konfigurace

### Backend (.env)
```env
# Databáze
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"

# CORS
CORS_ORIGINS="*"

# Resend (emaily)
RESEND_API_KEY=re_xxxxxxxxxxxxx
SENDER_EMAIL=onboarding@resend.dev
ADMIN_EMAIL=vas@email.cz

# Volitelné
RESEND_AUDIENCE_ID=
```

### Frontend (.env)
```env
# URL backendu (pro API volání)
REACT_APP_BACKEND_URL=https://vase-domena.com

# Google Analytics (volitelné)
REACT_APP_GA_ID=G-XXXXXXXXXX
```

---

## 📅 Google Calendar Integrace

Nové rezervace se automaticky přidávají do vašeho Google Kalendáře.

### Nastavení:

1. **Vytvořte projekt v Google Cloud Console:**
   - Jděte na https://console.cloud.google.com/
   - Vytvořte nový projekt
   - Povolte "Google Calendar API"

2. **Vytvořte OAuth 2.0 credentials:**
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: Web application
   - Přidejte Authorized redirect URI: `https://vase-domena.com/api/auth/google/callback`

3. **Nastavte proměnné v backend/.env:**
   ```env
   GOOGLE_CLIENT_ID=váš-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=váš-client-secret
   GOOGLE_REDIRECT_URI=https://vase-domena.com/api/auth/google/callback
   ```

4. **Připojte svůj Google účet:**
   - Navštivte: `https://vase-domena.com/api/auth/google/login`
   - Přihlaste se svým Google účtem
   - Povolte přístup ke kalendáři

### API Endpointy:
| Endpoint | Popis |
|----------|-------|
| `GET /api/auth/google/status` | Stav připojení kalendáře |
| `GET /api/auth/google/login` | Začít OAuth flow |
| `GET /api/auth/google/callback` | OAuth callback |
| `DELETE /api/auth/google/disconnect` | Odpojit kalendář |

### Co se přidá do kalendáře:
- 🌿 Název služby + jméno zákazníka
- 📍 Adresa
- 📏 Velikost plochy
- 💰 Odhadovaná cena
- 📞 Kontaktní údaje
- ⏰ Upomínka 24h a 1h před

---

## 🚀 Spuštění lokálně

### Backend
```bash
cd /app/backend

# Instalace závislostí
pip install -r requirements.txt

# Spuštění serveru
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend
```bash
cd /app/frontend

# Instalace závislostí
yarn install

# Spuštění dev serveru
yarn start
```

### Pomocí Supervisoru (produkce)
```bash
# Status služeb
sudo supervisorctl status

# Restart backendu
sudo supervisorctl restart backend

# Restart frontendu
sudo supervisorctl restart frontend
```

---

## 📧 Email systém (Resend)

### Aktuální funkce:
- ✅ **Admin notifikace** - při nové rezervaci se odešle email na `ADMIN_EMAIL`
- ✅ **Kontakty** - emaily z rezervací a newsletteru se ukládají do Resend Contacts
- ⚠️ **Zákaznické emaily** - vyžaduje ověřenou doménu v Resend

### Pro plné fungování emailů:
1. Zaregistrujte se na [resend.com](https://resend.com)
2. Přidejte a ověřte doménu (např. seknuto.cz)
3. Aktualizujte `SENDER_EMAIL` na email z vaší domény
4. Zákaznické potvrzovací emaily začnou fungovat

---

## 🗄️ Databázové modely (MongoDB)

### Booking (Rezervace)
```javascript
{
  "id": "uuid",
  "service": "lawn_mowing",
  "property_size": 200,
  "condition": "normal",
  "additional_services": ["mulching"],
  "preferred_date": "2026-02-01",
  "preferred_time": "morning",
  "customer_name": "Jan Novák",
  "customer_phone": "+420777888999",
  "customer_email": "jan@email.cz",
  "property_address": "Zahradní 123, Dvůr Králové",
  "notes": "",
  "estimated_price": 400,
  "status": "pending",
  "gdpr_consent": true,
  "coupon_code": "SEKNU12345",
  "created_at": "2026-01-28T12:00:00Z"
}
```

### Subscriber (Newsletter)
```javascript
{
  "email": "jan@email.cz",
  "coupon_code": "SEKNU12345",
  "subscribed_at": "2026-01-28T12:00:00Z"
}
```

### Coupon (Kupón)
```javascript
{
  "code": "SEKNU12345",
  "discount_percent": 5,
  "is_used": false,
  "created_at": "2026-01-28T12:00:00Z"
}
```

---

## 🎨 Design systém

### Barvy
```css
--primary: #3FA34D      /* Zelená - hlavní barva */
--primary-dark: #2d7a38 /* Tmavší zelená - hover */
--background: #F0FDF4   /* Světle zelená pozadí */
--text-dark: #222222    /* Tmavý text */
--text-muted: #4B5563   /* Šedý text */
```

### Fonty
- **Nadpisy:** Poppins (Google Fonts)
- **Text:** Montserrat / System fonts

### Komponenty (shadcn/ui)
Umístěny v `/app/frontend/src/components/ui/`:
- Button, Card, Input, Label, Textarea
- Select, Checkbox, Calendar
- Dialog, Popover, Toast (Sonner)
- A další...

---

## 🧪 Testování

### Spuštění testů
```bash
# Backend testy (pytest)
cd /app/backend
pytest tests/ -v

# Frontend - Playwright automatizované testy
# (spouštěno přes testing agenta)
```

### Test reporty
Uloženy v `/app/test_reports/iteration_*.json`

---

## 📱 Stránky webu

| Stránka | URL | Popis |
|---------|-----|-------|
| Domů | `/` | Hero, služby, ceník, CTA |
| Služby | `/sluzby` | Detail všech služeb |
| Ceník | `/cenik` | Cenové karty, kalkulačka, porovnání |
| Rezervace | `/rezervace` | 5-krokový rezervační formulář |
| O nás | `/o-nas` | Informace o firmě |
| Kontakt | `/kontakt` | Kontaktní formulář, mapa |

---

## 🔒 Bezpečnost

- CORS konfigurace v backendu
- GDPR souhlas v rezervačním formuláři
- Validace dat přes Pydantic modely
- Sanitizace vstupů

---

## 📞 Kontaktní informace v aplikaci

- **Telefon:** 730 588 372
- **WhatsApp:** Plovoucí tlačítko na webu
- **Email:** Nakonfigurováno přes ADMIN_EMAIL

---

## 🚧 Co chybí / TODO

### Kritické (P0)
- [ ] **Google Calendar integrace** - `addToCalendar()` v server.py je placeholder
- [ ] **Ověření domény v Resend** - pro zákaznické emaily

### Důležité (P1)
- [ ] Admin dashboard pro správu rezervací
- [ ] Sekce s recenzemi zákazníků

### Nice to have (P2)
- [ ] Online platby (Stripe)
- [ ] Fotogalerie prací
- [ ] Blog

---

## 📝 Poznámky pro hosting

### Požadavky:
- Node.js 18+ (frontend)
- Python 3.11+ (backend)
- MongoDB instance
- SSL certifikát (HTTPS)

### Proměnné prostředí pro produkci:
1. `MONGO_URL` - připojení k produkční MongoDB
2. `REACT_APP_BACKEND_URL` - URL backendu (s /api prefixem)
3. `RESEND_API_KEY` - produkční Resend klíč
4. `ADMIN_EMAIL` - email pro notifikace

### Doporučené služby:
- **Hosting:** Vercel (frontend), Railway/Render (backend)
- **Databáze:** MongoDB Atlas
- **Emaily:** Resend.com

---

## 📄 Licence

Tento projekt je soukromý a určen výhradně pro SeknuTo.cz.

---

*Vytvořeno pomocí Emergent AI • Leden 2026*
