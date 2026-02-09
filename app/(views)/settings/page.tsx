"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/navigation/top-bar";
import { BottomTabs } from "@/components/navigation/bottom-tabs";
import { ChevronRight } from "lucide-react";

const settingsItems = [
  {
    icon: "👤",
    label: "Account",
    description: "Magic link authentication",
  },
  {
    icon: "🕐",
    label: "Timezone",
    description: "America/Chicago (CST)",
  },
  {
    icon: "📦",
    label: "Archived Projects",
    description: "0 archived",
  },
  {
    icon: "💾",
    label: "Storage",
    description: "0 MB / 1 GB used",
  },
  {
    icon: "ℹ️",
    label: "About Traction",
    description: "Version 1.0.0",
  },
];

const themeOptions = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-14">
      <TopBar title="Settings" />

      <main className="flex-1 p-4 space-y-4">
        {/* Theme Selector */}
        <div className="rounded-lg border bg-card">
          <div className="flex items-center gap-4 px-4 py-4">
            <span className="text-2xl">🎨</span>
            <div className="flex-1">
              <div className="font-medium">Appearance</div>
              <div className="text-sm text-muted-foreground">
                Choose your preferred theme
              </div>
            </div>
          </div>
          <div className="border-t px-4 py-3">
            <div className="flex gap-2">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    mounted && theme === option.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Other Settings */}
        <div className="divide-y rounded-lg border bg-card">
          {settingsItems.map((item, index) => (
            <button
              key={index}
              className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/50 touch-target"
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <div className="font-medium">{item.label}</div>
                <div className="text-sm text-muted-foreground">
                  {item.description}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </main>

      <BottomTabs />
    </div>
  );
}
