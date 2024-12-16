import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box, CssBaseline, ThemeProvider } from '@mui/material';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import theme from './theme';

// Lazy loaded components
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const SecurityAlerts = React.lazy(() => import('./components/SecurityAlerts'));
const UsersList = React.lazy(() => import('./components/UsersList'));
const ActivityTimeline = React.lazy(() => import('./components/ActivityTimeline'));
const FormList = React.lazy(() => import('./components/FormList'));

// Loading spinner component
const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Router>
          <Navigation />
          <Box sx={{ flexGrow: 1, p: 3 }}>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/forms" element={<FormList />} />
                <Route path="/security/alerts" element={<SecurityAlerts alerts={[]} />} />
                <Route path="/users" element={<UsersList users={[]} onUserSelect={() => {}} onBlockUser={() => {}} />} />
                <Route path="/activity" element={<ActivityTimeline data={[]} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Box>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
