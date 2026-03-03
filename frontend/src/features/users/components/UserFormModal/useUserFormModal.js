import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, editUserSchema } from './userFormSchemas';
import { userFrontendService } from '~users/services/userFrontendService';

export const useUserFormModal = (isOpen, onClose, user) => {
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
            delete payload.confirm_password;

            if (isEditing && !payload.password) {
                delete payload.password;
            }

            if (isEditing) {
                delete payload.email;
                await userFrontendService.updateUser(user.id, payload);
            } else {
                await userFrontendService.createUser(payload);
            }
            onClose(true);
        } catch (error) {
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

    return {
        register,
        handleSubmit,
        setValue,
        isStaffValue,
        errors,
        isSubmitting,
        isEditing,
        onSubmit
    };
};
