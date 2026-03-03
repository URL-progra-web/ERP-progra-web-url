import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUserFormModal } from './useUserFormModal';

const UserFormModal = ({ isOpen, onClose, user }) => {
    const {
        register,
        handleSubmit,
        setValue,
        isStaffValue,
        errors,
        isSubmitting,
        isEditing,
        onSubmit
    } = useUserFormModal(isOpen, onClose, user);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Modifica los datos del usuario. Deja la contraseña en blanco si no deseas cambiarla.'
                            : 'Ingresa los datos para crear un nuevo usuario en el sistema.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    {errors.root && (
                        <div className="p-3 rounded bg-red-50 text-red-600 text-sm border border-red-200">
                            {errors.root.message}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="first_name">Nombre</Label>
                            <Input id="first_name" {...register('first_name')} />
                            {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="last_name">Apellidos</Label>
                            <Input id="last_name" {...register('last_name')} />
                            {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="email" className={errors.email ? "text-red-500" : ""}>Correo Electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                            disabled={isEditing}
                            {...register('email')}
                        />
                        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" {...register('phone')} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="password">{isEditing ? 'Nueva Contraseña' : 'Contraseña'}</Label>
                            <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
                            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="confirm_password">Confirmar Contraseña</Label>
                            <Input id="confirm_password" type="password" autoComplete="new-password" {...register('confirm_password')} />
                            {errors.confirm_password && <p className="text-xs text-red-500">{errors.confirm_password.message}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <Label>Permisos de Staff</Label>
                            <p className="text-[0.8rem] text-muted-foreground">
                                Permite al usuario acceder al panel administrativo.
                            </p>
                        </div>
                        <Switch
                            checked={isStaffValue}
                            onCheckedChange={(val) => setValue('is_staff', val)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => onClose(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UserFormModal;
