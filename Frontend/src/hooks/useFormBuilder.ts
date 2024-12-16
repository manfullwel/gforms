import { useState, useCallback } from 'react';
import { FormField, FormSettings, FieldType } from '../types/form';

interface FormState {
  title: string;
  description: string;
  fields: FormField[];
  settings: FormSettings;
}

const defaultSettings: FormSettings = {
  is_public: false,
  collect_email: false,
  one_response_per_user: true,
  show_progress_bar: true,
  confirmation_message: 'Obrigado por preencher o formulário!',
};

export const useFormBuilder = (initialData?: Partial<FormState>) => {
  const [formState, setFormState] = useState<FormState>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    fields: initialData?.fields || [],
    settings: initialData?.settings || defaultSettings,
  });

  const updateFormInfo = useCallback((updates: Partial<FormState>) => {
    setFormState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const addField = useCallback((field: FormField) => {
    setFormState((prev) => ({
      ...prev,
      fields: [...prev.fields, field],
    }));
  }, []);

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setFormState((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
  }, []);

  const removeField = useCallback((fieldId: string) => {
    setFormState((prev) => ({
      ...prev,
      fields: prev.fields.filter((field) => field.id !== fieldId),
    }));
  }, []);

  const reorderFields = useCallback((startIndex: number, endIndex: number) => {
    setFormState((prev) => {
      const newFields = Array.from(prev.fields);
      const [removed] = newFields.splice(startIndex, 1);
      newFields.splice(endIndex, 0, removed);

      return {
        ...prev,
        fields: newFields.map((field, index) => ({
          ...field,
          order: index,
        })),
      };
    });
  }, []);

  const updateSettings = useCallback((updates: Partial<FormSettings>) => {
    setFormState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...updates,
      },
    }));
  }, []);

  const validateForm = useCallback(() => {
    const errors: string[] = [];

    if (!formState.title.trim()) {
      errors.push('O título do formulário é obrigatório');
    }

    if (formState.fields.length === 0) {
      errors.push('O formulário deve ter pelo menos um campo');
    }

    formState.fields.forEach((field) => {
      if (!field.label.trim()) {
        errors.push(`O campo ${field.id} precisa de um rótulo`);
      }

      if (
        [FieldType.SELECT, FieldType.MULTISELECT, FieldType.RADIO].includes(
          field.type
        ) &&
        (!field.options || field.options.length < 2)
      ) {
        errors.push(
          `O campo ${field.label} precisa ter pelo menos duas opções`
        );
      }
    });

    return errors;
  }, [formState]);

  return {
    formState,
    updateFormInfo,
    addField,
    updateField,
    removeField,
    reorderFields,
    updateSettings,
    validateForm,
  };
};

export default useFormBuilder;
