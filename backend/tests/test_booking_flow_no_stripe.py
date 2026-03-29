"""
Test Suite: SeknuTo.cz Booking Flow WITHOUT Stripe
Tests: Booking steps 1-5, pricing calculation, coupons, vouchers, admin order management
CRITICAL: Stripe deposit has been REMOVED - payment is now on-site
"""
import pytest
import requests
import os
from datetime import datetime, timedelta
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="module")
def admin_token(api_client):
    """Get admin authentication token"""
    response = api_client.post(f"{BASE_URL}/api/admin/login", json={
        "password": "SeknuTo2025!"
    })
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    return response.json().get("token")

@pytest.fixture(scope="module")
def authenticated_client(api_client, admin_token):
    """Session with admin auth header"""
    api_client.headers.update({"X-Admin-Token": admin_token})
    return api_client


# ============== PRICING CALCULATION TESTS ==============

class TestPricingCalculation:
    """Test /api/pricing/calculate endpoint"""
    
    def test_lawn_mowing_100m2_returns_price(self, api_client):
        """POST /api/pricing/calculate for lawn_mowing 100m² returns non-zero price"""
        response = api_client.post(f"{BASE_URL}/api/pricing/calculate", json={
            "service": "lawn_mowing",
            "property_size": 100,
            "condition": "normal",
            "additional_services": []
        })
        assert response.status_code == 200
        data = response.json()
        assert "estimated_price" in data
        assert data["estimated_price"] > 0
        # lawn_mowing is 2 Kč/m², so 100m² = 200 Kč
        assert data["estimated_price"] == 200
        print(f"✓ lawn_mowing 100m² = {data['estimated_price']} Kč")
    
    def test_lawn_mowing_300m2_higher_than_100m2(self, api_client):
        """POST /api/pricing/calculate for lawn_mowing 300m² returns higher price than 100m²"""
        response_100 = api_client.post(f"{BASE_URL}/api/pricing/calculate", json={
            "service": "lawn_mowing",
            "property_size": 100,
            "condition": "normal",
            "additional_services": []
        })
        response_300 = api_client.post(f"{BASE_URL}/api/pricing/calculate", json={
            "service": "lawn_mowing",
            "property_size": 300,
            "condition": "normal",
            "additional_services": []
        })
        
        assert response_100.status_code == 200
        assert response_300.status_code == 200
        
        price_100 = response_100.json()["estimated_price"]
        price_300 = response_300.json()["estimated_price"]
        
        assert price_300 > price_100
        print(f"✓ 300m² ({price_300} Kč) > 100m² ({price_100} Kč)")
    
    def test_overgrown_condition_higher_price(self, api_client):
        """POST /api/pricing/calculate with condition=overgrown returns higher price"""
        response_normal = api_client.post(f"{BASE_URL}/api/pricing/calculate", json={
            "service": "lawn_mowing",
            "property_size": 100,
            "condition": "normal",
            "additional_services": []
        })
        response_overgrown = api_client.post(f"{BASE_URL}/api/pricing/calculate", json={
            "service": "lawn_mowing",
            "property_size": 100,
            "condition": "overgrown",
            "additional_services": []
        })
        
        assert response_normal.status_code == 200
        assert response_overgrown.status_code == 200
        
        price_normal = response_normal.json()["estimated_price"]
        price_overgrown = response_overgrown.json()["estimated_price"]
        
        # overgrown has 1.5x multiplier
        assert price_overgrown > price_normal
        assert price_overgrown == int(price_normal * 1.5)
        print(f"✓ overgrown ({price_overgrown} Kč) > normal ({price_normal} Kč)")
    
    def test_garden_work_hourly_pricing(self, api_client):
        """POST /api/pricing/calculate for garden_work (hourly) with size=2 returns 2h price"""
        response = api_client.post(f"{BASE_URL}/api/pricing/calculate", json={
            "service": "garden_work",
            "property_size": 2,  # 2 hours
            "condition": "normal",
            "additional_services": []
        })
        assert response.status_code == 200
        data = response.json()
        # garden_work is 350 Kč/hour, so 2 hours = 700 Kč
        assert data["estimated_price"] == 700
        print(f"✓ garden_work 2h = {data['estimated_price']} Kč")
    
    def test_mulching_additional_service(self, api_client):
        """Mulching adds 0.5 Kč/m² to price"""
        response_without = api_client.post(f"{BASE_URL}/api/pricing/calculate", json={
            "service": "lawn_mowing",
            "property_size": 100,
            "condition": "normal",
            "additional_services": []
        })
        response_with = api_client.post(f"{BASE_URL}/api/pricing/calculate", json={
            "service": "lawn_mowing",
            "property_size": 100,
            "condition": "normal",
            "additional_services": ["mulching"]
        })
        
        price_without = response_without.json()["estimated_price"]
        price_with = response_with.json()["estimated_price"]
        
        # mulching adds 0.5 Kč/m², so 100m² = +50 Kč
        assert price_with == price_without + 50
        print(f"✓ mulching adds 50 Kč for 100m²")


