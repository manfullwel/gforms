// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Mock MUI icons since they use SVG which Jest doesn't handle well
jest.mock('@mui/icons-material', () => ({
  Login: () => <div data-testid="LoginIcon" />,
  Warning: () => <div data-testid="WarningIcon" />,
  Security: () => <div data-testid="SecurityIcon" />,
  Block: () => <div data-testid="BlockIcon" />,
  VpnKey: () => <div data-testid="VpnKeyIcon" />
}));

// Mock date-fns locale to avoid issues with different timezones in tests
jest.mock('date-fns/locale', () => ({
  ptBR: {
    localize: {
      month: () => '',
      day: () => ''
    },
    formatLong: {
      date: () => ''
    }
  }
}));
