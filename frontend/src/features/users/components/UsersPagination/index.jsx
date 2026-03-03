import React from 'react';
import { Button } from '@/components/ui/button';

const UsersPagination = ({ page, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="p-4 border-t border-border flex items-center justify-end gap-2">
            <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
            >
                Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Siguiente
            </Button>
        </div>
    );
};

export default UsersPagination;
