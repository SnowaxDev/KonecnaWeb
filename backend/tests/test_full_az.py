"""
Full A-Z Backend Test Suite for SeknuTo.cz
Tests all core backend APIs including:
- Health check
- Admin authentication (login, 401 handling)
- Voucher system (create, get, validate)
- Coupon system
- Pricing calculation
- Blog posts
- Gallery projects
"""

import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://booking-system-test-7.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

ADMIN_PASSWORD = "SeknuTo2025!"
WRONG_PASSWORD = "wrongpassword123"


class TestHealthCheck:
    """Health check and basic API status"""
    
    def test_api_root(self):
        """GET /api/ returns running status"""
        response = requests.get(f"{API}/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        assert "SeknuTo" in data["message"]
        print(f"✓ API root: {data}")


class TestAdminAuthentication:
    """Admin login and 401 handling tests - CRITICAL BUG FIX VERIFICATION"""
    
    def test_admin_login_wrong_password_returns_401(self):
        """POST /api/admin/login with wrong password returns 401 with detail message"""
        response = requests.post(f"{API}/admin/login", json={"password": WRONG_PASSWORD})
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ Wrong password returns 401: {data}")
    
    def test_admin_login_success(self):
        """POST /api/admin/login with correct password succeeds"""
        response = requests.post(f"{API}/admin/login", json={"password": ADMIN_PASSWORD})
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert len(data["token"]) > 0
        print(f"✓ Admin login success, token: {data['token'][:20]}...")
        return data["token"]
    
    def test_admin_stats_with_invalid_token_returns_401(self):
        """GET /api/admin/stats with invalid token returns 401 (not 500)"""
        headers = {"X-Admin-Token": "invalid-expired-token-12345"}
        response = requests.get(f"{API}/admin/stats", headers=headers)
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ Invalid token returns 401: {data}")
    
    def test_admin_stats_without_token_returns_401(self):
        """GET /api/admin/stats without token returns 401"""
        response = requests.get(f"{API}/admin/stats")
        assert response.status_code == 401
        print("✓ No token returns 401")
    
    def test_admin_stats_with_valid_token(self):
        """GET /api/admin/stats with valid token returns stats"""
        # Login first
        login_resp = requests.post(f"{API}/admin/login", json={"password": ADMIN_PASSWORD})
        token = login_resp.json()["token"]
        
        headers = {"X-Admin-Token": token}
        response = requests.get(f"{API}/admin/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_bookings" in data
        assert "pending_bookings" in data
        assert "active_vouchers" in data
        assert "total_coupons" in data
        assert "total_subscribers" in data
        assert "total_revenue_estimate" in data
        print(f"✓ Admin stats: bookings={data['total_bookings']}, vouchers={data['active_vouchers']}")


class TestVoucherSystem:
    """Voucher CRUD and validation tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        resp = requests.post(f"{API}/admin/login", json={"password": ADMIN_PASSWORD})
        return resp.json()["token"]
    
    def test_create_voucher_without_code_auto_generates(self, admin_token):
        """POST /api/vouchers without code auto-generates one"""
        headers = {"X-Admin-Token": admin_token}
        valid_from = datetime.now().isoformat()
        valid_until = (datetime.now() + timedelta(days=90)).isoformat()
        
        payload = {
            "display_name": "Test Auto-Generated Code",
            "discount_type": "percentage",
            "discount_value": 15,
            "max_uses": 1,
            "valid_from": valid_from,
            "valid_until": valid_until
        }
        response = requests.post(f"{API}/vouchers", json=payload, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "code" in data
        assert len(data["code"]) > 0
        assert data["code"].startswith("SEKNU")  # Auto-generated codes start with SEKNU
        print(f"✓ Auto-generated voucher code: {data['code']}")
    
    def test_create_voucher_with_fixed_amount(self, admin_token):
        """POST /api/vouchers creates voucher with fixed_amount type"""
        headers = {"X-Admin-Token": admin_token}
        valid_from = datetime.now().isoformat()
        valid_until = (datetime.now() + timedelta(days=90)).isoformat()
        
        payload = {
            "code": f"TESTFIXED{datetime.now().strftime('%H%M%S')}",
            "display_name": "Test Fixed 100 Kč",
            "discount_type": "fixed_amount",
            "discount_value": 100,
            "max_uses": 5,
            "valid_from": valid_from,
            "valid_until": valid_until
        }
        response = requests.post(f"{API}/vouchers", json=payload, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["discount_type"] == "fixed_amount"
        assert data["discount_value"] == 100
        print(f"✓ Fixed amount voucher created: {data['code']} = {data['discount_value']} Kč")
        return data["code"]
    
    def test_get_voucher_returns_is_valid(self, admin_token):
        """GET /api/vouchers/:code returns voucher info with is_valid=true"""
        headers = {"X-Admin-Token": admin_token}
        
        # First create a voucher
        valid_from = datetime.now().isoformat()
        valid_until = (datetime.now() + timedelta(days=90)).isoformat()
        code = f"TESTGET{datetime.now().strftime('%H%M%S')}"
        
        create_payload = {
            "code": code,
            "display_name": "Test Get Voucher",
            "discount_type": "percentage",
            "discount_value": 20,
            "max_uses": 1,
            "valid_from": valid_from,
            "valid_until": valid_until
        }
        requests.post(f"{API}/vouchers", json=create_payload, headers=headers)
        
        # Now get it (public endpoint)
        response = requests.get(f"{API}/vouchers/{code}")
        assert response.status_code == 200
        data = response.json()
        assert data["is_valid"] == True
        assert "display_discount" in data
        print(f"✓ Voucher {code} is_valid={data['is_valid']}, display_discount={data['display_discount']}")


class TestCouponSystem:
    """Admin coupon management tests"""
    
    @pytest.fixture
    def admin_token(self):
        resp = requests.post(f"{API}/admin/login", json={"password": ADMIN_PASSWORD})
        return resp.json()["token"]
    
    def test_create_coupon(self, admin_token):
        """POST /api/admin/coupons creates a new coupon"""
        headers = {"X-Admin-Token": admin_token}
        code = f"TESTCOUP{datetime.now().strftime('%H%M%S')}"
        
        payload = {
            "code": code,
            "discount_percent": 10,
            "description": "Test coupon 10%"
        }
        response = requests.post(f"{API}/admin/coupons", json=payload, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == code
        assert data["discount_percent"] == 10
        print(f"✓ Coupon created: {code} = {data['discount_percent']}%")


class TestPricingCalculation:
    """Pricing calculation tests"""
    
    def test_calculate_lawn_mowing_price(self):
        """POST /api/pricing/calculate returns price estimate"""
        payload = {
            "service": "lawn_mowing",
            "property_size": 200,
            "condition": "normal",
            "additional_services": []
        }
        response = requests.post(f"{API}/pricing/calculate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "estimated_price" in data
        assert data["estimated_price"] > 0
        # lawn_mowing is 2 Kč/m², so 200m² = 400 Kč
        assert data["estimated_price"] == 400
        print(f"✓ Price calculation: {payload['property_size']}m² lawn_mowing = {data['estimated_price']} Kč")
    
    def test_calculate_package_price(self):
        """POST /api/pricing/calculate for seasonal package"""
        payload = {
            "service": "spring_package",
            "property_size": 300,
            "condition": "normal",
            "additional_services": []
        }
        response = requests.post(f"{API}/pricing/calculate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "estimated_price" in data
        assert data["estimated_price"] > 0
        # spring_package: 200-500m² = medium tier = 10 Kč/m², so 300m² = 3000 Kč
        assert "tier_info" in data
        print(f"✓ Package price: {payload['property_size']}m² spring_package = {data['estimated_price']} Kč, tier={data.get('tier_info', {}).get('tier')}")


class TestBlogPosts:
    """Blog posts public API tests"""
    
    def test_get_blog_posts(self):
        """GET /api/blog/posts returns published posts"""
        response = requests.get(f"{API}/blog/posts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Blog posts: {len(data)} posts found")
        if len(data) > 0:
            post = data[0]
            assert "title" in post
            assert "slug" in post
            print(f"  First post: '{post['title']}' at /blog/{post['slug']}")


class TestGalleryProjects:
    """Gallery projects public API tests"""
    
    def test_get_gallery_projects(self):
        """GET /api/gallery/projects returns published gallery projects"""
        response = requests.get(f"{API}/gallery/projects")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Gallery projects: {len(data)} projects found")


class TestAdminEndpointsAuth:
    """Test that all admin endpoints properly return 401 for invalid tokens"""
    
    def test_admin_bookings_invalid_token_returns_401(self):
        """GET /api/admin/bookings with invalid token returns 401"""
        headers = {"X-Admin-Token": "invalid-token"}
        response = requests.get(f"{API}/admin/bookings", headers=headers)
        assert response.status_code == 401
        print("✓ /api/admin/bookings returns 401 for invalid token")
    
    def test_admin_vouchers_invalid_token_returns_401(self):
        """GET /api/admin/vouchers with invalid token returns 401"""
        headers = {"X-Admin-Token": "invalid-token"}
        response = requests.get(f"{API}/admin/vouchers", headers=headers)
        assert response.status_code == 401
        print("✓ /api/admin/vouchers returns 401 for invalid token")
    
    def test_admin_coupons_invalid_token_returns_401(self):
        """GET /api/admin/coupons with invalid token returns 401"""
        headers = {"X-Admin-Token": "invalid-token"}
        response = requests.get(f"{API}/admin/coupons", headers=headers)
        assert response.status_code == 401
        print("✓ /api/admin/coupons returns 401 for invalid token")
    
    def test_admin_gallery_invalid_token_returns_401(self):
        """GET /api/admin/gallery/projects with invalid token returns 401"""
        headers = {"X-Admin-Token": "invalid-token"}
        response = requests.get(f"{API}/admin/gallery/projects", headers=headers)
        assert response.status_code == 401
        print("✓ /api/admin/gallery/projects returns 401 for invalid token")
    
    def test_admin_blog_invalid_token_returns_401(self):
        """GET /api/admin/blog/posts with invalid token returns 401"""
        headers = {"X-Admin-Token": "invalid-token"}
        response = requests.get(f"{API}/admin/blog/posts", headers=headers)
        assert response.status_code == 401
        print("✓ /api/admin/blog/posts returns 401 for invalid token")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
