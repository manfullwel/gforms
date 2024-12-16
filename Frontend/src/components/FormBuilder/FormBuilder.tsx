import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Card,
  CardContent,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragHandle as DragHandleIcon,
} from '@mui/icons-material';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { FieldType, FormField, FormSettings } from '../../types/form';

interface FormBuilderProps {
  initialData?: {
    title: string;
    description: string;
    fields: FormField[];
    settings: FormSettings;
  };
  onSave: (formData: any) => void;
}

const FIELD_TYPES = [
  { value: FieldType.TEXT, label: 'Texto' },
  { value: FieldType.NUMBER, label: 'Número' },
  { value: FieldType.EMAIL, label: 'Email' },
  { value: FieldType.DATE, label: 'Data' },
  { value: FieldType.SELECT, label: 'Seleção' },
  { value: FieldType.MULTISELECT, label: 'Múltipla Escolha' },
  { value: FieldType.CHECKBOX, label: 'Caixa de Seleção' },
  { value: FieldType.RADIO, label: 'Radio' },
  { value: FieldType.TEXTAREA, label: 'Área de Texto' },
  { value: FieldType.FILE, label: 'Arquivo' },
];

export const FormBuilder: React.FC<FormBuilderProps> = ({
  initialData,
  onSave,
}) => {
  const {
    formState,
    addField,
    updateField,
    removeField,
    reorderFields,
    updateSettings,
    updateFormInfo,
  } = useFormBuilder(initialData);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    reorderFields(result.source.index, result.destination.index);
  };

  const handleAddField = () => {
    addField({
      id: `field_${Date.now()}`,
      type: FieldType.TEXT,
      label: 'Novo Campo',
      required: false,
      order: formState.fields.length,
    });
  };

  const handleFieldChange = (fieldId: string, changes: Partial<FormField>) => {
    updateField(fieldId, changes);
  };

  const renderFieldOptions = (field: FormField) => {
    if (![FieldType.SELECT, FieldType.MULTISELECT, FieldType.RADIO].includes(field.type)) {
      return null;
    }

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2">Opções</Typography>
        {field.options?.map((option, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField
              size="small"
              value={option.label}
              onChange={(e) => {
                const newOptions = [...(field.options || [])];
                newOptions[index] = { ...option, label: e.target.value };
                handleFieldChange(field.id, { options: newOptions });
              }}
              placeholder="Opção"
            />
            <IconButton
              size="small"
              onClick={() => {
                const newOptions = field.options?.filter((_, i) => i !== index);
                handleFieldChange(field.id, { options: newOptions });
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => {
            const newOptions = [...(field.options || []), { label: '', value: `option_${Date.now()}` }];
            handleFieldChange(field.id, { options: newOptions });
          }}
          sx={{ mt: 1 }}
        >
          Adicionar Opção
        </Button>
      </Box>
    );
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Informações do Formulário
        </Typography>
        <TextField
          fullWidth
          label="Título"
          value={formState.title}
          onChange={(e) => updateFormInfo({ title: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Descrição"
          multiline
          rows={3}
          value={formState.description}
          onChange={(e) => updateFormInfo({ description: e.target.value })}
        />
      </Paper>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="fields">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {formState.fields.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      sx={{ mb: 2 }}
                    >
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item {...provided.dragHandleProps}>
                            <DragHandleIcon />
                          </Grid>
                          <Grid item xs>
                            <TextField
                              fullWidth
                              label="Rótulo do Campo"
                              value={field.label}
                              onChange={(e) =>
                                handleFieldChange(field.id, { label: e.target.value })
                              }
                            />
                          </Grid>
                          <Grid item>
                            <TextField
                              select
                              label="Tipo"
                              value={field.type}
                              onChange={(e) =>
                                handleFieldChange(field.id, { type: e.target.value as FieldType })
                              }
                              sx={{ minWidth: 150 }}
                            >
                              {FIELD_TYPES.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                  {type.label}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                          <Grid item>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={field.required}
                                  onChange={(e) =>
                                    handleFieldChange(field.id, { required: e.target.checked })
                                  }
                                />
                              }
                              label="Obrigatório"
                            />
                          </Grid>
                          <Grid item>
                            <IconButton
                              color="error"
                              onClick={() => removeField(field.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                        {renderFieldOptions(field)}
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddField}
        >
          Adicionar Campo
        </Button>
        <Button
          variant="contained"
          onClick={() => onSave(formState)}
        >
          Salvar Formulário
        </Button>
      </Box>
    </Box>
  );
};

export default FormBuilder;
