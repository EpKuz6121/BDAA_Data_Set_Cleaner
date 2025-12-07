import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CodeBlock from "./CodeBlock";

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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);

  const scrollToBottom = (force = false) => {
    if (!messagesEndRef.current || !messagesContainerRef.current) return;
    
    // Only auto-scroll if user is near the bottom or if forced
    const container = messagesContainerRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    
    if (force || isNearBottom) {
      requestAnimationFrame(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  };

  useEffect(() => {
    // Only scroll when new messages are added (not when typing)
    if (messages.length > prevMessagesLengthRef.current) {
      scrollToBottom(true);
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages.length]);

  useEffect(() => {
    // Scroll when loading state changes (new AI response arriving)
    if (!loading && messages.length > 0) {
      scrollToBottom(true);
    }
  }, [loading]);

  useEffect(() => {
    // Initial greeting
    const initialMessage: Message = {
      role: "assistant",
      content: `Hello! I've analyzed your dataset. I can see you have ${analysisData.totalRows} rows and ${analysisData.totalColumns} columns. Let's get your data ready for analysis! 

To start, which tool will you be using with this data? (For example: Python, Tableau, Excel, R, Power BI)`,
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

  const parseMessage = (content: string) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Regex to match code blocks: ```language\ncode\n``` or ```code\n```
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textBefore = content.substring(lastIndex, match.index);
        parts.push(<span key={`text-${lastIndex}`}>{formatText(textBefore)}</span>);
      }
      
      // Add code block
      const language = match[1] || '';
      const code = match[2].trim();
      parts.push(
        <CodeBlock key={`code-${match.index}`} code={code} language={language} />
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      const remainingText = content.substring(lastIndex);
      parts.push(<span key={`text-${lastIndex}`}>{formatText(remainingText)}</span>);
    }
    
    return parts.length > 0 ? parts : [<span key="text">{formatText(content)}</span>];
  };

  const formatText = (text: string) => {
    // Handle inline code: `code`
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const inlineCodeRegex = /`([^`]+)`/g;
    let match;
    
    while ((match = inlineCodeRegex.exec(text)) !== null) {
      // Add text before inline code
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add inline code
      parts.push(
        <code
          key={`inline-${match.index}`}
          className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary"
        >
          {match[1]}
        </code>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
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
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
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
                <div className="whitespace-pre-wrap space-y-2">
                  {parseMessage(message.content)}
                </div>
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
