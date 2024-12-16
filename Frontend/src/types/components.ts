import { ReactNode } from 'react';
import { SecurityAlert, UserSession, AdminUser } from './security';

export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

export interface LoadingProps extends BaseProps {
  loading?: boolean;
  error?: string | null;
}

// Dashboard Components
export interface DashboardCardProps extends BaseProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

export interface TimelineProps extends BaseProps {
  data: (SecurityAlert | UserSession)[];
  onItemClick?: (item: SecurityAlert | UserSession) => void;
}

export interface MapDataPoint {
  id: string;
  latitude: number;
  longitude: number;
  value: number;
  label: string;
  type: 'alert' | 'session';
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface RiskMapProps extends BaseProps {
  data: MapDataPoint[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (point: MapDataPoint) => void;
}

export interface SecurityAlertsTableProps extends BaseProps {
  alerts: SecurityAlert[];
  onResolve?: (alert: SecurityAlert) => Promise<void>;
  onDismiss?: (alert: SecurityAlert) => Promise<void>;
}

export interface UsersListProps extends BaseProps {
  users: AdminUser[];
  onUserClick?: (user: AdminUser) => void;
  onUserBlock?: (user: AdminUser) => Promise<void>;
  onUserUnblock?: (user: AdminUser) => Promise<void>;
}
