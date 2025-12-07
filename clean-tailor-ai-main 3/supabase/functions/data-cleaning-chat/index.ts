import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, analysisData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing chat request with', messages.length, 'messages');

    // Build system prompt based on analysis data
    const systemPrompt = `You are an expert data cleaning assistant helping a user prepare their dataset for analysis. 

${analysisData ? `
Current Dataset Analysis:
- Total Rows: ${analysisData.totalRows}
- Total Columns: ${analysisData.totalColumns}
- Columns with Nulls: ${analysisData.summary.columnsWithNulls}
- High Null Columns (>10%): ${analysisData.summary.highNullColumns.join(', ') || 'None'}
- Numeric Columns: ${analysisData.summary.numericColumns}
- Categorical Columns: ${analysisData.summary.categoricalColumns}
${analysisData.outliers.length > 0 ? `- Detected Outliers in: ${analysisData.outliers.map((o: any) => `${o.column} (${o.count} values)`).join(', ')}` : ''}

Column Details:
${analysisData.columnsInfo.map((col: any) => `
- ${col.name}: ${col.isNumeric ? 'Numeric' : 'Categorical'}, ${col.nullCount} nulls (${col.nullPercentage}%)${col.statistics ? `, Mean: ${col.statistics.mean}, Range: ${col.statistics.min}-${col.statistics.max}` : ''}`).join('\n')}
` : 'No dataset analyzed yet.'}

Your role is to:
1. Ask about their intended use case (Python, Tableau, Excel, R, etc.)
2. Guide them through handling null values based on their use case
3. Highlight outliers and suggest handling strategies
4. Provide actionable recommendations

Ask one question at a time and be conversational. Start by asking about their tool preference if not mentioned.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    console.log('Generated response, length:', assistantMessage.length);

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in data-cleaning-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
