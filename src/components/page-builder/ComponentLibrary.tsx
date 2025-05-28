
"use client";

import type React from 'react';
import { usePageBuilder } from '@/contexts/PageBuilderContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle } from 'lucide-react';

const ComponentLibrary: React.FC = () => {
  const { componentRegistry, addComponent } = usePageBuilder();

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-semibold flex items-center">
          <PlusCircle className="mr-2 h-5 w-5 text-primary" />
          Add Components
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow">
        <ScrollArea className="h-full p-4">
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
      </CardContent>
    </Card>
  );
};

export default ComponentLibrary;
