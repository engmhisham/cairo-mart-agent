import { products } from "@/lib/data/products";

interface Intent {
  type: "search" | "order" | "complaint" | "general";
  data?: Record<string, string>;
}

// Policy/info keywords - checked FIRST to avoid false complaint matches
const POLICY_KEYWORDS = [
  "return policy", "refund policy", "shipping policy", "warranty",
  "return product", "how to return", "can i return",
  "سياسة", "ارجاع", "ترجيع", "ضمان", "شحن",
  "policy", "policies", "hours", "working hours", "open",
  "مواعيد", "فروع", "branch", "location", "contact",
  "payment", "pay", "دفع", "فلوس", "كاش", "فوري", "فودافون",
  "loyalty", "نقاط", "points", "bulk", "جملة",
  "ship", "shipping", "deliver", "توصيل", "بتوصلوا",
  "cancel", "الغاء", "الغي",
];

// Order-related keywords
const ORDER_KEYWORDS = [
  "order", "track", "tracking", "delivery status", "where is my",
  "order number", "order id", "order status",
  "طلب", "طلبي", "وريني", "تتبع", "فين طلبي",
  "talb", "talabi", "feen talabi",
];

// Complaint keywords - words that ONLY mean complaints, not policy queries
const COMPLAINT_KEYWORDS = [
  "complaint", "complain", "i have a problem", "broken", "damaged",
  "wrong item", "bad quality", "terrible", "angry", "frustrated",
  "not working", "doesnt work", "doesn't work", "didn't arrive",
  "never arrived", "missing", "late delivery", "overcharged",
  "شكوى", "مشكلة", "مكسور", "تالف", "غلط", "خربان",
  "مش شغال", "باظ", "وحش", "زعلان",
  "moshkela", "kharab", "mesh shaghal",
];

// Product-related keywords
const PRODUCT_KEYWORDS = [
  "product", "buy", "purchase", "price", "how much", "cost", "shop",
  "electronics", "clothing", "clothes", "home", "recommend", "suggest",
  "show me", "what do you have", "what do you sell", "available", "stock",
  "catalog", "catalogue", "cheap", "expensive", "best", "top", "new",
  "phone", "mobile", "laptop", "computer", "headphone", "earphone",
  "watch", "smartwatch", "tablet", "ipad", "iphone", "samsung", "apple",
  "macbook", "sony", "nike", "levi",
  "shirt", "t-shirt", "tshirt", "jeans", "jacket", "sneaker", "shoe",
  "dress", "coffee", "blanket", "lamp", "light", "knife", "pillow",
  "north face",
  "منتج", "منتجات", "اشتري", "سعر", "بكام", "عندك", "عندكم",
  "موبايل", "موبايلات", "لابتوب", "سماعة", "ساعة", "تابلت",
  "تيشيرت", "جينز", "جاكيت", "سنيكرز", "حذاء", "فستان",
  "قهوة", "بطانية", "لمبة", "سكاكين", "مخدة",
  "الكترونيات", "ملابس", "منزلية", "جديد", "جديدة",
  "3ayez", "3andak", "3andoko", "bkam", "se3r",
];

/** Detect user intent from message text */
export function detectIntent(message: string, _conversationContext: string[]): Intent {
  const lower = message.toLowerCase();

  // 1. Check policy/info FIRST (highest priority to avoid false complaint matches)
  const hasPolicyKeyword = POLICY_KEYWORDS.some((k) => lower.includes(k));
  if (hasPolicyKeyword) {
    return { type: "general" };
  }

  // 2. Order tracking: must have order keyword + number
  const hasOrderKeyword = ORDER_KEYWORDS.some((k) => lower.includes(k));
  const orderIdMatch = message.match(/\b\d{4,}\b/);
  if (hasOrderKeyword && orderIdMatch) {
    return { type: "order", data: { orderId: orderIdMatch[0] } };
  }

  // 3. Complaint detection
  const hasComplaintKeyword = COMPLAINT_KEYWORDS.some((k) => lower.includes(k));
  if (hasComplaintKeyword) {
    const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = message.match(/(?:01|\+20|002)\d{9,}/);
    const contact = emailMatch?.[0] || phoneMatch?.[0] || "";

    if (contact) {
      return { type: "complaint", data: { issue: message, contact } };
    }
    return { type: "complaint", data: { issue: "", contact: "" } };
  }

  // 4. Product search
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
    if (lower.includes("electronic") || lower.includes("الكترون") || lower.includes("موبايل") || lower.includes("phone") || lower.includes("mobile") || lower.includes("iphone")) {
      if (p.category === "electronics") score += 1;
    }
    if (lower.includes("cloth") || lower.includes("ملابس") || lower.includes("sneaker") || lower.includes("shirt") || lower.includes("shoe") || lower.includes("dress") || lower.includes("jeans")) {
      if (p.category === "clothing") score += 1;
    }
    if (lower.includes("home") || lower.includes("منزل") || lower.includes("kitchen") || lower.includes("مطبخ") || lower.includes("coffee") || lower.includes("lamp") || lower.includes("pillow")) {
      if (p.category === "home") score += 1;
    }

    return { product: p, score };
  });

  const results = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);

  if (results.length === 0) {
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
