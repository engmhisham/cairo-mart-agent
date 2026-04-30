/** Product in the Cairo Mart catalog */
export interface Product {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  price: number;
  currency: "EGP";
  category: "electronics" | "clothing" | "home";
  inStock: boolean;
  rating: number;
  image?: string;
}

/** FAQ / Policy entry */
export interface PolicyEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
}

/** Store information */
export interface StoreInfo {
  name: string;
  nameAr: string;
  description: string;
  locations: StoreLocation[];
  workingHours: string;
  contactEmail: string;
  contactPhone: string;
  socialMedia: Record<string, string>;
}

export interface StoreLocation {
  name: string;
  nameAr: string;
  address: string;
  addressAr: string;
  phone: string;
}

/** Vector store document */
export interface VectorDocument {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  embedding: number[];
}

/** Chat message with sources */
export interface ChatSource {
  id: string;
  content: string;
  type: string;
  similarity: number;
}
