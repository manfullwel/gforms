import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ActivityTimeline from '../ActivityTimeline';
import { SecurityAlert, UserSession } from '../../types/security';

const mockSession: UserSession = {
  id: '1',
  ip_address: '192.168.1.1',
  user_agent: 'Mozilla/5.0',
  location: {
    country: 'Brazil',
    city: 'São Paulo',
    latitude: -23.5505,
    longitude: -46.6333
  },
  browser_fingerprint: 'mock-fingerprint',
  created_at: '2024-12-14T22:00:00Z',
  last_activity: '2024-12-14T23:00:00Z',
  is_suspicious: false
};

const mockAlert: SecurityAlert = {
  id: '2',
  user_id: 1,
  alert_type: 'suspicious_login',
  severity: 'high',
  details: {
    message: 'Suspicious login attempt detected'
  },
  timestamp: '2024-12-14T22:30:00Z',
  resolved: false
};

describe('ActivityTimeline Component', () => {
  const mockOnItemClick = jest.fn();

  beforeEach(() => {
    mockOnItemClick.mockClear();
  });

  it('renders timeline items correctly', () => {
    render(
      <ActivityTimeline
        data={[mockSession, mockAlert]}
        onItemClick={mockOnItemClick}
      />
    );

    // Check if session information is displayed
    expect(screen.getByText('Login Session')).toBeInTheDocument();
    expect(screen.getByText('mock-fingerprint')).toBeInTheDocument();

    // Check if alert information is displayed
    expect(screen.getByText('suspicious login')).toBeInTheDocument();
    expect(screen.getByText('Suspicious login attempt detected')).toBeInTheDocument();
  });

  it('handles item clicks correctly', () => {
    render(
      <ActivityTimeline
        data={[mockSession, mockAlert]}
        onItemClick={mockOnItemClick}
      />
    );

    // Click on session item
    fireEvent.click(screen.getByText('Login Session'));
    expect(mockOnItemClick).toHaveBeenCalledWith(mockSession);

    // Click on alert item
    fireEvent.click(screen.getByText('suspicious login'));
    expect(mockOnItemClick).toHaveBeenCalledWith(mockAlert);
  });

  it('sorts activities by timestamp in descending order', () => {
    const olderSession: UserSession = {
      ...mockSession,
      id: '3',
      created_at: '2024-12-14T21:00:00Z'
    };

    render(
      <ActivityTimeline
        data={[olderSession, mockSession, mockAlert]}
      />
    );

    const timelineItems = screen.getAllByRole('listitem');
    expect(timelineItems).toHaveLength(3);

    // Check if items are sorted correctly (most recent first)
    const timestamps = timelineItems.map(item => 
      item.querySelector('time')?.textContent
    );
    expect(timestamps[0]).toBe('14 de dezembro às 23:00');
    expect(timestamps[2]).toBe('14 de dezembro às 21:00');
  });

  it('displays correct icons based on activity type', () => {
    const vpnAlert: SecurityAlert = {
      ...mockAlert,
      id: '4',
      alert_type: 'vpn_detected'
    };

    render(
      <ActivityTimeline
        data={[mockSession, mockAlert, vpnAlert]}
      />
    );

    // Check for presence of different icons
    expect(screen.getByTestId('LoginIcon')).toBeInTheDocument();
    expect(screen.getByTestId('WarningIcon')).toBeInTheDocument();
    expect(screen.getByTestId('VpnKeyIcon')).toBeInTheDocument();
  });

  it('shows tooltips with additional information', async () => {
    render(
      <ActivityTimeline
        data={[mockSession, mockAlert]}
      />
    );

    // Hover over session item
    const sessionItem = screen.getByText('Login Session');
    fireEvent.mouseOver(sessionItem);
    
    // Check tooltip content
    expect(await screen.findByText('Location: São Paulo, Brazil')).toBeInTheDocument();

    // Hover over alert item
    const alertItem = screen.getByText('suspicious login');
    fireEvent.mouseOver(alertItem);
    
    // Check tooltip content
    expect(await screen.findByText('Severity: high')).toBeInTheDocument();
  });
});
