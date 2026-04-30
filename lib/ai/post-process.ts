/** Strip raw function/XML tags that Llama sometimes outputs as text */
export function sanitizeResponse(text: string): string {
  if (!text) return text;

  let result = text;

  // Remove <function=...>...</function> patterns
  result = result.replace(/<function=\w+>[\s\S]*?<\/function>/g, "");
  result = result.replace(/<function>[\s\S]*?<\/function>/g, "");
  result = result.replace(/<\/?function[^>]*>/g, "");

  // Remove JSON-like tool call fragments
  result = result.replace(/\{"\w+":\s*"[^"]*"(?:,\s*"\w+":\s*"[^"]*")*\}/g, "");

  // Remove common foreign words Llama hallucinates
  const foreignWords = [
    "hvordan", "peut-être", "peut être",
    "bitte", "por favor", "gracias", "merci", "danke",
  ];
  for (const word of foreignWords) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(`\\b${escaped}\\b`, "gi"), "");
  }

  // Clean up leftover whitespace
  result = result.replace(/\s{2,}/g, " ").replace(/\.\s*\./g, ".").trim();

  return result;
}
