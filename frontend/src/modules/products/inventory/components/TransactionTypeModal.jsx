import React, { useState, useEffect } from 'react';
import AppModal from '~/core/components/AppModal';
import AppAlert from '~/core/components/AppAlert';
import { AppSelect } from '~/core/components';
import { FiTrash2 } from 'react-icons/fi';

const TransactionTypeModal = ({
    isOpen,
    transactionType,
    onClose,
    onSave,
    onDelete,
}) => {
    const [name, setName] = useState('');
    const [factor, setFactor] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const isEditing = !!transactionType;

    useEffect(() => {
        if (transactionType) {
            setName(transactionType.name);
            setFactor(transactionType.factor?.toString() || '');
            setDescription(transactionType.description || '');
        } else {
            setName('');
            setFactor('');
            setDescription('');
        }
    }, [transactionType, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !factor) return;

        setIsSaving(true);
        try {
            await onSave({
                name: name.trim(),
                factor: parseInt(factor),
                description: description.trim() || null,
            });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        setDeleteConfirm({
            type: 'danger',
            header: '¿Eliminar este tipo de transacción?',
            content: `Se eliminará "${transactionType?.name}". Esta acción no se puede deshacer.`,
            confirmLabel: 'Sí, eliminar',
            onConfirm: async () => {
                await onDelete(transactionType.name);
                setDeleteConfirm(null);
                onClose();
            },
        });
    };

    const isNameDisabled = isEditing;
    const isValid = name.trim() && factor;

    return (
        <>
            <AppModal
                isOpen={isOpen}
                title={isEditing ? 'Editar Tipo de Transacción' : 'Nuevo Tipo de Transacción'}
                accent="var(--bs-primary)"
                onClose={onClose}
                onSubmit={handleSubmit}
                submitLabel={isEditing ? 'Guardar' : 'Crear'}
                cancelLabel="Cancelar"
                submitDisabled={isSaving || !isValid}
                size="sm"
            >
                <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="transactionTypeNameInput">
                        Nombre <span className="text-danger">*</span>
                    </label>
                    <input
                        id="transactionTypeNameInput"
                        type="text"
                        name="transaction_type_name"
                        autoComplete="off"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value.toUpperCase())}
                        placeholder="Ej: ENTRADA, DEVOLUCION, MERMA"
                        disabled={isNameDisabled}
                    />
                    {isNameDisabled && (
                        <small className="text-muted">El nombre no se puede modificar</small>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="transactionTypeFactorSelect">
                        Factor <span className="text-danger">*</span>
                    </label>
                    <AppSelect
                        id="transactionTypeFactorSelect"
                        name="transaction_type_factor"
                        value={factor}
                        onChange={setFactor}
                        options={[
                            { value: '', label: 'Seleccione...' },
                            { value: '1', label: '+1 (Entrada de stock)' },
                            { value: '-1', label: '-1 (Salida de stock)' },
                        ]}
                    />
                    <small className="text-muted">
                        +1 para entradas, -1 para salidas de inventario
                    </small>
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="transactionTypeDescriptionInput">Descripción</label>
                    <textarea
                        id="transactionTypeDescriptionInput"
                        name="transaction_type_description"
                        autoComplete="off"
                        className="form-control"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="2"
                        placeholder="Descripción opcional del tipo de transacción"
                    />
                </div>

                {isEditing && (
                    <div className="border-top pt-3 mt-3">
                        <button
                            type="button"
                            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2"
                            onClick={handleDelete}
                        >
                            <FiTrash2 size={14} />
                            Eliminar tipo de transacción
                        </button>
                    </div>
                )}
            </AppModal>

            {deleteConfirm && (
                <AppAlert
                    type={deleteConfirm.type}
                    header={deleteConfirm.header}
                    content={deleteConfirm.content}
                    confirmLabel={deleteConfirm.confirmLabel}
                    onConfirm={deleteConfirm.onConfirm}
                    onClose={() => setDeleteConfirm(null)}
                />
            )}
        </>
    );
};

export default TransactionTypeModal;
