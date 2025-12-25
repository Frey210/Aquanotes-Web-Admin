import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "@/api/resources/notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TRow } from "@/components/ui/table";
import { useAuth } from "@/features/auth/AuthProvider";

export function AlertsPage() {
  const { user } = useAuth();
  if (user?.role === "admin") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">Global alerts view is not enabled yet. Use Users & Devices to investigate.</p>
        </CardContent>
      </Card>
    );
  }
  const queryClient = useQueryClient();
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => listNotifications({ days: 30, unread_only: false, limit: 100 })
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Alerts & Notifications</CardTitle>
          <Button variant="outline" onClick={() => markAllMutation.mutate()}>Mark all read</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TRow>
                <TH>Device</TH>
                <TH>Message</TH>
                <TH>Parameter</TH>
                <TH>Value</TH>
                <TH>Status</TH>
                <TH></TH>
              </TRow>
            </THead>
            <TBody>
              {(notifications ?? []).map((alert) => (
                <TRow key={alert.id}>
                  <TD>{alert.device_name}</TD>
                  <TD>{alert.message}</TD>
                  <TD>{alert.parameter}</TD>
                  <TD>{alert.current_value}</TD>
                  <TD>
                    <Badge variant={alert.is_read ? "default" : "warning"}>
                      {alert.is_read ? "Read" : "Unread"}
                    </Badge>
                  </TD>
                  <TD>
                    {!alert.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markReadMutation.mutate(alert.id)}
                      >
                        Mark read
                      </Button>
                    )}
                  </TD>
                </TRow>
              ))}
              {!notifications?.length && (
                <TRow>
                  <TD colSpan={6} className="text-muted">No alerts yet.</TD>
                </TRow>
              )}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
