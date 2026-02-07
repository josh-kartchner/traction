import {
  cn,
  formatFileSize,
  truncate,
  getNextSortOrder,
  reorderItems,
} from "@/lib/utils";

describe("utils", () => {
  describe("cn", () => {
    it("merges class names correctly", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("handles conditional classes", () => {
      expect(cn("base", false && "hidden", true && "visible")).toBe(
        "base visible"
      );
    });

    it("handles Tailwind class conflicts", () => {
      expect(cn("px-2", "px-4")).toBe("px-4");
    });
  });

  describe("formatFileSize", () => {
    it("formats bytes correctly", () => {
      expect(formatFileSize(0)).toBe("0 B");
      expect(formatFileSize(500)).toBe("500 B");
    });

    it("formats kilobytes correctly", () => {
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1536)).toBe("1.5 KB");
    });

    it("formats megabytes correctly", () => {
      expect(formatFileSize(1024 * 1024)).toBe("1 MB");
      expect(formatFileSize(5 * 1024 * 1024)).toBe("5 MB");
    });
  });

  describe("truncate", () => {
    it("returns original string if shorter than max", () => {
      expect(truncate("hello", 10)).toBe("hello");
    });

    it("truncates and adds ellipsis if longer than max", () => {
      expect(truncate("hello world", 8)).toBe("hello...");
    });

    it("handles exact length", () => {
      expect(truncate("hello", 5)).toBe("hello");
    });
  });

  describe("getNextSortOrder", () => {
    it("returns 0 for empty array", () => {
      expect(getNextSortOrder([])).toBe(0);
    });

    it("returns max + 1 for populated array", () => {
      const items = [{ sortOrder: 0 }, { sortOrder: 2 }, { sortOrder: 1 }];
      expect(getNextSortOrder(items)).toBe(3);
    });
  });

  describe("reorderItems", () => {
    it("moves item from one position to another", () => {
      const items = [
        { id: "a", sortOrder: 0 },
        { id: "b", sortOrder: 1 },
        { id: "c", sortOrder: 2 },
      ];

      const result = reorderItems(items, 0, 2);

      expect(result.map((i) => i.id)).toEqual(["b", "c", "a"]);
      expect(result.map((i) => i.sortOrder)).toEqual([0, 1, 2]);
    });

    it("handles moving to same position", () => {
      const items = [
        { id: "a", sortOrder: 0 },
        { id: "b", sortOrder: 1 },
      ];

      const result = reorderItems(items, 0, 0);

      expect(result.map((i) => i.id)).toEqual(["a", "b"]);
    });
  });
});
