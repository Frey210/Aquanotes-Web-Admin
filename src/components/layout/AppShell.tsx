import { useState } from "react";
import { Sidebar, MobileSidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-atmosphere px-4 py-6 lg:px-10">
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex items-center justify-between lg:hidden mb-6">
        <BrandMark />
        <Button variant="outline" size="sm" onClick={() => setMobileOpen(true)}>
          <Menu size={18} />
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[18rem_1fr] gap-6">
        <Sidebar />
        <main className="space-y-8">
          <Topbar />
          {children}
        </main>
      </div>
    </div>
  );
}
