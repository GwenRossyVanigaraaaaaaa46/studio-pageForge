
"use client";
import { useState } from 'react';
import { PageBuilderProvider, usePageBuilder } from '@/contexts/PageBuilderContext';
import ComponentLibrary from '@/components/page-builder/ComponentLibrary';
import Canvas from '@/components/page-builder/Canvas';
import PropertyEditor from '@/components/page-builder/PropertyEditor';
import PageForgeLogo from '@/components/page-builder/icons/PageForgeLogo';
import { Button } from '@/components/ui/button';
import { PlusCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Inner component to consume context for panel visibility
const PageLayout = () => {
  const { isPropertyEditorPanelOpen, togglePropertyEditorPanel } = usePageBuilder();
  const [isComponentLibraryOpen, setIsComponentLibraryOpen] = useState(true);

  const toggleComponentLibrary = () => {
    setIsComponentLibraryOpen(!isComponentLibraryOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="h-14 border-b border-border flex items-center justify-between px-6 shadow-sm bg-card">
        <div className="flex items-center">
          <PageForgeLogo className="h-8 w-8 text-primary mr-4" />
          <h1 className="text-2xl font-bold text-primary ml-3">PageForge</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Plugin
          </Button>
          <Button variant="default">
            <Eye className="mr-2 h-4 w-4" />
            Preview Page
          </Button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className={cn(
          "h-full bg-card border-r border-border flex transition-all duration-300 ease-in-out",
          "hidden md:flex", 
          isComponentLibraryOpen ? "w-72" : "w-12"
        )}>
          <div className={cn(
            "flex-grow overflow-hidden", 
            "transition-all duration-300 ease-in-out", 
            isComponentLibraryOpen ? "w-auto opacity-100" : "w-0 opacity-0"
          )}>
            {isComponentLibraryOpen && <ComponentLibrary />}
          </div>
          <div className={cn(
              "flex-shrink-0 flex items-center justify-center",
              isComponentLibraryOpen ? "w-12" : "w-full h-full"
          )}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleComponentLibrary}
              className="h-10 w-10 rounded-md hover:bg-muted"
              aria-label={isComponentLibraryOpen ? "Collapse Component Library" : "Expand Component Library"}
            >
              {isComponentLibraryOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <section className="flex-1 h-full overflow-y-auto bg-background/50">
          <Canvas />
        </section>

        <div className={cn(
          "h-full bg-card border-l border-border flex flex-row-reverse transition-all duration-300 ease-in-out",
          "hidden lg:flex", 
          isPropertyEditorPanelOpen ? "w-80" : "w-12" // Use context state here
        )}>
          <div className={cn(
            "flex-grow overflow-hidden",
            "transition-all duration-300 ease-in-out",
            isPropertyEditorPanelOpen ? "w-auto opacity-100" : "w-0 opacity-0" // And here
          )}>
            {isPropertyEditorPanelOpen && <PropertyEditor />} 
          </div>
          <div className={cn(
              "flex-shrink-0 flex items-center justify-center",
              isPropertyEditorPanelOpen ? "w-12" : "w-full h-full" // And here
          )}>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePropertyEditorPanel} // Use context toggle function
              className="h-10 w-10 rounded-md hover:bg-muted"
              aria-label={isPropertyEditorPanelOpen ? "Collapse Property Editor" : "Expand Property Editor"}
            >
              {isPropertyEditorPanelOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </main>

      <footer className="h-10 border-t border-border flex items-center justify-center text-xs text-muted-foreground bg-card">
        <p>&copy; {new Date().getFullYear()} PageForge. Built with Next.js & ShadCN UI.</p>
      </footer>
    </div>
  );
};

export default function PageForgeBuilder() {
  return (
    <PageBuilderProvider>
      <PageLayout />
    </PageBuilderProvider>
  );
}
