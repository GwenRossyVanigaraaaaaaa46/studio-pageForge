
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
    setSelectedComponentId(newComponent.id);
    setEditingComponent(newComponent); // Directly set editing component
    setIsPropertyEditorOpen(true); // Open property editor
    toast({ title: "Component Added", description: `${definition.name} has been added to the page.` });
  }, [getComponentDefinition, toast]);

  const updateComponentProps = useCallback((id: string, newProps: Record<string, any>) => {
    let wasPageComponentsUpdated = false;
    let actualUpdateInEditingComponent = false;

    setPageComponents(prevComps =>
      prevComps.map(comp => {
        if (comp.id === id) {
          const currentCompProps = comp.props;
          let propsHaveActuallyChanged = false;
          const allKeys = new Set([...Object.keys(currentCompProps), ...Object.keys(newProps)]);

          for (const key of allKeys) {
            const currentVal = currentCompProps[key];
            const newVal = newProps[key];
            
            if (typeof newVal === 'number' && isNaN(newVal) && typeof currentVal === 'number' && isNaN(currentVal)) {
              continue;
            }
             if ((currentVal === undefined || currentVal === null || currentVal === '') && (newVal === undefined || newVal === null || newVal === '')) {
              continue;
            }
            if (currentVal !== newVal) {
              propsHaveActuallyChanged = true;
              break;
            }
          }

          if (propsHaveActuallyChanged) {
            wasPageComponentsUpdated = true;
            return { ...comp, props: { ...newProps } }; // Use newProps directly after validation
          }
          return comp; 
        }
        return comp;
      })
    );
    
    setEditingComponent(currentEditingComp => {
      if (currentEditingComp && currentEditingComp.id === id) {
        const currentEditingProps = currentEditingComp.props;
        let editingPropsNeedUpdate = false;
        const allKeys = new Set([...Object.keys(currentEditingProps), ...Object.keys(newProps)]);
        
        for (const key of allKeys) {
          const currentVal = currentEditingProps[key];
          const newVal = newProps[key];
          if (typeof newVal === 'number' && isNaN(newVal) && typeof currentVal === 'number' && isNaN(currentVal)) {
            continue;
          }
           if ((currentVal === undefined || currentVal === null || currentVal === '') && (newVal === undefined || newVal === null || newVal === '')) {
              continue;
            }
          if (currentVal !== newVal) {
            editingPropsNeedUpdate = true;
            break;
          }
        }

        if (editingPropsNeedUpdate) {
          actualUpdateInEditingComponent = true;
          return { ...currentEditingComp, props: { ...newProps } }; // Use newProps directly
        }
        return currentEditingComp; 
      }
      return currentEditingComp;
    });

    // User requested removal of "Component Updated" toast.
    // if (wasPageComponentsUpdated || actualUpdateInEditingComponent) {
    //   // toast({ title: "Component Updated", description: `Properties saved.` });
    // }
  }, [] /* Removed toast from deps as it's stable, updateComponentProps doesn't need to change if toast changes */);

  const selectComponent = useCallback((id: string | null) => {
    setSelectedComponentId(id);
    if (id) {
      const componentToEdit = pageComponents.find(comp => comp.id === id);
      if (componentToEdit) {
        setEditingComponent(componentToEdit);
        setIsPropertyEditorOpen(true);
      }
    } else {
      // If deselecting, or clicking canvas, close editor
      setEditingComponent(null);
      setIsPropertyEditorOpen(false); 
    }
  }, [pageComponents]); // pageComponents is a dependency here

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
    setSelectedComponentId(component.id); // Also ensure it's selected
    setIsPropertyEditorOpen(true);
  }, []);

  const closePropertyEditor = useCallback(() => {
    // We don't deselect the component here, just close the editor view
    // Deselection should happen via selectComponent(null)
    setIsPropertyEditorOpen(false);
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
