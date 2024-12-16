export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  EMAIL = 'email',
  DATE = 'date',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  TEXTAREA = 'textarea',
  FILE = 'file',
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  validation?: FormFieldValidation[];
  options?: FieldOption[];
  defaultValue?: any;
  order: number;
}

export interface FormFieldValidation {
  rule: string;
  value: any;
  message?: string;
}

export interface FieldOption {
  label: string;
  value: string;
}

export interface FormSettings {
  is_public: boolean;
  collect_email: boolean;
  one_response_per_user: boolean;
  show_progress_bar: boolean;
  confirmation_message: string;
  notification_email?: string;
  custom_theme?: any;
}
