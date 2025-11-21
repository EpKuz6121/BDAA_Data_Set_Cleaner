import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const benefits = [
  "Completely free to use",
  "No registration required",
  "No limits on usage",
  "Full feature access",
];

const CTA = () => {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-12 lg:p-20 shadow-strong">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
          
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl text-primary-foreground">
              Ready to Transform Your Data Workflow?
            </h2>
            
            <p className="text-lg text-primary-foreground/90">
              Join thousands of data scientists who have already automated their data cleaning 
              and saved countless hours every month. Best of all, it's completely free!
            </p>
            
            <div className="flex flex-wrap gap-6 justify-center">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-primary-foreground">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                variant="outline"
                size="xl"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-0"
                onClick={() => window.location.href = '/clean'}
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
