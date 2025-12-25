import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/layout/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensorLineChart } from "@/components/charts/SensorLineChart";
import { getDeviceStatus } from "@/api/resources/devices";
import { listTambak } from "@/api/resources/tambak";
import { getUnreadCount } from "@/api/resources/notifications";
import { getMonitoring } from "@/api/resources/monitoring";
import { getAdminOverview } from "@/api/resources/adminRole";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/AuthProvider";

export function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ["devices-status"],
    queryFn: getDeviceStatus,
    enabled: !isAdmin
  });
  const { data: tambak, isLoading: tambakLoading } = useQuery({
    queryKey: ["tambak"],
    queryFn: listTambak,
    enabled: !isAdmin
  });
  const { data: unread, isLoading: unreadLoading } = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: getUnreadCount,
    enabled: !isAdmin
  });
  const { data: monitoring } = useQuery({
    queryKey: ["monitoring"],
    queryFn: () => getMonitoring(12),
    enabled: !isAdmin
  });
  const { data: adminOverview, isLoading: adminLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: getAdminOverview,
    enabled: isAdmin
  });

  const chartData = useMemo(() => {
    const kolam = monitoring?.kolam_list?.[0];
    const device = kolam?.devices?.[0];
    return (
      device?.historical_data?.map((item) => ({
        timestamp: item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : "",
        suhu: item.suhu,
        ph: item.ph,
        do: item.do
      })) ?? []
    );
  }, [monitoring]);

  if (isAdmin) {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {adminLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-24" />
            ))
          ) : (
            <>
              <StatCard label="Total Users" value={adminOverview?.total_users ?? 0} />
              <StatCard label="Total Devices" value={adminOverview?.total_devices ?? 0} />
              <StatCard label="Inactive Devices" value={adminOverview?.inactive_devices ?? 0} accent="text-rose-700 dark:text-rose-300" />
              <StatCard label="Total Alerts" value={adminOverview?.total_notifications ?? 0} />
            </>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <p className="text-sm text-muted">Global monitoring for all farms and devices.</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div className="glass-panel rounded-2xl p-4">
                  <p className="text-xs text-muted">Database</p>
                  <p className="font-display text-xl">
                    {adminOverview?.database_ok ? "Connected" : "Down"}
                  </p>
                </div>
                <div className="glass-panel rounded-2xl p-4">
                  <p className="text-xs text-muted">Ponds</p>
                  <p className="font-display text-xl">{adminOverview?.total_kolam ?? 0}</p>
                </div>
                <div className="glass-panel rounded-2xl p-4">
                  <p className="text-xs text-muted">Devices Online</p>
                  <p className="font-display text-xl">{adminOverview?.online_devices ?? 0}</p>
                </div>
                <div className="glass-panel rounded-2xl p-4">
                  <p className="text-xs text-muted">Devices Offline</p>
                  <p className="font-display text-xl">{adminOverview?.offline_devices ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Admin Notes</CardTitle>
              <p className="text-sm text-muted">Use Devices & Users to control operations.</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted">
                <p>Deactivate devices to stop data ingestion.</p>
                <p>Update device status for maintenance cycles.</p>
                <p>Remove users to revoke access.</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statusLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24" />
          ))
        ) : (
          <>
            <StatCard label="Total Ponds" value={tambak?.length ?? 0} hint="Active farms" />
            <StatCard label="Devices Online" value={status?.online ?? 0} accent="text-emerald-700 dark:text-emerald-300" />
            <StatCard label="Devices Offline" value={status?.offline ?? 0} accent="text-rose-700 dark:text-rose-300" />
            <StatCard label="Unread Alerts" value={unreadLoading ? "..." : unread ?? 0} accent="text-amber-700 dark:text-amber-200" />
          </>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Sensor Trends</CardTitle>
            <p className="text-sm text-muted">Latest readings for the selected pond device.</p>
          </CardHeader>
          <CardContent>
            {chartData.length ? (
              <SensorLineChart data={chartData} metric="suhu" />
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-muted">
                No monitoring data yet.
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Farm Snapshot</CardTitle>
            <p className="text-sm text-muted">Tambak and device health overview.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase text-muted">Farms</p>
                <p className="font-display text-2xl">{tambakLoading ? "..." : tambak?.length ?? 0}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted">Maintenance Devices</p>
                <p className="font-display text-2xl">{status?.maintenance ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] p-4 text-sm text-muted">
                Tip: Keep DO levels above 4 mg/L for optimal growth.
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
