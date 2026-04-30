import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Check if text contains Arabic characters */
export function isArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/** Get text direction based on content */
export function getTextDirection(text: string): "rtl" | "ltr" {
  return isArabic(text) ? "rtl" : "ltr";
}
