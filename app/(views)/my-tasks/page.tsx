import { TopBar } from "@/components/navigation/top-bar";
import { BottomTabs } from "@/components/navigation/bottom-tabs";

export default function MyTasksPage() {
  // TODO: Fetch tasks from API and implement day rollover logic
  const dueTodayCount = 0;
  const upcomingCount = 0;

  return (
    <div className="flex min-h-screen flex-col bg-background pb-14">
      <TopBar
        title="My Tasks"
        subtitle={`${dueTodayCount} due today · ${upcomingCount} upcoming`}
      />

      <main className="flex-1">
        {/* Due Today Section */}
        <section>
          <header className="sticky top-[52px] z-20 flex items-center justify-between border-b bg-muted/50 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground transition-transform">
                ▼
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">
                Due Today
              </span>
            </div>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {dueTodayCount}
            </span>
          </header>

          {dueTodayCount === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No tasks due today
            </div>
          )}
        </section>

        {/* Upcoming Section */}
        <section>
          <header className="sticky top-[52px] z-20 flex items-center justify-between border-b bg-muted/50 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground transition-transform">
                ▼
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">
                Upcoming
              </span>
            </div>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {upcomingCount}
            </span>
          </header>

          {upcomingCount === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No upcoming tasks
            </div>
          )}
        </section>
      </main>

      <BottomTabs />
    </div>
  );
}
