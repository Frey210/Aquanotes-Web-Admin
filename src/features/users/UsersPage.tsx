import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { createUser, deleteUser, listUsers, updateUser } from "@/api/resources/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/tables/DataTable";

export function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingUser, setEditingUser] = useState<{
    id: number;
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const pageSize = 25;

  const { data: usersResponse } = useQuery({
    queryKey: ["users", search, roleFilter, page, sorting],
    queryFn: () =>
      listUsers({
        limit: pageSize,
        skip: (page - 1) * pageSize,
        search: search || undefined,
        role: roleFilter || undefined,
        sort_by: sorting[0]?.id,
        sort_dir: sorting[0]?.desc ? "desc" : "asc"
      })
  });
  const users = usersResponse?.data ?? [];
  const total = usersResponse?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success("User created");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; name?: string; email?: string; password?: string; role?: string }) =>
      updateUser(payload.id, {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        role: payload.role
      }),
    onSuccess: () => {
      toast.success("User updated");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create User</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget as HTMLFormElement;
              const data = new FormData(form);
              createMutation.mutate({
                name: data.get("name") as string,
                email: data.get("email") as string,
                password: data.get("password") as string,
                role: data.get("role") as string
              });
              form.reset();
            }}
          >
            <div>
              <Label>Name</Label>
              <Input name="name" required />
            </div>
            <div>
              <Label>Email</Label>
              <Input name="email" type="email" required />
            </div>
            <div>
              <Label>Password</Label>
              <Input name="password" type="password" required />
            </div>
            <div>
              <Label>Role</Label>
              <select name="role" className="w-full rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-2.5 text-sm text-[var(--text)]">
                <option value="operator">Operator</option>
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button type="submit" className="md:col-span-2">Create User</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 pb-4 text-sm">
            <Input
              placeholder="Search name or email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="max-w-xs"
            />
            <select
              className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-2.5 text-sm text-[var(--text)]"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="operator">Operator</option>
              <option value="viewer">Viewer</option>
            </select>
            <div className="ml-auto flex items-center gap-2 text-muted">
              <span>Total: {total}</span>
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
            data={users}
            columns={columns({
              onDelete: deleteMutation.mutate,
              onEdit: (user) => setEditingUser(user)
            })}
            sorting={sorting}
            onSortingChange={setSorting}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit User</CardTitle>
        </CardHeader>
        <CardContent>
          {editingUser ? (
            <form
              className="grid gap-3 md:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget as HTMLFormElement;
                const data = new FormData(form);
                updateMutation.mutate({
                  id: editingUser.id,
                  name: data.get("name") as string,
                  email: data.get("email") as string,
                  password: (data.get("password") as string) || undefined,
                  role: data.get("role") as string
                });
              }}
            >
              <div>
                <Label>Name</Label>
                <Input name="name" defaultValue={editingUser.name} />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" defaultValue={editingUser.email} />
              </div>
              <div>
                <Label>Password (optional)</Label>
                <Input name="password" type="password" />
              </div>
              <div>
                <Label>Role</Label>
                <select
                  name="role"
                  defaultValue={editingUser.role}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] px-4 py-2.5 text-sm text-[var(--text)]"
                >
                  <option value="operator">Operator</option>
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="md:col-span-2 flex gap-3">
                <Button type="submit">Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-muted">Select a user to edit.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const columns = ({
  onDelete,
  onEdit
}: {
  onDelete: (id: number) => void;
  onEdit: (user: { id: number; name: string; email: string; role: string }) => void;
}): ColumnDef<{ id: number; name: string; email: string; role: string; }>[] => [
  { header: "Name", accessorKey: "name" },
  { header: "Email", accessorKey: "email" },
  {
    header: "Role",
    accessorKey: "role",
    cell: ({ row }) => <Badge>{row.original.role}</Badge>
  },
  {
    header: "",
    id: "actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(row.original)}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(row.original.id)}>
          Delete
        </Button>
      </div>
    )
  }
];
