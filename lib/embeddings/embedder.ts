import { pipeline, type FeatureExtractionPipeline } from "@xenova/transformers";

let embedderInstance: FeatureExtractionPipeline | null = null;
let initPromise: Promise<FeatureExtractionPipeline> | null = null;

/** Get or create the singleton embedding pipeline */
export async function getEmbedder(): Promise<FeatureExtractionPipeline> {
  if (embedderInstance) return embedderInstance;

  if (!initPromise) {
    initPromise = pipeline(
      "feature-extraction",
      "Xenova/multilingual-e5-small"
    ).then((instance) => {
      embedderInstance = instance;
      return instance;
    });
  }

  return initPromise;
}

/** Generate embeddings for the given text */
export async function embed(text: string): Promise<number[]> {
  const embedder = await getEmbedder();
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}
