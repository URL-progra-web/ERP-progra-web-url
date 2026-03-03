import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const UsersFilters = ({ search, onSearchChange, statusFilter, onStatusChange }) => {
    return (
        <div className="p-4 flex flex-col sm:flex-row gap-4 border-b border-border items-center justify-between">
            <div className="w-full sm:max-w-xs">
                <Input
                    placeholder="Buscar por email o nombre..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <div className="w-full sm:w-48">
                <Select
                    value={statusFilter}
                    onValueChange={(val) => onStatusChange(val)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Activos</SelectItem>
                        <SelectItem value="inactive">Inactivos</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

export default UsersFilters;
