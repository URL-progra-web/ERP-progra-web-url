import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { userFrontendService } from '../services/userFrontendService';

const baseSchema = z.object({
    email: z.string().email('Debe ser un correo válido'),
    first_name: z.string().min(1, 'El nombre es requerido'),
    last_name: z.string().min(1, 'El apellido es requerido'),
    phone: z.string().optional(),
    is_staff: z.boolean().default(false),
});

const createUserSchema = baseSchema.extend({
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
});

const editUserSchema = baseSchema.extend({
    password: z.string().optional(),
    confirm_password: z.string().optional()
}).refine((data) => {
    if (data.password && data.password !== data.confirm_password) {
        return false;
    }
    return true;
}, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
});

const UserFormModal = ({ isOpen, onClose, user }) => {
    const isEditing = !!user;
    const schema = isEditing ? editUserSchema : createUserSchema;

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        setError,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            email: '',
            first_name: '',
            last_name: '',
            phone: '',
            is_staff: false,
            password: '',
            confirm_password: '',
        }
    });

    const isStaffValue = watch('is_staff');

    useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                reset({
                    email: user.email || '',
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    phone: user.phone || '',
                    is_staff: user.is_staff || false,
                    password: '',
                    confirm_password: '',
                });
            } else {
                reset({
                    email: '',
                    first_name: '',
                    last_name: '',
                    phone: '',
                    is_staff: false,
                    password: '',
                    confirm_password: '',
                });
            }
        }
    }, [isOpen, isEditing, user, reset]);

    const onSubmit = async (data) => {
        try {
            const payload = { ...data };
            // Remove confirm_password as backend doesn't need it
            delete payload.confirm_password;

            // If editing and password is empty, don't send it
            if (isEditing && !payload.password) {
                delete payload.password;
            }

            if (isEditing) {
                // Remove email when editing, as it shouldn't be updated
                delete payload.email;
                await userFrontendService.updateUser(user.id, payload);
            } else {
                await userFrontendService.createUser(payload);
            }
            onClose(true); // true indicates successful save
        } catch (error) {
            // Handle 400 error from backend (like email already exists)
            console.error('Save failed', error);
            if (error.response?.data?.email) {
                setError('email', { type: 'server', message: 'Este correo ya está registrado' });
            } else if (error.response?.data?.detail) {
                setError('root', { type: 'server', message: error.response.data.detail });
            } else {
                setError('root', { type: 'server', message: 'Ocurrió un error inesperado al guardar.' });
            }
        }
    };

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
