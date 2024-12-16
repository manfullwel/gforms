import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  SecurityAlert,
  AdminUser,
  UserSecurityProfile,
} from '../types/security';
import { adminApi } from '../services/api';
import UsersList from './UsersList';
import SecurityAlerts from './SecurityAlerts';
import RiskMap from './RiskMap';
import ActivityTimeline from './ActivityTimeline';

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [usersData, alertsData] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getSecurityAlerts(),
      ]);
      setUsers(usersData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (userId: number) => {
    try {
      const userData = await adminApi.getUserDetails(userId);
      setSelectedUser(userData);
    } catch (error) {
      console.error('Error loading user details:', error);
    }
  };

  const handleBlockUser = async (userId: number, reason: string) => {
    try {
      await adminApi.blockUser(userId, reason);
      await loadDashboardData(); // Recarrega os dados
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth={false}>
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Painel de Administração
        </Typography>

        <Grid container spacing={3}>
          {/* Estatísticas Gerais */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Usuários Ativos</Typography>
              <Typography variant="h3">
                {users.filter(u => u.is_active).length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Alertas Críticos</Typography>
              <Typography variant="h3" color="error">
                {alerts.filter(a => a.severity === 'critical').length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Usuários em Risco</Typography>
              <Typography variant="h3" color="warning.main">
                {users.filter(u => u.risk_score > 0.7).length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Usuários Bloqueados</Typography>
              <Typography variant="h3">
                {users.filter(u => !u.is_active).length}
              </Typography>
            </Paper>
          </Grid>

          {/* Lista de Usuários */}
          <Grid item xs={12} md={6}>
            <UsersList
              users={users}
              onUserSelect={handleUserSelect}
              onBlockUser={handleBlockUser}
            />
          </Grid>

          {/* Alertas de Segurança */}
          <Grid item xs={12} md={6}>
            <SecurityAlerts alerts={alerts} />
          </Grid>

          {/* Mapa de Risco */}
          <Grid item xs={12}>
            <RiskMap users={users} />
          </Grid>

          {/* Linha do Tempo de Atividades */}
          <Grid item xs={12}>
            <ActivityTimeline user={selectedUser} />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
