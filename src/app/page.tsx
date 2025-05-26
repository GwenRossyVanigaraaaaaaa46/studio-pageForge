
"use client"; 
import { useState } from 'react';
import { PageBuilderProvider } from '@/contexts/PageBuilderContext';
import ComponentLibrary from '@/components/page-builder/ComponentLibrary';
import Canvas from '@/components/page-builder/Canvas';
import PropertyEditor from '@/components/page-builder/PropertyEditor';
import PageForgeLogo from '@/components/page-builder/icons/PageForgeLogo';
import { Button } from '@/components/ui/button';
import { PlusCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PageForgeBuilder() {
  const [isComponentLibraryOpen, setIsComponentLibraryOpen] = useState(true);

  const toggleComponentLibrary = () => {
    setIsComponentLibraryOpen(!isComponentLibraryOpen);
  };

  return (
    <PageBuilderProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <header className="h-14 border-b border-border flex items-center justify-between px-6 shadow-sm bg-card">
          <div className="flex items-center">
            <PageForgeLogo className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-2xl font-bold text-primary">PageForge</h1>
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
          {/* Wrapper for Component Library Panel and its Toggle Button */}
          <div className={cn(
            "h-full bg-card border-r border-border flex transition-all duration-300 ease-in-out",
            "hidden md:flex", // Panel is part of flex layout on medium screens and up
            isComponentLibraryOpen ? "w-72" : "w-12" // Adjust width for panel content or just the button
          )}>
            {/* Component Library Content Area */}
            <div className={cn(
              "flex-grow overflow-hidden transition-all duration-200 ease-in-out",
              isComponentLibraryOpen ? "p-4 opacity-100" : "w-0 p-0 opacity-0" // Shrink and fade content
            )}>
              {/* Conditionally render to ensure it's removed from layout when hidden, aiding transitions */}
              {isComponentLibraryOpen && <ComponentLibrary />}
            </div>

            {/* Toggle Button Area - always takes up w-12 space within the wrapper */}
            <div className="flex-shrink-0 h-full w-12 flex items-center justify-center border-l border-border">
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
          
          {/* Canvas Area */}
          <section className="flex-1 h-full overflow-y-auto bg-background/50">
            <Canvas />
          </section>

          {/* Property Editor Panel (remains as before, controlled by lg:block) */}
          <aside className="w-80 h-full border-l border-border bg-card p-4 hidden lg:block">
            <div className="h-full">
                <PropertyEditor />
            </div>
          </aside>
        </main>
        
        <footer className="h-10 border-t border-border flex items-center justify-center text-xs text-muted-foreground bg-card">
          <p>&copy; {new Date().getFullYear()} PageForge. Built with Next.js & ShadCN UI.</p>
        </footer>
      </div>
    </PageBuilderProvider>
  );
}
