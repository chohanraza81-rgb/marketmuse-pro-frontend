import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const currencySymbol: Record<string, string> = {
  us: '$',
  pk: '₨',
  gb: '£',
  ae: 'د.إ',
  sa: '﷼',
};

export const countryFlags: Record<string, string> = {
  us: '🇺🇸',
  pk: '🇵🇰',
  gb: '🇬🇧',
  ae: '🇦🇪',
  sa: '🇸🇦',
};
