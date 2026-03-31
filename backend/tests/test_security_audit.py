"""
Security and Functionality Audit Tests for SeknuTo.cz
Tests for iteration 16 - Security fixes (SEC-001, SEC-002, SEC-006, SEC-007)
and functionality fixes (FUNC-001, FUNC-003, FUNC-004, PERF-002)
"""
import pytest
import requests
import os
import time
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://booking-system-test-7.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"
ADMIN_PASSWORD = "SeknuTo2025!"


class TestSecuritySEC001VouchersAuth:
    """SEC-001: Voucher endpoints require X-Admin-Token"""
    
    def test_post_vouchers_without_token_returns_401(self):
        """POST /api/vouchers without X-Admin-Token should return 401"""
        payload = {
            "display_name": "Test Voucher",
            "discount_type": "percentage",
            "discount_value": 10,
            "max_uses": 1,
            "valid_from": "2025-01-01T00:00:00Z",
            "valid_until": "2025-12-31T23:59:59Z"
        }
        response = requests.post(f"{API}/vouchers", json=payload)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        print("✓ SEC-001: POST /api/vouchers without token returns 401")
    
    def test_get_vouchers_without_token_returns_401(self):
        """GET /api/vouchers without X-Admin-Token should return 401"""
        response = requests.get(f"{API}/vouchers")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        print("✓ SEC-001: GET /api/vouchers without token returns 401")
    
    def test_delete_vouchers_without_token_returns_401(self):
        """DELETE /api/vouchers/{code} without X-Admin-Token should return 401"""
        response = requests.delete(f"{API}/vouchers/TESTCODE123")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        print("✓ SEC-001: DELETE /api/vouchers/{code} without token returns 401")


class TestSecuritySEC002GoogleDisconnectAuth:
    """SEC-002: Google disconnect endpoint requires X-Admin-Token"""
    
    def test_google_disconnect_without_token_returns_401(self):
        """DELETE /api/auth/google/disconnect without X-Admin-Token should return 401"""
        response = requests.delete(f"{API}/auth/google/disconnect")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        print("✓ SEC-002: DELETE /api/auth/google/disconnect without token returns 401")


