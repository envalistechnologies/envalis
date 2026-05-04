import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./EmptyStates";
import { Ghost } from "@phosphor-icons/react";

const DataTable = ({ columns, data, loading, emptyTitle, emptyMessage, onRowClick }) => {
    if (loading) {
        return (
            <div className="rounded-lg border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead key={col.key} className={col.className}>{col.label}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <TableRow key={i}>
                                {columns.map((col) => (
                                    <TableCell key={col.key}>
                                        <Skeleton className="h-5 w-full rounded" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    return (
        <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                        {columns.map((col) => (
                            <TableHead key={col.key} className={col.className}>
                                {col.label}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {!data?.length ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="p-0">
                                <EmptyState
                                    icon={Ghost}
                                    title={emptyTitle || "No records found"}
                                    message={emptyMessage || "Try adjusting your search or filters."}
                                />
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((row, idx) => (
                            <TableRow
                                key={row._id || idx}
                                onClick={() => onRowClick?.(row)}
                                className={onRowClick ? "cursor-pointer" : undefined}
                            >
                                {columns.map((col) => (
                                    <TableCell key={col.key} className={col.className}>
                                        {col.render ? col.render(row) : row[col.key] ?? "—"}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default DataTable;