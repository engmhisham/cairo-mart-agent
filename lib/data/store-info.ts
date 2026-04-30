import type { StoreInfo } from "@/types";

/** Cairo Mart store information */
export const storeInfo: StoreInfo = {
  name: "Cairo Mart",
  nameAr: "كايرو مارت",
  description:
    "كايرو مارت هو متجر إلكتروني مصري بيقدم أفضل المنتجات بأسعار منافسة. بنوفرلك إلكترونيات، ملابس، ومنتجات منزلية من أشهر الماركات العالمية مع توصيل لحد باب بيتك. Cairo Mart is Egypt's premier online store offering electronics, clothing, and home products from top brands with doorstep delivery.",
  locations: [
    {
      name: "Maadi Branch",
      nameAr: "فرع المعادي",
      address: "15 Street 9, Maadi, Cairo",
      addressAr: "15 شارع 9، المعادي، القاهرة",
      phone: "02-23456789",
    },
    {
      name: "Nasr City Branch",
      nameAr: "فرع مدينة نصر",
      address: "City Stars Mall, Nasr City, Cairo",
      addressAr: "سيتي ستارز مول، مدينة نصر، القاهرة",
      phone: "02-24567890",
    },
    {
      name: "Alexandria Branch",
      nameAr: "فرع الإسكندرية",
      address: "San Stefano Mall, Alexandria",
      addressAr: "سان ستيفانو مول، الإسكندرية",
      phone: "03-34567890",
    },
  ],
  workingHours:
    "السبت - الخميس: 10 الصبح - 10 بالليل | الجمعة: 2 الضهر - 10 بالليل | Sat-Thu: 10AM-10PM | Fri: 2PM-10PM",
  contactEmail: "support@cairomart.eg",
  contactPhone: "16XXX",
  socialMedia: {
    facebook: "facebook.com/cairomart",
    instagram: "@cairomart_eg",
    twitter: "@cairomart",
  },
};
