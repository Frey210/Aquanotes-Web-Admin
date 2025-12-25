import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type OnChangeFn,
  SortingState,
  useReactTable
} from "@tanstack/react-table";
import { Table, TBody, TD, TH, THead, TRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  sorting,
  onSortingChange
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <Table>
      <THead>
        {table.getHeaderGroups().map((headerGroup) => (
          <TRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TH key={header.id}>
                {header.isPlaceholder ? null : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </Button>
                )}
              </TH>
            ))}
          </TRow>
        ))}
      </THead>
      <TBody>
        {table.getRowModel().rows.map((row) => (
          <TRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TD key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TD>
            ))}
          </TRow>
        ))}
        {!table.getRowModel().rows.length && (
          <TRow>
            <TD colSpan={columns.length} className="text-muted">No data available.</TD>
          </TRow>
        )}
      </TBody>
    </Table>
  );
}
