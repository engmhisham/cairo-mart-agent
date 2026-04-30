"use client";

import type { Message } from "ai";
import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { Loader2 } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  sources: Record<string, { id: string; content: string; type: string; similarity: number }[]>;
}

/** Scrollable list of chat messages */
export function MessageList({ messages, isLoading, sources }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isLast={index === messages.length - 1}
          isLoading={isLoading}
          sources={message.role === "assistant" ? sources[message.id] : undefined}
        />
      ))}

      {/* Typing indicator */}
      {isLoading &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && (
          <div className="flex gap-3 animate-in fade-in duration-300">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

      <div ref={bottomRef} />
    </div>
  );
}
