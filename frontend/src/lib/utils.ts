import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKwacha(amount: number): string {
  return `K${amount.toLocaleString("en-ZM", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatDate(dateString: string | Date | null): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-ZM", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export function formatDateTime(dateString: string | Date | null): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-ZM", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function timeAgo(dateString: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateString.toString());
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
}

export function daysUntil(dateString: string): number {
  const diff = new Date(dateString).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function daysOverdue(dateString: string): number {
  const diff = Date.now() - new Date(dateString).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}
