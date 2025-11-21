import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wand2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AbbreviationExpansionProps {
  csvText: string;
  onExpansionComplete: (expandedCsv: string) => void;
}

interface DetectedAbbreviation {
  abbreviation: string;
  context: string;
  suggestedExpansion: string;
  confidence: number;
  column: string;
  occurrences: number;
}

const AbbreviationExpansion = ({ csvText, onExpansionComplete }: AbbreviationExpansionProps) => {
  const [detectedAbbreviations, setDetectedAbbreviations] = useState<DetectedAbbreviation[]>([]);
  const [expandedAbbreviations, setExpandedAbbreviations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  // Common abbreviations database
  const commonAbbreviations = {
    // Business & Finance
    'CEO': 'Chief Executive Officer',
    'CFO': 'Chief Financial Officer',
    'COO': 'Chief Operating Officer',
    'CTO': 'Chief Technology Officer',
    'VP': 'Vice President',
    'GM': 'General Manager',
    'HR': 'Human Resources',
    'IT': 'Information Technology',
    'R&D': 'Research and Development',
    'QA': 'Quality Assurance',
    'PR': 'Public Relations',
    'ROI': 'Return on Investment',
    'KPI': 'Key Performance Indicator',
    'CRM': 'Customer Relationship Management',
    'ERP': 'Enterprise Resource Planning',
    
    // Geographic
    'US': 'United States',
    'UK': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'EU': 'European Union',
    'NYC': 'New York City',
    'LA': 'Los Angeles',
    'SF': 'San Francisco',
    'DC': 'Washington DC',
    
    // Technology
    'AI': 'Artificial Intelligence',
    'ML': 'Machine Learning',
    'API': 'Application Programming Interface',
    'URL': 'Uniform Resource Locator',
    'HTML': 'HyperText Markup Language',
    'CSS': 'Cascading Style Sheets',
    'JS': 'JavaScript',
    'SQL': 'Structured Query Language',
    'JSON': 'JavaScript Object Notation',
    'XML': 'eXtensible Markup Language',
    'PDF': 'Portable Document Format',
    'CSV': 'Comma Separated Values',
    'DB': 'Database',
    'OS': 'Operating System',
    'UI': 'User Interface',
    'UX': 'User Experience',
    
    // Academic & Research
    'PhD': 'Doctor of Philosophy',
    'MD': 'Doctor of Medicine',
    'MBA': 'Master of Business Administration',
    'BS': 'Bachelor of Science',
    'BA': 'Bachelor of Arts',
    'MS': 'Master of Science',
    'MA': 'Master of Arts',
    'MIT': 'Massachusetts Institute of Technology',
    'UCLA': 'University of California Los Angeles',
    
    // Time & Date
    'AM': 'Ante Meridiem',
    'PM': 'Post Meridiem',
    'EST': 'Eastern Standard Time',
    'PST': 'Pacific Standard Time',
    'GMT': 'Greenwich Mean Time',
    'UTC': 'Coordinated Universal Time',
    
    // Medical
    'ICU': 'Intensive Care Unit',
    'ER': 'Emergency Room',
    'MRI': 'Magnetic Resonance Imaging',
    'CT': 'Computed Tomography',
    'EKG': 'Electrocardiogram',
    'BP': 'Blood Pressure',

    
    // Sports
    'NBA': 'National Basketball Association',
    'NFL': 'National Football League',
    'MLB': 'Major League Baseball',
    'NHL': 'National Hockey League',
    'FIFA': 'Fédération Internationale de Football Association',
    'MVP': 'Most Valuable Player',
  };

  const detectAbbreviations = async () => {
    if (!csvText) return;
    
    setAnalyzing(true);
    try {
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const detected: DetectedAbbreviation[] = [];
      
      // Analyze each column
      headers.forEach((header, headerIndex) => {
        const columnData = lines.slice(1).map(line => {
          const values = line.split(',');
          return values[headerIndex]?.trim();
        }).filter(value => value && value.length > 0);
        
        // Check for potential abbreviations
        columnData.forEach(value => {
          // Look for uppercase words that might be abbreviations
          const words = value.split(/\s+/);
          words.forEach(word => {
            if (word.length >= 2 && word.length <= 6 && /^[A-Z]+$/.test(word)) {
              const expansion = commonAbbreviations[word as keyof typeof commonAbbreviations];
              if (expansion) {
                const existing = detected.find(d => d.abbreviation === word && d.column === header);
                if (existing) {
                  existing.occurrences++;
                } else {
                  detected.push({
                    abbreviation: word,
                    context: value,
                    suggestedExpansion: expansion,
                    confidence: 0.9,
                    column: header,
                    occurrences: 1
                  });
                }
              }
            }
          });
        });
      });
      
      // Remove duplicates and sort by confidence
      const uniqueDetected = detected.reduce((acc, current) => {
        const existing = acc.find(item => item.abbreviation === current.abbreviation && item.column === current.column);
        if (existing) {
          existing.occurrences += current.occurrences;
        } else {
          acc.push(current);
        }
        return acc;
      }, [] as DetectedAbbreviation[]);
      
      setDetectedAbbreviations(uniqueDetected.sort((a, b) => b.confidence - a.confidence));
      
      toast({
        title: "Abbreviation Detection Complete",
        description: `Found ${uniqueDetected.length} potential abbreviations to expand.`,
      });
    } catch (error) {
      console.error('Error detecting abbreviations:', error);
      toast({
        title: "Detection Failed",
        description: "Failed to analyze abbreviations in your data.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExpansionChange = (abbreviation: string, expansion: string) => {
    setExpandedAbbreviations(prev => ({
      ...prev,
      [abbreviation]: expansion
    }));
  };

  const applyExpansions = async () => {
    if (Object.keys(expandedAbbreviations).length === 0) {
      toast({
        title: "No Expansions Selected",
        description: "Please select abbreviations to expand.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let expandedCsv = csvText;
      
      // Apply each expansion
      Object.entries(expandedAbbreviations).forEach(([abbreviation, expansion]) => {
        // Use word boundaries to avoid partial matches
        const regex = new RegExp(`\\b${abbreviation}\\b`, 'g');
        expandedCsv = expandedCsv.replace(regex, expansion);
      });
      
      onExpansionComplete(expandedCsv);
      
      toast({
        title: "Expansions Applied",
        description: `Successfully expanded ${Object.keys(expandedAbbreviations).length} abbreviations.`,
      });
    } catch (error) {
      console.error('Error applying expansions:', error);
      toast({
        title: "Expansion Failed",
        description: "Failed to apply abbreviation expansions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="gradient-card border-border shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Abbreviation Expansion
          </CardTitle>
          <CardDescription>
            Detect and expand abbreviations in your dataset for better clarity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={detectAbbreviations} 
              disabled={analyzing || !csvText}
              className="flex-1"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Detect Abbreviations
                </>
              )}
            </Button>
          </div>
          
          {detectedAbbreviations.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Found {detectedAbbreviations.length} abbreviations. Review and select which ones to expand.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {detectedAbbreviations.length > 0 && (
        <Card className="gradient-card border-border shadow-medium">
          <CardHeader>
            <CardTitle>Detected Abbreviations</CardTitle>
            <CardDescription>
              Review the detected abbreviations and customize their expansions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
            {detectedAbbreviations.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.abbreviation}</Badge>
                    <span className="text-sm text-muted-foreground">
                      in column "{item.column}"
                    </span>
                    <Badge variant="secondary">
                      {item.occurrences} occurrence{item.occurrences > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium">
                      {Math.round(item.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <strong>Context:</strong> "{item.context}"
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`expansion-${index}`}>Expansion</Label>
                    <Input
                      id={`expansion-${index}`}
                      value={expandedAbbreviations[item.abbreviation] || item.suggestedExpansion}
                      onChange={(e) => handleExpansionChange(item.abbreviation, e.target.value)}
                      placeholder="Enter full expansion"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExpansionChange(item.abbreviation, item.suggestedExpansion)}
                    >
                      Use Suggested
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {Object.keys(expandedAbbreviations).length > 0 && (
        <Card className="gradient-card border-border shadow-medium">
          <CardHeader>
            <CardTitle>Apply Expansions</CardTitle>
            <CardDescription>
              Apply the selected abbreviation expansions to your dataset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(expandedAbbreviations).map(([abbreviation, expansion]) => (
                  <div key={abbreviation} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="font-medium">{abbreviation}</span>
                    <span className="text-sm text-muted-foreground">→</span>
                    <span className="text-sm">{expansion}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={applyExpansions} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Applying Expansions...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Apply Expansions to Dataset
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AbbreviationExpansion;
