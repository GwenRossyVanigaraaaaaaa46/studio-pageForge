"use client";

import type React from 'react';
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { PageComponent, ComponentDefinition, PageBuilderContextType } from '@/types/page-builder';
import { COMPONENT_REGISTRY } from '@/config/componentRegistry';
import { useToast } from "@/hooks/use-toast";

const PageBuilderContext = createContext<PageBuilderContextType | undefined>(undefined);

export const PageBuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pageComponents, setPageComponents] = useState<PageComponent[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [editingComponent, setEditingComponent] = useState<PageComponent | null>(null);
  const [isPropertyEditorOpen, setIsPropertyEditorOpen] = useState<boolean>(false);
  const { toast } = useToast();

  const getComponentDefinition = useCallback((type: string): ComponentDefinition | undefined => {
    return COMPONENT_REGISTRY.find(def => def.type === type);
  }, []);

  const addComponent = useCallback((type: string) => {
    const definition = getComponentDefinition(type);
    if (!definition) {
      console.error(`Component type ${type} not found in registry.`);
      toast({ title: "Error", description: `Component type ${type} not found.`, variant: "destructive" });
      return;
    }
    const newComponent: PageComponent = {
      id: crypto.randomUUID(),
      type: definition.type,
      props: { ...definition.defaultProps },
    };
    setPageComponents(prev => [...prev, newComponent]);
    setSelectedComponentId(newComponent.id); // Auto-select new component
    setEditingComponent(newComponent);
    setIsPropertyEditorOpen(true);
    toast({ title: "Component Added", description: `${definition.name} has been added to the page.` });
  }, [getComponentDefinition, toast]);

  const updateComponentProps = useCallback((id: string, newProps: Record<string, any>) => {
    setPageComponents(prevComps =>
      prevComps.map(comp =>
        comp.id === id ? { ...comp, props: { ...comp.props, ...newProps } } : comp
      )
    );
    // Update editingComponent state if it's the one being modified.
    // Use functional update to avoid needing editingComponent in useCallback deps.
    setEditingComponent(currentEditingComp => {
      if (currentEditingComp && currentEditingComp.id === id) {
        // Create a new object for editingComponent state with updated props
        return { ...currentEditingComp, props: { ...currentEditingComp.props, ...newProps } };
      }
      // If not the currently edited component, or no component is being edited, return the existing state.
      return currentEditingComp; 
    });

    toast({ title: "Component Updated", description: `Properties saved.` });
  }, [toast]); // setPageComponents and setEditingComponent (from useState) and toast are stable.

  const selectComponent = useCallback((id: string | null) => {
    setSelectedComponentId(id);
    if (id) {
      const componentToEdit = pageComponents.find(comp => comp.id === id);
      if (componentToEdit) {
        setEditingComponent(componentToEdit);
        setIsPropertyEditorOpen(true);
      }
    } else {
      setEditingComponent(null);
      setIsPropertyEditorOpen(false);
    }
  }, [pageComponents]);

  const deleteComponent = useCallback((id: string) => {
    setPageComponents(prev => prev.filter(comp => comp.id !== id));
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
      setEditingComponent(null);
      setIsPropertyEditorOpen(false);
    }
    toast({ title: "Component Removed", description: `Component has been removed.`, variant: "destructive" });
  }, [selectedComponentId, toast]);

  const moveComponent = useCallback((id: string, direction: 'up' | 'down') => {
    setPageComponents(prev => {
      const index = prev.findIndex(comp => comp.id === id);
      if (index === -1) return prev;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newArray = [...prev];
      const [movedComponent] = newArray.splice(index, 1);
      newArray.splice(newIndex, 0, movedComponent);
      return newArray;
    });
    toast({ title: "Component Moved", description: `Component reordered.` });
  }, [toast]);
  
  const moveComponentUp = (id: string) => moveComponent(id, 'up');
  const moveComponentDown = (id: string) => moveComponent(id, 'down');

  const openPropertyEditor = useCallback((component: PageComponent) => {
    setEditingComponent(component);
    setSelectedComponentId(component.id);
    setIsPropertyEditorOpen(true);
  }, []);

  const closePropertyEditor = useCallback(() => {
    setIsPropertyEditorOpen(false);
    // Optionally deselect component or keep it selected:
    // setSelectedComponentId(null); 
    // setEditingComponent(null);
  }, []);
  
  const contextValue = useMemo(() => ({
    pageComponents,
    selectedComponentId,
    componentRegistry: COMPONENT_REGISTRY,
    editingComponent,
    isPropertyEditorOpen,
    addComponent,
    updateComponentProps,
    selectComponent,
    deleteComponent,
    moveComponentUp,
    moveComponentDown,
    getComponentDefinition,
    openPropertyEditor,
    closePropertyEditor,
  }), [
    pageComponents, selectedComponentId, editingComponent, isPropertyEditorOpen,
    addComponent, updateComponentProps, selectComponent, deleteComponent, 
    moveComponentUp, moveComponentDown, getComponentDefinition,
    openPropertyEditor, closePropertyEditor
  ]);

  return (
    <PageBuilderContext.Provider value={contextValue}>
      {children}
    </PageBuilderContext.Provider>
  );
};

export const usePageBuilder = (): PageBuilderContextType => {
  const context = useContext(PageBuilderContext);
  if (context === undefined) {
    throw new Error('usePageBuilder must be used within a PageBuilderProvider');
  }
  return context;
};
