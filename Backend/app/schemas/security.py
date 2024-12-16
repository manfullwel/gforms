from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class SecurityAlert(BaseModel):
    user_id: int
    alert_type: str  # suspicious_login, multiple_ips, vpn_detected, etc
    severity: str    # low, medium, high, critical
    details: dict
    timestamp: datetime
    resolved: bool = False
    resolved_by: Optional[int] = None
    resolution_notes: Optional[str] = None

class UserSecurityProfile(BaseModel):
    user_id: int
    risk_score: float
    known_ips: List[str]
    known_devices: List[str]
    known_locations: List[dict]
    vpn_usage_history: List[dict]
    suspicious_activities: List[SecurityAlert]
    last_security_audit: datetime
    security_notes: Optional[str]

class BrowserFingerprint(BaseModel):
    user_agent: str
    screen_resolution: str
    color_depth: int
    timezone: str
    plugins: List[str]
    fonts: List[str]
    canvas_hash: str
    webgl_hash: str
    audio_hash: str
    cpu_class: Optional[str]
    platform: str
    do_not_track: Optional[bool]
    hardware_concurrency: int
    device_memory: Optional[float]

class SecurityAuditLog(BaseModel):
    timestamp: datetime
    action: str
    admin_id: int
    target_user_id: Optional[int]
    details: dict
    ip_address: str
    geolocation: dict
