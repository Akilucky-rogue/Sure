import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatNumber(input: number): string {
  return new Intl.NumberFormat("en-US").format(input);
}

export function formatCurrency(input: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(input);
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}