import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique ID (for optimistic updates before server response)
 */
export function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Calculate the next sort order value
 */
export function getNextSortOrder(items: { sortOrder: number }[]): number {
  if (items.length === 0) return 0;
  return Math.max(...items.map((item) => item.sortOrder)) + 1;
}

/**
 * Reorder items by moving an item from one index to another
 */
export function reorderItems<T extends { id: string; sortOrder: number }>(
  items: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  const result = [...items];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);

  // Update sort orders
  return result.map((item, index) => ({
    ...item,
    sortOrder: index,
  }));
}

/**
 * Debounce function for search/filter inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if we're running on the server
 */
export const isServer = typeof window === "undefined";

/**
 * Check if we're running on iOS Safari
 */
export function isIOSSafari(): boolean {
  if (isServer) return false;
  const ua = window.navigator.userAgent;
  const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
  const webkit = !!ua.match(/WebKit/i);
  return iOS && webkit && !ua.match(/CriOS/i);
}

/**
 * Check if the app is running as a PWA (added to home screen)
 */
export function isRunningAsPWA(): boolean {
  if (isServer) return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}
