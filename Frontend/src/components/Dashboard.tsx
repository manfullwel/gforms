import React from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  Box 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SecurityIcon from '@mui/icons-material/Security';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Criar Novo Formulário',
      description: 'Crie um novo formulário personalizado',
      icon: <AddIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/forms/new'),
      color: '#4CAF50'
    },
    {
      title: 'Meus Formulários',
      description: 'Visualize e gerencie seus formulários',
      icon: <ListAltIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/forms'),
      color: '#2196F3'
    },
    {
      title: 'Área Administrativa',
      description: 'Acesse as configurações administrativas',
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/admin'),
      color: '#FF9800'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bem-vindo ao Gerador de Formulários
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Crie e gerencie seus formulários de forma simples e rápida
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                }
              }}
              onClick={card.action}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${card.color}15`,
                  color: card.color,
                  mb: 2
                }}
              >
                {card.icon}
              </Box>
              <Typography variant="h6" component="h2" gutterBottom>
                {card.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {card.description}
              </Typography>
              <Button
                variant="contained"
                sx={{ 
                  mt: 2,
                  backgroundColor: card.color,
                  '&:hover': {
                    backgroundColor: card.color
                  }
                }}
              >
                Acessar
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard;
