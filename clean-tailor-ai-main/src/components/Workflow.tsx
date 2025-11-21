import { Card, CardContent } from "@/components/ui/card";
import { Upload, ScanSearch, Wand2, Download } from "lucide-react";
import iconClean from "@/assets/icon-clean.jpg";
import iconAutomate from "@/assets/icon-automate.jpg";
import iconExport from "@/assets/icon-export.jpg";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Data",
    description: "Import datasets from multiple sources or connect directly to your databases.",
    image: iconClean,
  },
  {
    number: "02",
    icon: ScanSearch,
    title: "Review Insights",
    description: "AI automatically detects issues and suggests smart fixes with detailed explanations.",
    image: iconAutomate,
  },
  {
    number: "03",
    icon: Wand2,
    title: "Customize & Preview",
    description: "Adjust cleaning rules and see before/after views in real-time with undo/redo.",
    image: iconClean,
  },
  {
    number: "04",
    icon: Download,
    title: "Export & Automate",
    description: "Download cleaned data and scripts, or schedule automated recurring jobs.",
    image: iconExport,
  },
];

const Workflow = () => {
  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4">
            Simple Workflow, Powerful Results
          </h2>
          <p className="text-lg text-muted-foreground">
            From messy data to analysis-ready datasets in just four steps
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={index}
                className="gradient-card border-border hover:shadow-medium transition-smooth group"
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <span className="text-4xl font-bold text-primary/20 group-hover:text-primary/40 transition-smooth">
                        {step.number}
                      </span>
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted/50">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Workflow;
