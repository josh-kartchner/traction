import {
  getTodayDateString,
  isDateToday,
  isDateOverdue,
  isDateUpcoming,
  formatDueDate,
  hasDateChanged,
} from "@/lib/date";

describe("date utilities", () => {
  describe("getTodayDateString", () => {
    it("returns a valid date string in YYYY-MM-DD format", () => {
      const result = getTodayDateString();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("isDateToday", () => {
    it("returns true for today's date", () => {
      const today = getTodayDateString();
      expect(isDateToday(today)).toBe(true);
    });

    it("returns false for past dates", () => {
      expect(isDateToday("2020-01-01")).toBe(false);
    });

    it("returns false for future dates", () => {
      expect(isDateToday("2099-12-31")).toBe(false);
    });
  });

  describe("isDateOverdue", () => {
    it("returns true for past dates", () => {
      expect(isDateOverdue("2020-01-01")).toBe(true);
    });

    it("returns false for today", () => {
      const today = getTodayDateString();
      expect(isDateOverdue(today)).toBe(false);
    });

    it("returns false for future dates", () => {
      expect(isDateOverdue("2099-12-31")).toBe(false);
    });
  });

  describe("isDateUpcoming", () => {
    it("returns true for future dates", () => {
      expect(isDateUpcoming("2099-12-31")).toBe(true);
    });

    it("returns false for today", () => {
      const today = getTodayDateString();
      expect(isDateUpcoming(today)).toBe(false);
    });

    it("returns false for past dates", () => {
      expect(isDateUpcoming("2020-01-01")).toBe(false);
    });
  });

  describe("formatDueDate", () => {
    it("returns 'Today' for today's date", () => {
      const today = getTodayDateString();
      expect(formatDueDate(today)).toBe("Today");
    });

    it("returns formatted date for other dates", () => {
      // Test a specific date
      const result = formatDueDate("2026-03-15");
      expect(result).toBe("Mar 15");
    });
  });

  describe("hasDateChanged", () => {
    it("returns false when date has not changed", () => {
      const today = getTodayDateString();
      expect(hasDateChanged(today)).toBe(false);
    });

    it("returns true when date has changed", () => {
      expect(hasDateChanged("2020-01-01")).toBe(true);
    });
  });
});
