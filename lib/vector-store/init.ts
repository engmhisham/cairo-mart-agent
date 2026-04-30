import { vectorStore } from "./memory-store";
import { products } from "@/lib/data/products";
import { policies } from "@/lib/data/policies";
import { storeInfo } from "@/lib/data/store-info";

let initialized = false;
let initPromise: Promise<void> | null = null;

/** Initialize the vector store with all data (lazy, once) */
export async function initializeStore(): Promise<void> {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Index products
    const productDocs = products.map((p) => ({
      id: p.id,
      content: `${p.name} - ${p.nameAr}: ${p.description}. السعر: ${p.price} جنيه مصري (${p.price} EGP). الفئة: ${p.category}. ${p.inStock ? "متوفر في المخزون / In stock" : "غير متوفر حالياً / Out of stock"}. التقييم: ${p.rating}/5`,
      metadata: { type: "product", category: p.category, productId: p.id },
    }));

    // Index policies
    const policyDocs = policies.map((p) => ({
      id: p.id,
      content: `${p.question}\n${p.answer}`,
      metadata: { type: "policy", category: p.category },
    }));

    // Index store info
    const storeDoc = {
      id: "store-info",
      content: `${storeInfo.name} - ${storeInfo.nameAr}: ${storeInfo.description}. الفروع: ${storeInfo.locations.map((l) => `${l.nameAr} (${l.addressAr})`).join("، ")}. مواعيد العمل: ${storeInfo.workingHours}. للتواصل: ${storeInfo.contactPhone} أو ${storeInfo.contactEmail}`,
      metadata: { type: "store-info" },
    };

    await vectorStore.addDocuments([...productDocs, ...policyDocs, storeDoc]);
    initialized = true;
  })();

  return initPromise;
}
