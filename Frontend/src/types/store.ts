import { AdminUser, SecurityAlert, UserSession } from './security';
import { ApiState } from './api';

export interface RootState {
  auth: AuthState;
  security: SecurityState;
  users: UsersState;
}

export interface AuthState {
  user: ApiState<AdminUser>;
  isAuthenticated: boolean;
  token: string | null;
}

export interface SecurityState {
  alerts: ApiState<SecurityAlert[]>;
  sessions: ApiState<UserSession[]>;
  metrics: ApiState<{
    riskScore: number;
    activeUsers: number;
    totalAlerts: number;
    criticalAlerts: number;
  }>;
  selectedAlert: SecurityAlert | null;
}

export interface UsersState {
  list: ApiState<AdminUser[]>;
  selected: AdminUser | null;
  filters: {
    status: 'all' | 'active' | 'blocked';
    risk: 'all' | 'high' | 'medium' | 'low';
    search: string;
  };
}

// Action Types
export type AuthAction = 
  | { type: 'auth/login/pending' }
  | { type: 'auth/login/fulfilled'; payload: { user: AdminUser; token: string } }
  | { type: 'auth/login/rejected'; payload: string }
  | { type: 'auth/logout' };

export type SecurityAction =
  | { type: 'security/fetchAlerts/pending' }
  | { type: 'security/fetchAlerts/fulfilled'; payload: SecurityAlert[] }
  | { type: 'security/fetchAlerts/rejected'; payload: string }
  | { type: 'security/selectAlert'; payload: SecurityAlert }
  | { type: 'security/resolveAlert'; payload: string };

export type UsersAction =
  | { type: 'users/fetchList/pending' }
  | { type: 'users/fetchList/fulfilled'; payload: AdminUser[] }
  | { type: 'users/fetchList/rejected'; payload: string }
  | { type: 'users/selectUser'; payload: AdminUser }
  | { type: 'users/updateFilters'; payload: Partial<UsersState['filters']> };
