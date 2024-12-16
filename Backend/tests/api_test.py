import requests
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"

def test_root_endpoint():
    """Test the root endpoint"""
    response = requests.get(f"{BASE_URL}/")
    print("\n=== Testing Root Endpoint ===")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    assert "message" in response.json()

def test_admin_endpoints():
    """Test admin endpoints"""
    # Mock admin token (you would normally get this through authentication)
    headers = {
        "Authorization": "Bearer test_admin_token",
        "Content-Type": "application/json"
    }

    endpoints = [
        ("/admin/users", "GET", None),
        ("/admin/users/1", "GET", None),
        ("/admin/security/alerts", "GET", None),
        ("/admin/security/audit-logs", "GET", {
            "start_date": datetime.now().isoformat(),
            "end_date": datetime.now().isoformat()
        })
    ]

    print("\n=== Testing Admin Endpoints ===")
    for endpoint, method, data in endpoints:
        print(f"\nTesting: {method} {endpoint}")
        try:
            if method == "GET":
                response = requests.get(f"{BASE_URL}{endpoint}", 
                                     headers=headers,
                                     params=data if data else None)
            else:
                response = requests.post(f"{BASE_URL}{endpoint}",
                                      headers=headers,
                                      json=data if data else None)
            
            print(f"Status Code: {response.status_code}")
            print("Response:", end=" ")
            try:
                print(json.dumps(response.json(), indent=2))
            except:
                print(response.text)
                
            # Print detailed error for 422 responses (validation errors)
            if response.status_code == 422:
                print("Validation Error Details:")
                print(json.dumps(response.json(), indent=2))
                
        except requests.exceptions.RequestException as e:
            print(f"Error making request: {str(e)}")

def test_api_docs():
    """Test access to API documentation"""
    endpoints = ["/docs", "/redoc", "/openapi.json"]
    
    print("\n=== Testing API Documentation ===")
    for endpoint in endpoints:
        response = requests.get(f"{BASE_URL}{endpoint}")
        print(f"\nEndpoint: {endpoint}")
        print(f"Status Code: {response.status_code}")
        print(f"Available: {'Yes' if response.status_code == 200 else 'No'}")

def main():
    """Run all tests"""
    print("Starting API Tests...")
    
    try:
        test_root_endpoint()
    except Exception as e:
        print(f"Error testing root endpoint: {str(e)}")
    
    try:
        test_admin_endpoints()
    except Exception as e:
        print(f"Error testing admin endpoints: {str(e)}")
        
    try:
        test_api_docs()
    except Exception as e:
        print(f"Error testing API docs: {str(e)}")
    
    print("\nAPI Tests Completed!")

if __name__ == "__main__":
    main()
