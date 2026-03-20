import React, { useState, useEffect } from 'react';
import AppModal from '~/core/components/AppModal';

const UserModal = ({ user, roles, onClose, onSave }) => {
    const isEditing = !!user;
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role_id: '',
        password: ''
    });
    
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                role_id: user.role?.id || '',
                password: '' // Keep password empty on edit
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Basic validation
        if (!formData.name || !formData.email || !formData.role_id) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        if (!isEditing && !formData.password) {
            setError('La contraseña es obligatoria para nuevos usuarios.');
            return;
        }

        try {
            setIsSubmitting(true);
            
            // Cleanup data before sending
            const dataToSubmit = { ...formData };
            if (isEditing && !dataToSubmit.password) {
                delete dataToSubmit.password;
            }
            
            await onSave(dataToSubmit);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al procesar la solicitud.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AppModal
            title={isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
            tone="dark"
            onClose={onClose}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Guardar cambios' : 'Guardar'}
        >
            {error && <div className="alert alert-danger small py-2">{error}</div>}
            
            <form onSubmit={handleSubmit} id="userForm">
                <div className="mb-3">
                    <label className="form-label">Nombre Completo *</label>
                    <input 
                        type="text" 
                        name="name"
                        className="form-control" 
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ej. Juan Pérez"
                    />
                </div>
                
                <div className="mb-3">
                    <label className="form-label">Correo Electrónico *</label>
                    <input 
                        type="email" 
                        name="email"
                        className="form-control" 
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="usuario@erp.com"
                    />
                </div>
                
                <div className="mb-3">
                    <label className="form-label">Rol de Acceso *</label>
                    <select 
                        name="role_id"
                        className="form-select" 
                        value={formData.role_id}
                        onChange={handleChange}
                    >
                        <option value="">Selecciona un rol...</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>
                </div>
                
                <div className="mb-3">
                    <label className="form-label">
                        Contraseña {isEditing && <span className="text-muted fw-normal text-lowercase">(dejar en blanco para mantener actual)</span>}
                    </label>
                    <input 
                        type="password" 
                        name="password"
                        className="form-control" 
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                    />
                </div>
            </form>
        </AppModal>
    );
};

export default UserModal;
