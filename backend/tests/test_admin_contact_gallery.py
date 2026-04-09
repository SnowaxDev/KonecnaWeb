"""
Test Admin Contact Messages and Gallery Upload Features
- GET /api/admin/contact - list contact messages
- PATCH /api/admin/contact/{id}/status - update message status
- DELETE /api/admin/contact/{id} - delete message
- POST /api/admin/gallery/upload - upload image file

Uses module-scoped fixture to avoid rate limiting on admin login (5/min)
"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
ADMIN_PASSWORD = "SeknuTo2025!"

# Module-scoped admin token to avoid rate limiting
_admin_token = None

def get_admin_token():
    """Get or create admin token (cached)"""
    global _admin_token
    if _admin_token is None:
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            _admin_token = response.json().get("token")
        else:
            raise Exception(f"Admin login failed: {response.status_code} - {response.text}")
    return _admin_token


class TestAdminContactMessages:
    """Test admin contact messages management"""
    
    def test_01_admin_login_works(self):
        """Test admin login with correct password"""
        token = get_admin_token()
        assert token is not None
        print(f"PASS: Admin login works, token received")
    
    def test_02_get_contact_messages(self):
        """Test GET /api/admin/contact returns list of messages"""
        token = get_admin_token()
        response = requests.get(
            f"{BASE_URL}/api/admin/contact",
            headers={"X-Admin-Token": token}
        )
        assert response.status_code == 200, f"Failed to get contact messages: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"PASS: GET /api/admin/contact returns {len(data)} messages")
        
        # Verify message structure if there are messages
        if len(data) > 0:
            msg = data[0]
            assert "id" in msg, "Message should have id"
            assert "name" in msg, "Message should have name"
            assert "email" in msg, "Message should have email"
            assert "message" in msg, "Message should have message content"
            assert "status" in msg, "Message should have status"
            assert "created_at" in msg, "Message should have created_at"
            print(f"PASS: Message structure verified - first message from: {msg.get('name')}")
    
    def test_03_get_contact_messages_requires_auth(self):
        """Test GET /api/admin/contact requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/contact")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: GET /api/admin/contact requires authentication (401)")
    
    def test_04_update_contact_status_to_read(self):
        """Test PATCH /api/admin/contact/{id}/status - mark as read"""
        token = get_admin_token()
        
        # First get messages
        response = requests.get(
            f"{BASE_URL}/api/admin/contact",
            headers={"X-Admin-Token": token}
        )
        messages = response.json()
        
        if len(messages) == 0:
            pytest.skip("No contact messages to test status update")
        
        # Find a message with 'new' status or use first one
        test_msg = None
        for msg in messages:
            if msg.get("status") == "new":
                test_msg = msg
                break
        if not test_msg:
            test_msg = messages[0]
        
        msg_id = test_msg["id"]
        
        # Update status to 'read'
        response = requests.patch(
            f"{BASE_URL}/api/admin/contact/{msg_id}/status",
            json={"status": "read"},
            headers={"X-Admin-Token": token, "Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Failed to update status: {response.text}"
        data = response.json()
        assert data.get("success") == True, "Response should have success: true"
        print(f"PASS: PATCH /api/admin/contact/{msg_id}/status to 'read' succeeded")
    
    def test_05_update_contact_status_to_archived(self):
        """Test PATCH /api/admin/contact/{id}/status - mark as archived"""
        token = get_admin_token()
        
        response = requests.get(
            f"{BASE_URL}/api/admin/contact",
            headers={"X-Admin-Token": token}
        )
        messages = response.json()
        
        if len(messages) == 0:
            pytest.skip("No contact messages to test")
        
        # Use first message
        msg_id = messages[0]["id"]
        
        response = requests.patch(
            f"{BASE_URL}/api/admin/contact/{msg_id}/status",
            json={"status": "archived"},
            headers={"X-Admin-Token": token, "Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Failed to archive: {response.text}"
        print(f"PASS: PATCH /api/admin/contact/{msg_id}/status to 'archived' succeeded")
    
    def test_06_update_contact_status_requires_auth(self):
        """Test PATCH /api/admin/contact/{id}/status requires authentication"""
        response = requests.patch(
            f"{BASE_URL}/api/admin/contact/fake-id/status",
            json={"status": "read"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: PATCH /api/admin/contact/{id}/status requires authentication (401)")
    
    def test_07_delete_contact_message_requires_auth(self):
        """Test DELETE /api/admin/contact/{id} requires authentication"""
        response = requests.delete(f"{BASE_URL}/api/admin/contact/fake-id")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: DELETE /api/admin/contact/{id} requires authentication (401)")
    
    def test_08_delete_nonexistent_message(self):
        """Test DELETE /api/admin/contact/{id} with non-existent ID returns 404"""
        token = get_admin_token()
        response = requests.delete(
            f"{BASE_URL}/api/admin/contact/nonexistent-id-12345",
            headers={"X-Admin-Token": token}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: DELETE /api/admin/contact/nonexistent-id returns 404")


class TestAdminGalleryUpload:
    """Test admin gallery image upload"""
    
    def test_01_gallery_upload_requires_auth(self):
        """Test POST /api/admin/gallery/upload requires authentication"""
        # Minimal valid PNG (1x1 pixel)
        png_data = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
            0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59,
            0xE7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
            0x44, 0xAE, 0x42, 0x60, 0x82
        ])
        
        files = {"file": ("test.png", io.BytesIO(png_data), "image/png")}
        response = requests.post(f"{BASE_URL}/api/admin/gallery/upload", files=files)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: POST /api/admin/gallery/upload requires authentication (401)")
    
    def test_02_gallery_upload_with_valid_image(self):
        """Test POST /api/admin/gallery/upload with valid image"""
        token = get_admin_token()
        
        # Minimal valid PNG (1x1 pixel)
        png_data = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
            0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59,
            0xE7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
            0x44, 0xAE, 0x42, 0x60, 0x82
        ])
        
        files = {"file": ("test_upload.png", io.BytesIO(png_data), "image/png")}
        headers = {"X-Admin-Token": token}
        
        response = requests.post(
            f"{BASE_URL}/api/admin/gallery/upload",
            files=files,
            headers=headers
        )
        assert response.status_code == 200, f"Upload failed: {response.text}"
        
        data = response.json()
        assert "url" in data, "Response should have url"
        assert "filename" in data, "Response should have filename"
        assert data["url"].startswith("/uploads/"), f"URL should start with /uploads/, got: {data['url']}"
        print(f"PASS: Gallery upload succeeded, URL: {data['url']}")
        
        # Verify the uploaded file is accessible
        full_url = f"{BASE_URL}{data['url']}"
        verify_response = requests.get(full_url)
        assert verify_response.status_code == 200, f"Uploaded file not accessible at {full_url}"
        print(f"PASS: Uploaded file is accessible at {full_url}")
    
    def test_03_gallery_upload_rejects_invalid_file_type(self):
        """Test POST /api/admin/gallery/upload rejects non-image files"""
        token = get_admin_token()
        
        # Create a text file
        text_data = b"This is not an image"
        files = {"file": ("test.txt", io.BytesIO(text_data), "text/plain")}
        headers = {"X-Admin-Token": token}
        
        response = requests.post(
            f"{BASE_URL}/api/admin/gallery/upload",
            files=files,
            headers=headers
        )
        assert response.status_code == 400, f"Expected 400 for invalid file type, got {response.status_code}"
        print("PASS: Gallery upload rejects invalid file type (400)")


class TestAdminStats:
    """Test admin stats endpoint"""
    
    def test_admin_stats_endpoint(self):
        """Test GET /api/admin/stats returns expected fields"""
        token = get_admin_token()
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"X-Admin-Token": token}
        )
        assert response.status_code == 200, f"Failed to get stats: {response.text}"
        
        data = response.json()
        assert "total_bookings" in data
        assert "pending_bookings" in data
        assert "active_vouchers" in data
        assert "total_subscribers" in data
        assert "total_revenue_estimate" in data
        print(f"PASS: Admin stats endpoint works - {data['total_bookings']} total bookings")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
