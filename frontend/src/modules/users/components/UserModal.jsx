import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

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
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
                    <div className="modal-header border-bottom-0 pb-0" style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                        <h5 className="modal-title fw-bold">
                            {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                    </div>
                    
                    <div className="modal-body p-4 pt-3">
                        {error && <div className="alert alert-danger small py-2">{error}</div>}
                        
                        <form onSubmit={handleSubmit} id="userForm">
                            <div className="form-group mb-3">
                                <label className="small fw-bold text-secondary text-uppercase mb-1">Nombre Completo</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    className="form-control" 
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>
                            
                            <div className="form-group mb-3">
                                <label className="small fw-bold text-secondary text-uppercase mb-1">Correo Electrónico</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    className="form-control" 
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="usuario@erp.com"
                                />
                            </div>
                            
                            <div className="form-group mb-3">
                                <label className="small fw-bold text-secondary text-uppercase mb-1">Rol de Acceso</label>
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
                            
                            <div className="form-group mb-0">
                                <label className="small fw-bold text-secondary text-uppercase mb-1">
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
                    </div>
                    
                    <div className="modal-footer border-0 pt-0 pb-4 px-4" style={{ borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                        <button type="button" className="btn btn-outline-secondary px-4 fw-bold shadow-sm" onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </button>
                        <button type="submit" form="userForm" className="btn btn-primary px-4 fw-bold shadow-sm" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserModal;
