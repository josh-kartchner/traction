import { format, isToday, isBefore, isAfter, parseISO, startOfDay } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

// CST timezone as specified in PRD (America/Chicago)
export const APP_TIMEZONE = "America/Chicago";

/**
 * Get the current date in CST timezone
 */
export function getTodayInCST(): Date {
  return toZonedTime(new Date(), APP_TIMEZONE);
}

/**
 * Get today's date as an ISO string (YYYY-MM-DD) in CST
 */
export function getTodayDateString(): string {
  const today = getTodayInCST();
  return format(today, "yyyy-MM-dd");
}

/**
 * Check if a date string is today in CST
 */
export function isDateToday(dateStr: string): boolean {
  const date = parseISO(dateStr);
  const today = startOfDay(getTodayInCST());
  const compareDate = startOfDay(toZonedTime(date, APP_TIMEZONE));
  return format(today, "yyyy-MM-dd") === format(compareDate, "yyyy-MM-dd");
}

/**
 * Check if a date string is before today in CST (overdue)
 */
export function isDateOverdue(dateStr: string): boolean {
  const date = parseISO(dateStr);
  const today = startOfDay(getTodayInCST());
  const compareDate = startOfDay(toZonedTime(date, APP_TIMEZONE));
  return isBefore(compareDate, today);
}

/**
 * Check if a date string is after today in CST (upcoming)
 */
export function isDateUpcoming(dateStr: string): boolean {
  const date = parseISO(dateStr);
  const today = startOfDay(getTodayInCST());
  const compareDate = startOfDay(toZonedTime(date, APP_TIMEZONE));
  return isAfter(compareDate, today);
}

/**
 * Check if a date is due today or overdue
 */
export function isDueTodayOrOverdue(dateStr: string): boolean {
  return isDateToday(dateStr) || isDateOverdue(dateStr);
}

/**
 * Format a date for display
 */
export function formatDueDate(dateStr: string): string {
  if (isDateToday(dateStr)) {
    return "Today";
  }
  const date = parseISO(dateStr);
  return format(date, "MMM d");
}

/**
 * Format a date with full month and year
 */
export function formatDateFull(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, "MMMM d, yyyy");
}

/**
 * Format a timestamp for comments/activity
 */
export function formatTimestamp(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  const zonedDate = toZonedTime(d, APP_TIMEZONE);

  if (isToday(zonedDate)) {
    return format(zonedDate, "'Today at' h:mm a");
  }

  return format(zonedDate, "MMM d 'at' h:mm a");
}

/**
 * Convert a local date input to UTC for storage
 */
export function localDateToUTC(dateStr: string): Date {
  return fromZonedTime(parseISO(dateStr), APP_TIMEZONE);
}

/**
 * Day rollover check - returns true if the date has changed since last check
 * Used for client-side interval checking as per PRD section 4.5
 */
export function hasDateChanged(lastCheckedDate: string): boolean {
  const currentDate = getTodayDateString();
  return currentDate !== lastCheckedDate;
}
