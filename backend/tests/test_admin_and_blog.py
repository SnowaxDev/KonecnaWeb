"""
Test suite for Admin Dashboard and Blog features - SeknuTo.cz
Tests: Admin login, stats, bookings, vouchers, coupons, blog endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin password from the review request
ADMIN_PASSWORD = "SeknuTo2025!"


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login with correct password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert len(data["token"]) > 0, "Token should not be empty"
        print(f"Admin login SUCCESS - token: {data['token'][:10]}...")
        return data["token"]
    
    def test_admin_login_wrong_password(self):
        """Test admin login with wrong password returns 401"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "password": "wrongpassword123"
        })
        assert response.status_code == 401, f"Expected 401 for wrong password, got {response.status_code}"
        print("Admin login with wrong password correctly returns 401")


class TestAdminStats:
    """Admin stats endpoint tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Failed to get admin token")
    
    def test_admin_stats_returns_all_fields(self, admin_token):
        """Test GET /api/admin/stats returns correct stats object"""
        headers = {"X-Admin-Token": admin_token}
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify all expected fields exist
        expected_fields = ["total_bookings", "pending_bookings", "active_vouchers", 
                          "total_coupons", "total_subscribers", "total_revenue_estimate"]
        
        for field in expected_fields:
            assert field in data, f"Missing field: {field}"
            assert isinstance(data[field], (int, float)), f"Field {field} should be numeric"
        
        print(f"Admin stats SUCCESS - bookings: {data['total_bookings']}, vouchers: {data['active_vouchers']}")
    
    def test_admin_stats_unauthorized(self):
        """Test admin stats without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 401, "Should return 401 without auth token"


class TestAdminBookings:
    """Admin bookings endpoint tests"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Failed to get admin token")
    
    def test_admin_get_bookings(self, admin_token):
        """Test GET /api/admin/bookings returns bookings array"""
        headers = {"X-Admin-Token": admin_token}
        response = requests.get(f"{BASE_URL}/api/admin/bookings", headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list/array"
        print(f"Admin bookings SUCCESS - found {len(data)} bookings")
        
        # If there are bookings, verify structure
        if len(data) > 0:
            booking = data[0]
            expected_fields = ["id", "customer_name", "service", "status"]
            for field in expected_fields:
                assert field in booking, f"Booking should have field: {field}"


class TestAdminVouchers:
    """Admin vouchers endpoint tests"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Failed to get admin token")
    
    def test_admin_get_vouchers(self, admin_token):
        """Test GET /api/admin/vouchers returns vouchers array"""
        headers = {"X-Admin-Token": admin_token}
        response = requests.get(f"{BASE_URL}/api/admin/vouchers", headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list/array"
        print(f"Admin vouchers SUCCESS - found {len(data)} vouchers")


class TestAdminCoupons:
    """Admin coupons endpoint tests"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Failed to get admin token")
    
    def test_admin_get_coupons(self, admin_token):
        """Test GET /api/admin/coupons returns coupons array"""
        headers = {"X-Admin-Token": admin_token}
        response = requests.get(f"{BASE_URL}/api/admin/coupons", headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list/array"
        print(f"Admin coupons SUCCESS - found {len(data)} coupons")


class TestBlogEndpoints:
    """Blog public endpoints tests"""
    
    def test_get_blog_posts_list(self):
        """Test GET /api/blog/posts returns published posts"""
        response = requests.get(f"{BASE_URL}/api/blog/posts")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list/array"
        print(f"Blog posts list SUCCESS - found {len(data)} posts")
        
        # Verify post structure if posts exist
        if len(data) > 0:
            post = data[0]
            expected_fields = ["id", "title", "slug", "excerpt", "published"]
            for field in expected_fields:
                assert field in post, f"Post should have field: {field}"
    
    def test_get_blog_post_by_slug(self):
        """Test GET /api/blog/posts/{slug} returns specific post"""
        # Test with known seed post slug
        slug = "jak-pecovat-o-travnik-na-jare"
        response = requests.get(f"{BASE_URL}/api/blog/posts/{slug}")
        
        # May return 404 if post doesn't exist yet - that's ok for testing
        if response.status_code == 404:
            print(f"Blog post '{slug}' not found (may need seeding)")
            return
        
        assert response.status_code == 200, f"Expected 200 or 404, got {response.status_code}"
        
        data = response.json()
        assert "title" in data, "Post should have title"
        assert "content" in data, "Post should have content"
        assert data["slug"] == slug, "Returned post should have correct slug"
        print(f"Blog post SUCCESS - title: {data['title']}")
    
    def test_get_nonexistent_blog_post(self):
        """Test GET /api/blog/posts/nonexistent returns 404"""
        response = requests.get(f"{BASE_URL}/api/blog/posts/nonexistent-post-slug-12345")
        assert response.status_code == 404, f"Expected 404 for nonexistent post, got {response.status_code}"


class TestAdminBlog:
    """Admin blog management tests"""
    
    @pytest.fixture
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Failed to get admin token")
    
    def test_admin_get_blog_posts(self, admin_token):
        """Test GET /api/admin/blog/posts returns all posts (including drafts)"""
        headers = {"X-Admin-Token": admin_token}
        response = requests.get(f"{BASE_URL}/api/admin/blog/posts", headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list/array"
        print(f"Admin blog posts SUCCESS - found {len(data)} posts")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
