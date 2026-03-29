"""
Test custom_order feature for SeknuTo.cz booking system
Tests the new 'Služby na objednávku' (custom order) flow
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCustomOrderBooking:
    """Tests for custom_order service type"""
    
    def test_create_custom_order_booking(self):
        """POST /api/bookings with service=custom_order should succeed"""
        future_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        
        payload = {
            "service": "custom_order",
            "property_size": 0,  # Not relevant for custom orders
            "condition": "normal",
            "additional_services": [],
            "preferred_date": future_date,
            "preferred_time": "anytime",
            "customer_name": "Test Custom Order",
            "customer_phone": "+420111222333",
            "customer_email": "custom_order_test@example.com",
            "property_address": "Zakázková 123, Praha",
            "notes": "[ZAKÁZKOVÁ PRÁCE]\nTyp zákazníka: Firma\nTypy prací: garden_design, planting\nPopis: Testovací zakázka",
            "estimated_price": 0,  # Price is "Dle dohody"
            "gdpr_consent": True
        }
        
        response = requests.post(f"{BASE_URL}/api/bookings", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should contain booking id"
        assert data["service"] == "custom_order", "Service should be custom_order"
        assert data["estimated_price"] == 0, "Price should be 0 for custom order"
        assert "[ZAKÁZKOVÁ PRÁCE]" in data["notes"], "Notes should contain custom order marker"
        
        print(f"✓ Custom order booking created with id: {data['id']}")
        return data["id"]
    
    def test_custom_order_booking_persisted(self):
        """Verify custom_order booking is persisted in database"""
        # First create a booking
        future_date = (datetime.now() + timedelta(days=8)).strftime('%Y-%m-%d')
        
        payload = {
            "service": "custom_order",
            "property_size": 0,
            "condition": "normal",
            "additional_services": [],
            "preferred_date": future_date,
            "preferred_time": "morning",
            "customer_name": "Persistence Test",
            "customer_phone": "+420999888777",
            "customer_email": "persist_test@example.com",
            "property_address": "Testovací 456, Brno",
            "notes": "[ZAKÁZKOVÁ PRÁCE]\nTyp zákazníka: Soukromá osoba\nTypy prací: lawn_installation\nPopis: Test persistence",
            "estimated_price": 0,
            "gdpr_consent": True
        }
        
        create_response = requests.post(f"{BASE_URL}/api/bookings", json=payload)
        assert create_response.status_code == 200
        booking_id = create_response.json()["id"]
        
        # Now fetch the booking
        get_response = requests.get(f"{BASE_URL}/api/bookings/{booking_id}")
        assert get_response.status_code == 200, f"Expected 200, got {get_response.status_code}"
        
        fetched = get_response.json()
        assert fetched["service"] == "custom_order"
        assert fetched["customer_name"] == "Persistence Test"
        assert "[ZAKÁZKOVÁ PRÁCE]" in fetched["notes"]
        
        print(f"✓ Custom order booking persisted and retrieved: {booking_id}")


class TestStandardBookingRegression:
    """Regression tests for standard booking flow (lawn mowing etc.)"""
    
    def test_standard_lawn_mowing_booking(self):
        """Standard lawn_mowing booking should still work"""
        future_date = (datetime.now() + timedelta(days=5)).strftime('%Y-%m-%d')
        
        payload = {
            "service": "lawn_mowing",
            "property_size": 200,
            "condition": "normal",
            "additional_services": [],
            "preferred_date": future_date,
            "preferred_time": "afternoon",
            "customer_name": "Standard Test",
            "customer_phone": "+420555666777",
            "customer_email": "standard_test@example.com",
            "property_address": "Standardní 789, Ostrava",
            "notes": "Běžná rezervace sekání trávy",
            "estimated_price": 400,  # 200m² × 2 Kč/m²
            "gdpr_consent": True
        }
        
        response = requests.post(f"{BASE_URL}/api/bookings", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["service"] == "lawn_mowing"
        assert data["property_size"] == 200
        assert data["estimated_price"] == 400
        
        print(f"✓ Standard lawn_mowing booking created: {data['id']}")
    
    def test_price_calculation_lawn_mowing(self):
        """Price calculation for lawn_mowing should work"""
        payload = {
            "service": "lawn_mowing",
            "property_size": 150,
            "condition": "normal",
            "additional_services": []
        }
        
        response = requests.post(f"{BASE_URL}/api/pricing/calculate", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        
        # 150m² × 2 Kč/m² = 300 Kč
        assert data["estimated_price"] == 300, f"Expected 300, got {data['estimated_price']}"
        
        print(f"✓ Price calculation correct: {data['estimated_price']} Kč")
    
    def test_price_calculation_with_condition(self):
        """Price calculation with overgrown condition should apply multiplier"""
        payload = {
            "service": "lawn_mowing",
            "property_size": 100,
            "condition": "overgrown",
            "additional_services": []
        }
        
        response = requests.post(f"{BASE_URL}/api/pricing/calculate", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        
        # 100m² × 2 Kč/m² × 1.5 (overgrown) = 300 Kč
        assert data["estimated_price"] == 300, f"Expected 300, got {data['estimated_price']}"
        assert data["condition_multiplier"] == 1.5
        
        print(f"✓ Overgrown condition multiplier applied: {data['estimated_price']} Kč")


class TestCouponSystem:
    """Test coupon system still works"""
    
    def test_validate_invalid_coupon(self):
        """Invalid coupon should return 404"""
        response = requests.post(f"{BASE_URL}/api/coupons/validate", json={"code": "INVALID_CODE_XYZ"})
        assert response.status_code == 404
        print("✓ Invalid coupon returns 404")


class TestServiceNames:
    """Test that custom_order is in service names"""
    
    def test_custom_order_in_service_names(self):
        """Verify custom_order is recognized as a valid service"""
        # Create a booking with custom_order to verify it's accepted
        future_date = (datetime.now() + timedelta(days=10)).strftime('%Y-%m-%d')
        
        payload = {
            "service": "custom_order",
            "property_size": 0,
            "condition": "normal",
            "additional_services": [],
            "preferred_date": future_date,
            "preferred_time": "anytime",
            "customer_name": "Service Name Test",
            "customer_phone": "+420123123123",
            "customer_email": "service_test@example.com",
            "property_address": "Test 1, Praha",
            "notes": "Testing service name",
            "estimated_price": 0,
            "gdpr_consent": True
        }
        
        response = requests.post(f"{BASE_URL}/api/bookings", json=payload)
        assert response.status_code == 200, "custom_order should be a valid service"
        print("✓ custom_order is a valid service type")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
