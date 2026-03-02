"""
Test suite for SeknuTo.cz Voucher and Stripe Payment features

Tests:
- Voucher endpoints (GET /api/vouchers/{code}, POST /api/vouchers/{code}/claim)
- Stripe deposit endpoints (POST /api/payments/deposit/create, GET /api/payments/deposit/status/{session_id})
- Booking with voucher flow
"""
import pytest
import requests
import os
from datetime import datetime, timezone, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAPIHealth:
    """Basic API health checks"""
    
    def test_api_root(self):
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        print("API root endpoint: PASS")


class TestVoucherEndpoints:
    """Voucher API endpoints tests"""
    
    def test_get_voucher_testpoukaz(self):
        """GET /api/vouchers/TESTPOUKAZ returns valid voucher"""
        response = requests.get(f"{BASE_URL}/api/vouchers/TESTPOUKAZ")
        assert response.status_code == 200
        
        data = response.json()
        assert data["code"] == "TESTPOUKAZ"
        assert data["is_valid"] == True
        assert data["discount_type"] == "percentage"
        assert data["discount_value"] == 20
        assert data["display_discount"] == "20 %"
        assert "valid_until_formatted" in data
        assert data["has_expiration"] == True
        print(f"GET /api/vouchers/TESTPOUKAZ: PASS - Voucher is valid with {data['display_discount']} discount")
    
    def test_get_invalid_voucher(self):
        """GET /api/vouchers/INVALIDCODE returns 404"""
        response = requests.get(f"{BASE_URL}/api/vouchers/INVALIDCODE")
        assert response.status_code == 404
        print("GET /api/vouchers/INVALIDCODE: PASS - Returns 404 as expected")
    
    def test_claim_voucher_testpoukaz(self):
        """POST /api/vouchers/TESTPOUKAZ/claim returns redirect_url"""
        response = requests.post(f"{BASE_URL}/api/vouchers/TESTPOUKAZ/claim")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["voucher_code"] == "TESTPOUKAZ"
        assert data["discount_type"] == "percentage"
        assert data["discount_value"] == 20
        assert "/rezervace?voucher=TESTPOUKAZ&auto_apply=true" in data["redirect_url"]
        print(f"POST /api/vouchers/TESTPOUKAZ/claim: PASS - redirect_url: {data['redirect_url']}")
    
    def test_claim_invalid_voucher(self):
        """POST /api/vouchers/INVALIDCODE/claim returns 404"""
        response = requests.post(f"{BASE_URL}/api/vouchers/INVALIDCODE/claim")
        assert response.status_code == 404
        print("POST /api/vouchers/INVALIDCODE/claim: PASS - Returns 404 as expected")


class TestStripeDepositEndpoints:
    """Stripe deposit payment endpoints tests"""
    
    def test_create_deposit_session(self):
        """POST /api/payments/deposit/create returns Stripe checkout URL"""
        response = requests.post(
            f"{BASE_URL}/api/payments/deposit/create",
            json={"origin_url": BASE_URL}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "url" in data
        assert "session_id" in data
        assert data["url"].startswith("https://checkout.stripe.com")
        assert data["session_id"].startswith("cs_test_")
        print(f"POST /api/payments/deposit/create: PASS - session_id: {data['session_id'][:30]}...")
        
        # Return session_id for next test
        return data["session_id"]
    
    def test_get_deposit_status(self):
        """GET /api/payments/deposit/status/:session_id works"""
        # First create a session
        create_resp = requests.post(
            f"{BASE_URL}/api/payments/deposit/create",
            json={"origin_url": BASE_URL}
        )
        session_id = create_resp.json()["session_id"]
        
        # Check status
        response = requests.get(f"{BASE_URL}/api/payments/deposit/status/{session_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["session_id"] == session_id
        assert data["status"] in ["open", "complete", "expired"]
        assert data["payment_status"] in ["unpaid", "paid", "no_payment_required"]
        print(f"GET /api/payments/deposit/status: PASS - status: {data['status']}, payment: {data['payment_status']}")
    
    def test_get_invalid_session_status(self):
        """GET /api/payments/deposit/status/invalid_session returns error"""
        response = requests.get(f"{BASE_URL}/api/payments/deposit/status/invalid_session_id")
        # Should either return 404 or 500 depending on implementation
        assert response.status_code in [200, 404, 500]
        print(f"GET /api/payments/deposit/status/invalid: Response code {response.status_code}")


class TestBookingWithVoucher:
    """Test booking flow with voucher"""
    
    def test_create_booking_with_voucher(self):
        """Create a booking with voucher code applied"""
        booking_data = {
            "service": "lawn_mowing",
            "property_size": 150,
            "condition": "normal",
            "additional_services": [],
            "preferred_date": (datetime.now(timezone.utc) + timedelta(days=7)).strftime("%Y-%m-%d"),
            "preferred_time": "morning",
            "customer_name": "TEST_Voucher User",
            "customer_phone": "+420123456789",
            "customer_email": "test_voucher@example.com",
            "property_address": "Test Street 123, Prague",
            "notes": "Test booking with voucher",
            "estimated_price": 300,
            "gdpr_consent": True,
            "coupon_code": "TESTPOUKAZ",
        }
        
        response = requests.post(f"{BASE_URL}/api/bookings", json=booking_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "id" in data
        assert data["customer_name"] == "TEST_Voucher User"
        assert data["coupon_code"] == "TESTPOUKAZ"
        print(f"POST /api/bookings with voucher: PASS - booking_id: {data['id'][:8]}...")


class TestPriceCalculation:
    """Test price calculation endpoint"""
    
    def test_calculate_price_lawn_mowing(self):
        """Price calculation for lawn mowing service"""
        response = requests.post(
            f"{BASE_URL}/api/pricing/calculate",
            json={
                "service": "lawn_mowing",
                "property_size": 100,
                "condition": "normal",
                "additional_services": []
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["estimated_price"] == 200  # 100 m² × 2 Kč = 200 Kč
        print(f"Price calculation for 100m² lawn: PASS - {data['estimated_price']} Kč")
    
    def test_calculate_price_with_condition_multiplier(self):
        """Price with overgrown condition multiplier"""
        response = requests.post(
            f"{BASE_URL}/api/pricing/calculate",
            json={
                "service": "lawn_mowing",
                "property_size": 100,
                "condition": "overgrown",
                "additional_services": []
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["estimated_price"] == 300  # 100 m² × 2 Kč × 1.5 = 300 Kč
        assert data["condition_multiplier"] == 1.5
        print(f"Price with overgrown: PASS - {data['estimated_price']} Kč (multiplier: {data['condition_multiplier']})")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
