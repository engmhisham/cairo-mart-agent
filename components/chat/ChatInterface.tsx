"use client";

import { useChat } from "ai/react";
import { useState, useCallback } from "react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import {
  Bot,
  Moon,
  Sun,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const SUGGESTED_QUESTIONS = [
  "إيه المنتجات الجديدة عندكم؟",
  "What's your return policy?",
  "ازاي اتابع طلبي؟",
  "Do you ship to Alexandria?",
];

/** Main chat interface component */
export function ChatInterface() {
  const [isDark, setIsDark] = useState(false);
  const [sources, setSources] = useState<
    Record<string, { id: string; content: string; type: string; similarity: number }[]>
  >({});

  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    append,
  } = useChat({
    api: "/api/chat",
    onResponse: (response) => {
      const sourcesHeader = response.headers.get("X-Sources");
      if (sourcesHeader) {
        try {
          const bytes = Uint8Array.from(atob(sourcesHeader), (c) =>
            c.charCodeAt(0)
          );
          const decoded = new TextDecoder("utf-8").decode(bytes);
          const parsedSources = JSON.parse(decoded);
          setSources((prev) => ({
            ...prev,
            _pending: parsedSources,
          }));
        } catch {
          // ignore parse errors
        }
      }
    },
    onFinish: (message) => {
      setSources((prev) => {
        const pending = prev._pending;
        if (pending) {
          const updated = { ...prev, [message.id]: pending };
          delete updated._pending;
          return updated;
        }
        return prev;
      });
    },
  });

  const toggleDarkMode = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  const handleSuggestedQuestion = (question: string) => {
    append({ role: "user", content: question });
  };

  const showEmptyState = messages.length === 0;

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-3 mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">
                Cairo Mart Assistant
              </h1>
              <p className="text-xs text-muted-foreground">
                AI-powered support · Available 24/7
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-lg"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Messages or Empty State */}
      {showEmptyState ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-8">
          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xl">
              <Bot className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">أهلاً بيك في كايرو مارت!</h2>
              <p className="text-muted-foreground mt-1">
                Welcome to Cairo Mart! How can I help you today?
              </p>
            </div>
          </div>

          {/* Suggested questions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
            {SUGGESTED_QUESTIONS.map((question) => (
              <button
                key={question}
                onClick={() => handleSuggestedQuestion(question)}
                className="flex items-center gap-2 rounded-xl border bg-muted/50 px-4 py-3 text-sm text-left hover:bg-muted transition-colors"
              >
                <Sparkles className="h-4 w-4 text-violet-500 shrink-0" />
                <span>{question}</span>
              </button>
            ))}
          </div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">🔍 Product Search</span>
            <span>·</span>
            <span className="flex items-center gap-1">📦 Order Tracking</span>
            <span>·</span>
            <span className="flex items-center gap-1">🌍 Arabic + English</span>
            <span>·</span>
            <span className="flex items-center gap-1">⚡ Streaming AI</span>
          </div>
        </div>
      ) : (
        <MessageList
          messages={messages}
          isLoading={isLoading}
          sources={sources}
        />
      )}

      {/* Input */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
