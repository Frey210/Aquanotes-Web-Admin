import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listTambak, createTambak } from "@/api/resources/tambak";
import { listKolam, createKolam } from "@/api/resources/kolam";
import { listDevices } from "@/api/resources/devices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TBody, TD, TH, THead, TRow } from "@/components/ui/table";
import { useAuth } from "@/features/auth/AuthProvider";

export function PondsPage() {
  const { user } = useAuth();
  if (user?.role === "admin") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin View</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted">Admin tidak memiliki tambak/kolam. Gunakan halaman Devices & Users untuk monitoring.</p>
        </CardContent>
      </Card>
    );
  }
  const queryClient = useQueryClient();
  const { data: tambak } = useQuery({ queryKey: ["tambak"], queryFn: listTambak });
  const [selectedTambakId, setSelectedTambakId] = useState<number | null>(null);

  const activeTambakId = selectedTambakId ?? tambak?.[0]?.id ?? null;

  const { data: kolam } = useQuery({
    queryKey: ["kolam", activeTambakId],
    queryFn: () => (activeTambakId ? listKolam(activeTambakId) : Promise.resolve([])),
    enabled: !!activeTambakId
  });

  const { data: devices } = useQuery({ queryKey: ["devices"], queryFn: listDevices });

  const createTambakMutation = useMutation({
    mutationFn: createTambak,
    onSuccess: () => {
      toast.success("Tambak created");
      queryClient.invalidateQueries({ queryKey: ["tambak"] });
    }
  });

  const createKolamMutation = useMutation({
    mutationFn: createKolam,
    onSuccess: () => {
      toast.success("Kolam created");
      queryClient.invalidateQueries({ queryKey: ["kolam", activeTambakId] });
    }
  });

  const availableDevices = useMemo(
    () => (devices ?? []).map((device) => device.id),
    [devices]
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Tambak Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {(tambak ?? []).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedTambakId(item.id)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm ${
                    activeTambakId === item.id
                      ? "border-ocean-400/60 bg-ocean-500/10"
                      : "border-[var(--border)] hover:border-ocean-400/40"
                  }`}
                >
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted">{item.city}, {item.province}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Create Tambak</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget as HTMLFormElement;
                const data = new FormData(form);
                createTambakMutation.mutate({
                  name: data.get("name") as string,
                  country: data.get("country") as string,
                  province: data.get("province") as string,
                  city: data.get("city") as string,
                  district: data.get("district") as string,
                  village: data.get("village") as string,
                  address: data.get("address") as string,
                  cultivation_type: data.get("cultivation_type") as string
                });
                form.reset();
              }}
            >
              <Label>Name</Label>
              <Input name="name" required />
              <Label>Country</Label>
              <Input name="country" required />
              <Label>Province</Label>
              <Input name="province" required />
              <Label>City</Label>
              <Input name="city" required />
              <Label>District</Label>
              <Input name="district" required />
              <Label>Village</Label>
              <Input name="village" required />
              <Label>Address</Label>
              <Input name="address" required />
              <Label>Cultivation Type</Label>
              <Input name="cultivation_type" required />
              <Button type="submit">Create Tambak</Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Kolam for Selected Tambak</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TRow>
                <TH>Name</TH>
                <TH>Commodity</TH>
              </TRow>
            </THead>
            <TBody>
              {(kolam ?? []).map((item) => (
                <TRow key={item.id}>
                  <TD>{item.nama}</TD>
                  <TD>{item.komoditas}</TD>
                </TRow>
              ))}
              {!kolam?.length && (
                <TRow>
                  <TD colSpan={2} className="text-muted">No kolam for this tambak.</TD>
                </TRow>
              )}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create Kolam</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!activeTambakId) return;
              const form = event.currentTarget as HTMLFormElement;
              const data = new FormData(form);
              createKolamMutation.mutate({
                nama: data.get("nama") as string,
                tipe: data.get("tipe") as string,
                panjang: Number(data.get("panjang")),
                lebar: Number(data.get("lebar")),
                kedalaman: Number(data.get("kedalaman")),
                komoditas: data.get("komoditas") as string,
                tambak_id: activeTambakId,
                device_id: Number(data.get("device_id"))
              });
              form.reset();
            }}
          >
            <Label>Name</Label>
            <Input name="nama" required />
            <Label>Type</Label>
            <Input name="tipe" required />
            <Label>Length (m)</Label>
            <Input name="panjang" type="number" step="0.1" required />
            <Label>Width (m)</Label>
            <Input name="lebar" type="number" step="0.1" required />
            <Label>Depth (m)</Label>
            <Input name="kedalaman" type="number" step="0.1" required />
            <Label>Commodity</Label>
            <Input name="komoditas" required />
            <Label>Device ID</Label>
            <Input name="device_id" type="number" required />
            <p className="text-xs text-muted">
              Available devices: {availableDevices.join(", ") || "None"}
            </p>
            <Button type="submit">Create Kolam</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
