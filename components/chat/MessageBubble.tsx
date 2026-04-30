"use client";

import type { Message } from "ai";
import { cn, isArabic } from "@/lib/utils";
import { sanitizeResponse } from "@/lib/ai/post-process";
import { User, Bot } from "lucide-react";
import { ToolCallBadge } from "./ToolCallBadge";
import { SourcesPanel } from "./SourcesPanel";

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
  isLoading: boolean;
  sources?: { id: string; content: string; type: string; similarity: number }[];
}

/** Single message bubble with RTL support and tool call display */
export function MessageBubble({
  message,
  isLast,
  isLoading,
  sources,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const toolInvocations = message.toolInvocations || [];
  const rawContent =
    typeof message.content === "string" ? message.content : "";
  const cleanContent = isUser ? rawContent : sanitizeResponse(rawContent);

  // Show fallback for empty assistant messages that are done streaming
  const showFallback =
    !isUser && !cleanContent && !isLoading && !(isLast && toolInvocations.some((t) => t.state !== "result"));

  const textContent = showFallback
    ? getFallbackFromTools(toolInvocations)
    : cleanContent;

  const rtl = isArabic(textContent);

  // Don't render empty non-last assistant messages with no tools
  if (!isUser && !textContent && toolInvocations.length === 0) return null;

  return (
    <div
      className={cn(
        "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message content */}
      <div
        className={cn(
          "flex w-full max-w-[80%] flex-col gap-1",
          isUser && "items-end"
        )}
      >
        {/* Tool call badges */}
        {toolInvocations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {toolInvocations.map((invocation, i) => (
              <ToolCallBadge
                key={i}
                toolName={invocation.toolName}
                state={invocation.state}
              />
            ))}
          </div>
        )}

        {/* Text bubble */}
        {textContent && (
          <div
            dir={rtl ? "rtl" : "ltr"}
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm leading-relaxed w-fit",
              isUser
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-muted rounded-tl-sm"
            )}
          >
            <p className="whitespace-pre-wrap">{textContent}</p>
          </div>
        )}

        {/* Sources panel for assistant messages */}
        {!isUser && sources && sources.length > 0 && (
          <SourcesPanel sources={sources} />
        )}
      </div>
    </div>
  );
}

/** Extract a fallback message from tool results if available */
function getFallbackFromTools(
  invocations: NonNullable<Message["toolInvocations"]>
): string {
  for (const inv of invocations) {
    if (inv.state !== "result") continue;
    const result = inv.result as Record<string, unknown>;

    if (inv.toolName === "createSupportTicket" && result?.ticketId) {
      return `تمام! اتعمل تذكرة برقم ${result.ticketId}، هنتواصل معاك قريب 👍`;
    }
    if (inv.toolName === "searchProducts" && Array.isArray(result)) {
      if (result.length === 0) {
        return "للأسف مش لاقي حاجة بالمواصفات دي، حابب أوريك حاجة تانية؟";
      }
    }
    if (inv.toolName === "checkOrderStatus" && result?.message) {
      return String(result.message);
    }
  }
  return "ثانية، هحاول أساعدك بطريقة تانية";
}
