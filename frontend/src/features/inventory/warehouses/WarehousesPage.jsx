import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Warehouse } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import WarehousesTable from "./WarehousesTable";
import WarehouseForm from "./WarehouseForm";
import { getWarehouses } from "./warehouseService";

export default function WarehousesPage() {
  const [open, setOpen] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingWarehouse, setEditingWarehouse] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadWarehouses() {
    try {
      setLoading(true);
      const data = await getWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error("Error cargando bodegas:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWarehouses();
  }, []);

  function handleCreate() {
    setEditingWarehouse(null);
    setOpen(true);
  }

  function handleEdit(warehouse) {
    setEditingWarehouse(warehouse);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    setEditingWarehouse(null);
  }

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((warehouse) => {
      const matchesSearch =
        warehouse.name.toLowerCase().includes(search.toLowerCase()) ||
        warehouse.code.toLowerCase().includes(search.toLowerCase()) ||
        warehouse.address.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? warehouse.is_active
          : !warehouse.is_active;

      return matchesSearch && matchesStatus;
    });
  }, [warehouses, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Warehouse className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Bodegas</h1>
          </div>
          <p className="text-muted-foreground">
            Administra las bodegas del sistema, su código, dirección y estado.
          </p>
        </div>

        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva bodega
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, código o dirección..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="w-full md:w-[180px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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

          <WarehousesTable
            warehouses={filteredWarehouses}
            loading={loading}
            onEdit={handleEdit}
            onReload={loadWarehouses}
          />
        </CardContent>
      </Card>

      <WarehouseForm
        open={open}
        onClose={handleClose}
        onSuccess={loadWarehouses}
        editingWarehouse={editingWarehouse}
      />
    </div>
  );
}