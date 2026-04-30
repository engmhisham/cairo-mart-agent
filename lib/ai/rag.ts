import { vectorStore } from "@/lib/vector-store/memory-store";

/** Retrieve relevant context for a user query using RAG */
export async function retrieveContext(
  query: string,
  topK: number = 3
): Promise<{ context: string; sources: { id: string; content: string; type: string; similarity: number }[] }> {
  const results = await vectorStore.search(query, topK);

  const sources = results.map((doc) => ({
    id: doc.id,
    content: doc.content,
    type: (doc.metadata.type as string) || "unknown",
    similarity: Math.round(doc.similarity * 100) / 100,
  }));

  const context = results.map((doc) => doc.content).join("\n\n---\n\n");

  return { context, sources };
}
