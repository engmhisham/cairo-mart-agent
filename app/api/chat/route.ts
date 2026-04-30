import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { initializeStore } from "@/lib/vector-store/init";
import { retrieveContext } from "@/lib/ai/rag";
import { SYSTEM_PROMPT, getComplaintAskPrompt } from "@/lib/ai/system-prompt";
import {
  detectIntent,
  searchProducts,
  checkOrder,
  createTicket,
} from "@/lib/ai/intent";

const API_KEYS = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_BACKUP,
].filter(Boolean) as string[];

let currentKeyIndex = 0;
let keyBlockedUntil = 0;

function getGroqClient() {
  if (Date.now() < keyBlockedUntil && currentKeyIndex < API_KEYS.length - 1) {
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  }
  return createGroq({ apiKey: API_KEYS[currentKeyIndex] });
}

/** Detect language of the user's message */
function detectLanguage(text: string): "arabic" | "english" | "franco" {
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  if (arabicChars > text.length * 0.2) return "arabic";

  const francoWords = /\b(3ayez|3amel|3andak|3andoko|3andi|ezayak|ezay|7aga|7elwa|e7na|ma3a|2ana|ya3ni|kwayes|kowayes|mawgood|shokran|a5bar|bs2al|bkam|se3r|feen|leeh|mesh|msh|kda|7abibi|mashkoor|tab|yala|akher|3ashan|lessa|khalas|ahlan|tamam|aiwa|la2|sabah|masa|ana|eh|da|de|wa|enta|enti|howa|heya)\b/i;
  if (francoWords.test(text)) return "franco";

  // Numbers as Arabic letters (3=ع, 7=ح, 2=ء) mixed with Latin
  const francoNumPattern = /[a-zA-Z]+[2357]+[a-zA-Z]+/;
  if (francoNumPattern.test(text)) return "franco";

  return "english";
}

/** Build a static data stream response (no LLM needed) */
function staticStreamResponse(message: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(`f:{"messageId":"msg-${Date.now()}"}\n`)
      );
      controller.enqueue(
        encoder.encode(`0:"${message.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"\n`)
      );
      controller.enqueue(
        encoder.encode(
          `e:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0},"isContinued":false}\n`
        )
      );
      controller.enqueue(
        encoder.encode(
          `d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`
        )
      );
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Vercel-AI-Data-Stream": "v1",
    },
  });
}

export async function POST(req: Request) {
  try {
    await initializeStore();

    const body = await req.json();
    const messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return staticStreamResponse("Please send a message to get started!");
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";
    if (!lastUserMessage.trim()) {
      return staticStreamResponse("Please type a message!");
    }

    const userLang = detectLanguage(lastUserMessage);

    // Detect intent and handle tools server-side
    const prevMessages = messages.map((m: { content: string }) => m.content);
    const intent = detectIntent(lastUserMessage, prevMessages);

    let toolContext = "";
    let toolAction = "";

    try {
      switch (intent.type) {
        case "order": {
          const result = checkOrder(intent.data?.orderId || "");
          toolContext = `\n\nORDER STATUS RESULT:\n${result}`;
          toolAction = "Checked order status";
          break;
        }
        case "search": {
          const result = searchProducts(intent.data?.query || lastUserMessage, userLang);
          toolContext = `\n\nPRODUCT SEARCH RESULTS:\n${result}`;
          toolAction = "Searched products";
          break;
        }
        case "complaint": {
          if (!intent.data?.contact) {
            return staticStreamResponse(getComplaintAskPrompt(userLang));
          }
          const result = createTicket(intent.data.issue || lastUserMessage, intent.data.contact);
          toolContext = `\n\nSUPPORT TICKET CREATED:\n${result}`;
          toolAction = "Created support ticket";
          break;
        }
      }
    } catch {
      // If tool execution fails, continue without tool context
    }

    // RAG: Retrieve relevant context
    let context = "";
    let sources: { id: string; content: string; type: string; similarity: number }[] = [];
    try {
      const rag = await retrieveContext(lastUserMessage, 3);
      context = rag.context;
      sources = rag.sources;
      // Strip Arabic from context when user writes in Franco/English to prevent LLM mixing
      if (userLang !== "arabic") {
        context = context.replace(/[\u0600-\u06FF]+/g, "").replace(/\s{2,}/g, " ");
      }
    } catch {
      // If RAG fails, continue without context
    }

    // Language instruction
    const langMap = {
      arabic: "RESPOND IN EGYPTIAN ARABIC ONLY (عامية مصرية). NOT formal Arabic.",
      franco: `RESPOND IN EGYPTIAN FRANCO-ARABIC ONLY (Arabizi).
Rules: 3=ع, 7=ح, 2=أ, 5=خ, 8=غ. NO Arabic script. NO formal English.
Examples:
- "ahlan! ta7t amrak, 3ayez eh?"
- "el mobile da se3ro 42999 geneih, mawgood fel stock"
- "te2dar terga3 ay montag 5elal 14 yom"
- "ma3lesh, mafeesh el montag da, bas 3andena 7agat tanya kwayes"
Use EGYPTIAN dialect: "ezayak" not "shlonak", "3ayez" not "abgha", "kwayes" not "zein".`,
      english: "RESPOND IN ENGLISH ONLY.",
    };

    const systemPrompt = `${langMap[userLang]}

${SYSTEM_PROMPT}
${toolAction ? `\nYou just performed this action: ${toolAction}. Summarize the result below for the user naturally.` : ""}
${toolContext}

RELEVANT CONTEXT:
${context}

CRITICAL REMINDER: The user's LATEST message is in ${userLang === "arabic" ? "Egyptian Arabic" : userLang === "franco" ? "Franco-Arabic (Arabizi)" : "English"}. You MUST respond in the SAME language as the LATEST message. Ignore the language of previous messages. ${langMap[userLang]}`;

    // Only send last 4 messages to avoid language contamination from earlier turns
    const recentMessages = messages.slice(-4);

    const result = streamText({
      model: getGroqClient()("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: recentMessages,
      maxSteps: 1,
    });

    return result.toDataStreamResponse({
      getErrorMessage: () => "An error occurred, please try again.",
      headers: {
        "X-Sources": Buffer.from(JSON.stringify(sources)).toString("base64"),
      },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "";
    if (errMsg.includes("Rate limit")) {
      keyBlockedUntil = Date.now() + 15 * 60 * 1000;
    }
    console.error("Chat API Error:", error);
    return new Response(
      JSON.stringify({
        error: "Server error occurred.",
        details: error instanceof Error ? error.message : "Unknown",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
