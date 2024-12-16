import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Form {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const FormList: React.FC = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await axios.get('/api/v1/forms');
      setForms(response.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar os formulários. Por favor, tente novamente.');
      console.error('Error fetching forms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/forms/edit/${id}`);
  };

  const handleView = (id: number) => {
    navigate(`/forms/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este formulário?')) {
      try {
        await axios.delete(`/api/v1/forms/${id}`);
        setForms(forms.filter(form => form.id !== id));
      } catch (err) {
        setError('Erro ao excluir o formulário. Por favor, tente novamente.');
        console.error('Error deleting form:', err);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Meus Formulários
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/forms/new')}
        >
          Novo Formulário
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {forms.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">
              Nenhum formulário encontrado. Crie seu primeiro formulário!
            </Alert>
          </Grid>
        ) : (
          forms.map((form) => (
            <Grid item xs={12} sm={6} md={4} key={form.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {form.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {form.description}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Criado em: {new Date(form.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleView(form.id)}
                    title="Visualizar"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEdit(form.id)}
                    title="Editar"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(form.id)}
                    title="Excluir"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default FormList;
