"use client";

import type React from 'react';
import { usePageBuilder } from '@/contexts/PageBuilderContext';
import RenderedPageComponent from './RenderedPageComponent';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { LayoutGrid } from 'lucide-react';

const Canvas: React.FC = () => {
  const { pageComponents, selectComponent } = usePageBuilder();

  const handleCanvasClick = () => {
    selectComponent(null); // Deselect component when clicking on canvas background
  };

  return (
    <Card 
      className="h-full flex-grow shadow-inner bg-background/70"
      onClick={handleCanvasClick}
    >
      <ScrollArea className="h-full p-2 md:p-6 rounded-md">
        <div className="max-w-4xl mx-auto bg-card p-4 md:p-8 rounded-lg shadow-xl min-h-[calc(100vh-10rem)]">
          {pageComponents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-muted-foreground border-2 border-dashed border-border rounded-lg p-8">
              <LayoutGrid className="h-16 w-16 mb-4 text-primary/50" />
              <h2 className="text-xl font-semibold mb-2 text-foreground">Your Page is Empty</h2>
              <p className="text-sm">
                Add components from the library on the left to start building your page.
              </p>
              <p className="text-sm mt-1">Click on a component in the canvas to edit its properties.</p>
            </div>
          ) : (
            pageComponents.map(comp => (
              <RenderedPageComponent key={comp.id} pageComponent={comp} />
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default Canvas;
