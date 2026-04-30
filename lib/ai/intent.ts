import { products } from "@/lib/data/products";

interface Intent {
  type: "search" | "order" | "complaint" | "general";
  data?: Record<string, string>;
}

// Product-related keywords (any language)
const PRODUCT_KEYWORDS = [
  // English
  "product", "buy", "price", "how much", "cost", "shop", "store",
  "electronics", "clothing", "home", "recommend", "suggest", "show me",
  "what do you have", "what do you sell", "available", "stock", "catalog",
  "phone", "mobile", "laptop", "headphone", "earphone", "watch", "tablet", "ipad",
  "shirt", "t-shirt", "tshirt", "jeans", "jacket", "sneaker", "shoe", "dress",
  "coffee", "blanket", "lamp", "light", "knife", "pillow", "samsung", "apple",
  "macbook", "sony", "nike", "levi", "north face",
  // Arabic
  "منتج", "اشتري", "سعر", "بكام", "عندك", "عندكم", "موبايل", "لابتوب",
  "سماعة", "ساعة", "تابلت", "تيشيرت", "جينز", "جاكيت", "سنيكرز", "حذاء",
  "فستان", "قهوة", "بطانية", "لمبة", "سكاكين", "مخدة", "موبايلات",
  "الكترونيات", "ملابس", "منزلية", "منتجات", "جديد", "جديدة",
  // Franco
  "3ayez", "3andak", "3andoko", "mobile", "sho", "kam", "bkam",
];

// Order-related keywords
const ORDER_KEYWORDS = [
  "order", "track", "delivery", "shipped", "shipping", "where is my",
  "طلب", "طلبي", "وريني", "تتبع", "شحن", "فين", "وصل",
  "talb", "talabi", "feen",
];

// Complaint keywords
const COMPLAINT_KEYWORDS = [
  "complaint", "complain", "problem", "issue", "broken", "damaged",
  "wrong", "bad", "terrible", "angry", "refund", "return", "defect",
  "not working", "doesnt work", "didn't arrive",
  "شكوى", "مشكلة", "مكسور", "تالف", "غلط", "رجع", "استرجاع",
  "مش شغال", "خربان", "باظ", "وحش",
  "moshkela", "kharab", "mesh shaghal",
];

/** Detect user intent from message text */
export function detectIntent(message: string, _conversationContext: string[]): Intent {
  const lower = message.toLowerCase();

  // Order tracking: keywords + number
  const hasOrderKeyword = ORDER_KEYWORDS.some((k) => lower.includes(k));
  const orderIdMatch = message.match(/\d{3,}/);
  if (hasOrderKeyword && orderIdMatch) {
    return { type: "order", data: { orderId: orderIdMatch[0] } };
  }

  // Complaint detection
  const hasComplaintKeyword = COMPLAINT_KEYWORDS.some((k) => lower.includes(k));
  if (hasComplaintKeyword) {
    const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = message.match(/(?:01|\+20|002)\d{9,}/);
    const contact = emailMatch?.[0] || phoneMatch?.[0] || "";

    if (contact && message.length > 20) {
      return { type: "complaint", data: { issue: message, contact } };
    }
    return { type: "complaint" };
  }

  // Product search
  const hasProductKeyword = PRODUCT_KEYWORDS.some((k) => lower.includes(k));
  if (hasProductKeyword) {
    return { type: "search", data: { query: message } };
  }

  return { type: "general" };
}

/** Execute product search with fuzzy matching */
export function searchProducts(query: string, lang: "arabic" | "english" | "franco" = "english"): string {
  const currency = lang === "arabic" ? "جنيه" : lang === "franco" ? "geneih" : "EGP";
  const lower = query.toLowerCase();
  const words = lower.split(/\s+/);

  const scored = products.map((p) => {
    let score = 0;
    const searchable = `${p.name} ${p.nameAr} ${p.description} ${p.category}`.toLowerCase();

    for (const word of words) {
      if (word.length < 2) continue;
      if (searchable.includes(word)) score += 2;
    }

    // Category boosts
    if (lower.includes("electronic") || lower.includes("الكترون") || lower.includes("موبايل") || lower.includes("phone") || lower.includes("mobile")) {
      if (p.category === "electronics") score += 1;
    }
    if (lower.includes("cloth") || lower.includes("ملابس") || lower.includes("sneaker") || lower.includes("shirt") || lower.includes("shoe")) {
      if (p.category === "clothing") score += 1;
    }
    if (lower.includes("home") || lower.includes("منزل") || lower.includes("kitchen") || lower.includes("مطبخ")) {
      if (p.category === "home") score += 1;
    }

    return { product: p, score };
  });

  const results = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);

  // If no matches, return top products from the most likely category
  if (results.length === 0) {
    // Try to guess category
    const allProducts = products.slice(0, 5);
    return (
      "Here are some of our popular products:\n" +
      allProducts
        .map(
          (p) =>
            `- ${p.name}: ${p.price} ${currency} | ${p.inStock ? "In stock ✅" : "Out of stock ❌"} | ${p.rating}/5⭐`
        )
        .join("\n")
    );
  }

  return results
    .slice(0, 5)
    .map(
      ({ product: p }) =>
        `- ${p.name}: ${p.price} ${currency} | ${p.inStock ? "In stock ✅" : "Out of stock ❌"} | ${p.rating}/5⭐`
    )
    .join("\n");
}

/** Execute order status check */
export function checkOrder(orderId: string): string {
  const numericId = orderId.replace(/\D/g, "");
  if (!numericId) {
    return "Invalid order ID. Order IDs should be numbers like 12345.";
  }
  const num = parseInt(numericId, 10);
  if (num % 2 === 0) {
    return `Order #${orderId}: SHIPPED 🚚 - Expected delivery: tomorrow. Tracking: TRACK-${numericId}-EG via Cairo Express Delivery.`;
  }
  return `Order #${orderId}: PREPARING 📦 - Being packed for shipment. Expected delivery: 2-3 days.`;
}

/** Execute support ticket creation */
export function createTicket(issue: string, contact: string): string {
  const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}`;
  return `Support ticket created! Ticket ID: ${ticketId}. Our team will contact you at ${contact} within 24 hours.`;
}
