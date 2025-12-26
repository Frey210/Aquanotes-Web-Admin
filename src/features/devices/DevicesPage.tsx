import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createDevice,
  deleteDevice,
  getDeviceStatus,
  listDevices,
  setMaintenance,
  setOnline,
  updateInterval
} from "@/api/resources/devices";
import {
  activateDevice,
  deactivateDevice,
  listAllDevices,
  scheduleDeviceDeactivation,
  setAdminDeviceStatus
} from "@/api/resources/adminRole";
import { listAdminDevices, registerAdminDevice } from "@/api/resources/admin";
import { listSensorData } from "@/api/resources/sensor";
import type { AdminDevice, Device } from "@/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TRow } from "@/components/ui/table";
import { SensorLineChart } from "@/components/charts/SensorLineChart";
import { useAuth } from "@/features/auth/AuthProvider";

const ADMIN_KEY_STORAGE = "aquanotes_admin_api_key";

export function DevicesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data: devices } = useQuery({
    queryKey: isAdmin ? ["admin-devices-all"] : ["devices"],
    queryFn: isAdmin ? listAllDevices : listDevices
  });
  const { data: status } = useQuery({
    queryKey: ["devices-status"],
    queryFn: getDeviceStatus,
    enabled: !isAdmin
  });
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [adminApiKey, setAdminApiKey] = useState<string>(() => localStorage.getItem(ADMIN_KEY_STORAGE) || "");
  const [scheduleValue, setScheduleValue] = useState<string>("");

  const formatTimestamp = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  const toLocalInputValue = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (num: number) => String(num).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hour}:${minute}`;
  };

  const adminDevices = useMemo(
    () => (isAdmin ? ((devices ?? []) as AdminDevice[]) : []),
    [devices, isAdmin]
  );
  const userDevices = useMemo(
    () => (!isAdmin ? ((devices ?? []) as Device[]) : []),
    [devices, isAdmin]
  );

  const selectedDevice = useMemo(() => {
    const pool = isAdmin ? adminDevices : userDevices;
    return pool.find((device) => device.id === selectedDeviceId) ?? null;
  }, [adminDevices, userDevices, selectedDeviceId, isAdmin]);
  const selectedUserDevice = !isAdmin ? (selectedDevice as Device | null) : null;

  useEffect(() => {
    setScheduleValue(toLocalInputValue(selectedDevice?.deactivate_at ?? null));
  }, [selectedDevice]);

  const { data: sensorResponse } = useQuery({
    queryKey: ["sensor", selectedDevice?.uid, isAdmin],
    queryFn: () =>
      listSensorData({
        uid: selectedDevice?.uid ?? "",
        limit: 30,
        sort_dir: "desc"
      }),
    enabled: !!selectedDevice?.uid && !isAdmin
  });

  const sensorTrend = useMemo(() => {
    const data = sensorResponse?.data ?? [];
    return data
      .slice()
      .reverse()
      .map((item) => ({
        timestamp: new Date(item.timestamp).toLocaleTimeString(),
        suhu: item.suhu,
        ph: item.ph,
        do: item.do
      }));
  }, [sensorResponse]);

  useEffect(() => {
    localStorage.setItem(ADMIN_KEY_STORAGE, adminApiKey);
  }, [adminApiKey]);

  const { data: adminProvisionedDevices } = useQuery({
    queryKey: ["admin-devices", adminApiKey],
    queryFn: () => listAdminDevices(adminApiKey),
    enabled: user?.role === "admin" && !!adminApiKey
  });

  const createMutation = useMutation({
    mutationFn: createDevice,
    onSuccess: () => {
      toast.success("Device claimed");
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["devices-status"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDevice,
    onSuccess: () => {
      toast.success("Device removed");
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    }
  });

  const adminStatusMutation = useMutation({
    mutationFn: (payload: { id: number; status: "online" | "offline" | "maintenance" }) =>
      setAdminDeviceStatus(payload.id, payload.status),
    onSuccess: () => {
      toast.success("Device status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-devices-all"] });
    }
  });

  const adminDeactivateMutation = useMutation({
    mutationFn: deactivateDevice,
    onSuccess: () => {
      toast.success("Device deactivated");
      queryClient.invalidateQueries({ queryKey: ["admin-devices-all"] });
    }
  });

  const adminActivateMutation = useMutation({
    mutationFn: activateDevice,
    onSuccess: () => {
      toast.success("Device activated");
      queryClient.invalidateQueries({ queryKey: ["admin-devices-all"] });
    }
  });

  const adminScheduleMutation = useMutation({
    mutationFn: (payload: { id: number; deactivate_at: string | null }) =>
      scheduleDeviceDeactivation(payload.id, payload.deactivate_at),
    onSuccess: () => {
      toast.success("Deactivate schedule updated");
      queryClient.invalidateQueries({ queryKey: ["admin-devices-all"] });
    }
  });

  const registerAdminMutation = useMutation({
    mutationFn: (uid: string) => registerAdminDevice(adminApiKey, uid),
    onSuccess: () => {
      toast.success("Admin device registered");
      queryClient.invalidateQueries({ queryKey: ["admin-devices", adminApiKey] });
    }
  });

  return (
    <div className="space-y-6">
      {!isAdmin && (
        <section className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Device Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Online</span><span>{status?.online ?? 0}</span></div>
                <div className="flex justify-between"><span>Offline</span><span>{status?.offline ?? 0}</span></div>
                <div className="flex justify-between"><span>Maintenance</span><span>{status?.maintenance ?? 0}</span></div>
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Claim Device</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-3 md:grid-cols-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget as HTMLFormElement;
                  const data = new FormData(form);
                  createMutation.mutate({
                    uid: data.get("uid") as string,
                    name: data.get("name") as string
                  });
                  form.reset();
                }}
              >
                <div>
                  <Label>Device UID</Label>
                  <Input name="uid" required />
                </div>
                <div>
                  <Label>Device Name</Label>
                  <Input name="name" required />
                </div>
                <Button type="submit" className="md:col-span-2">Claim Device</Button>
              </form>
            </CardContent>
          </Card>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{isAdmin ? "All Devices" : "Devices"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[720px]">
                <THead>
                <TRow>
                  <TH>Name</TH>
                  <TH>UID</TH>
                  {isAdmin && <TH>Owner</TH>}
                  <TH>Status</TH>
                  <TH>Last Seen</TH>
                  <TH>Active</TH>
                  {!isAdmin && <TH>Interval (min)</TH>}
                  <TH>Actions</TH>
                </TRow>
              </THead>
              <TBody>
                {isAdmin &&
                  adminDevices.map((device) => (
                    <TRow key={device.id} className={selectedDeviceId === device.id ? "bg-black/5 dark:bg-white/10" : undefined}>
                      <TD>
                        <button className="text-left" onClick={() => setSelectedDeviceId(device.id)}>
                          {device.name}
                        </button>
                      </TD>
                      <TD>{device.uid}</TD>
                      <TD>{device.user_name ?? "-"}</TD>
                      <TD>
                        <Badge
                          variant={
                            device.status === "online"
                              ? "success"
                              : device.status === "maintenance"
                                ? "warning"
                                : "danger"
                          }
                        >
                          {device.status ?? "offline"}
                        </Badge>
                      </TD>
                      <TD>{formatTimestamp(device.last_seen)}</TD>
                      <TD>
                        <Badge variant={device.is_active === false ? "danger" : "success"}>
                          {device.is_active === false ? "Inactive" : "Active"}
                        </Badge>
                      </TD>
                      <TD className="space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => adminStatusMutation.mutate({ id: device.id, status: "online" })}
                        >
                          Online
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => adminStatusMutation.mutate({ id: device.id, status: "maintenance" })}
                        >
                          Maintenance
                        </Button>
                        {device.is_active === false ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => adminActivateMutation.mutate(device.id)}
                          >
                            Activate
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => adminDeactivateMutation.mutate(device.id)}
                          >
                            Deactivate
                          </Button>
                        )}
                      </TD>
                    </TRow>
                  ))}
                {!isAdmin &&
                  userDevices.map((device) => (
                    <TRow key={device.id} className={selectedDeviceId === device.id ? "bg-black/5 dark:bg-white/10" : undefined}>
                      <TD>
                        <button className="text-left" onClick={() => setSelectedDeviceId(device.id)}>
                          {device.name}
                        </button>
                      </TD>
                      <TD>{device.uid}</TD>
                      <TD>
                        <Badge
                          variant={
                            device.status === "online"
                              ? "success"
                              : device.status === "maintenance"
                                ? "warning"
                                : "danger"
                          }
                        >
                          {device.status ?? "offline"}
                        </Badge>
                      </TD>
                      <TD>{formatTimestamp(device.last_seen)}</TD>
                      <TD>
                        <Badge variant={device.is_active === false ? "danger" : "success"}>
                          {device.is_active === false ? "Inactive" : "Active"}
                        </Badge>
                      </TD>
                      <TD>{device.connection_interval ?? 5}</TD>
                      <TD className="space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setOnline(device.id).then(() => queryClient.invalidateQueries({ queryKey: ["devices"] }))}
                        >
                          Online
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMaintenance(device.id).then(() => queryClient.invalidateQueries({ queryKey: ["devices"] }))}
                        >
                          Maintenance
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateInterval(device.id, 10).then(() => queryClient.invalidateQueries({ queryKey: ["devices"] }))}
                        >
                          Interval 10m
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(device.uid)}
                        >
                          Remove
                        </Button>
                      </TD>
                    </TRow>
                  ))}
                {!devices?.length && (
                  <TRow>
                    <TD colSpan={isAdmin ? 7 : 6} className="text-muted">No devices yet.</TD>
                  </TRow>
                )}
              </TBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Device Detail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 min-w-0">
            {selectedDevice ? (
              <>
                <div>
                  <p className="text-xs text-muted">Device</p>
                  <p className="font-display text-xl">{selectedDevice.name}</p>
                  <p className="text-xs text-muted break-all">{selectedDevice.uid}</p>
                </div>
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted">Status</p>
                    <p>{selectedDevice.status ?? "offline"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Last Seen</p>
                    <p>{formatTimestamp(selectedDevice.last_seen)}</p>
                  </div>
                  {!isAdmin && (
                    <div>
                      <p className="text-xs text-muted">Interval</p>
                      <p>{selectedUserDevice?.connection_interval ?? 5} min</p>
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <div className="space-y-2 text-sm">
                    <p className="text-xs text-muted">Schedule Deactivate (local time, saved as UTC)</p>
                    <Input
                      type="datetime-local"
                      className="w-full"
                      value={scheduleValue}
                      onChange={(event) => setScheduleValue(event.target.value)}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          if (!selectedDevice) return;
                          if (!scheduleValue) {
                            toast.error("Pick a schedule datetime");
                            return;
                          }
                          const iso = new Date(scheduleValue).toISOString();
                          adminScheduleMutation.mutate({ id: selectedDevice.id, deactivate_at: iso });
                        }}
                      >
                        Set Schedule
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (!selectedDevice) return;
                          setScheduleValue("");
                          adminScheduleMutation.mutate({ id: selectedDevice.id, deactivate_at: null });
                        }}
                      >
                        Clear Schedule
                      </Button>
                    </div>
                    {selectedDevice.deactivate_at && (
                      <p className="text-xs text-muted break-words">
                        Current: {formatTimestamp(selectedDevice.deactivate_at)}
                      </p>
                    )}
                  </div>
                )}
                {!isAdmin && <SensorLineChart data={sensorTrend} metric="suhu" />}
                {isAdmin && (
                  <p className="text-xs text-muted">Admin can inspect readings from the Readings page.</p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted">Select a device to view details.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {user?.role === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Device Provisioning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <Label>Admin API Key</Label>
                <Input
                  value={adminApiKey}
                  onChange={(event) => setAdminApiKey(event.target.value)}
                  placeholder="X-API-Key value"
                />
              </div>
              <form
                className="grid gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget as HTMLFormElement;
                  const data = new FormData(form);
                  const uid = data.get("uid") as string;
                  if (!adminApiKey) {
                    toast.error("Set Admin API Key first");
                    return;
                  }
                  registerAdminMutation.mutate(uid);
                  form.reset();
                }}
              >
                <Label>Register UID</Label>
                <Input name="uid" required />
                <Button type="submit">Register Device UID</Button>
              </form>
            </div>

            <div className="w-full overflow-x-auto">
              <Table className="min-w-[640px]">
              <THead>
                <TRow>
                  <TH>ID</TH>
                  <TH>UID</TH>
                  <TH>Owner</TH>
                  <TH>Status</TH>
                </TRow>
              </THead>
              <TBody>
                {(adminProvisionedDevices ?? []).map((device) => (
                  <TRow key={device.id}>
                    <TD>{device.id}</TD>
                    <TD>{device.uid}</TD>
                    <TD>{device.user_name ?? "-"}</TD>
                    <TD>
                      <Badge variant={device.registered ? "success" : "warning"}>
                        {device.registered ? "Assigned" : "Unassigned"}
                      </Badge>
                    </TD>
                  </TRow>
                ))}
                {!adminDevices?.length && (
                  <TRow>
                    <TD colSpan={4} className="text-muted">No admin devices loaded.</TD>
                  </TRow>
                )}
              </TBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
