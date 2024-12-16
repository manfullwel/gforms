from datetime import datetime
from typing import List, Optional
import geoip2.database
from ..models.user import User
from ..models.security import SecurityAlert, UserSession
from ..schemas.security import AlertType, AlertSeverity

class SecurityService:
    def __init__(self):
        self.geoip_reader = None
        try:
            self.geoip_reader = geoip2.database.Reader('GeoLite2-City.mmdb')
        except Exception:
            print("Warning: GeoIP database not found")

    async def get_location_from_ip(self, ip_address: str):
        if not self.geoip_reader:
            return {"country": "Unknown", "city": "Unknown", "latitude": 0, "longitude": 0}
        
        try:
            response = self.geoip_reader.city(ip_address)
            return {
                "country": response.country.name,
                "city": response.city.name,
                "latitude": response.location.latitude,
                "longitude": response.location.longitude
            }
        except Exception:
            return {"country": "Unknown", "city": "Unknown", "latitude": 0, "longitude": 0}

    async def create_security_alert(
        self,
        user_id: int,
        alert_type: AlertType,
        severity: AlertSeverity,
        details: dict
    ) -> SecurityAlert:
        alert = SecurityAlert(
            user_id=user_id,
            alert_type=alert_type,
            severity=severity,
            details=details,
            timestamp=datetime.utcnow()
        )
        # Add to database
        return alert

    async def get_user_risk_score(self, user_id: int) -> float:
        # Implement risk scoring logic
        return 0.0

    def __del__(self):
        if self.geoip_reader:
            self.geoip_reader.close()
