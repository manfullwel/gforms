import { SecurityAlert, UserSession } from './security';

export type ApiResponse<T> = {
  success: true;
  data: T;
  message?: string;
} | {
  success: false;
  error: string;
  code?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type ApiError = {
  message: string;
  code: string;
  details?: Record<string, unknown>;
};

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ApiState<T> {
  data: T | null;
  status: RequestStatus;
  error: ApiError | null;
  lastUpdated?: Date;
}

// API Endpoints Types
export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
};

export type SecurityMetrics = {
  totalAlerts: number;
  criticalAlerts: number;
  activeUsers: number;
  riskScore: number;
  recentSessions: UserSession[];
  recentAlerts: SecurityAlert[];
};
