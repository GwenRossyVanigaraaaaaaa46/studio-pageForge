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
    e.stopPropagation(); // Prevent event bubbling if nested
    selectComponent(pageComponent.id);
    openPropertyEditor(pageComponent);
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
      onKeyDown={(e) => e.key === 'Enter' && handleSelect(e as any)}
      aria-label={`Select ${definition.name} component`}
    >
      <div className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 p-1 bg-card/80 backdrop-blur-sm rounded-md shadow">
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openPropertyEditor(pageComponent); }} className="h-7 w-7" aria-label="Edit component">
          <Settings2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); moveComponentUp(pageComponent.id); }} className="h-7 w-7" aria-label="Move component up">
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); moveComponentDown(pageComponent.id); }} className="h-7 w-7" aria-label="Move component down">
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteComponent(pageComponent.id); }} className="h-7 w-7 text-destructive hover:text-destructive-foreground hover:bg-destructive" aria-label="Delete component">
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
