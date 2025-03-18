
import React from "react";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
  provider: "openai" | "perplexity";
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, provider }) => {
  const isUser = message.role === "user";
  
  const bubbleStyles = cn(
    "p-3 rounded-lg max-w-full overflow-hidden break-words",
    isUser
      ? "bg-gray-100 text-gray-900 ml-auto"
      : cn(
          "text-white",
          provider === "openai" 
            ? "bg-emerald-600" 
            : "bg-blue-600"
        )
  );

  const iconContainerStyles = cn(
    "flex items-center justify-center w-8 h-8 rounded-full mr-2",
    isUser
      ? "bg-gray-200 text-gray-700"
      : cn(
          provider === "openai" 
            ? "bg-emerald-100 text-emerald-700" 
            : "bg-blue-100 text-blue-700"
        )
  );

  return (
    <div className={cn("flex items-start", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className={iconContainerStyles}>
          <Bot size={16} />
        </div>
      )}
      
      <div className="max-w-[85%]">
        <div className={bubbleStyles}>
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {format(new Date(message.timestamp), "h:mm a")}
        </div>
      </div>
      
      {isUser && (
        <div className={iconContainerStyles}>
          <User size={16} />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