class TestSecuritySEC006AdminSession:
    """SEC-006: Admin login and session token functionality"""
    
    def test_admin_login_returns_token(self):
        """Admin login with correct password returns token"""
        response = requests.post(f"{API}/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "token" in data, "Response should contain 'token'"
        assert len(data["token"]) > 0, "Token should not be empty"
        print(f"✓ SEC-006: Admin login returns token: {data['token'][:8]}...")
        return data["token"]
    
    def test_get_vouchers_with_valid_token_returns_list(self):
        """GET /api/vouchers with valid token returns list"""
        # First login to get token
        login_response = requests.post(f"{API}/admin/login", json={"password": ADMIN_PASSWORD})
        assert login_response.status_code == 200
        token = login_response.json()["token"]
        
        # Now get vouchers with token
        headers = {"X-Admin-Token": token}
        response = requests.get(f"{API}/vouchers", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ SEC-006: GET /api/vouchers with valid token returns list ({len(data)} vouchers)")


class TestFUNC003CouponUsedOnBooking:
    """FUNC-003: Coupon is marked as used when booking is created"""
    
    def test_coupon_marked_as_used_after_booking(self):
        """Coupon should be marked as used after booking, second validation returns error"""
        # First login to get admin token
        login_response = requests.post(f"{API}/admin/login", json={"password": ADMIN_PASSWORD})
        assert login_response.status_code == 200
        token = login_response.json()["token"]
        headers = {"X-Admin-Token": token}
        
        # Create a unique coupon
        unique_code = f"TEST{uuid.uuid4().hex[:6].upper()}"
        coupon_payload = {
            "code": unique_code,
            "discount_percent": 10,
            "description": "Test coupon for FUNC-003"
        }
        create_response = requests.post(f"{API}/admin/coupons", json=coupon_payload, headers=headers)
        assert create_response.status_code == 200, f"Failed to create coupon: {create_response.text}"
        print(f"✓ Created test coupon: {unique_code}")
        
        # Validate coupon - should be valid
        validate_response = requests.post(f"{API}/coupons/validate", json={"code": unique_code})
        assert validate_response.status_code == 200, f"Coupon should be valid: {validate_response.text}"
        print(f"✓ Coupon {unique_code} is valid before booking")
        
        # Create booking with coupon
        booking_payload = {
            "service": "lawn_mowing",
            "property_size": 100,
            "condition": "normal",
            "additional_services": [],
            "preferred_date": "2025-02-15",
            "preferred_time": "morning",
            "customer_name": "Test FUNC003",
            "customer_phone": "+420123456789",
            "customer_email": "test.func003@example.com",
            "property_address": "Test Street 123",
            "notes": "FUNC-003 test",
            "estimated_price": 200,
            "gdpr_consent": True,
            "coupon_code": unique_code
        }
        booking_response = requests.post(f"{API}/bookings", json=booking_payload)
        assert booking_response.status_code == 200, f"Booking failed: {booking_response.text}"
        print(f"✓ Booking created with coupon {unique_code}")
        
        # Validate coupon again - should fail with "Tento kupón již byl použit"
        validate_response2 = requests.post(f"{API}/coupons/validate", json={"code": unique_code})
        assert validate_response2.status_code == 400, f"Expected 400, got {validate_response2.status_code}"
        error_detail = validate_response2.json().get("detail", "")
        assert "použit" in error_detail.lower() or "used" in error_detail.lower(), f"Expected 'used' error, got: {error_detail}"
        print(f"✓ FUNC-003: Second validation returns 'Tento kupón již byl použit': {error_detail}")


class TestPERF002PaginatedBookings:
    """PERF-002: GET /api/admin/bookings returns paginated format {bookings: [], total: N}"""
    
    def test_admin_bookings_returns_paginated_format(self):
        """GET /api/admin/bookings should return {bookings: [], total: N} not bare array"""
        # Login to get token
        login_response = requests.post(f"{API}/admin/login", json={"password": ADMIN_PASSWORD})
        assert login_response.status_code == 200
        token = login_response.json()["token"]
        headers = {"X-Admin-Token": token}
        
        # Get bookings
        response = requests.get(f"{API}/admin/bookings", headers=headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, dict), f"Response should be dict, got {type(data)}"
        assert "bookings" in data, "Response should contain 'bookings' key"
        assert "total" in data, "Response should contain 'total' key"
        assert isinstance(data["bookings"], list), "'bookings' should be a list"
        assert isinstance(data["total"], int), "'total' should be an integer"
        print(f"✓ PERF-002: GET /api/admin/bookings returns {{bookings: [{len(data['bookings'])} items], total: {data['total']}}}")


class TestFUNC004CustomOrderService:
    """FUNC-004: custom_order service is valid and accepted"""
    
    def test_booking_with_custom_order_service_succeeds(self):
        """Booking with service='custom_order' should succeed"""
        booking_payload = {
            "service": "custom_order",
            "property_size": 0,
            "condition": "normal",
            "additional_services": [],
            "preferred_date": "2025-02-20",
            "preferred_time": "anytime",
            "customer_name": "Test FUNC004",
            "customer_phone": "+420987654321",
            "customer_email": "test.func004@example.com",
            "property_address": "Custom Order Street 456",
            "notes": "[ZAKÁZKOVÁ PRÁCE] Test for FUNC-004",
            "estimated_price": 0,
            "gdpr_consent": True
        }
        response = requests.post(f"{API}/bookings", json=booking_payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "id" in data, "Response should contain booking 'id'"
        assert data["service"] == "custom_order", f"Service should be 'custom_order', got {data['service']}"
        print(f"✓ FUNC-004: Booking with custom_order service succeeds, id: {data['id'][:8]}...")


class TestPydanticValidation:
    """Pydantic validator: Invalid service should return 422"""
    
    def test_booking_with_invalid_service_returns_422(self):
        """Booking with invalid service should return 422 validation error"""
        booking_payload = {
            "service": "invalid_service_xyz",
            "property_size": 100,
            "condition": "normal",
            "additional_services": [],
            "preferred_date": "2025-02-25",
            "preferred_time": "morning",
            "customer_name": "Test Invalid",
            "customer_phone": "+420111222333",
            "customer_email": "test.invalid@example.com",
            "property_address": "Invalid Street 789",
            "notes": "Testing invalid service",
            "estimated_price": 0,
            "gdpr_consent": True
        }
        response = requests.post(f"{API}/bookings", json=booking_payload)
        assert response.status_code == 422, f"Expected 422, got {response.status_code}: {response.text}"
        print(f"✓ Pydantic: Booking with invalid service 'invalid_service_xyz' returns 422")


class TestStandardBookingFlow:
    """Standard booking flow still works (lawn_mowing + coupon)"""
    
    def test_standard_booking_with_lawn_mowing(self):
        """Standard booking with lawn_mowing service should succeed"""
        booking_payload = {
            "service": "lawn_mowing",
            "property_size": 150,
            "condition": "normal",
            "additional_services": [],
            "preferred_date": "2025-03-01",
            "preferred_time": "afternoon",
            "customer_name": "Test Standard",
            "customer_phone": "+420444555666",
            "customer_email": "test.standard@example.com",
            "property_address": "Standard Street 101",
            "notes": "Standard booking test",
            "estimated_price": 300,
            "gdpr_consent": True
        }
        response = requests.post(f"{API}/bookings", json=booking_payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "id" in data, "Response should contain booking 'id'"
        assert data["service"] == "lawn_mowing", f"Service should be 'lawn_mowing', got {data['service']}"
        print(f"✓ Standard booking with lawn_mowing succeeds, id: {data['id'][:8]}...")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
