
"use client";
import { useState } from 'react';
import { PageBuilderProvider, usePageBuilder } from '@/contexts/PageBuilderContext';
import ComponentLibrary from '@/components/page-builder/ComponentLibrary';
import Canvas from '@/components/page-builder/Canvas';
import PropertyEditor from '@/components/page-builder/PropertyEditor';
import PageForgeLogo from '@/components/page-builder/icons/PageForgeLogo';
import ManagePostView from '@/components/page-builder/ManagePostView';
import { Button } from '@/components/ui/button';
import { PlusCircle, Eye, ChevronLeft, ChevronRight, FileCog, Library, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

// Inner component to consume context for panel visibility
const PageLayout = () => {
  const { 
    isPropertyEditorPanelOpen, 
    togglePropertyEditorPanel,
    currentViewInLeftPanel,
    setCurrentViewInLeftPanel
  } = usePageBuilder();
  const [isComponentLibraryOpen, setIsComponentLibraryOpen] = useState(true);

  const toggleComponentLibraryPanel = () => {
    setIsComponentLibraryOpen(!isComponentLibraryOpen);
  };

  const handleManagePostClick = () => {
    setCurrentViewInLeftPanel('managePost');
    if (!isComponentLibraryOpen) {
      setIsComponentLibraryOpen(true);
    }
  };
  
  const leftPanelTitle = currentViewInLeftPanel === 'components' ? 'Add Components' : 'Manage Posts';
  const LeftPanelIcon = currentViewInLeftPanel === 'components' ? Library : FileCog; // Adjusted icons to better match titles

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
        {/* Left Panel: Component Library or Manage Posts */}
        <div className={cn(
          "h-full bg-card border-r border-border flex transition-all duration-300 ease-in-out",
          "hidden md:flex",
          isComponentLibraryOpen ? "w-72" : "w-12" // Reduced from w-80
        )}>
          <div className={cn(
            "flex flex-col flex-grow overflow-hidden",
            "transition-all duration-300 ease-in-out",
            isComponentLibraryOpen ? "w-auto opacity-100" : "w-0 opacity-0"
          )}>
            {isComponentLibraryOpen && (
              <div className="flex flex-col h-full">
                 <div className="p-4 border-b flex-shrink-0">
                    <h2 className="text-lg font-semibold flex items-center">
                      <LeftPanelIcon className="mr-2 h-5 w-5 text-primary" />
                      {leftPanelTitle}
                    </h2>
                  </div>

                <div className="flex-grow overflow-auto">
                  {currentViewInLeftPanel === 'components' ? <ComponentLibrary /> : <ManagePostView />}
                </div>
                
                <div className="p-4 border-t border-border flex-shrink-0">
                  {currentViewInLeftPanel === 'components' ? (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start bg-muted text-primary hover:bg-accent hover:text-accent-foreground font-medium"
                      onClick={handleManagePostClick}
                    >
                      <FileCog className="mr-3 h-5 w-5" /> Manage Posts
                    </Button>
                  ) : (
                     <Button 
                      variant="ghost" 
                      className="w-full justify-start bg-muted text-primary hover:bg-accent hover:text-accent-foreground font-medium"
                      onClick={() => setCurrentViewInLeftPanel('components')}
                    >
                      <Library className="mr-3 h-5 w-5" /> Component Library
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className={cn(
              "flex-shrink-0 flex items-center justify-center",
              isComponentLibraryOpen ? "w-12" : "w-full h-full"
          )}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleComponentLibraryPanel}
              className="h-10 w-10 rounded-md hover:bg-muted"
              aria-label={isComponentLibraryOpen ? "Collapse Left Panel" : "Expand Left Panel"}
            >
              {isComponentLibraryOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Center Panel: Canvas */}
        <section className="flex-1 h-full overflow-y-auto bg-background/50">
          <Canvas />
        </section>

        {/* Right Panel: Property Editor */}
        <div className={cn(
          "h-full bg-card border-l border-border flex flex-row-reverse transition-all duration-300 ease-in-out",
          "hidden lg:flex",
          isPropertyEditorPanelOpen ? "w-80" : "w-12" // Reduced from w-96
        )}>
          <div className={cn(
            "flex-grow overflow-hidden",
            "transition-all duration-300 ease-in-out",
            isPropertyEditorPanelOpen ? "w-auto opacity-100" : "w-0 opacity-0"
          )}>
            {isPropertyEditorPanelOpen && <PropertyEditor />}
          </div>
          <div className={cn(
              "flex-shrink-0 flex items-center justify-center",
              isPropertyEditorPanelOpen ? "w-12" : "w-full h-full"
          )}>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePropertyEditorPanel}
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
