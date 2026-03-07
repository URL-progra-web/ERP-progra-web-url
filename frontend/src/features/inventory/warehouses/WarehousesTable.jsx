import { Pencil, Power } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { deactivateWarehouse } from "./warehouseService";

export default function WarehousesTable({
  warehouses,
  loading,
  onEdit,
  onReload,
}) {
  async function handleDeactivate(id) {
    try {
      await deactivateWarehouse(id);
      onReload();
    } catch (error) {
      console.error("Error al desactivar bodega:", error);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando bodegas...</p>;
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-[180px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {warehouses.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground h-24"
              >
                No hay bodegas registradas.
              </TableCell>
            </TableRow>
          ) : (
            warehouses.map((warehouse) => (
              <TableRow key={warehouse.id}>
                <TableCell className="font-medium">{warehouse.name}</TableCell>
                <TableCell>{warehouse.code}</TableCell>
                <TableCell>{warehouse.address}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      warehouse.is_active
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-200"
                    }
                  >
                    {warehouse.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(warehouse)}
                      className="gap-1"
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeactivate(warehouse.id)}
                      className="gap-1 text-red-600 hover:text-red-700"
                    >
                      <Power className="h-4 w-4" />
                      Desactivar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}