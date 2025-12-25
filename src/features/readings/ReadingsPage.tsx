import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { listDevices } from "@/api/resources/devices";
import { listSensorData } from "@/api/resources/sensor";
import { listAdminSensorData, listAllDevices } from "@/api/resources/adminRole";
import { exportSensorCsv } from "@/api/resources/export";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/AuthProvider";

export function ReadingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data: devices } = useQuery({
    queryKey: isAdmin ? ["admin-devices-all"] : ["devices"],
    queryFn: isAdmin ? listAllDevices : listDevices
  });
  const [selectedUid, setSelectedUid] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const pageSize = 25;

  useEffect(() => {
    setPage(1);
  }, [selectedUid, startDate, endDate]);

  const sortDir = sorting[0]?.desc ? "desc" : "asc";
  const { data: readingsResponse } = useQuery({
    queryKey: ["sensor", selectedUid, startDate, endDate, page, sortDir, isAdmin],
    queryFn: () =>
      isAdmin
        ? listAdminSensorData({
            uid: selectedUid,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            skip: (page - 1) * pageSize,
            limit: pageSize,
            sort_dir: sortDir
          })
        : listSensorData({
            uid: selectedUid,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            skip: (page - 1) * pageSize,
            limit: pageSize,
            sort_dir: sortDir
          }),
    enabled: !!selectedUid
  });

  const tableData = useMemo(() => readingsResponse?.data ?? [], [readingsResponse]);
  const total = readingsResponse?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const selectedDeviceId = useMemo(() => {
    const device = devices?.find((d) => d.uid === selectedUid);
    return device?.id;
  }, [devices, selectedUid]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Readings Explorer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Device</Label>
              <Input
                list="device-options"
                placeholder="Type device name or UID"
                value={selectedUid}
                onChange={(event) => setSelectedUid(event.target.value)}
              />
              <datalist id="device-options">
                {(devices ?? []).map((device) => (
                  <option
                    key={device.uid}
                    value={device.uid}
                    label={
                      "user_name" in device && device.user_name
                        ? `${device.name} (${device.user_name})`
                        : `${device.name} (${device.uid})`
                    }
                  />
                ))}
              </datalist>
            </div>
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  if (selectedDeviceId && startDate && endDate) {
                    exportSensorCsv({
                      device_id: selectedDeviceId,
                      start_date: startDate,
                      end_date: endDate
                    });
                  }
                }}
              >
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sensor Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between pb-4 text-sm text-muted">
            <span>Total records: {total}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                Prev
              </Button>
              <span>Page {page} / {totalPages}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
          <DataTable
            data={tableData}
            columns={columns}
            sorting={sorting}
            onSortingChange={setSorting}
          />
        </CardContent>
      </Card>
    </div>
  );
}

const columns: ColumnDef<{
  id: number;
  timestamp: string;
  suhu: number;
  ph: number;
  do: number;
  tds: number;
  ammonia: number;
  salinitas: number;
}>[] = [
  {
    header: "Timestamp",
    accessorKey: "timestamp",
    cell: ({ row }) => new Date(row.original.timestamp).toLocaleString()
  },
  { header: "Temp", accessorKey: "suhu" },
  { header: "pH", accessorKey: "ph" },
  { header: "DO", accessorKey: "do" },
  { header: "TDS", accessorKey: "tds" },
  { header: "Ammonia", accessorKey: "ammonia" },
  { header: "Salinity", accessorKey: "salinitas" }
];
