import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { CalendarDays, LayoutDashboard, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsAdmin } from "./hooks/useQueries";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import SchedulePage from "./pages/SchedulePage";

type Tab = "schedule" | "admin";

function AppShell() {
  const { identity, clear, isInitializing } = useInternetIdentity();
  const { isFetching } = useActor();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const [activeTab, setActiveTab] = useState<Tab>("schedule");

  const isAuthenticated = !!identity;
  const isLoading = isInitializing || isFetching;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ─── Top Nav ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border/60">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-bold text-base tracking-tight text-foreground">
              Daily Routine
            </span>
          </div>

          {/* Tabs */}
          <nav className="flex items-center gap-1 flex-1 justify-center">
            <button
              type="button"
              data-ocid="schedule.tab"
              onClick={() => setActiveTab("schedule")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === "schedule"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">My Schedule</span>
            </button>

            {isAdminLoading ? (
              <Skeleton className="h-8 w-20 rounded-lg" />
            ) : isAdmin ? (
              <button
                type="button"
                data-ocid="admin.tab"
                onClick={() => setActiveTab("admin")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  activeTab === "admin"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            ) : null}
          </nav>

          {/* User actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-2.5 py-1.5 rounded-lg">
              <User className="w-3 h-3" />
              <span className="max-w-[80px] truncate font-mono">
                {identity?.getPrincipal().toString().slice(0, 8)}…
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2.5 gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─────────────────────────────────────── */}
      <main className="flex-1">
        {isLoading ? (
          <div
            data-ocid="schedule.loading_state"
            className="max-w-3xl mx-auto px-4 py-8 space-y-4"
          >
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-40" />
            <div className="mt-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ) : activeTab === "schedule" ? (
          <SchedulePage />
        ) : (
          <AdminPage />
        )}
      </main>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer className="py-5 px-4 text-center border-t border-border/40 mt-auto">
        <p className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()}. Built with{" "}
          <span className="text-primary/70">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/80 hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(1 0 0)",
            border: "1px solid oklch(0.9 0.01 90)",
            color: "oklch(0.2 0.02 85)",
            fontSize: "0.875rem",
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return <AppShell />;
}
