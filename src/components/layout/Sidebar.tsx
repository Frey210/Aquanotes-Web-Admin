import { NavLink } from "react-router-dom";
import {
  Activity,
  Bell,
  Cpu,
  Droplets,
  LayoutDashboard,
  Settings,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/AuthProvider";
import { BrandMark } from "@/components/layout/BrandMark";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ponds", label: "Ponds", icon: Droplets, hideForAdmin: true },
  { to: "/devices", label: "Devices", icon: Cpu },
  { to: "/readings", label: "Readings", icon: Activity },
  { to: "/alerts", label: "Alerts", icon: Bell, hideForAdmin: true },
  { to: "/users", label: "Users", icon: Users, adminOnly: true },
  { to: "/settings", label: "Settings", icon: Settings }
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  return (
    <div className="h-full glass-panel rounded-3xl p-6 shadow-card bg-[var(--panel)]">
      <div className="mb-8">
        <BrandMark />
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          if (item.adminOnly && user?.role !== "admin") return null;
          if (item.hideForAdmin && user?.role === "admin") return null;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                  "hover:bg-black/5 dark:hover:bg-white/10",
                  isActive
                    ? "bg-black/10 dark:bg-white/15 text-[var(--text)]"
                    : "text-slate-700 dark:text-slate-200"
                )
              }
              onClick={onNavigate}
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 text-xs text-muted">
        <p>Ocean-grade insights.</p>
        <p>Version 0.1.0</p>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:shrink-0">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden transition",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute left-4 top-4 bottom-4 w-[84vw] max-w-xs transform transition-transform",
          open ? "translate-x-0" : "-translate-x-[120%]"
        )}
      >
        <SidebarContent onNavigate={onClose} />
      </div>
    </div>
  );
}
