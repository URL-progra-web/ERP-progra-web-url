import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * A reusable Table component — 100% Tailwind, no custom CSS.
 *
 * @param {Array}    columns    - [{ header, accessor, render }]
 * @param {Array}    data       - Array of row objects
 * @param {boolean}  isLoading  - Loading state
 * @param {function} onRowClick - Optional row click callback
 */
const Table = ({ columns, data, isLoading, onRowClick }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-10 gap-3 rounded-lg border border-dashed border-border bg-card text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm">Cargando datos...</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 rounded-lg border border-dashed border-border bg-card text-muted-foreground">
                <p className="text-sm">No hay registros para mostrar.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted border-b border-border">
                    <tr>
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {data.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            onClick={() => onRowClick && onRowClick(row)}
                            className={cn(
                                'transition-colors text-foreground',
                                onRowClick && 'cursor-pointer hover:bg-accent'
                            )}
                        >
                            {columns.map((col, colIndex) => (
                                <td key={colIndex} className="px-4 py-3">
                                    {col.render ? col.render(row) : row[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
