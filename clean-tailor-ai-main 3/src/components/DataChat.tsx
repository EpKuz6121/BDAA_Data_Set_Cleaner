import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface DataChatProps {
  datasetId: string;
  analysisData: any;
  csvText: string;
}

const DataChat = ({ datasetId, analysisData, csvText }: DataChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial greeting with more context
    const qualityScore = analysisData.summary.dataQualityScore;
    const scoreEmoji = qualityScore >= 80 ? '✨' : qualityScore >= 60 ? '⚡' : '⚠️';
    
    const issuesSummary = [];
    if (analysisData.summary.highNullColumns.length > 0) {
      issuesSummary.push(`${analysisData.summary.highNullColumns.length} columns with high missing values`);
    }
    if (analysisData.outliers.length > 0) {
      issuesSummary.push(`${analysisData.outliers.length} columns with outliers`);
    }

    const issuesText = issuesSummary.length > 0 
      ? `\n\nI've detected: ${issuesSummary.join(', ')}.`
      : '\n\nYour data looks clean! Great job! 🎉';

    const initialMessage: Message = {
      role: "assistant",
      content: `${scoreEmoji} Hello! I've analyzed your dataset:

📊 **Dataset Overview:**
- ${analysisData.totalRows.toLocaleString()} rows
- ${analysisData.totalColumns} columns
- Data Quality Score: ${qualityScore}%${issuesText}

🛠️ **Let's get started!** 

To give you the best cleaning recommendations, which tool will you be using with this data? 
(For example: Python, Tableau, Excel, R, Power BI, or something else)`,
    };
    setMessages([initialMessage]);
  }, [analysisData]);

  const sendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: Message = { role: "user", content: inputValue };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setLoading(true);

    try {
      // Save user message to database
      await supabase.from('chat_messages').insert({
        dataset_id: datasetId,
        role: 'user',
        content: inputValue,
      });

      // Get AI response
      const { data, error } = await supabase.functions.invoke('data-cleaning-chat', {
        body: {
          messages: updatedMessages,
          analysisData,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };

      setMessages([...updatedMessages, assistantMessage]);

      // Save assistant message to database
      await supabase.from('chat_messages').insert({
        dataset_id: datasetId,
        role: 'assistant',
        content: data.message,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="gradient-card border-border shadow-medium h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Data Cleaning Assistant
        </CardTitle>
        <CardDescription>
          Chat with AI to configure your data cleaning preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={loading}
          />
          <Button onClick={sendMessage} disabled={loading || !inputValue.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataChat;
