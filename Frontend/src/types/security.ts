export interface UserSession {
  id: string;
  ip_address: string;
  user_agent: string;
  location: GeoLocation;
  browser_fingerprint: string;
  created_at: string;
  last_activity: string;
  is_suspicious: boolean;
}

export interface GeoLocation {
  country: string;
  city: string;
  latitude: number;
  longitude: number;
}

export type AlertType = 'vpn_detected' | 'suspicious_login' | 'blocked' | 'security_audit';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityAlert {
  id: string;
  user_id: number;
  alert_type: AlertType;
  severity: AlertSeverity;
  details: Record<string, unknown>;
  timestamp: string;
  resolved: boolean;
  resolved_by?: number;
  resolution_notes?: string;
}

export interface UserSecurityProfile {
  user_id: number;
  risk_score: number;
  known_ips: string[];
  known_devices: string[];
  known_locations: GeoLocation[];
  vpn_usage_history: VpnUsage[];
  suspicious_activities: SecurityAlert[];
  last_security_audit: string;
  security_notes?: string;
}

export interface VpnUsage {
  timestamp: string;
  ip_address: string;
  vpn_provider?: string;
  location: GeoLocation;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  sessions: UserSession[];
  security_profile: UserSecurityProfile;
  last_login: string;
  is_active: boolean;
}
