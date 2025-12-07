import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, FileText, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AnalysisResultsProps {
  analysisData: any;
}

const AnalysisResults = ({ analysisData }: AnalysisResultsProps) => {
  if (!analysisData) return null;

  const qualityScore = analysisData.summary.dataQualityScore;
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-4">
      <Card className="gradient-card border-border shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Data Quality Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-4xl font-bold ${getScoreColor(qualityScore)}`}>
              {qualityScore}%
            </span>
            <Badge variant={qualityScore >= 80 ? "default" : qualityScore >= 60 ? "secondary" : "destructive"}>
              {qualityScore >= 80 ? "Excellent" : qualityScore >= 60 ? "Good" : "Needs Work"}
            </Badge>
          </div>
          <Progress value={qualityScore} className="h-3" />
          <p className="text-sm text-muted-foreground">
            {qualityScore >= 80 
              ? "Your data is in great shape! Minimal cleaning needed."
              : qualityScore >= 60
              ? "Some data quality issues detected. Let's clean them up."
              : "Significant data quality issues found. Let's work on improving it."}
          </p>
        </CardContent>
      </Card>

      <Card className="gradient-card border-border shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Dataset Overview
          </CardTitle>
          {analysisData.sampled && (
            <CardDescription>
              <Badge variant="outline">Analyzed {analysisData.sampleSize.toLocaleString()} sample rows</Badge>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Rows:</span>
            <span className="font-medium">{analysisData.totalRows.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Columns:</span>
            <span className="font-medium">{analysisData.totalColumns}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Numeric Columns:</span>
            <span className="font-medium">{analysisData.summary.numericColumns}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Categorical Columns:</span>
            <span className="font-medium">{analysisData.summary.categoricalColumns}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Missing Values:</span>
            <span className="font-medium text-orange-500">{analysisData.summary.totalNullValues.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="gradient-card border-border shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Data Quality Issues
          </CardTitle>
          <CardDescription>
            {analysisData.summary.columnsWithNulls} columns have missing values
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysisData.summary.highNullColumns.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Critical: High Missing Values (&gt;10%)</p>
                <Badge variant="destructive">{analysisData.summary.highNullColumns.length}</Badge>
              </div>
              <div className="space-y-1">
                {analysisData.summary.highNullColumns.map((col: string) => {
                  const colInfo = analysisData.columnsInfo.find((c: any) => c.name === col);
                  return (
                    <div key={col} className="text-sm bg-muted/50 p-2 rounded flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                        {col}
                      </span>
                      <span className="text-muted-foreground">{colInfo?.nullPercentage}% missing</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {analysisData.outliers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Outliers Detected</p>
                <Badge variant="secondary">{analysisData.outliers.length} columns</Badge>
              </div>
              <div className="space-y-1">
                {analysisData.outliers.map((outlier: any) => (
                  <div key={outlier.column} className="text-sm bg-muted/50 p-2 rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{outlier.column}</span>
                      <span className="text-muted-foreground">{outlier.count.toLocaleString()} values</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {outlier.percentage}% outside [{outlier.lowerBound}, {outlier.upperBound}]
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisData.summary.highNullColumns.length === 0 && analysisData.outliers.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              No major data quality issues detected! Your data looks clean.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="gradient-card border-border shadow-medium">
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            Column Details
            <Badge variant="outline">{analysisData.columnsInfo.length} columns</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {analysisData.columnsInfo.map((col: any) => (
              <div key={col.name} className="border border-border rounded-lg p-3 bg-muted/30">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-sm">{col.name}</p>
                  <Badge variant={col.isNumeric ? "default" : "secondary"} className="text-xs">
                    {col.isNumeric ? "Numeric" : "Categorical"}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between items-center">
                    <span>Missing Values:</span>
                    <span className={col.nullPercentage > 10 ? "text-orange-500 font-medium" : ""}>
                      {col.nullCount.toLocaleString()} ({col.nullPercentage}%)
                    </span>
                  </div>
                  {col.isNumeric && col.statistics && (
                    <>
                      <div className="flex justify-between">
                        <span>Mean:</span>
                        <span className="font-mono">{col.statistics.mean.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Median:</span>
                        <span className="font-mono">{col.statistics.median.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Range:</span>
                        <span className="font-mono">{col.statistics.min} - {col.statistics.max}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Std Dev (IQR):</span>
                        <span className="font-mono">{col.statistics.iqr.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  {!col.isNumeric && (
                    <>
                      <div className="flex justify-between">
                        <span>Unique Values:</span>
                        <span className="font-mono">{col.uniqueCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cardinality:</span>
                        <span className="font-mono">{col.cardinality}%</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisResults;
