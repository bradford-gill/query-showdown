
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LockKeyhole } from "lucide-react";

interface ApiKeyFormProps {
  onKeysSubmitted: () => void;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onKeysSubmitted }) => {
  const { toast } = useToast();
  const [openAIKey, setOpenAIKey] = useState(localStorage.getItem("openai_api_key") || "");
  const [perplexityKey, setPerplexityKey] = useState(localStorage.getItem("perplexity_api_key") || "");
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!openAIKey.trim() || !perplexityKey.trim()) {
      toast({
        title: "Missing API Keys",
        description: "Please enter both API keys",
        variant: "destructive",
      });
      return;
    }
    
    setIsValidating(true);
    
    try {
      // Store the API keys in localStorage
      localStorage.setItem("openai_api_key", openAIKey);
      localStorage.setItem("perplexity_api_key", perplexityKey);
      
      toast({
        title: "API Keys Saved",
        description: "Your API keys have been saved",
      });
      
      onKeysSubmitted();
    } catch (error) {
      console.error("Error saving API keys:", error);
      toast({
        title: "Error",
        description: "Failed to save API keys",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-6rem)]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">API Keys</CardTitle>
          <CardDescription className="text-center">
            Enter your API keys to use the AI Comparison tool
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="openai-key" className="text-sm font-medium">
                OpenAI API Key
              </label>
              <div className="relative">
                <Input
                  id="openai-key"
                  type="password"
                  value={openAIKey}
                  onChange={(e) => setOpenAIKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-10"
                />
                <LockKeyhole className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-muted-foreground">
                Get your key from{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 text-primary"
                >
                  OpenAI dashboard
                </a>
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="perplexity-key" className="text-sm font-medium">
                Perplexity API Key
              </label>
              <div className="relative">
                <Input
                  id="perplexity-key"
                  type="password"
                  value={perplexityKey}
                  onChange={(e) => setPerplexityKey(e.target.value)}
                  placeholder="pplx-..."
                  className="pr-10"
                />
                <LockKeyhole className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-muted-foreground">
                Get your key from{" "}
                <a
                  href="https://perplexity.ai/settings/api"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 text-primary"
                >
                  Perplexity dashboard
                </a>
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isValidating}
            >
              {isValidating ? "Validating..." : "Save API Keys"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ApiKeyForm;
