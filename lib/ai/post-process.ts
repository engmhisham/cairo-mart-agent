/** Strip raw function/XML tags that Llama sometimes outputs as text */
export function sanitizeResponse(text: string): string {
  if (!text) return text;

  let result = text;

  // Remove <function=...>...</function> patterns
  result = result.replace(/<function=\w+>[\s\S]*?<\/function>/g, "");
  // Remove <function>...</function> patterns
  result = result.replace(/<function>[\s\S]*?<\/function>/g, "");
  // Remove standalone <function=...> tags without closing
  result = result.replace(/<function=\w+>[^<]*/g, "");
  // Remove any remaining <function...> tags
  result = result.replace(/<\/?function[^>]*>/g, "");
  // Remove JSON-like tool call fragments: {"issue": "...", "contact": "..."}
  result = result.replace(/\{"(?:issue|query|orderId|productId|contact|category)":\s*"[^"]*"(?:,\s*"(?:issue|query|orderId|productId|contact|category)":\s*"[^"]*")*\}/g, "");

  // Remove common foreign words Llama hallucinates
  const foreignWords = [
    "hvordan", "peut-être", "peut être", "comment",
    "bitte", "por favor", "gracias", "merci", "danke",
    "s'il vous plaît", "oui", "nein", "ja ",
  ];
  for (const word of foreignWords) {
    result = result.replace(new RegExp(`\\b${word}\\b`, "gi"), "");
  }

  // Clean up leftover whitespace
  result = result.replace(/\s{2,}/g, " ").replace(/\.\s*\./g, ".").trim();

  return result;
}
