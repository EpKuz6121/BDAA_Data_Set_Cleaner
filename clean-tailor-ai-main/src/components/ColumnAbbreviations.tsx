import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertCircle, ChevronDown, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ColumnAbbreviationsProps {
  csvText: string;
  onExpansionComplete?: (expandedCsv: string) => void;
}

interface AbbreviationInfo {
  abbreviation: string;
  suggestedExpansion: string;
  occurrences: number;
  examples: string[];
  confidence: number;
}

interface ColumnWithAbbreviations {
  columnName: string;
  abbreviations: AbbreviationInfo[];
  totalAbbreviationCount: number;
}

const ColumnAbbreviations = ({ csvText, onExpansionComplete }: ColumnAbbreviationsProps) => {
  const [columnsWithAbbreviations, setColumnsWithAbbreviations] = useState<ColumnWithAbbreviations[]>([]);
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set());
  const [expandedAbbreviations, setExpandedAbbreviations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();
  const previousCsvRef = useRef<string>("");

  // Comprehensive abbreviations database
  const commonAbbreviations: Record<string, string> = {
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
    'SaaS': 'Software as a Service',
    'B2B': 'Business to Business',
    'B2C': 'Business to Consumer',
    
    // Geographic
    'US': 'United States',
    'USA': 'United States of America',
    'UK': 'United Kingdom',
    'CA': 'California',
    'NY': 'New York',
    'TX': 'Texas',
    'FL': 'Florida',
    'IL': 'Illinois',
    'PA': 'Pennsylvania',
    'AZ': 'Arizona',
    'NC': 'North Carolina',
    'GA': 'Georgia',
    'MI': 'Michigan',
    'WA': 'Washington',
    'AU': 'Australia',
    'EU': 'European Union',
    'NYC': 'New York City',
    'LA': 'Los Angeles',
    'SF': 'San Francisco',
    'DC': 'Washington DC',
    'CHI': 'Chicago',
    'PHX': 'Phoenix',
    'PHL': 'Philadelphia',
    'HOU': 'Houston',
    'DAL': 'Dallas',
    
    // Technology
    'AI': 'Artificial Intelligence',
    'ML': 'Machine Learning',
    'DL': 'Deep Learning',
    'NLP': 'Natural Language Processing',
    'API': 'Application Programming Interface',
    'REST': 'Representational State Transfer',
    'URL': 'Uniform Resource Locator',
    'HTML': 'HyperText Markup Language',
    'CSS': 'Cascading Style Sheets',
    'JS': 'JavaScript',
    'TS': 'TypeScript',
    'SQL': 'Structured Query Language',
    'JSON': 'JavaScript Object Notation',
    'XML': 'eXtensible Markup Language',
    'PDF': 'Portable Document Format',
    'CSV': 'Comma Separated Values',
    'DB': 'Database',
    'OS': 'Operating System',
    'UI': 'User Interface',
    'UX': 'User Experience',
    'IDE': 'Integrated Development Environment',
    'SDK': 'Software Development Kit',
    'CLI': 'Command Line Interface',
    'GUI': 'Graphical User Interface',
    
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
    'UCSD': 'University of California San Diego',
    'NYU': 'New York University',
    
    // Time & Date
    'AM': 'Ante Meridiem',
    'PM': 'Post Meridiem',
    'EST': 'Eastern Standard Time',
    'PST': 'Pacific Standard Time',
    'CST': 'Central Standard Time',
    'MST': 'Mountain Standard Time',
    'GMT': 'Greenwich Mean Time',
    'UTC': 'Coordinated Universal Time',
    
    // Medical
    'ICU': 'Intensive Care Unit',
    'ER': 'Emergency Room',
    'MRI': 'Magnetic Resonance Imaging',
    'CT': 'Computed Tomography',
    'EKG': 'Electrocardiogram',
    'ECG': 'Electrocardiogram',
    'BP': 'Blood Pressure',
    'HR': 'Heart Rate',
    'BMI': 'Body Mass Index',
    'ADHD': 'Attention Deficit Hyperactivity Disorder',
    'HIV': 'Human Immunodeficiency Virus',
    'AIDS': 'Acquired Immunodeficiency Syndrome',
    
    // Sports
    'NBA': 'National Basketball Association',
    'NFL': 'National Football League',
    'MLB': 'Major League Baseball',
    'NHL': 'National Hockey League',
    'FIFA': 'Fédération Internationale de Football Association',
    'MVP': 'Most Valuable Player',
    
    // General
    'ID': 'Identifier',
    'MAX': 'Maximum',
    'MIN': 'Minimum',
    'AVG': 'Average',
    'SUM': 'Summation',
    'QTY': 'Quantity',
    'AMT': 'Amount',
    'EST': 'Estimate',
    'TBD': 'To Be Determined',
    'TBA': 'To Be Announced',
    'ASAP': 'As Soon As Possible',
    'FYI': 'For Your Information',
    'FAQ': 'Frequently Asked Questions',
    'ETA': 'Estimated Time of Arrival',
    'RSVP': 'Répondez S\'il Vous Plaît',
  };

  // Improved CSV parsing that handles quoted values
  const parseCSV = (text: string): { headers: string[], rows: string[][] } => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };
    
    const parseCSVLine = (line: string): string[] => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        const nextChar = line[j + 1];
        
        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            current += '"';
            j++; // Skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    };
    
    const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, ''));
    
    const rows: string[][] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      // Ensure we have the same number of columns as headers
      while (values.length < headers.length) {
        values.push('');
      }
      rows.push(values.slice(0, headers.length));
    }
    
    return { headers, rows };
  };

  // Check if a word is likely an abbreviation
  const isLikelyAbbreviation = (word: string, columnValues: string[]): boolean => {
    // Must be 2-6 characters, all uppercase letters (no numbers or special chars)
    if (!/^[A-Z]{2,6}$/.test(word)) return false;
    
    // Skip common words that are short but not abbreviations
    const commonShortWords = ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW', 'ITS', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WAY', 'WHO', 'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE'];
    if (commonShortWords.includes(word)) return false;
    
    // Check if it's in our database - high confidence
    if (commonAbbreviations[word]) return true;
    
    // Additional heuristic: if most values in column are lowercase/mixed but this is uppercase
    const lowerCaseCount = columnValues.filter(v => {
      const trimmed = v.trim();
      return trimmed.length > 0 && /^[a-z]/.test(trimmed);
    }).length;
    
    const upperCaseCount = columnValues.filter(v => {
      const trimmed = v.trim();
      return trimmed.length > 0 && /^[A-Z]/.test(trimmed);
    }).length;
    
    const mixedCaseCount = columnValues.filter(v => {
      const trimmed = v.trim();
      return trimmed.length > 0 && /^[A-Z]/.test(trimmed) && trimmed.toLowerCase() !== trimmed;
    }).length;
    
    // If column is mostly lowercase but this is uppercase, likely abbreviation
    if (lowerCaseCount > upperCaseCount * 2 && upperCaseCount > 0 && mixedCaseCount === 0) {
      return true;
    }
    
    return false;
  };

  // Detect abbreviations in columns
  const detectAbbreviationsInColumns = () => {
    if (!csvText || csvText.trim().length === 0) return;
    
    setAnalyzing(true);
    try {
      const { headers, rows } = parseCSV(csvText);
      const columnData: Record<string, string[]> = {};
      const abbreviationsByColumn: Record<string, Map<string, AbbreviationInfo>> = {};
      
      // Extract data for each column
      headers.forEach((header, index) => {
        columnData[header] = rows.map(row => row[index] || '').filter(v => v.trim().length > 0);
        abbreviationsByColumn[header] = new Map();
      });
      
      // Analyze each column
      headers.forEach(header => {
        const values = columnData[header];
        
        values.forEach(value => {
          // Split by whitespace and punctuation
          const words = value.split(/\s+|[-_]/).filter(w => w.trim().length > 0);
          
          words.forEach(word => {
            const cleanWord = word.replace(/[.,;:!?()]/g, '').trim();
            
            if (isLikelyAbbreviation(cleanWord, values)) {
              const expansion = commonAbbreviations[cleanWord] || `[${cleanWord}]`;
              const existing = abbreviationsByColumn[header].get(cleanWord);
              
              if (existing) {
                existing.occurrences++;
                if (existing.examples.length < 3 && !existing.examples.includes(value)) {
                  existing.examples.push(value);
                }
              } else {
                abbreviationsByColumn[header].set(cleanWord, {
                  abbreviation: cleanWord,
                  suggestedExpansion: expansion,
                  occurrences: 1,
                  examples: [value],
                  confidence: commonAbbreviations[cleanWord] ? 0.9 : 0.7
                });
              }
            }
          });
        });
      });
      
      // Convert to array format and filter columns with abbreviations
      const result: ColumnWithAbbreviations[] = headers
        .map(header => ({
          columnName: header,
          abbreviations: Array.from(abbreviationsByColumn[header].values()),
          totalAbbreviationCount: abbreviationsByColumn[header].size
        }))
        .filter(col => col.abbreviations.length > 0)
        .sort((a, b) => b.totalAbbreviationCount - a.totalAbbreviationCount);
      
      setColumnsWithAbbreviations(result);
      
      if (result.length > 0) {
        toast({
          title: "Abbreviations Detected",
          description: `Found abbreviations in ${result.length} column(s). Click to view details.`,
        });
      } else {
        toast({
          title: "No Abbreviations Found",
          description: "No abbreviations detected in your dataset.",
        });
      }
    } catch (error) {
      console.error('Error detecting abbreviations:', error);
      toast({
        title: "Detection Failed",
        description: "Failed to analyze abbreviations. Please check your CSV format.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Auto-detect when CSV text changes
  useEffect(() => {
    if (csvText && csvText.trim().length > 0 && csvText !== previousCsvRef.current) {
      previousCsvRef.current = csvText;
      
      // Small delay to avoid triggering on every keystroke
      const timer = setTimeout(() => {
        detectAbbreviationsInColumns();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [csvText]);

  const toggleColumn = (columnName: string) => {
    setExpandedColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnName)) {
        newSet.delete(columnName);
      } else {
        newSet.add(columnName);
      }
      return newSet;
    });
  };

  const handleExpansionChange = (abbreviation: string, expansion: string) => {
    setExpandedAbbreviations(prev => ({
      ...prev,
      [abbreviation]: expansion
    }));
  };

  const applyExpansions = () => {
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
      
      // Apply each expansion with word boundaries
      Object.entries(expandedAbbreviations).forEach(([abbreviation, expansion]) => {
        const regex = new RegExp(`\\b${abbreviation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        expandedCsv = expandedCsv.replace(regex, expansion);
      });
      
      if (onExpansionComplete) {
        onExpansionComplete(expandedCsv);
      }
      
      toast({
        title: "Expansions Applied",
        description: `Successfully expanded ${Object.keys(expandedAbbreviations).length} abbreviation(s).`,
      });
      
      // Clear expansions after applying
      setExpandedAbbreviations({});
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

  // Only show if we have CSV text
  if (!csvText || csvText.trim().length === 0) {
    return null;
  }

  return (
    <Card className="gradient-card border-border shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Columns with Abbreviations
        </CardTitle>
        <CardDescription>
          Click on a column to see detected abbreviations and their expansions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {analyzing && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
            <span className="text-sm text-muted-foreground">Analyzing columns...</span>
          </div>
        )}
        
        {!analyzing && columnsWithAbbreviations.length === 0 && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              No abbreviations detected in your dataset columns.
            </AlertDescription>
          </Alert>
        )}
        
        {!analyzing && columnsWithAbbreviations.map((column, colIndex) => {
          const isExpanded = expandedColumns.has(column.columnName);
          
          return (
            <Collapsible
              key={colIndex}
              open={isExpanded}
              onOpenChange={() => toggleColumn(column.columnName)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between p-4 h-auto"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-semibold">{column.columnName}</span>
                    <Badge variant="secondary">
                      {column.totalAbbreviationCount} abbreviation{column.totalAbbreviationCount !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-2">
                <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                  {column.abbreviations.map((abbrev, abbrevIndex) => (
                    <div key={abbrevIndex} className="p-3 border rounded-lg bg-background space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-base">
                            {abbrev.abbreviation}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {abbrev.occurrences} occurrence{abbrev.occurrences !== 1 ? 's' : ''}
                          </span>
                          {abbrev.confidence >= 0.9 && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {abbrev.examples.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <strong>Examples:</strong> {abbrev.examples.join(', ')}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="md:col-span-2">
                          <Label htmlFor={`exp-${colIndex}-${abbrevIndex}`} className="text-xs">
                            Expansion
                          </Label>
                          <Input
                            id={`exp-${colIndex}-${abbrevIndex}`}
                            value={expandedAbbreviations[abbrev.abbreviation] || abbrev.suggestedExpansion}
                            onChange={(e) => handleExpansionChange(abbrev.abbreviation, e.target.value)}
                            placeholder="Enter full expansion"
                            className="h-9"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExpansionChange(abbrev.abbreviation, abbrev.suggestedExpansion)}
                            className="w-full h-9"
                          >
                            Reset
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
        
        {!analyzing && Object.keys(expandedAbbreviations).length > 0 && (
          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Ready to expand {Object.keys(expandedAbbreviations).length} abbreviation(s)
              </span>
              <Button
                onClick={applyExpansions}
                disabled={loading}
                size="sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    Applying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-2" />
                    Apply Expansions
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ColumnAbbreviations;
