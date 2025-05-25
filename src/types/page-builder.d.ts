import type { LucideIcon } from 'lucide-react';
import type { Control, UseFormReturn, FieldValues } from 'react-hook-form';

export interface ComponentPropertyOption {
  label: string;
  value: string | number;
}

export interface ComponentProperty {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'number' | 'select' | 'color';
  defaultValue?: any;
  options?: ComponentPropertyOption[];
  placeholder?: string;
}

export interface PageComponent {
  id: string;
  type: string; // Key from componentRegistry
  props: Record<string, any>;
}

export interface ComponentDefinition {
  type: string; // Unique identifier
  name: string; // Display name in library
  icon: LucideIcon | React.FC<{ className?: string }>; // Icon for library
  defaultProps: Record<string, any>;
  properties: ComponentProperty[];
  component: React.FC<any>; // The actual React component to render
}

export interface PageBuilderContextType {
  pageComponents: PageComponent[];
  selectedComponentId: string | null;
  componentRegistry: ComponentDefinition[];
  editingComponent: PageComponent | null;
  isPropertyEditorOpen: boolean;
  
  addComponent: (type: string) => void;
  updateComponentProps: (id: string, newProps: Record<string, any>) => void;
  selectComponent: (id: string | null) => void;
  deleteComponent: (id: string) => void;
  moveComponentUp: (id: string) => void;
  moveComponentDown: (id: string) => void;
  
  getComponentDefinition: (type: string) => ComponentDefinition | undefined;
  
  openPropertyEditor: (component: PageComponent) => void;
  closePropertyEditor: () => void;
}

export interface FormFieldProps {
  property: ComponentProperty;
  control: Control<FieldValues>;
  form: UseFormReturn<FieldValues>;
}