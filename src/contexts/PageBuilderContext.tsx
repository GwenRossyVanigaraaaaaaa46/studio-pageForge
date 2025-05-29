
"use client";

import type React from 'react';
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { PageComponent, ComponentDefinition, PageBuilderContextType, Post } from '@/types/page-builder';
import { COMPONENT_REGISTRY } from '@/config/componentRegistry';
import { useToast } from "@/hooks/use-toast";

const PageBuilderContext = createContext<PageBuilderContextType | undefined>(undefined);

export const PageBuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pageComponents, _setPageComponentsInternal] = useState<PageComponent[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [editingComponent, setEditingComponent] = useState<PageComponent | null>(null);
  const [isPropertyEditorPanelOpen, setIsPropertyEditorPanelOpen] = useState<boolean>(true);
  const { toast } = useToast();

  // Post Management State
  const [posts, setPosts] = useState<Post[]>([]);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [currentViewInLeftPanel, setCurrentViewInLeftPanel] = useState<'components' | 'managePost'>('components');

  const activePost = useMemo(() => {
    if (!activePostId) return null;
    return posts.find(p => p.id === activePostId) || null;
  }, [activePostId, posts]);

  // Sync pageComponents with active post
  const setAndSyncPageComponents = useCallback((newComponentsOrCallback: React.SetStateAction<PageComponent[]>) => {
    _setPageComponentsInternal(prevCanvasComponents => {
      const updatedCanvasComponents = typeof newComponentsOrCallback === 'function'
        ? newComponentsOrCallback(prevCanvasComponents)
        : newComponentsOrCallback;

      if (activePostId) {
        setPosts(prevPosts =>
          prevPosts.map(p =>
            p.id === activePostId
              ? { ...p, pageComponents: updatedCanvasComponents, updatedAt: new Date().toISOString() }
              : p
          )
        );
      }
      return updatedCanvasComponents;
    });
  }, [activePostId]);


  const getComponentDefinition = useCallback((type: string): ComponentDefinition | undefined => {
    return COMPONENT_REGISTRY.find(def => def.type === type);
  }, []);

  const addComponent = useCallback((type: string) => {
    const definition = getComponentDefinition(type);
    if (!definition) {
      toast({ title: "Error", description: `Component type ${type} not found.`, variant: "destructive" });
      return;
    }
    const newComponent: PageComponent = {
      id: crypto.randomUUID(),
      type: definition.type,
      props: { ...definition.defaultProps },
    };
    setAndSyncPageComponents(prev => [...prev, newComponent]);
    setSelectedComponentId(newComponent.id);
    setEditingComponent(newComponent);
    setIsPropertyEditorPanelOpen(true);
    toast({ title: "Component Added", description: `${definition.name} added to current post.` });
  }, [getComponentDefinition, toast, setAndSyncPageComponents]);

  const updateComponentProps = useCallback((id: string, newProps: Record<string, any>) => {
    let wasPageComponentsUpdated = false;
    setAndSyncPageComponents(prevComps =>
      prevComps.map(comp => {
        if (comp.id === id) {
          const currentCompProps = comp.props;
          let propsHaveActuallyChanged = false;
          const allKeys = new Set([...Object.keys(currentCompProps), ...Object.keys(newProps)]);
          for (const key of allKeys) {
            const currentVal = currentCompProps[key];
            const newVal = newProps[key];
            if ((currentVal === undefined || currentVal === null || currentVal === '') && (newVal === undefined || newVal === null || newVal === '')) continue;
            if (currentVal !== newVal) {
              propsHaveActuallyChanged = true;
              break;
            }
          }
          if (propsHaveActuallyChanged) {
            wasPageComponentsUpdated = true;
            return { ...comp, props: { ...newProps } };
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
          if ((currentVal === undefined || currentVal === null || currentVal === '') && (newVal === undefined || newVal === null || newVal === '')) continue;
          if (currentVal !== newVal) {
            editingPropsNeedUpdate = true;
            break;
          }
        }
        if (editingPropsNeedUpdate) return { ...currentEditingComp, props: { ...newProps } };
        return currentEditingComp;
      }
      return currentEditingComp;
    });
    // Toast for property updates was removed by user request
  }, [setAndSyncPageComponents]);

  const selectComponent = useCallback((id: string | null) => {
    setSelectedComponentId(id);
    if (id) {
      const componentToEdit = pageComponents.find(comp => comp.id === id);
      if (componentToEdit) {
        setEditingComponent(componentToEdit);
        setIsPropertyEditorPanelOpen(true);
      }
    } else {
      setEditingComponent(null);
      setIsPropertyEditorPanelOpen(false);
    }
  }, [pageComponents]);

  const deleteComponent = useCallback((id: string) => {
    setAndSyncPageComponents(prev => prev.filter(comp => comp.id !== id));
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
      setEditingComponent(null);
      setIsPropertyEditorPanelOpen(false);
    }
    toast({ title: "Component Removed", description: `Component has been removed.`, variant: "destructive" });
  }, [selectedComponentId, toast, setAndSyncPageComponents]);

  const moveComponent = useCallback((id: string, direction: 'up' | 'down') => {
    setAndSyncPageComponents(prev => {
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
  }, [toast, setAndSyncPageComponents]);

  const moveComponentUp = (id: string) => moveComponent(id, 'up');
  const moveComponentDown = (id: string) => moveComponent(id, 'down');

  const openPropertyEditor = useCallback((component: PageComponent) => {
    setEditingComponent(component);
    setSelectedComponentId(component.id);
    setIsPropertyEditorPanelOpen(true);
  }, []);

  const closePropertyEditor = useCallback(() => {
    setEditingComponent(null);
    setSelectedComponentId(null);
    setIsPropertyEditorPanelOpen(false);
  }, []);

  const togglePropertyEditorPanel = useCallback(() => {
    setIsPropertyEditorPanelOpen(prev => !prev);
  }, []);

  // Post Management Functions
  const createPost = useCallback((title: string) => {
    const newPostId = crypto.randomUUID();
    const now = new Date().toISOString();
    const newPost: Post = {
      id: newPostId,
      title,
      status: 'draft',
      pageComponents: [],
      createdAt: now,
      updatedAt: now,
    };
    setPosts(prev => [...prev, newPost]);
    setActivePostId(newPostId);
    _setPageComponentsInternal([]); // Set canvas components directly, sync will handle post array
    setCurrentViewInLeftPanel('components');
    toast({ title: "Post Created", description: `"${title}" has been created.` });
  }, [toast]);

  const selectPost = useCallback((postId: string | null) => {
    if (postId) {
      const postToLoad = posts.find(p => p.id === postId);
      if (postToLoad) {
        setActivePostId(postId);
        _setPageComponentsInternal(postToLoad.pageComponents); // Load components directly
        setCurrentViewInLeftPanel('components');
        toast({ title: "Post Loaded", description: `"${postToLoad.title}" is now active.` });
      } else {
        toast({ title: "Error", description: "Post not found.", variant: "destructive" });
        setActivePostId(null);
        _setPageComponentsInternal([]);
      }
    } else { // Deselecting post
      setActivePostId(null);
      _setPageComponentsInternal([]);
      setCurrentViewInLeftPanel('components'); // Or 'managePost' if preferred
    }
  }, [posts, toast]);
  
  const deletePostStorage = useCallback((postId: string) => {
    const postToDelete = posts.find(p => p.id === postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
    if (activePostId === postId) {
      setActivePostId(null);
      _setPageComponentsInternal([]); // Clear canvas if active post is deleted
    }
    if (postToDelete) {
      toast({ title: "Post Deleted", description: `"${postToDelete.title}" has been deleted.`, variant: "destructive" });
    }
  }, [activePostId, posts, toast]);

  const updatePostTitle = useCallback((postId: string, newTitle: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, title: newTitle, updatedAt: new Date().toISOString() } : p));
    toast({ title: "Post Updated", description: `Post title changed to "${newTitle}".` });
  }, [toast]);

  const updatePostStatus = useCallback((postId: string, newStatus: 'draft' | 'published') => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: newStatus, updatedAt: new Date().toISOString() } : p));
    toast({ title: "Post Updated", description: `Post status changed to "${newStatus}".` });
  }, [toast]);


  const contextValue = useMemo(() => ({
    pageComponents, selectedComponentId, componentRegistry: COMPONENT_REGISTRY,
    editingComponent, isPropertyEditorPanelOpen,
    addComponent, updateComponentProps, selectComponent, deleteComponent,
    moveComponentUp, moveComponentDown, getComponentDefinition,
    openPropertyEditor, closePropertyEditor, togglePropertyEditorPanel,
    // Post Management
    posts, activePostId, activePost, currentViewInLeftPanel,
    setCurrentViewInLeftPanel, createPost, selectPost,
    deletePostStorage, updatePostTitle, updatePostStatus,
  }), [
    pageComponents, selectedComponentId, editingComponent, isPropertyEditorPanelOpen,
    addComponent, updateComponentProps, selectComponent, deleteComponent,
    moveComponentUp, moveComponentDown, getComponentDefinition,
    openPropertyEditor, closePropertyEditor, togglePropertyEditorPanel,
    posts, activePostId, activePost, currentViewInLeftPanel,
    createPost, selectPost, deletePostStorage, updatePostTitle, updatePostStatus
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
