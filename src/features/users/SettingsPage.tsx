import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateProfile } from "@/api/auth";
import { useAuth } from "@/features/auth/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState(user?.name ?? "");
  const [cooldown, setCooldown] = useState(user?.notification_cooldown_minutes ?? 30);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate({
                name,
                notification_cooldown_minutes: cooldown,
                old_password: oldPassword || undefined,
                new_password: newPassword || undefined
              });
            }}
          >
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div>
              <Label>Notification Cooldown (minutes)</Label>
              <Input
                type="number"
                value={cooldown}
                onChange={(event) => setCooldown(Number(event.target.value))}
              />
            </div>
            <div>
              <Label>Old Password</Label>
              <Input type="password" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} />
            </div>
            <div>
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
            </div>
            <Button type="submit" className="md:col-span-2">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