# ============== BOOKING CREATION TESTS ==============

class TestBookingCreation:
    """Test /api/bookings POST endpoint"""
    
    def test_create_booking_returns_id(self, api_client):
        """POST /api/bookings with all required fields returns 200 with booking id"""
        future_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        
        response = api_client.post(f"{BASE_URL}/api/bookings", json={
            "service": "lawn_mowing",
            "property_size": 150,
            "condition": "normal",
            "additional_services": [],
            "preferred_date": future_date,
            "preferred_time": "morning",
            "customer_name": "TEST_Jan Novák",
            "customer_phone": "+420123456789",
            "customer_email": "test@example.com",
            "property_address": "Testovací 123, Praha",
            "notes": "Test booking - no Stripe",
            "estimated_price": 300,
            "gdpr_consent": True
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["id"] is not None
        assert data["service"] == "lawn_mowing"
        assert data["customer_name"] == "TEST_Jan Novák"
        assert data["status"] == "pending"
        print(f"✓ Booking created with ID: {data['id']}")
        return data["id"]
    
    def test_booking_stored_in_db(self, api_client, admin_token):
        """POST /api/bookings stores booking in DB correctly"""
        future_date = (datetime.now() + timedelta(days=8)).strftime("%Y-%m-%d")
        unique_name = f"TEST_DB_Check_{uuid.uuid4().hex[:6]}"
        
        # Create booking
        create_response = api_client.post(f"{BASE_URL}/api/bookings", json={
            "service": "overgrown",
            "property_size": 200,
            "condition": "overgrown",
            "additional_services": ["mulching"],
            "preferred_date": future_date,
            "preferred_time": "afternoon",
            "customer_name": unique_name,
            "customer_phone": "+420987654321",
            "customer_email": "dbcheck@example.com",
            "property_address": "DB Test 456, Brno",
            "notes": "DB persistence test",
            "estimated_price": 650,
            "gdpr_consent": True
        })
        
        assert create_response.status_code == 200
        booking_id = create_response.json()["id"]
        
        # Verify via GET
        get_response = api_client.get(f"{BASE_URL}/api/bookings/{booking_id}")
        assert get_response.status_code == 200
        
        fetched = get_response.json()
        assert fetched["customer_name"] == unique_name
        assert fetched["service"] == "overgrown"
        assert fetched["property_size"] == 200
        assert "mulching" in fetched["additional_services"]
        print(f"✓ Booking persisted in DB: {booking_id}")
    
    def test_booking_with_coupon_code(self, api_client):
        """POST /api/bookings with coupon_code stores coupon in booking"""
        future_date = (datetime.now() + timedelta(days=9)).strftime("%Y-%m-%d")
        
        response = api_client.post(f"{BASE_URL}/api/bookings", json={
            "service": "lawn_mowing",
            "property_size": 100,
            "condition": "normal",
            "additional_services": [],
            "preferred_date": future_date,
            "preferred_time": "anytime",
            "customer_name": "TEST_Coupon User",
            "customer_phone": "+420111222333",
            "customer_email": "coupon@example.com",
            "property_address": "Coupon Test 789",
            "notes": "",
            "estimated_price": 200,
            "gdpr_consent": True,
            "coupon_code": "TESTCOUPON"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("coupon_code") == "TESTCOUPON"
        print(f"✓ Booking with coupon_code stored")
    
    def test_booking_missing_required_fields_returns_422(self, api_client):
        """POST /api/bookings missing customer_name returns 422"""
        response = api_client.post(f"{BASE_URL}/api/bookings", json={
            "service": "lawn_mowing",
            "property_size": 100,
            "condition": "normal",
            "preferred_date": "2027-01-15",
            "preferred_time": "morning",
            # Missing customer_name
            "customer_phone": "+420123456789",
            "customer_email": "test@example.com",
            "property_address": "Test Address",
            "estimated_price": 200,
            "gdpr_consent": True
        })
        
        assert response.status_code == 422
        print("✓ Missing customer_name returns 422")
    
    def test_booking_invalid_email_returns_422(self, api_client):
        """POST /api/bookings with invalid email format returns 422"""
        response = api_client.post(f"{BASE_URL}/api/bookings", json={
            "service": "lawn_mowing",
            "property_size": 100,
            "condition": "normal",
            "preferred_date": "2027-01-15",
            "preferred_time": "morning",
            "customer_name": "Test User",
            "customer_phone": "+420123456789",
            "customer_email": "invalid-email",  # Invalid format
            "property_address": "Test Address",
            "estimated_price": 200,
            "gdpr_consent": True
        })
        
        assert response.status_code == 422
        print("✓ Invalid email returns 422")


# ============== COUPON SYSTEM TESTS ==============

class TestCouponSystem:
    """Test coupon creation and validation"""
    
    def test_admin_create_coupon(self, authenticated_client):
        """POST /api/admin/coupons creates coupon with discount"""
        unique_code = f"TEST{uuid.uuid4().hex[:6].upper()}"
        
        response = authenticated_client.post(f"{BASE_URL}/api/admin/coupons", json={
            "code": unique_code,
            "discount_percent": 15,
            "description": "Test coupon 15%"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == unique_code
        assert data["discount_percent"] == 15
        print(f"✓ Coupon created: {unique_code} (15%)")
        return unique_code
    
    def test_validate_valid_coupon(self, authenticated_client, api_client):
        """POST /api/coupons/validate for valid code returns discount_percent"""
        # First create a coupon
        unique_code = f"VALID{uuid.uuid4().hex[:6].upper()}"
        authenticated_client.post(f"{BASE_URL}/api/admin/coupons", json={
            "code": unique_code,
            "discount_percent": 10,
            "description": "Valid test coupon"
        })
        
        # Validate it (no auth needed for validation)
        response = api_client.post(f"{BASE_URL}/api/coupons/validate", json={
            "code": unique_code
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == True
        assert data["discount_percent"] == 10
        print(f"✓ Coupon {unique_code} validated: {data['discount_percent']}%")
    
    def test_validate_invalid_coupon_returns_404(self, api_client):
        """POST /api/coupons/validate for INVALID_CODE returns 404"""
        response = api_client.post(f"{BASE_URL}/api/coupons/validate", json={
            "code": "NONEXISTENT_CODE_12345"
        })
        
        assert response.status_code == 404
        print("✓ Invalid coupon returns 404")


# ============== VOUCHER SYSTEM TESTS ==============

class TestVoucherSystem:
    """Test voucher creation, validation, and redemption"""
    
    def test_create_percentage_voucher(self, api_client):
        """POST /api/vouchers creates percentage voucher"""
        unique_code = f"VTEST{uuid.uuid4().hex[:6].upper()}"
        valid_from = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
        valid_until = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%dT%H:%M:%SZ")
        
        response = api_client.post(f"{BASE_URL}/api/vouchers", json={
            "code": unique_code,
            "display_name": "Test Voucher 20%",
            "discount_type": "percentage",
            "discount_value": 20,
            "max_uses": 5,
            "valid_from": valid_from,
            "valid_until": valid_until,
            "campaign_name": "Test Campaign"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == unique_code
        assert data["discount_type"] == "percentage"
        assert data["discount_value"] == 20
        assert data["status"] == "active"
        print(f"✓ Percentage voucher created: {unique_code} (20%)")
        return unique_code
    
    def test_create_fixed_amount_voucher(self, api_client):
        """POST /api/vouchers creates fixed_amount voucher"""
        unique_code = f"VFIX{uuid.uuid4().hex[:6].upper()}"
        valid_from = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
        valid_until = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%dT%H:%M:%SZ")
        
        response = api_client.post(f"{BASE_URL}/api/vouchers", json={
            "code": unique_code,
            "display_name": "Test Fixed 100 Kč",
            "discount_type": "fixed_amount",
            "discount_value": 100,
            "max_uses": 1,
            "valid_from": valid_from,
            "valid_until": valid_until
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["discount_type"] == "fixed_amount"
        assert data["discount_value"] == 100
        print(f"✓ Fixed amount voucher created: {unique_code} (100 Kč)")
        return unique_code
    
    def test_get_voucher_by_code(self, api_client):
        """GET /api/vouchers/:code returns voucher details"""
        # Create voucher first
        unique_code = f"VGET{uuid.uuid4().hex[:6].upper()}"
        valid_from = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
        valid_until = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%dT%H:%M:%SZ")
        
        api_client.post(f"{BASE_URL}/api/vouchers", json={
            "code": unique_code,
            "display_name": "Get Test Voucher",
            "discount_type": "percentage",
            "discount_value": 15,
            "max_uses": 10,
            "valid_from": valid_from,
            "valid_until": valid_until
        })
        
        # Get voucher
        response = api_client.get(f"{BASE_URL}/api/vouchers/{unique_code}")
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == unique_code
        assert data["is_valid"] == True
        assert "display_discount" in data
        print(f"✓ Voucher retrieved: {unique_code}, display_discount={data['display_discount']}")
    
    def test_claim_voucher(self, api_client):
        """POST /api/vouchers/:code/claim validates and returns redirect URL"""
        unique_code = f"VCLM{uuid.uuid4().hex[:6].upper()}"
        valid_from = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
        valid_until = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%dT%H:%M:%SZ")
        
        api_client.post(f"{BASE_URL}/api/vouchers", json={
            "code": unique_code,
            "display_name": "Claim Test",
            "discount_type": "percentage",
            "discount_value": 25,
            "max_uses": 5,
            "valid_from": valid_from,
            "valid_until": valid_until
        })
        
        response = api_client.post(f"{BASE_URL}/api/vouchers/{unique_code}/claim")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["voucher_code"] == unique_code
        assert "redirect_url" in data
        assert f"voucher={unique_code}" in data["redirect_url"]
        print(f"✓ Voucher claimed: {unique_code}, redirect={data['redirect_url']}")
    
    def test_nonexistent_voucher_returns_404(self, api_client):
        """GET /api/vouchers/NONEXISTENT returns 404"""
        response = api_client.get(f"{BASE_URL}/api/vouchers/NONEXISTENT_VOUCHER_XYZ")
        assert response.status_code == 404
        print("✓ Nonexistent voucher returns 404")


# ============== ADMIN ORDER MANAGEMENT TESTS ==============

class TestAdminOrderManagement:
    """Test admin booking management endpoints"""
    
    def test_admin_get_bookings(self, authenticated_client):
        """GET /api/admin/bookings returns list of bookings"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/bookings")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin bookings list: {len(data)} bookings")
    
    def test_admin_update_booking_status(self, authenticated_client, api_client):
        """PATCH /api/admin/bookings/:id/status updates status"""
        # Create a booking first
        future_date = (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d")
        create_response = api_client.post(f"{BASE_URL}/api/bookings", json={
            "service": "lawn_mowing",
            "property_size": 100,
            "condition": "normal",
            "additional_services": [],
            "preferred_date": future_date,
            "preferred_time": "morning",
            "customer_name": "TEST_Status Update",
            "customer_phone": "+420555666777",
            "customer_email": "status@example.com",
            "property_address": "Status Test 123",
            "notes": "",
            "estimated_price": 200,
            "gdpr_consent": True
        })
        
        booking_id = create_response.json()["id"]
        
        # Update status to confirmed
        update_response = authenticated_client.patch(
            f"{BASE_URL}/api/admin/bookings/{booking_id}/status",
            json={"status": "confirmed"}
        )
        assert update_response.status_code == 200
        
        # Verify status changed
        get_response = api_client.get(f"{BASE_URL}/api/bookings/{booking_id}")
        assert get_response.json()["status"] == "confirmed"
        print(f"✓ Booking status updated to 'confirmed'")
        
        # Update to completed
        update_response = authenticated_client.patch(
            f"{BASE_URL}/api/admin/bookings/{booking_id}/status",
            json={"status": "completed"}
        )
        assert update_response.status_code == 200
        
        get_response = api_client.get(f"{BASE_URL}/api/bookings/{booking_id}")
        assert get_response.json()["status"] == "completed"
        print(f"✓ Booking status updated to 'completed'")
    
    def test_admin_stats(self, authenticated_client):
        """GET /api/admin/stats returns dashboard statistics"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        data = response.json()
        
        assert "total_bookings" in data
        assert "pending_bookings" in data
        assert "active_vouchers" in data
        assert "total_coupons" in data
        assert "total_subscribers" in data
        assert "total_revenue_estimate" in data
        
        print(f"✓ Admin stats: {data['total_bookings']} bookings, {data['active_vouchers']} vouchers")


# ============== HEALTH CHECK ==============

class TestHealthCheck:
    """Basic API health check"""
    
    def test_api_health(self, api_client):
        """GET /api/health returns ok"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        print("✓ API health check passed")
    
    def test_api_root(self, api_client):
        """GET /api/ returns running status"""
        response = api_client.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        print("✓ API root endpoint working")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
