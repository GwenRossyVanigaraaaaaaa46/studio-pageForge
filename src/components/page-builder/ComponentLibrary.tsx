
"use client";

import type React from 'react';
import { usePageBuilder } from '@/contexts/PageBuilderContext';
import { Button } from '@/components/ui/button';
// Card, CardHeader, CardTitle, CardContent are removed as the header is now in page.tsx
import { ScrollArea } from '@/components/ui/scroll-area';
// PlusCircle icon is removed as it's now handled in page.tsx for the panel header

const ComponentLibrary: React.FC = () => {
  const { componentRegistry, addComponent } = usePageBuilder();

  // The Card wrapper and header are removed from here, as page.tsx now handles the panel structure and header
  return (
    <ScrollArea className="h-full p-4"> {/* Assumes parent provides flex-grow and overflow handling */}
      <div className="space-y-3">
        {componentRegistry.map((definition) => {
          const Icon = definition.icon;
          return (
            <Button
              key={definition.type}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 transition-all duration-150 ease-in-out hover:shadow-md hover:border-primary group hover:bg-secondary"
              onClick={() => addComponent(definition.type)}
              aria-label={`Add ${definition.name} component`}
            >
              <div className="flex items-center">
                <Icon className="h-5 w-5 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
                <div>
                  <p className="font-medium text-sm text-foreground group-hover:text-primary">{definition.name}</p>
                  <p className="text-xs text-muted-foreground">Click to add to page</p>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default ComponentLibrary;
