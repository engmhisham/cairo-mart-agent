import { tool } from "ai";
import { z } from "zod";
import { products } from "@/lib/data/products";

/** All tools available to the Cairo Mart AI agent */
export const tools = {
  searchProducts: tool({
    description:
      "Search for products in Cairo Mart catalog by query text and optional category filter. Use this when the user asks about products, wants to browse, or is looking for something specific. دور على المنتجات في كاتالوج كايرو مارت",
    parameters: z.object({
      query: z
        .string()
        .describe("Search query - can be in Arabic, English, or Franco-Arabic"),
      category: z
        .enum(["electronics", "clothing", "home"])
        .optional()
        .describe("Optional category filter"),
    }),
    execute: async ({ query, category }) => {
      const queryLower = query.toLowerCase();
      let results = products;

      if (category) {
        results = results.filter((p) => p.category === category);
      }

      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(queryLower) ||
          p.nameAr.includes(query) ||
          p.description.toLowerCase().includes(queryLower) ||
          p.category.includes(queryLower)
      );

      // If no exact match, return all in category or top results
      if (results.length === 0) {
        results = category
          ? products.filter((p) => p.category === category)
          : products.slice(0, 5);
      }

      return results.map((p) => ({
        id: p.id,
        name: `${p.name} - ${p.nameAr}`,
        price: `${p.price} EGP`,
        category: p.category,
        inStock: p.inStock,
        rating: p.rating,
      }));
    },
  }),

  checkOrderStatus: tool({
    description:
      "Check the status of an order by its order ID. Use this whenever the user asks about their order, delivery status, or tracking. تتبع حالة الطلب",
    parameters: z.object({
      orderId: z
        .string()
        .describe(
          "The order ID to check - usually a number like 12345 or ORD-12345"
        ),
    }),
    execute: async ({ orderId }) => {
      // Extract numeric part
      const numericId = orderId.replace(/\D/g, "");

      if (!numericId || numericId.length === 0) {
        return {
          status: "error",
          message:
            "رقم الطلب مش صحيح. الرقم لازم يكون أرقام زي 12345. Invalid order ID - must contain numbers.",
          orderId,
        };
      }

      const num = parseInt(numericId, 10);

      if (num % 2 === 0) {
        return {
          status: "shipped",
          orderId,
          message: "تم الشحن وهيوصلك بكرة إن شاء الله 🚚",
          estimatedDelivery: "غداً / Tomorrow",
          trackingNumber: `TRACK-${numericId}-EG`,
          carrier: "Cairo Express Delivery",
        };
      } else {
        return {
          status: "preparing",
          orderId,
          message: "جاري تجهيز طلبك للشحن 📦",
          estimatedDelivery: "خلال 2-3 أيام / In 2-3 days",
          currentStep: "التغليف والتجهيز / Packing",
        };
      }
    },
  }),

  getProductDetails: tool({
    description:
      "Get full details about a specific product by its ID. Use this when the user wants more information about a particular product. تفاصيل المنتج",
    parameters: z.object({
      productId: z
        .string()
        .describe("The product ID like elec-001, cloth-002, home-003"),
    }),
    execute: async ({ productId }) => {
      const product = products.find((p) => p.id === productId);

      if (!product) {
        return {
          error: true,
          message: `مش لاقي المنتج ده. Product with ID ${productId} not found.`,
        };
      }

      return {
        id: product.id,
        name: `${product.name} - ${product.nameAr}`,
        description: product.description,
        price: `${product.price} جنيه مصري (${product.price} EGP)`,
        category: product.category,
        inStock: product.inStock
          ? "متوفر ✅ / In Stock"
          : "غير متوفر حالياً ❌ / Out of Stock",
        rating: `${product.rating}/5 ⭐`,
      };
    },
  }),

  createSupportTicket: tool({
    description:
      "Create a customer support ticket for issues that need human follow-up. Use this when the user has a complaint, complex issue, or needs help beyond what you can provide. إنشاء تذكرة دعم",
    parameters: z.object({
      issue: z
        .string()
        .describe(
          "Description of the customer's issue - be detailed and include context"
        ),
      contact: z
        .string()
        .describe(
          "Customer contact info - phone number, email, or any way to reach them"
        ),
    }),
    execute: async ({ issue, contact }) => {
      const ticketId = `TKT-${Date.now().toString(36).toUpperCase()}`;

      return {
        success: true,
        ticketId,
        message: `تم إنشاء تذكرة دعم رقم ${ticketId}. فريق خدمة العملاء هيتواصل معاك خلال 24 ساعة. Support ticket ${ticketId} created. Our team will contact you within 24 hours.`,
        issue,
        contact,
        estimatedResponse: "خلال 24 ساعة / Within 24 hours",
      };
    },
  }),
};
