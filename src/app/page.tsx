
import { PageBuilderProvider } from '@/contexts/PageBuilderContext';
import ComponentLibrary from '@/components/page-builder/ComponentLibrary';
import Canvas from '@/components/page-builder/Canvas';
import PropertyEditor from '@/components/page-builder/PropertyEditor';
import PageForgeLogo from '@/components/page-builder/icons/PageForgeLogo';
import { Separator } from '@/components/ui/separator';

export default function PageForgeBuilder() {
  return (
    <PageBuilderProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <header className="h-14 border-b border-border flex items-center px-6 shadow-sm bg-card">
          <div className="flex items-center">
            <PageForgeLogo className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-2xl font-bold text-primary">PageForge</h1>
          </div>
          {/* Future: Add Save/Preview/Publish buttons here */}
        </header>
        
        <main className="flex flex-1 overflow-hidden">
          {/* Component Library Panel */}
          <aside className="w-72 h-full border-r border-border bg-card p-4 hidden md:block">
             <div className="h-full">
                <ComponentLibrary />
             </div>
          </aside>

          {/* Canvas Area */}
          <section className="flex-1 h-full overflow-y-auto bg-background/50">
            <Canvas />
          </section>

          {/* Property Editor Panel */}
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

