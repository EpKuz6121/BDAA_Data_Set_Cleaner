import { Database } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <Database className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">DataClean AI</span>
            </div>
          <p className="text-sm text-muted-foreground max-w-md">
              Empowering data scientists with AI-powered cleaning and tailoring tools.
            </p>
        </div>
        
        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 DataClean AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
