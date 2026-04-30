import type { PolicyEntry } from "@/types";

/** Cairo Mart FAQ & policies - Egyptian Arabic with English mix */
export const policies: PolicyEntry[] = [
  {
    id: "policy-001",
    question: "إيه سياسة الإرجاع؟ / What is the return policy?",
    answer:
      "تقدر ترجع أي منتج خلال 14 يوم من تاريخ الاستلام بشرط المنتج يكون بحالته الأصلية ومعاك الفاتورة. المنتجات اللي اتفتحت أو اتستخدمت مش بنقبل رجوعها إلا لو فيها عيب صناعة. You can return any product within 14 days of delivery in its original condition with receipt.",
    category: "returns",
  },
  {
    id: "policy-002",
    question: "بتوصلوا في قد إيه؟ / How long does shipping take?",
    answer:
      "التوصيل في القاهرة والجيزة من يوم لـ يومين عمل. المحافظات التانية من 3 لـ 5 أيام عمل. الشحن مجاني للطلبات فوق 500 جنيه. Cairo/Giza: 1-2 business days. Other governorates: 3-5 business days. Free shipping on orders over 500 EGP.",
    category: "shipping",
  },
  {
    id: "policy-003",
    question: "إيه طرق الدفع المتاحة؟ / What payment methods do you accept?",
    answer:
      "بنقبل الدفع عند الاستلام (COD)، فيزا/ماستركارد، فوري، فودافون كاش، وانستاباي. Payment methods: Cash on Delivery (COD), Visa/Mastercard, Fawry, Vodafone Cash, and InstaPay.",
    category: "payment",
  },
  {
    id: "policy-004",
    question: "إيه الضمان على الإلكترونيات؟ / What warranty do electronics have?",
    answer:
      "كل المنتجات الإلكترونية عليها ضمان سنة كاملة ضد عيوب الصناعة. الضمان بيشمل الإصلاح أو الاستبدال مجاناً. الضمان مش بيشمل الأعطال الناتجة عن سوء الاستخدام. All electronics come with a 1-year manufacturer warranty covering defects. Includes free repair or replacement.",
    category: "warranty",
  },
  {
    id: "policy-005",
    question: "إزاي أسترد فلوسي؟ / How do I get a refund?",
    answer:
      "بعد ما نستلم المنتج المرتجع ونتأكد من حالته، الفلوس بترجعلك خلال 5-7 أيام عمل على نفس طريقة الدفع الأصلية. لو كان الدفع عند الاستلام، هنحولك المبلغ على فودافون كاش أو حوالة بريدية. Refunds are processed within 5-7 business days after we receive and inspect the returned item.",
    category: "refunds",
  },
  {
    id: "policy-006",
    question: "أقدر ألغي الطلب؟ / Can I cancel my order?",
    answer:
      "تقدر تلغي طلبك في أي وقت قبل ما يتشحن. لو الطلب اتشحن خلاص، لازم تستنى توصله وبعدين تعمل إرجاع عادي. للإلغاء، كلم خدمة العملاء أو من خلال حسابك على الموقع. You can cancel any order before it ships. Once shipped, you'll need to follow the return process.",
    category: "cancellation",
  },
  {
    id: "policy-007",
    question: "عندكم برنامج ولاء؟ / Do you have a loyalty program?",
    answer:
      "أيوه! برنامج 'نقاط كايرو مارت' - كل 10 جنيه بتصرفهم بتاخد نقطة. لما توصل 100 نقطة تقدر تستبدلهم بخصم 50 جنيه. النقاط بتتجمع أوتوماتيك مع كل طلب. Yes! Cairo Mart Points - earn 1 point per 10 EGP spent. Redeem 100 points for 50 EGP discount.",
    category: "loyalty",
  },
  {
    id: "policy-008",
    question: "بتعملوا أسعار خاصة للطلبات بالجملة؟ / Do you offer bulk pricing?",
    answer:
      "أيوه، للطلبات الكبيرة (أكتر من 10 قطع من نفس المنتج) بنعمل خصم خاص. كلم فريق المبيعات على sales@cairomart.eg أو على الرقم 01000000000. Yes, for bulk orders (10+ units of the same product), we offer special pricing. Contact our sales team.",
    category: "bulk",
  },
  {
    id: "policy-009",
    question: "إيه مواعيد خدمة العملاء؟ / What are customer service hours?",
    answer:
      "خدمة العملاء متاحة كل يوم من السبت للخميس من 9 الصبح لـ 10 بالليل. الجمعة من 2 الضهر لـ 10 بالليل. تقدر تكلمنا على 16XXX أو واتساب على 01000000000. Customer service: Sat-Thu 9AM-10PM, Fri 2PM-10PM.",
    category: "support",
  },
  {
    id: "policy-010",
    question: "لو المنتج وصلني مكسور أعمل إيه؟ / What if I receive a damaged item?",
    answer:
      "لو المنتج وصلك تالف أو مكسور، صوره وكلمنا خلال 48 ساعة وهنبعتلك بديل فوراً أو نرجعلك فلوسك كاملة مع تحمل مصاريف الشحن. مش هتتحمل أي تكلفة إضافية. If you receive a damaged item, photo it and contact us within 48 hours for a free replacement or full refund.",
    category: "damaged",
  },
];
