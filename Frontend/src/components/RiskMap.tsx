import React, { useEffect, useRef } from 'react';
import {
  Paper,
  Typography,
  Box,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { AdminUser } from '../types/security';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RiskMapProps {
  users: AdminUser[];
}

const RiskMap: React.FC<RiskMapProps> = ({ users }) => {
  const theme = useTheme();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapRef.current).setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ' OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current);

    updateMarkers();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers();
    }
  }, [users]);

  const updateMarkers = () => {
    if (!mapInstanceRef.current) return;

    // Limpa marcadores existentes
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Adiciona novos marcadores
    users.forEach(user => {
      const locations = user.security_profile.known_locations;
      locations.forEach(location => {
        const marker = L.circleMarker(
          [location.latitude, location.longitude],
          {
            radius: 8,
            fillColor: getRiskColor(user.risk_score),
            color: theme.palette.background.paper,
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          }
        ).addTo(mapInstanceRef.current!);

        marker.bindPopup(`
          <b>${user.name}</b><br>
          Risco: ${(user.risk_score * 100).toFixed(0)}%<br>
          Local: ${location.city}, ${location.country}
        `);

        markersRef.current.push(marker);
      });
    });
  };

  const getRiskColor = (riskScore: number): string => {
    if (riskScore >= 0.7) return theme.palette.error.main;
    if (riskScore >= 0.4) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Mapa de Risco Global
      </Typography>
      <Box
        ref={mapRef}
        sx={{
          height: 400,
          width: '100%',
          position: 'relative',
          bgcolor: 'background.default',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        {!mapInstanceRef.current && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Box>
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Typography variant="caption" display="flex" alignItems="center">
          <Box
            component="span"
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: theme.palette.error.main,
              mr: 1,
            }}
          />
          Alto Risco
        </Typography>
        <Typography variant="caption" display="flex" alignItems="center">
          <Box
            component="span"
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: theme.palette.warning.main,
              mr: 1,
            }}
          />
          Médio Risco
        </Typography>
        <Typography variant="caption" display="flex" alignItems="center">
          <Box
            component="span"
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: theme.palette.success.main,
              mr: 1,
            }}
          />
          Baixo Risco
        </Typography>
      </Box>
    </Paper>
  );
};

export default RiskMap;
