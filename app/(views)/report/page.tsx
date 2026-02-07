import { TopBar } from "@/components/navigation/top-bar";
import { BottomTabs } from "@/components/navigation/bottom-tabs";
import { STATUS_CONFIG } from "@/lib/types";

export default function ReportPage() {
  // TODO: Fetch all tasks from API grouped by status
  const statusGroups = {
    not_started: [],
    in_progress: [],
    on_hold: [],
    completed: [],
  };

  const totalTasks = Object.values(statusGroups).flat().length;

  return (
    <div className="flex min-h-screen flex-col bg-background pb-14">
      <TopBar
        title="Status Report"
        subtitle={`${totalTasks} total tasks across all projects`}
      />

      <main className="flex-1">
        {(Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[]).map(
          (status) => {
            const config = STATUS_CONFIG[status];
            const tasks = statusGroups[status];

            return (
              <section key={status}>
                <header
                  className="sticky top-[52px] z-20 flex items-center justify-between border-b px-4 py-2.5"
                  style={{ backgroundColor: config.bgColor }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs transition-transform"
                      style={{ color: config.color }}
                    >
                      ▼
                    </span>
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {config.label}
                    </span>
                  </div>
                  <span
                    className="rounded-full border bg-background px-2 py-0.5 text-[11px] font-semibold"
                    style={{
                      color: config.color,
                      borderColor: `${config.color}30`,
                    }}
                  >
                    {tasks.length}
                  </span>
                </header>

                {tasks.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No {config.label.toLowerCase()} tasks
                  </div>
                )}
              </section>
            );
          }
        )}
      </main>

      <BottomTabs />
    </div>
  );
}
