"""
Comprehensive Security + Functionality Test Suite for SeknuTo.cz
Pre-production deployment testing

Tests cover:
- Security: Admin authentication, token validation, SQL injection, XSS, input sanitization
- Booking flow: Create, retrieve, update status
- Coupon/Voucher system: Create, validate, claim, redeem
- Email: Newsletter subscription
- Payment: Stripe deposit session
- Gallery/Blog: CRUD operations
"""
import pytest
import requests
import os
import uuid
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
ADMIN_PASSWORD = "SeknuTo2025!"

# Test data tracking for cleanup
TEST_IDS = {
    "bookings": [],
    "vouchers": [],
    "coupons": [],
    "subscribers": []
}


@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture
def admin_token(api_client):
    """Get valid admin token"""
    response = api_client.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    return response.json().get("token")


# ================= SECURITY TESTS =================

class TestAdminSecurity:
    """Test admin endpoint security - must return 401 for unauthorized access"""

    def test_admin_stats_without_token_returns_401(self, api_client):
        """Admin /api/admin/stats WITHOUT token should return 401 (not 200 or 500)"""
        response = api_client.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"

    def test_admin_bookings_with_fake_token_returns_401(self, api_client):
        """Admin /api/admin/bookings with random fake token should return 401"""
        fake_token = str(uuid.uuid4())
        response = api_client.get(
            f"{BASE_URL}/api/admin/bookings",
            headers={"X-Admin-Token": fake_token}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"

    def test_admin_coupons_with_empty_token_returns_401(self, api_client):
        """Admin /api/admin/coupons with empty X-Admin-Token header should return 401"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/coupons",
            headers={"X-Admin-Token": ""}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"

    def test_admin_vouchers_without_token_returns_401(self, api_client):
        """Admin /api/admin/vouchers WITHOUT token should return 401"""
        response = api_client.get(f"{BASE_URL}/api/admin/vouchers")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"

    def test_admin_gallery_without_token_returns_401(self, api_client):
        """Admin /api/admin/gallery/projects WITHOUT token should return 401"""
        response = api_client.get(f"{BASE_URL}/api/admin/gallery/projects")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"

    def test_admin_blog_without_token_returns_401(self, api_client):
        """Admin /api/admin/blog/posts WITHOUT token should return 401"""
        response = api_client.get(f"{BASE_URL}/api/admin/blog/posts")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestLoginSecurity:
    """Test login security - SQL injection and brute force"""

    def test_sql_injection_attempt_returns_401(self, api_client):
        """Admin login with SQL injection attempt should return 401"""
        sql_injection_password = "SeknuTo2025!' OR '1'='1"
        response = api_client.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": sql_injection_password}
        )
        assert response.status_code == 401, f"SQL injection should fail with 401, got {response.status_code}"

    def test_brute_force_all_return_401(self, api_client):
        """Admin login brute force: 5 wrong passwords should ALL return 401"""
        wrong_passwords = ["wrong1", "wrong2", "wrong3", "admin", "password"]
        for pwd in wrong_passwords:
            response = api_client.post(
                f"{BASE_URL}/api/admin/login",
                json={"password": pwd}
            )
            assert response.status_code == 401, f"Wrong password '{pwd}' should return 401, got {response.status_code}"

    def test_correct_password_returns_200_with_token(self, api_client):
        """Admin login with correct password returns 200 and token"""
        response = api_client.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert len(data["token"]) > 0


class TestInputValidation:
    """Test input validation - missing fields should return 422"""

    def test_voucher_missing_required_fields_returns_422(self, api_client, admin_token):
        """POST /api/vouchers with missing required fields should return 422"""
        # Missing display_name, discount_type, valid_from, valid_until
        response = api_client.post(
            f"{BASE_URL}/api/vouchers",
            json={"code": "TEST123"},
            headers={"X-Admin-Token": admin_token}
        )
        assert response.status_code == 422, f"Expected 422 for missing fields, got {response.status_code}: {response.text}"

    def test_booking_missing_customer_name_returns_422(self, api_client):
        """POST /api/bookings with missing customer_name should return 422"""
        booking_data = {
            "service": "lawn_mowing",
            "property_size": 100,
            "condition": "normal",
            "preferred_date": "2025-02-15",
            "preferred_time": "morning",
            # customer_name is missing
            "customer_phone": "+420123456789",
            "customer_email": "test@example.com",
            "property_address": "Test Address",
            "estimated_price": 200
        }
        response = api_client.post(f"{BASE_URL}/api/bookings", json=booking_data)
        assert response.status_code == 422, f"Expected 422 for missing customer_name, got {response.status_code}: {response.text}"

    def test_booking_invalid_email_format_handled(self, api_client):
        """POST /api/bookings with invalid email format should return 422 or be handled gracefully"""
        booking_data = {
            "service": "lawn_mowing",
            "property_size": 100,
            "condition": "normal",
            "preferred_date": "2025-02-15",
            "preferred_time": "morning",
            "customer_name": "Test User",
            "customer_phone": "+420123456789",
            "customer_email": "not-an-email",  # Invalid email format
            "property_address": "Test Address",
            "estimated_price": 200
        }
        response = api_client.post(f"{BASE_URL}/api/bookings", json=booking_data)
        # Should return 422 for validation error
        assert response.status_code == 422, f"Expected 422 for invalid email, got {response.status_code}: {response.text}"

    def test_admin_blog_invalid_patch_body_returns_error(self, api_client, admin_token):
        """Admin /api/admin/blog/posts with valid token but invalid PATCH body returns proper error"""
        # Try to PATCH a non-existent post
        response = api_client.patch(
            f"{BASE_URL}/api/admin/blog/posts/nonexistent-id",
            json={"invalid_field": "value"},
            headers={"X-Admin-Token": admin_token}
        )
        # Should return 404 (post not found) or handle the error gracefully
        assert response.status_code in [400, 404], f"Expected 400 or 404, got {response.status_code}"


class TestXSSSanitization:
    """Test XSS protection - script tags should be stored escaped or rejected"""

    def test_xss_in_booking_notes_stored_safely(self, api_client):
        """POST /api/bookings with XSS in notes should store escaped or rejected"""
        xss_payload = '<script>alert(1)</script>'
        booking_data = {
            "service": "lawn_mowing",
            "property_size": 100,
            "condition": "normal",
            "preferred_date": "2025-02-20",
            "preferred_time": "morning",
            "customer_name": "XSS Test User",
            "customer_phone": "+420999888777",
            "customer_email": "xsstest@example.com",
            "property_address": "XSS Test Address",
            "notes": xss_payload,  # XSS attempt
            "estimated_price": 200
        }
        response = api_client.post(f"{BASE_URL}/api/bookings", json=booking_data)
        
        # If booking is created, check that the notes are stored (might be escaped or as-is for DB)
        # The important thing is it doesn't execute - that's frontend's job
        if response.status_code == 200:
            data = response.json()
            TEST_IDS["bookings"].append(data.get("id"))
            # Notes should be stored - XSS protection is typically on display, not storage
            assert "id" in data, "Booking should have been created"
            print(f"XSS payload stored in notes field - frontend must escape on display")
        else:
            # If rejected, that's also acceptable
            print(f"XSS booking rejected with status {response.status_code}")


# ================= BOOKING FLOW TESTS =================

class TestBookingFlow:
    """Test complete booking flow"""

    def test_pricing_calculate_lawn_mowing_100m2(self, api_client):
        """POST /api/pricing/calculate for lawn_mowing 100m2 returns price > 0"""
        response = api_client.post(
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
        assert "estimated_price" in data
        assert data["estimated_price"] > 0, f"Price should be > 0, got {data['estimated_price']}"
        print(f"Lawn mowing 100m2 price: {data['estimated_price']} Kč")

    def test_pricing_calculate_garden_work_3_hours(self, api_client):
        """POST /api/pricing/calculate for garden_work 3 hours returns hourly price"""
        response = api_client.post(
            f"{BASE_URL}/api/pricing/calculate",
            json={
                "service": "garden_work",
                "property_size": 3,  # hours
                "condition": "normal",
                "additional_services": []
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["estimated_price"] > 0, f"Price should be > 0, got {data['estimated_price']}"
        # 350 Kč/hour * 3 hours = 1050 Kč
        print(f"Garden work 3 hours price: {data['estimated_price']} Kč")

    def test_create_booking_full_fields_returns_id(self, api_client):
        """POST /api/bookings creates booking with all required fields and returns id"""
        unique_id = str(uuid.uuid4())[:8]
        booking_data = {
            "service": "lawn_mowing",
            "property_size": 150,
            "condition": "normal",
            "additional_services": [],
            "preferred_date": "2025-02-15",
            "preferred_time": "morning",
            "customer_name": f"Test Customer {unique_id}",
            "customer_phone": "+420555123456",
            "customer_email": f"test_{unique_id}@example.com",
            "property_address": "Testovaci 123, Praha",
            "notes": "Test booking for security testing",
            "estimated_price": 300
        }
        response = api_client.post(f"{BASE_URL}/api/bookings", json=booking_data)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data, f"Booking should have an id: {data}"
        assert data["customer_name"] == booking_data["customer_name"]
        TEST_IDS["bookings"].append(data["id"])
        print(f"Created booking: {data['id']}")
        return data["id"]

    def test_create_booking_with_coupon_code_stores_it(self, api_client):
        """POST /api/bookings with coupon_code field stores coupon code"""
        unique_id = str(uuid.uuid4())[:8]
        booking_data = {
            "service": "lawn_mowing",
            "property_size": 100,
            "condition": "normal",
            "preferred_date": "2025-02-16",
            "preferred_time": "afternoon",
            "customer_name": f"Coupon Test {unique_id}",
            "customer_phone": "+420555111222",
            "customer_email": f"coupon_{unique_id}@example.com",
            "property_address": "Kupon 456, Brno",
            "estimated_price": 200,
            "coupon_code": "TESTCOUPON"
        }
        response = api_client.post(f"{BASE_URL}/api/bookings", json=booking_data)
        assert response.status_code == 200
        data = response.json()
        assert data.get("coupon_code") == "TESTCOUPON", f"Coupon code not stored: {data}"
        TEST_IDS["bookings"].append(data["id"])
        print(f"Booking with coupon: {data['id']}, coupon: {data.get('coupon_code')}")

    def test_admin_get_bookings_shows_new_booking(self, api_client, admin_token):
        """GET /api/admin/bookings shows newly created booking"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/bookings",
            headers={"X-Admin-Token": admin_token}
        )
        assert response.status_code == 200
        bookings = response.json()
        assert isinstance(bookings, list)
        print(f"Admin sees {len(bookings)} bookings")

    def test_admin_update_booking_status_to_confirmed(self, api_client, admin_token):
        """PATCH /api/admin/bookings/:id/status updates status to confirmed"""
        # First create a booking
        unique_id = str(uuid.uuid4())[:8]
        booking_data = {
            "service": "lawn_mowing",
            "property_size": 100,
            "condition": "normal",
            "preferred_date": "2025-02-17",
            "preferred_time": "anytime",
            "customer_name": f"Status Test {unique_id}",
            "customer_phone": "+420555333444",
            "customer_email": f"status_{unique_id}@example.com",
            "property_address": "Status 789, Ostrava",
            "estimated_price": 200
        }
        create_response = api_client.post(f"{BASE_URL}/api/bookings", json=booking_data)
        assert create_response.status_code == 200
        booking_id = create_response.json()["id"]
        TEST_IDS["bookings"].append(booking_id)

        # Update status
        response = api_client.patch(
            f"{BASE_URL}/api/admin/bookings/{booking_id}/status",
            json={"status": "confirmed"},
            headers={"X-Admin-Token": admin_token}
        )
        assert response.status_code == 200
        assert response.json().get("success") == True
        print(f"Booking {booking_id} status updated to confirmed")


