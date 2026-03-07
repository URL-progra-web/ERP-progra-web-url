import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { createWarehouse, updateWarehouse } from "./warehouseService";

export default function WarehouseForm({
  open,
  onClose,
  onSuccess,
  editingWarehouse,
}) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    is_active: true,
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingWarehouse) {
      setFormData({
        name: editingWarehouse.name || "",
        code: editingWarehouse.code || "",
        address: editingWarehouse.address || "",
        is_active: editingWarehouse.is_active ?? true,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        address: "",
        is_active: true,
      });
    }

    setErrors({});
  }, [editingWarehouse, open]);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const payload = {
        ...formData,
        code: formData.code.replace(/\s+/g, ""),
      };

      if (editingWarehouse) {
        await updateWarehouse(editingWarehouse.id, payload);
      } else {
        await createWarehouse(payload);
      }

      onClose();
      onSuccess();
    } catch (error) {
      if (typeof error === "object") {
        setErrors(error);
      } else {
        console.error("Error guardando bodega:", error);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {editingWarehouse ? "Editar bodega" : "Nueva bodega"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nombre de la bodega"
              className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Código</label>
            <Input
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Código sin espacios"
              className={errors.code ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Dirección</label>
            <Textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Dirección de la bodega"
              rows={3}
              className={errors.address ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  is_active: !!checked,
                }))
              }
            />
            <label htmlFor="is_active" className="text-sm font-medium">
              Bodega activa
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}