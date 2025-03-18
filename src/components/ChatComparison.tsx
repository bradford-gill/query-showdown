
import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import MessageBubble from "@/components/MessageBubble";
import ApiKeyForm from "@/components/ApiKeyForm";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const ChatComparison = () => {
  const { toast } = useToast();
  const [inputMessage, setInputMessage] = useState("");
  const [openAISession, setOpenAISession] = useState<ChatSession>({
    messages: [],
    isLoading: false,
    error: null,
  });
  const [perplexitySession, setPerplexitySession] = useState<ChatSession>({
    messages: [],
    isLoading: false,
    error: null,
  });
  
  const openAIApiKey = localStorage.getItem("openai_api_key");
  const perplexityApiKey = localStorage.getItem("perplexity_api_key");
  
  const [showApiKeyForm, setShowApiKeyForm] = useState(!openAIApiKey || !perplexityApiKey);
  
  const openAIMessagesEndRef = useRef<HTMLDivElement>(null);
  const perplexityMessagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (openAISession.messages.length > 0) {
      scrollToBottom(openAIMessagesEndRef);
    }
  }, [openAISession.messages]);

  useEffect(() => {
    if (perplexitySession.messages.length > 0) {
      scrollToBottom(perplexityMessagesEndRef);
    }
  }, [perplexitySession.messages]);

  const fetchOpenAIResponse = async (message: string) => {
    setOpenAISession((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAIApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant with internet search capabilities. Provide accurate and up-to-date information."
            },
            ...openAISession.messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to get response from OpenAI");
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;

      setOpenAISession((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { role: "assistant", content: assistantMessage, timestamp: new Date() },
        ],
        isLoading: false,
      }));
    } catch (error) {
      console.error("OpenAI API error:", error);
      setOpenAISession((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to get response from OpenAI",
      }));
      toast({
        title: "OpenAI Error",
        description: error instanceof Error ? error.message : "Failed to get response from OpenAI",
        variant: "destructive",
      });
    }
  };

  const fetchPerplexityResponse = async (message: string) => {
    setPerplexitySession((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${perplexityApiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content: "Be precise and concise. Provide up-to-date information based on search results."
            },
            ...perplexitySession.messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: "user", content: message }
          ],
          temperature: 0.2,
          max_tokens: 800,
          return_images: false,
          return_related_questions: false,
          search_recency_filter: "month",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to get response from Perplexity");
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;

      setPerplexitySession((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { role: "assistant", content: assistantMessage, timestamp: new Date() },
        ],
        isLoading: false,
      }));
    } catch (error) {
      console.error("Perplexity API error:", error);
      setPerplexitySession((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to get response from Perplexity",
      }));
      toast({
        title: "Perplexity Error",
        description: error instanceof Error ? error.message : "Failed to get response from Perplexity",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    if (!openAIApiKey || !perplexityApiKey) {
      setShowApiKeyForm(true);
      toast({
        title: "API Keys Required",
        description: "Please set your OpenAI and Perplexity API keys first",
        variant: "destructive",
      });
      return;
    }
    
    const userMessage = { role: "user" as const, content: inputMessage, timestamp: new Date() };
    
    // Add user message to both sessions
    setOpenAISession((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));
    
    setPerplexitySession((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));
    
    // Fetch responses from both APIs
    await Promise.all([
      fetchOpenAIResponse(inputMessage),
      fetchPerplexityResponse(inputMessage)
    ]);
    
    setInputMessage("");
  };

  if (showApiKeyForm) {
    return (
      <ApiKeyForm 
        onKeysSubmitted={() => setShowApiKeyForm(false)} 
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow overflow-hidden">
        {/* OpenAI Column */}
        <div className="flex flex-col rounded-lg border border-slate-200 bg-white/50 shadow-sm overflow-hidden">
          <div className="p-4 bg-emerald-50 border-b">
            <h2 className="text-lg font-semibold text-emerald-700">OpenAI</h2>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {openAISession.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p>Ask a question to start chatting with OpenAI</p>
              </div>
            ) : (
              <>
                {openAISession.messages.map((message, index) => (
                  <MessageBubble 
                    key={index} 
                    message={message} 
                    provider="openai" 
                  />
                ))}
                {openAISession.isLoading && (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-emerald-100" />
                    <Skeleton className="h-4 w-1/2 bg-emerald-100" />
                    <Skeleton className="h-4 w-2/3 bg-emerald-100" />
                  </div>
                )}
                {openAISession.error && (
                  <div className="p-3 bg-red-50 text-red-500 rounded-lg border border-red-200">
                    {openAISession.error}
                  </div>
                )}
                <div ref={openAIMessagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Perplexity Column */}
        <div className="flex flex-col rounded-lg border border-slate-200 bg-white/50 shadow-sm overflow-hidden">
          <div className="p-4 bg-blue-50 border-b">
            <h2 className="text-lg font-semibold text-blue-700">Perplexity</h2>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {perplexitySession.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p>Ask a question to start chatting with Perplexity</p>
              </div>
            ) : (
              <>
                {perplexitySession.messages.map((message, index) => (
                  <MessageBubble 
                    key={index} 
                    message={message} 
                    provider="perplexity" 
                  />
                ))}
                {perplexitySession.isLoading && (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-blue-100" />
                    <Skeleton className="h-4 w-1/2 bg-blue-100" />
                    <Skeleton className="h-4 w-2/3 bg-blue-100" />
                  </div>
                )}
                {perplexitySession.error && (
                  <div className="p-3 bg-red-50 text-red-500 rounded-lg border border-red-200">
                    {perplexitySession.error}
                  </div>
                )}
                <div ref={perplexityMessagesEndRef} />
              </>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask both AI assistants a question..."
          className="flex-grow"
        />
        <Button type="submit" disabled={openAISession.isLoading || perplexitySession.isLoading}>
          <Send className="h-4 w-4 mr-2" />
          Send
        </Button>
      </form>
    </div>
  );
};

export default ChatComparison;
