
"use client";

import type React from 'react';
import { usePageBuilder } from '@/contexts/PageBuilderContext';
import type { PageComponent } from '@/types/page-builder';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Trash2, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RenderedPageComponentProps {
  pageComponent: PageComponent;
}

const RenderedPageComponent: React.FC<RenderedPageComponentProps> = ({ pageComponent }) => {
  const {
    selectComponent,
    selectedComponentId,
    deleteComponent,
    moveComponentUp,
    moveComponentDown,
    getComponentDefinition,
    openPropertyEditor,
  } = usePageBuilder();

  const definition = getComponentDefinition(pageComponent.type);
  if (!definition) {
    return <div className="p-4 text-destructive-foreground bg-destructive rounded-md">Error: Component type '{pageComponent.type}' not found.</div>;
  }

  const ComponentToRender = definition.component;
  const isSelected = selectedComponentId === pageComponent.id;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    selectComponent(pageComponent.id); // This already opens property editor via its own logic
  };
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openPropertyEditor(pageComponent);
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveComponentUp(pageComponent.id);
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveComponentDown(pageComponent.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteComponent(pageComponent.id);
  };


  return (
    <Card 
      className={cn(
        "mb-4 relative group transition-all duration-200 ease-in-out shadow-md hover:shadow-lg",
        isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "border-border"
      )}
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelect(e as any);}}
      aria-label={`Select ${definition.name} component for editing`}
      aria-selected={isSelected}
    >
      <div className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 flex gap-1 p-1 bg-card/80 backdrop-blur-sm rounded-md shadow">
        <Button variant="ghost" size="icon" onClick={handleEditClick} className="h-7 w-7" aria-label="Edit component properties">
          <Settings2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleMoveUp} className="h-7 w-7" aria-label="Move component up">
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleMoveDown} className="h-7 w-7" aria-label="Move component down">
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDelete} className="h-7 w-7 text-destructive hover:text-destructive-foreground hover:bg-destructive" aria-label="Delete component">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <CardContent className="p-0"> {/* Padding is handled by element components */}
        <ComponentToRender {...pageComponent.props} />
      </CardContent>
    </Card>
  );
};

export default RenderedPageComponent;
