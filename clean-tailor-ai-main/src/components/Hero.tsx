import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-data.jpg";

const Hero = () => {
  return (
    <section className="relative overflow-hidden gradient-hero py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              AI-Powered Data Pipeline
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight">
              Clean & Tailor Your Data in{" "}
              <span className="gradient-primary bg-clip-text text-transparent">
                Minutes, Not Days
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl">
              Automate data cleaning, preprocessing, and customization. Focus on insights 
              while our AI handles the tedious work—reducing errors and saving up to 50% 
              of your preparation time. Completely free to use!
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl" onClick={() => window.location.href = '/clean'}>
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-primary">50%</div>
                <div className="text-sm text-muted-foreground">Time Saved</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-3xl font-bold text-primary">80%</div>
                <div className="text-sm text-muted-foreground">Error Reduction</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-3xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">Datasets Cleaned</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img
              src={heroImage}
              alt="Data cleaning visualization"
              className="relative rounded-2xl shadow-strong w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
