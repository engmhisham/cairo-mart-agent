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
  if (arabicChars > text.length * 0.3) return "arabic";

  // Franco-Arabic: numbers used as Arabic letters OR common Franco words
  const hasArabicNumbers = /[2345789]/.test(text) && /[a-zA-Z]/.test(text);
  const francoWords = /\b(3ayez|3amel|3andak|3andoko|3andi|ezayak|ezay|7aga|7elwa|e7na|ma3a|2ana|ya3ni|kwayes|kowayes|mawgood|shokran|a5bar|bs2al|bkam|se3r|feen|leeh|mesh|msh|kda|7abibi|mashkoor|el|fel|wel|aw|wala|tab|yala|akher|3ashan|lessa|khalas|ahlan|tamam|aiwa|la2|sabah|masa|ana)\b/i;
  if (hasArabicNumbers || francoWords.test(text)) return "franco";

  return "english";
}

export async function POST(req: Request) {
  try {
    await initializeStore();

    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const userLang = detectLanguage(lastUserMessage);

    // Detect intent and handle tools server-side
    const prevMessages = messages.map((m: { content: string }) => m.content);
    const intent = detectIntent(lastUserMessage, prevMessages);

    let toolContext = "";
    let toolAction = "";

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
          // No details yet - return a static ask message, no LLM needed
          const askMessage = getComplaintAskPrompt(userLang);
          const encoder = new TextEncoder();
          const stream = new ReadableStream({
            start(controller) {
              controller.enqueue(
                encoder.encode(`f:{"messageId":"msg-complaint-ask"}\n`)
              );
              controller.enqueue(encoder.encode(`0:"${askMessage.replace(/"/g, '\\"')}"\n`));
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
        // Has details + contact → create ticket
        const result = createTicket(intent.data.issue, intent.data.contact);
        toolContext = `\n\nSUPPORT TICKET CREATED:\n${result}`;
        toolAction = "Created support ticket";
        break;
      }
    }

    // RAG: Retrieve relevant context
    const { context, sources } = await retrieveContext(lastUserMessage, 3);

    // Language instruction - placed prominently
    const langMap = {
      arabic: "RESPOND IN EGYPTIAN ARABIC ONLY (عامية مصرية). NOT formal Arabic.",
      franco: `RESPOND IN EGYPTIAN FRANCO-ARABIC ONLY (Arabizi/Egyptian dialect in Latin letters).
Rules: 3=ع, 7=ح, 2=أ, 5=خ, 8=غ. NO Arabic script. NO formal English.
EGYPTIAN Franco examples:
- "ahlan! ta7t amrak, 3ayez eh?"
- "el mobile da se3ro 42999 geneih, mawgood fel stock"
- "te2dar terga3 ay montag 5elal 14 yom"
- "el shipping le masr kolaha, el qahera yom aw yomein"
- "ma3lesh, mafeesh el montag da, bas 3andena 7agat tanya kwayes"
NEVER use Gulf/Khaliji dialect. Use EGYPTIAN words: "ezayak" not "shlonak", "3ayez" not "abgha", "kwayes" not "zein".`,
      english: "RESPOND IN ENGLISH ONLY.",
    };

    const systemPrompt = `${langMap[userLang]}

${SYSTEM_PROMPT}
${toolAction ? `\nYou just performed this action: ${toolAction}. Summarize the result below for the user.` : ""}
${toolContext}

RELEVANT CONTEXT:
${context}

REMINDER: ${langMap[userLang]}`;

    const result = streamText({
      model: getGroqClient()("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages,
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
