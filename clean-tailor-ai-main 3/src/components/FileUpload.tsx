import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadProps {
  onUploadComplete: (datasetId: string, analysisData: any, csvText: string) => void;
}

const FileUpload = ({ onUploadComplete }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      console.log('Reading CSV file:', file.name);

      // Read CSV file
      const csvText = await file.text();
      console.log('CSV content read, length:', csvText.length);

      // Upload to storage
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('datasets')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded to storage');

      // Create dataset record
      const { data: dataset, error: datasetError } = await supabase
        .from('datasets')
        .insert({
          file_name: file.name,
          file_size: file.size,
          storage_path: fileName,
        })
        .select()
        .single();

      if (datasetError) {
        console.error('Dataset creation error:', datasetError);
        throw datasetError;
      }

      console.log('Dataset record created:', dataset.id);
      setUploading(false);
      setAnalyzing(true);

      // Analyze data
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-data',
        {
          body: { csvText, datasetId: dataset.id },
        }
      );

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        throw analysisError;
      }

      console.log('Analysis complete:', analysisData);

      const qualityScore = analysisData.summary.dataQualityScore;
      const scoreEmoji = qualityScore >= 80 ? '✨' : qualityScore >= 60 ? '⚡' : '⚠️';

      toast({
        title: `${scoreEmoji} Analysis Complete!`,
        description: `Data Quality Score: ${qualityScore}%. Found ${analysisData.summary.columnsWithNulls} columns with missing values.`,
      });

      onUploadComplete(dataset.id, analysisData, csvText);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <section className="py-20 lg:py-32 gradient-hero">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Upload Your Dataset
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload a CSV file to get started with AI-powered data cleaning
            </p>
          </div>

          <Card className="gradient-card border-border shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Choose CSV File
              </CardTitle>
              <CardDescription>
                Upload your dataset and we'll analyze it automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-smooth">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={uploading || analyzing}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  {uploading || analyzing ? (
                    <>
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                      <div className="space-y-2">
                        <p className="text-lg font-medium">
                          {uploading ? "Uploading..." : "Analyzing your data..."}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {uploading ? "Please wait while we upload your file" : "Detecting null values, outliers, and patterns"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-primary" />
                      <div className="space-y-2">
                        <p className="text-lg font-medium">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-muted-foreground">
                          CSV files only (Max 10MB)
                        </p>
                      </div>
                      <Button variant="hero" size="lg" type="button">
                        Select File
                      </Button>
                    </>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FileUpload;