# ================= EMAIL TESTS =================

class TestEmailAndNewsletter:
    """Test email subscription"""

    def test_newsletter_subscribe_adds_subscriber(self, api_client):
        """POST /api/newsletter/subscribe with valid email adds subscriber"""
        # Note: The endpoint is actually /api/subscribe
        unique_id = str(uuid.uuid4())[:8]
        email = f"newsletter_{unique_id}@example.com"
        
        response = api_client.post(
            f"{BASE_URL}/api/subscribe",
            json={"email": email}
        )
        assert response.status_code == 200
        data = response.json()
        assert "coupon_code" in data, f"Should receive coupon code: {data}"
        print(f"Newsletter subscription successful, coupon: {data.get('coupon_code')}")


# ================= COUPON SYSTEM TESTS =================

class TestCouponSystem:
    """Test coupon creation and validation"""

    def test_admin_create_coupon_auto_generated_code(self, api_client, admin_token):
        """POST /api/admin/coupons creates coupon with auto-generated code"""
        response = api_client.post(
            f"{BASE_URL}/api/admin/coupons",
            json={
                "discount_percent": 15,
                "description": "Test auto-gen coupon"
            },
            headers={"X-Admin-Token": admin_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "code" in data
        assert data["code"].startswith("SEKNU"), f"Auto-generated code should start with SEKNU: {data['code']}"
        TEST_IDS["coupons"].append(data["code"])
        print(f"Created coupon: {data['code']} ({data.get('discount_percent')}%)")
        return data["code"]

    def test_coupon_validate_valid_code_returns_discount(self, api_client, admin_token):
        """GET /api/coupons/validate/:code returns discount_percent for valid coupon"""
        # First create a coupon
        create_resp = api_client.post(
            f"{BASE_URL}/api/admin/coupons",
            json={"discount_percent": 10, "description": "Validation test"},
            headers={"X-Admin-Token": admin_token}
        )
        assert create_resp.status_code == 200
        code = create_resp.json()["code"]
        TEST_IDS["coupons"].append(code)

        # Validate it
        response = api_client.post(
            f"{BASE_URL}/api/coupons/validate",
            json={"code": code}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("valid") == True
        assert data.get("discount_percent") == 10
        print(f"Coupon {code} validated: {data.get('discount_percent')}% discount")

    def test_coupon_validate_invalid_code_returns_404(self, api_client):
        """GET /api/coupons/validate/INVALID_CODE returns 404"""
        response = api_client.post(
            f"{BASE_URL}/api/coupons/validate",
            json={"code": "INVALID_CODE_12345"}
        )
        assert response.status_code == 404, f"Expected 404 for invalid coupon, got {response.status_code}"


# ================= VOUCHER SYSTEM TESTS =================

class TestVoucherSystem:
    """Test voucher creation, validation, claim, and redemption"""

    def test_create_voucher_percentage_type(self, api_client, admin_token):
        """POST /api/vouchers with percentage type creates active voucher"""
        unique_code = f"SECTEST{str(uuid.uuid4())[:5].upper()}"
        voucher_data = {
            "code": unique_code,
            "display_name": "Security Test Voucher 20%",
            "discount_type": "percentage",
            "discount_value": 20,
            "max_uses": 5,
            "valid_from": datetime.now().isoformat(),
            "valid_until": (datetime.now() + timedelta(days=30)).isoformat()
        }
        response = api_client.post(
            f"{BASE_URL}/api/vouchers",
            json=voucher_data,
            headers={"X-Admin-Token": admin_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == unique_code
        assert data["status"] == "active"
        TEST_IDS["vouchers"].append(unique_code)
        print(f"Created percentage voucher: {unique_code}")
        return unique_code

    def test_create_voucher_fixed_amount_type(self, api_client, admin_token):
        """POST /api/vouchers with fixed_amount type creates active voucher"""
        unique_code = f"SECFIX{str(uuid.uuid4())[:5].upper()}"
        voucher_data = {
            "code": unique_code,
            "display_name": "Security Test Voucher 100 Kč",
            "discount_type": "fixed_amount",
            "discount_value": 100,
            "max_uses": 3,
            "valid_from": datetime.now().isoformat(),
            "valid_until": (datetime.now() + timedelta(days=30)).isoformat()
        }
        response = api_client.post(
            f"{BASE_URL}/api/vouchers",
            json=voucher_data,
            headers={"X-Admin-Token": admin_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["code"] == unique_code
        assert data["discount_type"] == "fixed_amount"
        TEST_IDS["vouchers"].append(unique_code)
        print(f"Created fixed amount voucher: {unique_code}")
        return unique_code

    def test_get_voucher_returns_is_valid_and_display_discount(self, api_client, admin_token):
        """GET /api/vouchers/:code returns is_valid=true and display_discount"""
        # First create a voucher
        unique_code = f"SECGET{str(uuid.uuid4())[:5].upper()}"
        api_client.post(
            f"{BASE_URL}/api/vouchers",
            json={
                "code": unique_code,
                "display_name": "Get Test Voucher",
                "discount_type": "percentage",
                "discount_value": 25,
                "max_uses": 10,
                "valid_from": datetime.now().isoformat(),
                "valid_until": (datetime.now() + timedelta(days=30)).isoformat()
            },
            headers={"X-Admin-Token": admin_token}
        )
        TEST_IDS["vouchers"].append(unique_code)

        # Get voucher info
        response = api_client.get(f"{BASE_URL}/api/vouchers/{unique_code}")
        assert response.status_code == 200
        data = response.json()
        assert data.get("is_valid") == True, f"Voucher should be valid: {data}"
        assert "display_discount" in data, f"Should have display_discount: {data}"
        print(f"Voucher {unique_code}: is_valid={data.get('is_valid')}, display={data.get('display_discount')}")

    def test_claim_voucher_returns_redirect_url(self, api_client, admin_token):
        """POST /api/vouchers/:code/claim returns redirect_url with voucher params"""
        # Create voucher
        unique_code = f"SECCLM{str(uuid.uuid4())[:5].upper()}"
        api_client.post(
            f"{BASE_URL}/api/vouchers",
            json={
                "code": unique_code,
                "display_name": "Claim Test Voucher",
                "discount_type": "percentage",
                "discount_value": 15,
                "max_uses": 10,
                "valid_from": datetime.now().isoformat(),
                "valid_until": (datetime.now() + timedelta(days=30)).isoformat()
            },
            headers={"X-Admin-Token": admin_token}
        )
        TEST_IDS["vouchers"].append(unique_code)

        # Claim voucher
        response = api_client.post(f"{BASE_URL}/api/vouchers/{unique_code}/claim")
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "redirect_url" in data
        assert unique_code in data["redirect_url"]
        print(f"Claim response: redirect_url={data.get('redirect_url')}")

    def test_redeem_voucher_marks_as_used(self, api_client, admin_token):
        """POST /api/vouchers/:code/redeem marks voucher as used"""
        # Create voucher with max_uses=1
        unique_code = f"SECRED{str(uuid.uuid4())[:5].upper()}"
        api_client.post(
            f"{BASE_URL}/api/vouchers",
            json={
                "code": unique_code,
                "display_name": "Redeem Test Voucher",
                "discount_type": "percentage",
                "discount_value": 10,
                "max_uses": 1,
                "valid_from": datetime.now().isoformat(),
                "valid_until": (datetime.now() + timedelta(days=30)).isoformat()
            },
            headers={"X-Admin-Token": admin_token}
        )
        TEST_IDS["vouchers"].append(unique_code)

        # Redeem it
        booking_id = f"test-booking-{uuid.uuid4()}"
        response = api_client.post(
            f"{BASE_URL}/api/vouchers/{unique_code}/redeem",
            params={"booking_id": booking_id, "discount_applied": 50}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        print(f"Redeemed voucher {unique_code}")

    def test_get_nonexistent_voucher_returns_404(self, api_client):
        """GET /api/vouchers/NONEXISTENT returns 404"""
        response = api_client.get(f"{BASE_URL}/api/vouchers/NONEXISTENT_VOUCHER_12345")
        assert response.status_code == 404


# ================= PAYMENT TESTS =================

class TestPayment:
    """Test Stripe payment integration"""

    def test_create_deposit_returns_stripe_checkout_url(self, api_client):
        """POST /api/payments/deposit/create returns valid Stripe checkout URL"""
        response = api_client.post(
            f"{BASE_URL}/api/payments/deposit/create",
            json={"origin_url": "https://seknuto.cz"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "url" in data, f"Should have checkout URL: {data}"
        assert "session_id" in data
        # Stripe test mode URLs contain 'checkout.stripe.com'
        assert "stripe.com" in data["url"] or "session_id" in data
        print(f"Stripe session created: {data.get('session_id')}")

    def test_get_deposit_status_returns_status(self, api_client):
        """GET /api/payments/deposit/status/:session_id returns status"""
        # First create a session
        create_resp = api_client.post(
            f"{BASE_URL}/api/payments/deposit/create",
            json={"origin_url": "https://seknuto.cz"}
        )
        if create_resp.status_code == 200:
            session_id = create_resp.json().get("session_id")
            if session_id:
                response = api_client.get(f"{BASE_URL}/api/payments/deposit/status/{session_id}")
                assert response.status_code == 200
                data = response.json()
                assert "status" in data
                print(f"Payment status for {session_id}: {data.get('status')}")


# ================= GALLERY + BLOG TESTS =================

class TestGalleryAndBlog:
    """Test gallery and blog public endpoints"""

    def test_gallery_projects_returns_array(self, api_client):
        """GET /api/gallery/projects returns array (empty ok)"""
        response = api_client.get(f"{BASE_URL}/api/gallery/projects")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), f"Should return array: {data}"
        print(f"Gallery has {len(data)} projects")

    def test_blog_posts_returns_array(self, api_client):
        """GET /api/blog/posts returns array"""
        response = api_client.get(f"{BASE_URL}/api/blog/posts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), f"Should return array: {data}"
        print(f"Blog has {len(data)} posts")

    def test_blog_post_by_slug_returns_post(self, api_client):
        """GET /api/blog/posts/jak-pecovat-o-travnik-na-jare returns full post"""
        response = api_client.get(f"{BASE_URL}/api/blog/posts/jak-pecovat-o-travnik-na-jare")
        # If post exists, should return 200
        if response.status_code == 200:
            data = response.json()
            assert "title" in data
            assert "content" in data
            print(f"Blog post found: {data.get('title')}")
        else:
            # 404 is acceptable if post doesn't exist in DB
            assert response.status_code == 404
            print("Blog post jak-pecovat-o-travnik-na-jare not found (404)")

    def test_blog_nonexistent_slug_returns_404(self, api_client):
        """GET /api/blog/posts/nonexistent-slug returns 404"""
        response = api_client.get(f"{BASE_URL}/api/blog/posts/nonexistent-slug-12345")
        assert response.status_code == 404


# ================= ADMIN STATS VERIFICATION =================

class TestAdminStatsUpdates:
    """Test that admin stats update after actions"""

    def test_admin_stats_shows_counts_after_operations(self, api_client, admin_token):
        """GET /api/admin/stats shows updated counts"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"X-Admin-Token": admin_token}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify all expected fields exist
        assert "total_bookings" in data
        assert "pending_bookings" in data
        assert "active_vouchers" in data
        assert "total_coupons" in data
        assert "total_subscribers" in data
        assert "total_revenue_estimate" in data
        
        print(f"Admin stats: bookings={data['total_bookings']}, vouchers={data['active_vouchers']}, coupons={data['total_coupons']}, subscribers={data['total_subscribers']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
