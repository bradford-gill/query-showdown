
import React from "react";
import ChatComparison from "@/components/ChatComparison";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="py-6 px-4 border-b bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AI Search Battle: OpenAI vs. Perplexity
          </h1>
          <p className="text-slate-500 mt-2">
            Compare responses from two leading AI search assistants side-by-side
          </p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4">
        <ChatComparison />
      </main>
      
      <footer className="py-6 px-4 border-t mt-auto">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-500">
          <p>
            This tool requires OpenAI and Perplexity API keys. Your keys are stored locally in your browser and never sent to our servers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
