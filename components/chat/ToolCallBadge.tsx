"use client";

import { Badge } from "@/components/ui/badge";
import {
  Search,
  Package,
  ShoppingBag,
  Ticket,
  Loader2,
} from "lucide-react";

const toolIcons: Record<string, React.ReactNode> = {
  searchProducts: <Search className="h-3 w-3" />,
  checkOrderStatus: <Package className="h-3 w-3" />,
  getProductDetails: <ShoppingBag className="h-3 w-3" />,
  createSupportTicket: <Ticket className="h-3 w-3" />,
};

const toolLabels: Record<string, string> = {
  searchProducts: "Searching products",
  checkOrderStatus: "Checking order",
  getProductDetails: "Getting details",
  createSupportTicket: "Creating ticket",
};

interface ToolCallBadgeProps {
  toolName: string;
  state: "call" | "result" | "partial-call";
}

/** Badge showing which tool was called by the AI agent */
export function ToolCallBadge({ toolName, state }: ToolCallBadgeProps) {
  const icon = toolIcons[toolName] || <Package className="h-3 w-3" />;
  const label = toolLabels[toolName] || toolName;
  const isLoading = state === "call" || state === "partial-call";

  return (
    <Badge
      variant="secondary"
      className="gap-1.5 px-2.5 py-1 text-xs font-medium animate-in fade-in slide-in-from-bottom-1 duration-300"
    >
      {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : icon}
      <span>{label}</span>
      {!isLoading && <span className="text-green-500">✓</span>}
    </Badge>
  );
}
