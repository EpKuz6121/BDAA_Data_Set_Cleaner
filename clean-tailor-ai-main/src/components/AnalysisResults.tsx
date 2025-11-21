import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";

interface AnalysisResultsProps {
  analysisData: any;
}

const AnalysisResults = ({ analysisData }: AnalysisResultsProps) => {
  if (!analysisData) return null;

  return (
    <div className="space-y-6">
      <Card className="gradient-card border-border shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Dataset Overview
          </CardTitle>
          <CardDescription>Quick statistics about your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Rows</p>
              <p className="text-2xl font-bold text-primary">{analysisData.totalRows}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Columns</p>
              <p className="text-2xl font-bold text-primary">{analysisData.totalColumns}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Numeric</p>
              <p className="text-2xl font-bold text-success">{analysisData.summary.numericColumns}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Categorical</p>
              <p className="text-2xl font-bold text-secondary">{analysisData.summary.categoricalColumns}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="gradient-card border-border shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Data Quality Issues
          </CardTitle>
          <CardDescription>Columns requiring attention</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysisData.summary.highNullColumns.length > 0 ? (
            <div>
              <p className="text-sm font-medium mb-2">High Null Columns (&gt;10%)</p>
              <div className="flex flex-wrap gap-2">
                {analysisData.summary.highNullColumns.map((col: string, index: number) => (
                  <Badge key={index} variant="destructive">
                    {col}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm">No high null columns detected</p>
            </div>
          )}
        </CardContent>
      </Card>

      {analysisData.outliers.length > 0 && (
        <Card className="gradient-card border-border shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-warning" />
              Detected Outliers
            </CardTitle>
            <CardDescription>Columns with statistical outliers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysisData.outliers.map((outlier: any, index: number) => (
              <div key={index} className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium">{outlier.column}</p>
                  <Badge variant="outline">{outlier.count} values</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {outlier.percentage}% outside range [{outlier.lowerBound}, {outlier.upperBound}]
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="gradient-card border-border shadow-medium">
        <CardHeader>
          <CardTitle>Column Details</CardTitle>
          <CardDescription>Detailed information per column</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
          {analysisData.columnsInfo.map((col: any, index: number) => (
            <div key={index} className="p-3 rounded-lg bg-muted/50 text-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium">{col.name}</p>
                <Badge variant={col.isNumeric ? "default" : "secondary"}>
                  {col.isNumeric ? "Numeric" : "Categorical"}
                </Badge>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Nulls: {col.nullCount} ({col.nullPercentage}%)</span>
                {col.statistics && (
                  <span>Range: {col.statistics.min} - {col.statistics.max}</span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisResults;
