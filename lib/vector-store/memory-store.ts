import { embed } from "@/lib/embeddings/embedder";
import type { VectorDocument } from "@/types";

/** In-memory vector store with cosine similarity search */
class MemoryVectorStore {
  private docs: VectorDocument[] = [];

  /** Add documents to the store, computing embeddings for each */
  async addDocuments(
    docs: Omit<VectorDocument, "embedding">[]
  ): Promise<void> {
    for (const doc of docs) {
      const embedding = await embed(doc.content);
      this.docs.push({ ...doc, embedding });
    }
  }

  /** Search for the most similar documents to a query */
  async search(
    query: string,
    topK: number = 3
  ): Promise<(VectorDocument & { similarity: number })[]> {
    const queryEmbedding = await embed(query);

    const scored = this.docs.map((doc) => ({
      ...doc,
      similarity: this.cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    return scored.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
  }

  /** Compute cosine similarity between two vectors */
  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }

  /** Check if store has been initialized */
  get size(): number {
    return this.docs.length;
  }
}

export const vectorStore = new MemoryVectorStore();
