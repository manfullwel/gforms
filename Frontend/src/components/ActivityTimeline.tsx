import React, { useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Tooltip,
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import {
  Login as LoginIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  Block as BlockIcon,
  VpnKey as VpnIcon,
} from '@mui/icons-material';
import { AdminUser, SecurityAlert, UserSession, AlertType } from '../types/security';
import { TimelineProps } from '../types/components';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ActivityType = 'session' | 'alert';

interface Activity {
  id: string;
  type: ActivityType;
  timestamp: Date;
  data: UserSession | SecurityAlert;
}

const getAlertIcon = (alertType: AlertType): JSX.Element => {
  switch (alertType) {
    case 'vpn_detected':
      return <VpnIcon />;
    case 'suspicious_login':
      return <WarningIcon />;
    case 'blocked':
      return <BlockIcon />;
    case 'security_audit':
      return <SecurityIcon />;
    default:
      return <WarningIcon />;
  }
};

const getAlertColor = (alertType: AlertType): "error" | "warning" | "info" => {
  switch (alertType) {
    case 'blocked':
    case 'suspicious_login':
      return "error";
    case 'vpn_detected':
      return "warning";
    default:
      return "info";
  }
};

const ActivityTimeline: React.FC<TimelineProps> = ({ data, onItemClick }) => {
  const activities: Activity[] = useMemo(() => {
    return data.map(item => ({
      id: item.id,
      type: 'alert' in item ? 'alert' : 'session',
      timestamp: new Date('alert' in item ? item.timestamp : item.created_at),
      data: item,
    })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [data]);

  const formatDate = (date: Date): string => {
    return format(date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
  };

  const handleItemClick = (activity: Activity): void => {
    if (onItemClick) {
      onItemClick(activity.data);
    }
  };

  return (
    <Paper elevation={0} sx={{ backgroundColor: 'transparent' }}>
      <Timeline position="alternate">
        {activities.map((activity) => (
          <TimelineItem key={activity.id} onClick={() => handleItemClick(activity)} sx={{ cursor: onItemClick ? 'pointer' : 'default' }}>
            <TimelineOppositeContent color="text.secondary">
              {formatDate(activity.timestamp)}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color={
                activity.type === 'alert' 
                  ? getAlertColor((activity.data as SecurityAlert).alert_type)
                  : (activity.data as UserSession).is_suspicious ? "warning" : "success"
              }>
                {activity.type === 'alert' 
                  ? getAlertIcon((activity.data as SecurityAlert).alert_type)
                  : <LoginIcon />
                }
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Tooltip title={activity.type === 'alert' 
                ? `Severity: ${(activity.data as SecurityAlert).severity}`
                : `Location: ${(activity.data as UserSession).location.city}, ${(activity.data as UserSession).location.country}`
              }>
                <Box>
                  <Typography variant="h6" component="span">
                    {activity.type === 'alert' 
                      ? `${(activity.data as SecurityAlert).alert_type.replace('_', ' ')}` 
                      : 'Login Session'
                    }
                  </Typography>
                  <Typography>
                    {activity.type === 'alert'
                      ? (activity.data as SecurityAlert).details.message || 'No additional details'
                      : `${(activity.data as UserSession).browser_fingerprint}`
                    }
                  </Typography>
                </Box>
              </Tooltip>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Paper>
  );
};

export default ActivityTimeline;
