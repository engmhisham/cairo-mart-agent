"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { cn, isArabic } from "@/lib/utils";

interface Source {
  id: string;
  content: string;
  type: string;
  similarity: number;
}

interface SourcesPanelProps {
  sources: Source[];
}

const typeLabels: Record<string, string> = {
  product: "📦 Product",
  policy: "📋 Policy",
  "store-info": "🏪 Store Info",
};

/** Collapsible panel showing RAG sources used for a response */
export function SourcesPanel({ sources }: SourcesPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <BookOpen className="h-3 w-3" />
        <span>Sources ({sources.length})</span>
        {isOpen ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2 animate-in slide-in-from-top-1 duration-200">
          {sources.map((source) => (
            <div
              key={source.id}
              className={cn(
                "rounded-lg border bg-muted/50 p-2.5 text-xs",
                isArabic(source.content) && "text-right"
              )}
              dir={isArabic(source.content) ? "rtl" : "ltr"}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">
                  {typeLabels[source.type] || source.type}
                </span>
                <span className="text-muted-foreground">
                  {Math.round(source.similarity * 100)}% match
                </span>
              </div>
              <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                {source.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
