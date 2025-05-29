
import type { LucideIcon } from 'lucide-react';
import type { Control, UseFormReturn, FieldValues, UseFormGetValues, UseFormSetValue } from 'react-hook-form';

export interface ComponentPropertyOption {
  label: string;
  value: string | number;
}

export interface ComponentProperty {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'number' | 'select' | 'color' | 'file' | 'ai_action_button';
  defaultValue?: any;
  options?: ComponentPropertyOption[];
  placeholder?: string;
  // For 'ai_action_button' type
  promptSourceField?: string; // Name of the form field to get the prompt from
  actionTargetField?: string; // Name of the form field to put the AI result into
  buttonText?: string; // Optional custom text for the AI action button
}

export interface PageComponent {
  id: string;
  type: string; 
  props: Record<string, any>;
}

export interface ComponentDefinition {
  type: string; 
  name: string; 
  icon: LucideIcon | React.FC<{ className?: string }>; 
  defaultProps: Record<string, any>;
  properties: ComponentProperty[];
  component: React.FC<any>; 
}

export interface PageBuilderContextType {
  pageComponents: PageComponent[];
  selectedComponentId: string | null;
  componentRegistry: ComponentDefinition[];
  editingComponent: PageComponent | null;
  isPropertyEditorPanelOpen: boolean;
  
  addComponent: (type: string) => void;
  updateComponentProps: (id: string, newProps: Record<string, any>) => void;
  selectComponent: (id: string | null) => void;
  deleteComponent: (id: string) => void;
  moveComponentUp: (id: string) => void;
  moveComponentDown: (id: string) => void;
  
  getComponentDefinition: (type: string) => ComponentDefinition | undefined;
  
  openPropertyEditor: (component: PageComponent) => void;
  closePropertyEditor: () => void;
  togglePropertyEditorPanel: () => void;
}

export interface FormFieldProps {
  property: ComponentProperty;
  control: Control<FieldValues>;
  form: UseFormReturn<FieldValues>; // Contains getValues, setValue, etc.
}
