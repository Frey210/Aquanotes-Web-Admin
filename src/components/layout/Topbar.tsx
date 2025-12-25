import { useMemo, useState } from "react";
import { Bell, LogOut, Moon, Sun } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/app/ThemeProvider";
import { useAuth } from "@/features/auth/AuthProvider";
import { cn } from "@/lib/utils";
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "@/api/resources/notifications";

export function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: unreadCount } = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: getUnreadCount,
    enabled: !isAdmin
  });
  const { data: notifications } = useQuery({
    queryKey: ["notifications", open],
    queryFn: () => listNotifications({ days: 14, unread_only: false, limit: 10 }),
    enabled: !isAdmin && open
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    }
  });
  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    }
  });

  const unreadLabel = useMemo(() => (unreadCount && unreadCount > 99 ? "99+" : unreadCount ?? 0), [unreadCount]);

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm text-muted">Welcome back</p>
        <h1 className="font-display text-2xl lg:text-3xl">{user?.name ?? "Operator"}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={toggleTheme}
          className={cn(
            "glass-panel px-4 py-2 rounded-2xl text-sm flex items-center gap-2",
            "hover:border-ocean-400/60 transition"
          )}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          {theme === "dark" ? "Light" : "Dark"}
        </button>
        {!isAdmin && (
          <div className="relative">
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="glass-panel px-4 py-2 rounded-2xl text-sm flex items-center gap-2"
            >
              <Bell size={16} />
              Notifications
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-ocean-500/20 px-2 py-0.5 text-xs text-[var(--text)]">
                {unreadLabel}
              </span>
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl glass-panel shadow-card p-4 z-20">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">Recent alerts</p>
                  <button
                    onClick={() => markAllMutation.mutate()}
                    className="text-xs text-ocean-500 hover:text-ocean-600"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="space-y-3 max-h-72 overflow-auto">
                  {(notifications ?? []).map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => markReadMutation.mutate(notif.id)}
                      className={cn(
                        "w-full text-left rounded-xl p-3 border text-sm",
                        notif.is_read
                          ? "border-[var(--border)] text-muted"
                          : "border-ocean-400/40 text-[var(--text)]"
                      )}
                    >
                      <p className="font-medium">{notif.device_name}</p>
                      <p className="text-xs text-muted">{notif.message}</p>
                      <p className="text-[11px] text-muted mt-1">
                        {new Date(notif.timestamp).toLocaleString()}
                      </p>
                    </button>
                  ))}
                  {!notifications?.length && (
                    <p className="text-sm text-muted">No notifications yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => logout()}
          className="px-4 py-2 rounded-2xl text-sm flex items-center gap-2 bg-ocean-500/20 border border-ocean-400/40 text-[var(--text)] hover:bg-ocean-500/30 transition"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </header>
  );
}
