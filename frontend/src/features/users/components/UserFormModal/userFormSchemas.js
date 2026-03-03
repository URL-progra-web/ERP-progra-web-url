import * as z from 'zod';

const baseSchema = z.object({
    email: z.string().email('Debe ser un correo válido'),
    first_name: z.string().min(1, 'El nombre es requerido'),
    last_name: z.string().min(1, 'El apellido es requerido'),
    phone: z.string().optional(),
    is_staff: z.boolean().default(false),
});

export const createUserSchema = baseSchema.extend({
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
});

export const editUserSchema = baseSchema.extend({
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
