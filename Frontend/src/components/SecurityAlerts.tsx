import React, { useState, useCallback, useMemo } from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { SecurityAlert } from '../types/security';

interface SecurityAlertsProps {
  alerts: SecurityAlert[];
  onResolveAlert?: (alertId: string, notes: string) => Promise<void>;
}

const ALERT_TYPES = {
  suspicious_login: {
    label: 'Login Suspeito',
    icon: <WarningIcon color="warning" />,
    color: 'warning' as const,
  },
  failed_login: {
    label: 'Falha de Login',
    icon: <ErrorIcon color="error" />,
    color: 'error' as const,
  },
  system_error: {
    label: 'Erro do Sistema',
    icon: <ErrorIcon color="error" />,
    color: 'error' as const,
  },
  info: {
    label: 'Informação',
    icon: <InfoIcon color="info" />,
    color: 'info' as const,
  },
};

const SecurityAlerts: React.FC<SecurityAlertsProps> = React.memo(({ alerts, onResolveAlert }) => {
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const handleAlertClick = useCallback((alert: SecurityAlert) => {
    setSelectedAlert(alert);
    setResolutionNotes('');
  }, []);

  const handleClose = useCallback(() => {
    setSelectedAlert(null);
    setResolutionNotes('');
    setIsResolving(false);
  }, []);

  const handleResolve = useCallback(async () => {
    if (selectedAlert && onResolveAlert) {
      try {
        setIsResolving(true);
        await onResolveAlert(selectedAlert.id, resolutionNotes);
        handleClose();
      } catch (error) {
        console.error('Error resolving alert:', error);
      } finally {
        setIsResolving(false);
      }
    }
  }, [selectedAlert, resolutionNotes, onResolveAlert, handleClose]);

  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => {
      // Priorizar alertas não resolvidos
      if (a.resolved !== b.resolved) {
        return a.resolved ? 1 : -1;
      }
      // Ordenar por severidade e data
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [alerts]);

  return (
    <Paper elevation={3} sx={{ p: 2, maxHeight: '80vh', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Alertas de Segurança
      </Typography>
      
      <List>
        {sortedAlerts.map((alert) => (
          <ListItem
            key={alert.id}
            onClick={() => handleAlertClick(alert)}
            sx={{
              cursor: 'pointer',
              '&:hover': { backgroundColor: 'action.hover' },
              opacity: alert.resolved ? 0.7 : 1,
            }}
          >
            <ListItemIcon>
              {alert.resolved ? (
                <CheckCircleIcon color="success" />
              ) : (
                (ALERT_TYPES[alert.type as keyof typeof ALERT_TYPES] || ALERT_TYPES.info).icon
              )}
            </ListItemIcon>
            <ListItemText
              primary={ALERT_TYPES[alert.type as keyof typeof ALERT_TYPES]?.label || 'Alerta Desconhecido'}
              secondary={alert.details.message as string}
            />
            <Chip
              label={alert.resolved ? 'Resolvido' : 'Pendente'}
              color={(ALERT_TYPES[alert.type as keyof typeof ALERT_TYPES]?.color || 'default') as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
              size="small"
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={!!selectedAlert} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedAlert && ALERT_TYPES[selectedAlert.type]?.label}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">{selectedAlert?.message}</Typography>
            <Typography variant="caption" color="textSecondary">
              {selectedAlert?.timestamp && new Date(selectedAlert.timestamp).toLocaleString()}
            </Typography>
          </Box>
          {!selectedAlert?.resolved && onResolveAlert && (
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Notas de resolução..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '8px',
                marginTop: '16px',
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Fechar</Button>
          {!selectedAlert?.resolved && onResolveAlert && (
            <Button
              onClick={handleResolve}
              color="primary"
              disabled={isResolving || !resolutionNotes.trim()}
            >
              {isResolving ? 'Resolvendo...' : 'Resolver Alerta'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
});

SecurityAlerts.displayName = 'SecurityAlerts';

export default SecurityAlerts;
