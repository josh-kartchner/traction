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

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background pb-14">
      <TopBar title="Settings" />

      <main className="flex-1 p-4">
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
