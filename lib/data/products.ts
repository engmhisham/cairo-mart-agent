import type { Product } from "@/types";

/** Cairo Mart product catalog - 15 products across 3 categories */
export const products: Product[] = [
  // === Electronics ===
  {
    id: "elec-001",
    name: "Samsung Galaxy S24",
    nameAr: "موبايل سامسونج جالاكسي S24",
    description:
      "أحدث موبايل سامسونج بكاميرا 200MP وشاشة AMOLED - Samsung Galaxy S24 Ultra with AI features, 256GB storage",
    price: 42999,
    currency: "EGP",
    category: "electronics",
    inStock: true,
    rating: 4.8,
  },
  {
    id: "elec-002",
    name: "MacBook Air M3",
    nameAr: "لابتوب ماك بوك اير M3",
    description:
      "لابتوب Apple MacBook Air بمعالج M3 - خفيف وسريع، مناسب للشغل والدراسة، 8GB RAM, 256GB SSD",
    price: 64999,
    currency: "EGP",
    category: "electronics",
    inStock: true,
    rating: 4.9,
  },
  {
    id: "elec-003",
    name: "Sony WH-1000XM5",
    nameAr: "سماعة سوني WH-1000XM5",
    description:
      "أفضل سماعة noise cancelling في السوق - Sony headphones with 30hr battery, perfect for music and calls",
    price: 12999,
    currency: "EGP",
    category: "electronics",
    inStock: true,
    rating: 4.7,
  },
  {
    id: "elec-004",
    name: "Apple Watch Series 9",
    nameAr: "ساعة أبل واتش Series 9",
    description:
      "ساعة ذكية Apple Watch مع مستشعر صحي متطور - track fitness, heart rate, blood oxygen, GPS",
    price: 18999,
    currency: "EGP",
    category: "electronics",
    inStock: false,
    rating: 4.6,
  },
  {
    id: "elec-005",
    name: "iPad Air M2",
    nameAr: "تابلت آيباد اير M2",
    description:
      "تابلت iPad Air بمعالج M2 وشاشة 11 بوصة - مناسب للرسم والدراسة والترفيه، 128GB WiFi",
    price: 32999,
    currency: "EGP",
    category: "electronics",
    inStock: true,
    rating: 4.8,
  },

  // === Clothing ===
  {
    id: "cloth-001",
    name: "Egyptian Cotton T-Shirt",
    nameAr: "تيشيرت قطن مصري",
    description:
      "تيشيرت من أجود أنواع القطن المصري - 100% Egyptian cotton, comfortable fit, available in all sizes S-XXL",
    price: 350,
    currency: "EGP",
    category: "clothing",
    inStock: true,
    rating: 4.5,
  },
  {
    id: "cloth-002",
    name: "Levi's 501 Jeans",
    nameAr: "جينز ليفايز 501",
    description:
      "جينز Levi's 501 الكلاسيكي - original fit، متوفر بكل المقاسات، قماش متين ومريح",
    price: 1899,
    currency: "EGP",
    category: "clothing",
    inStock: true,
    rating: 4.4,
  },
  {
    id: "cloth-003",
    name: "North Face Winter Jacket",
    nameAr: "جاكيت نورث فيس شتوي",
    description:
      "جاكيت شتوي North Face مقاوم للمياه والرياح - windproof, waterproof, perfect for cold weather",
    price: 4500,
    currency: "EGP",
    category: "clothing",
    inStock: true,
    rating: 4.7,
  },
  {
    id: "cloth-004",
    name: "Nike Air Max Sneakers",
    nameAr: "سنيكرز نايك اير ماكس",
    description:
      "سنيكرز Nike Air Max مريحة جداً للمشي والرياضة - Air cushioning, lightweight, stylish design",
    price: 3200,
    currency: "EGP",
    category: "clothing",
    inStock: true,
    rating: 4.6,
  },
  {
    id: "cloth-005",
    name: "Elegant Evening Dress",
    nameAr: "فستان سهرة أنيق",
    description:
      "فستان سهرة أنيق بتصميم عصري - elegant evening dress, available in black, navy, and burgundy",
    price: 2800,
    currency: "EGP",
    category: "clothing",
    inStock: true,
    rating: 4.3,
  },

  // === Home ===
  {
    id: "home-001",
    name: "De'Longhi Coffee Maker",
    nameAr: "ماكينة قهوة ديلونجي",
    description:
      "ماكينة قهوة De'Longhi أوتوماتيكية بالكامل - espresso, cappuccino, latte, built-in grinder",
    price: 15999,
    currency: "EGP",
    category: "home",
    inStock: true,
    rating: 4.8,
  },
  {
    id: "home-002",
    name: "Premium Fleece Blanket",
    nameAr: "بطانية فليس فاخرة",
    description:
      "بطانية فليس ناعمة ودافية - king size, hypoallergenic, machine washable, available in multiple colors",
    price: 750,
    currency: "EGP",
    category: "home",
    inStock: true,
    rating: 4.4,
  },
  {
    id: "home-003",
    name: "Modern LED Desk Lamp",
    nameAr: "لمبة مكتب LED حديثة",
    description:
      "لمبة مكتب LED بتصميم عصري - adjustable brightness, USB charging port, eye-care technology",
    price: 899,
    currency: "EGP",
    category: "home",
    inStock: true,
    rating: 4.5,
  },
  {
    id: "home-004",
    name: "Professional Kitchen Knife Set",
    nameAr: "طقم سكاكين مطبخ احترافي",
    description:
      "طقم سكاكين مطبخ 8 قطع من ستانلس ستيل - professional grade, ergonomic handles, includes knife block",
    price: 2200,
    currency: "EGP",
    category: "home",
    inStock: true,
    rating: 4.6,
  },
  {
    id: "home-005",
    name: "Memory Foam Pillow",
    nameAr: "مخدة ميموري فوم",
    description:
      "مخدة Memory Foam طبية للنوم المريح - orthopedic support, cooling gel layer, hypoallergenic cover",
    price: 550,
    currency: "EGP",
    category: "home",
    inStock: true,
    rating: 4.3,
  },
];
