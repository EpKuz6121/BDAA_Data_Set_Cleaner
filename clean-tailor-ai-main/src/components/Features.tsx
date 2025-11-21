import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Zap, FileOutput, BarChart3, Shield, Clock } from "lucide-react";

const features = [
  {
    icon: Database,
    title: "Multi-Format Support",
    description: "Import from CSV, Excel, JSON, Parquet, and connect directly to your databases.",
  },
  {
    icon: Zap,
    title: "AI-Powered Cleaning",
    description: "Automatically detect and fix missing values, outliers, and formatting issues.",
  },
  {
    icon: FileOutput,
    title: "Smart Export",
    description: "Export cleaned data and reproducible scripts for your entire workflow.",
  },
  {
    icon: BarChart3,
    title: "Visual Preview",
    description: "Interactive before/after views with undo/redo for every transformation.",
  },
  {
    icon: Clock,
    title: "Automated Pipelines",
    description: "Schedule recurring jobs and create reliable, low-maintenance workflows.",
  },
  {
    icon: Shield,
    title: "Data Security",
    description: "Encrypted storage with full audit trails and compliance-ready processes.",
  },
];

const Features = () => {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4">
            Everything You Need for Data Excellence
          </h2>
          <p className="text-lg text-muted-foreground">
            Comprehensive tools designed for data scientists who demand precision and efficiency
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="gradient-card border-border hover:shadow-medium transition-smooth"
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
