from typing import Dict, List
from datetime import datetime, timedelta
import hashlib
import json
from user_agents import parse
from geoip2.database import Reader
from ..models.user import User, UserSession
from sqlalchemy.orm import Session

class SecurityAnalyzer:
    def __init__(self, db: Session):
        self.db = db
        # Você precisará baixar o banco de dados GeoLite2 da MaxMind
        # self.geo_reader = Reader('path/to/GeoLite2-City.mmdb')

    def calculate_risk_score(self, user: User) -> float:
        """Calcula pontuação de risco baseada em vários fatores"""
        score = 0.0
        
        # Analisa histórico de IPs
        if len(user.ip_history) > 5:
            score += 0.2
        
        # Analisa mudanças de localização
        if self._has_suspicious_location_changes(user):
            score += 0.3
        
        # Analisa padrões de tempo de uso
        if self._has_suspicious_timing(user):
            score += 0.2
        
        # Analisa comportamento de requisições
        if self._has_suspicious_request_patterns(user):
            score += 0.3
        
        return min(score, 1.0)

    def _has_suspicious_location_changes(self, user: User) -> bool:
        """Detecta mudanças suspeitas de localização"""
        if not user.geolocation_history:
            return False
            
        locations = user.geolocation_history[-5:]  # últimas 5 localizações
        
        for i in range(len(locations) - 1):
            if self._calculate_location_distance(locations[i], locations[i+1]) > 500:  # km
                time_diff = locations[i+1]['timestamp'] - locations[i]['timestamp']
                if time_diff < timedelta(hours=1):  # mudança impossível em 1 hora
                    return True
        return False

    def _has_suspicious_timing(self, user: User) -> bool:
        """Detecta padrões suspeitos de tempo de uso"""
        sessions = self.db.query(UserSession).filter(
            UserSession.user_id == user.id,
            UserSession.created_at >= datetime.utcnow() - timedelta(days=1)
        ).all()
        
        # Analisa padrões de tempo entre sessões
        if len(sessions) > 50:  # Muitas sessões em 24h
            return True
            
        return False

    def _has_suspicious_request_patterns(self, user: User) -> bool:
        """Detecta padrões suspeitos de requisições"""
        # Implementar lógica de detecção de padrões suspeitos
        return False

    def generate_browser_fingerprint(self, request_headers: Dict, user_agent_string: str) -> str:
        """Gera uma fingerprint única do navegador"""
        user_agent = parse(user_agent_string)
        
        fingerprint_data = {
            "user_agent": user_agent_string,
            "browser": user_agent.browser.family,
            "browser_version": user_agent.browser.version_string,
            "os": user_agent.os.family,
            "device": user_agent.device.family,
            "headers": dict(request_headers)
        }
        
        return hashlib.sha256(json.dumps(fingerprint_data).encode()).hexdigest()

    def detect_vpn(self, ip_address: str) -> bool:
        """Detecta se um IP está usando VPN"""
        # Implementar lógica de detecção de VPN
        # Pode usar serviços externos ou lista de IPs conhecidos de VPN
        return False

    def log_security_event(self, user_id: int, event_type: str, details: Dict):
        """Registra eventos de segurança para análise posterior"""
        # Implementar lógica de registro de eventos
        pass

    def get_location_from_ip(self, ip_address: str) -> Dict:
        """Obtém localização geográfica de um IP"""
        try:
            # Implementar lógica de geolocalização
            # response = self.geo_reader.city(ip_address)
            # return {
            #     "country": response.country.name,
            #     "city": response.city.name,
            #     "latitude": response.location.latitude,
            #     "longitude": response.location.longitude
            # }
            return {}
        except Exception:
            return {}
