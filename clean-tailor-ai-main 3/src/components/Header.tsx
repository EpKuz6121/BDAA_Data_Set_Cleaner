import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Database className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">DataClean AI</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-smooth">
              Features
            </a>
            <a href="#workflow" className="text-sm font-medium hover:text-primary transition-smooth">
              How It Works
            </a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-smooth">
              Pricing
            </a>
            <a href="#docs" className="text-sm font-medium hover:text-primary transition-smooth">
              Documentation
            </a>
          </nav>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => window.location.href = '/clean'}>
              Try It Now
            </Button>
            <Button variant="hero">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
