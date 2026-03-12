import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd/MM/yyyy");
}

export function formatDateLong(date: string | Date): string {
  return format(new Date(date), "d 'de' MMMM yyyy", { locale: es });
}

export function formatMonthYear(date: string | Date): string {
  return format(new Date(date), "MMMM yyyy", { locale: es });
}

/**
 * Validates Chilean RUT.
 * Accepts formats: 12.345.678-9 or 12345678-9
 */
export function isValidRUT(rut: string): boolean {
  const cleaned = rut.replace(/\./g, "").replace(/-/, "");
  if (!/^\d{7,8}[0-9kK]$/.test(cleaned)) return false;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1).toLowerCase();

  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  const expected =
    remainder === 11 ? "0" : remainder === 10 ? "k" : String(remainder);

  return dv === expected;
}

export function formatRUT(rut: string): string {
  const cleaned = rut.replace(/\./g, "").replace(/-/g, "");
  if (cleaned.length < 2) return cleaned;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted}-${dv}`;
}

export function calcRetention(grossAmount: number): number {
  return Math.round(grossAmount * 0.1075);
}

export function calcNet(grossAmount: number): number {
  return grossAmount - calcRetention(grossAmount);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}
