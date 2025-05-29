
import type { LucideIcon } from 'lucide-react';
import type { Control, FieldValues, UseFormGetValues, UseFormSetValue } from 'react-hook-form';

export interface ComponentPropertyOption {
  label: string;
  value: string | number | boolean; // Updated to include boolean for select
}

export interface ComponentProperty {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'number' | 'select' | 'color' | 'file' | 'ai_action_button';
  defaultValue?: any;
  options?: ComponentPropertyOption[];
  placeholder?: string;
  promptSourceField?: string;
  actionTargetField?: string;
  buttonText?: string;
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

export interface Post {
  id: string;
  title: string;
  status: 'draft' | 'published';
  pageComponents: PageComponent[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
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

  // Post Management
  posts: Post[];
  activePostId: string | null;
  activePost: Post | null; // Derived from activePostId and posts
  currentViewInLeftPanel: 'components' | 'managePost';
  setCurrentViewInLeftPanel: (view: 'components' | 'managePost') => void;
  createPost: (title: string) => void;
  selectPost: (postId: string | null) => void;
  deletePostStorage: (postId: string) => void; // Renamed to avoid conflict with component delete
  updatePostTitle: (postId: string, newTitle: string) => void;
  updatePostStatus: (postId: string, newStatus: 'draft' | 'published') => void;
  // saveActivePostContent is handled internally by setAndSyncPageComponents
}

export interface FormFieldProps {
  property: ComponentProperty;
  control: Control<FieldValues>;
  getValues: UseFormGetValues<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
}
