import { Database } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <Database className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">DataClean AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering data scientists with AI-powered cleaning and tailoring tools.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-smooth">Features</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Pricing</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Enterprise</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Changelog</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-smooth">Documentation</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">API Reference</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Guides</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Community</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-smooth">About</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 DataClean AI. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-smooth">Privacy</a>
            <a href="#" className="hover:text-primary transition-smooth">Terms</a>
            <a href="#" className="hover:text-primary transition-smooth">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
