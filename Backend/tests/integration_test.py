import pytest
from fastapi.testclient import TestClient
from app.main import app
import logging

# Configurar logging para testes
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "uptime" in data
    assert "cache_size" in data

def test_admin_endpoints():
    # Test users endpoint
    response = client.get("/admin/users")
    assert response.status_code == 200
    users = response.json()
    assert isinstance(users, list)

    # Test security alerts endpoint
    response = client.get("/admin/security/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert isinstance(alerts, list)

    # Test audit logs endpoint
    response = client.get("/admin/security/audit-logs")
    assert response.status_code == 200
    logs = response.json()
    assert isinstance(logs, list)

def test_rate_limiting():
    # Test rate limiting by making multiple requests
    for _ in range(110):  # Limite é 100/minuto
        response = client.get("/")
    assert response.status_code == 429  # Too Many Requests

def test_caching():
    # First request should not be cached
    response1 = client.get("/admin/users")
    assert response1.status_code == 200
    assert "cache-control" in response1.headers

    # Second request should be cached
    response2 = client.get("/admin/users")
    assert response2.status_code == 200
    assert response1.json() == response2.json()

def test_compression():
    headers = {"Accept-Encoding": "gzip"}
    response = client.get("/admin/users", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("content-encoding") == "gzip"

if __name__ == "__main__":
    pytest.main(["-v", __file__])
