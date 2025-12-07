import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { csvText, datasetId } = await req.json();
    
    if (!csvText) {
      throw new Error('No CSV text provided');
    }

    console.log('Analyzing CSV data, length:', csvText.length);

    // Parse CSV more efficiently with streaming approach
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    const headers = lines[0].split(',').map((h: string) => h.trim().replace(/^["']|["']$/g, ''));
    const totalRows = lines.length - 1;
    
    console.log(`Starting analysis: ${totalRows} rows, ${headers.length} columns`);

    // Sample data for large datasets to avoid memory issues
    const maxSampleSize = 10000;
    const sampleRate = totalRows > maxSampleSize ? maxSampleSize / totalRows : 1;
    const shouldSample = totalRows > maxSampleSize;

    // Analyze columns efficiently
    const columnsInfo: any[] = [];
    const outliers: any[] = [];

    for (const header of headers) {
      console.log(`Analyzing column: ${header}`);
      
      const values: (string | null)[] = [];
      let nullCount = 0;
      let numericCount = 0;
      const numericValues: number[] = [];
      const uniqueValues = new Set<string>();

      // Process rows in batches
      for (let i = 1; i < lines.length; i++) {
        // Sample if needed
        if (shouldSample && Math.random() > sampleRate) continue;

        const rowValues = lines[i].split(',').map((v: string) => v.trim().replace(/^["']|["']$/g, ''));
        const colIndex = headers.indexOf(header);
        const value = rowValues[colIndex] || null;

        values.push(value);

        if (!value || value === '' || value === 'null') {
          nullCount++;
        } else {
          uniqueValues.add(value);
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            numericCount++;
            numericValues.push(numValue);
          }
        }
      }

      const sampleSize = values.length;
      const nullPercentage = (nullCount / sampleSize) * 100;
      const isNumeric = numericCount > sampleSize * 0.5;

      const columnInfo: any = {
        name: header,
        totalValues: totalRows,
        sampleSize: shouldSample ? sampleSize : totalRows,
        nullCount: shouldSample ? Math.round((nullCount / sampleSize) * totalRows) : nullCount,
        nullPercentage: Math.round(nullPercentage * 100) / 100,
        isNumeric,
      };

      // Calculate statistics for numeric columns
      if (isNumeric && numericValues.length > 0) {
        const sorted = [...numericValues].sort((a: number, b: number) => a - b);
        const mean = numericValues.reduce((a: number, b: number) => a + b, 0) / numericValues.length;
        const median = sorted[Math.floor(sorted.length / 2)];
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;

        columnInfo.statistics = {
          mean: Math.round(mean * 100) / 100,
          median,
          min: sorted[0],
          max: sorted[sorted.length - 1],
          q1,
          q3,
          iqr: Math.round(iqr * 100) / 100,
        };

        // Detect outliers
        const columnOutliers = numericValues.filter((v: number) => v < lowerBound || v > upperBound);
        if (columnOutliers.length > 0) {
          outliers.push({
            column: header,
            count: shouldSample ? Math.round((columnOutliers.length / numericValues.length) * totalRows) : columnOutliers.length,
            percentage: Math.round((columnOutliers.length / numericValues.length) * 100 * 100) / 100,
            lowerBound: Math.round(lowerBound * 100) / 100,
            upperBound: Math.round(upperBound * 100) / 100,
          });
        }
      } else {
        // For categorical columns
        columnInfo.uniqueCount = uniqueValues.size;
        columnInfo.cardinality = Math.round((uniqueValues.size / sampleSize) * 100 * 100) / 100;
      }

      columnsInfo.push(columnInfo);
    }

    const analysisResults = {
      totalRows,
      totalColumns: headers.length,
      columnsInfo,
      outliers,
      sampled: shouldSample,
      sampleSize: shouldSample ? maxSampleSize : totalRows,
      summary: {
        columnsWithNulls: columnsInfo.filter((c: any) => c.nullCount > 0).length,
        highNullColumns: columnsInfo.filter((c: any) => c.nullPercentage > 10).map((c: any) => c.name),
        numericColumns: columnsInfo.filter((c: any) => c.isNumeric).length,
        categoricalColumns: columnsInfo.filter((c: any) => !c.isNumeric).length,
        totalNullValues: columnsInfo.reduce((sum: number, c: any) => sum + c.nullCount, 0),
        dataQualityScore: Math.round((1 - (columnsInfo.reduce((sum: number, c: any) => sum + c.nullPercentage, 0) / (columnsInfo.length * 100))) * 100),
      }
    };

    console.log('Analysis complete:', analysisResults.summary);

    // Update dataset with analysis results
    if (datasetId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { error: updateError } = await supabase
        .from('datasets')
        .update({
          columns_info: columnsInfo,
          analysis_results: analysisResults,
        })
        .eq('id', datasetId);

      if (updateError) {
        console.error('Error updating dataset:', updateError);
      } else {
        console.log('Dataset updated successfully');
      }
    }

    return new Response(JSON.stringify(analysisResults), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-data function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
