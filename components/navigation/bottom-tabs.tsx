"use client";

import { cn } from "@/lib/utils";
import { Home, CheckSquare, BarChart3, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/my-tasks", icon: CheckSquare, label: "My Tasks" },
  { href: "/report", icon: BarChart3, label: "Report" },
  { href: "/settings", icon: Settings, label: "Settings" },
] as const;

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center border-t bg-background pb-safe">
      {tabs.map(({ href, icon: Icon, label }) => {
        // Check if this tab is active
        const isActive =
          href === "/"
            ? pathname === "/" || pathname.startsWith("/projects")
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 pt-2 pb-1 transition-colors touch-target",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
            <span
              className={cn(
                "text-[10px] tracking-wide",
                isActive ? "font-bold" : "font-medium"
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
