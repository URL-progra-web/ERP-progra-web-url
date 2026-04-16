import React, { useState, useEffect } from 'react';
import AppModal from '~/core/components/AppModal';
import { CustomerSearch } from './CustomerSearch';
import { normalizeList } from '../helpers/normalizeList';
import { orderService } from '~/modules/orders/orders/services/orderService';

export const OrderModal = ({ isOpen, onClose, onSubmit, isSubmitting, initialCustomer }) => {
    const [formData, setFormData] = useState({
        customer_id: '',
        payment_method_id: '',
        shipping_address: '',
        shipping_cost: 0,
        notes: '',
    });

    const [paymentMethods, setPaymentMethods] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [items, setItems] = useState([]);
    const [itemDraft, setItemDraft] = useState({ variant_id: '', quantity: 1 });
    const [itemDraftError, setItemDraftError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const data = await orderService.catalogs();
                    setPaymentMethods(normalizeList(data?.payment_methods));
                } catch (error) {
                    console.error('Critical error in fetchData:', error);
                    setPaymentMethods([]);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        if (initialCustomer) {
            setSelectedCustomer(initialCustomer);
            setFormData(prev => ({
                ...prev,
                customer_id: String(initialCustomer.id),
                shipping_address: initialCustomer.address || prev.shipping_address || ''
            }));
        } else {
            setSelectedCustomer(null);
            setFormData(prev => ({
                ...prev,
                customer_id: ''
            }));
        }
        setItemDraftError('');
    }, [isOpen, initialCustomer]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.customer_id) return;
        const payload = {
            customer_id: parseInt(formData.customer_id, 10),
        };
        if (formData.payment_method_id) payload.payment_method_id = parseInt(formData.payment_method_id, 10);
        if (formData.shipping_address) payload.shipping_address = formData.shipping_address;
        if (formData.shipping_cost) payload.shipping_cost = parseFloat(formData.shipping_cost);
        if (formData.notes) payload.notes = formData.notes;
        if (items.length) payload.items = items;

        const success = await onSubmit(payload);
        if (success) {
            setFormData({
                customer_id: '',
                payment_method_id: '',
                shipping_address: '',
                shipping_cost: 0,
                notes: '',
            });
            setSelectedCustomer(null);
            setItems([]);
            setItemDraft({ variant_id: '', quantity: 1 });
            onClose();
        }
    };
    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setFormData(prev => ({
            ...prev,
            customer_id: String(customer.id),
            shipping_address: customer.address || ''
        }));
    };

    const handleClearCustomer = () => {
        setSelectedCustomer(null);
        setFormData(prev => ({
            ...prev,
            customer_id: ''
        }));
    };

    const submitDisabled = isSubmitting || isLoading || !formData.customer_id;

    const addItemDraft = () => {
        const variantId = Number(itemDraft.variant_id);
        const quantity = Number(itemDraft.quantity);

        if (!variantId || variantId <= 0) {
            setItemDraftError('Debes ingresar un Variant ID válido.');
            return;
        }

        if (!quantity || quantity <= 0) {
            setItemDraftError('La cantidad debe ser mayor a cero.');
            return;
        }

        const alreadyExists = items.some((item) => Number(item.variant_id) === variantId);
        if (alreadyExists) {
            setItemDraftError('Ya agregaste ese Variant ID en la lista de items.');
            return;
        }

        setItemDraftError('');
        setItems((prev) => ([...prev, { variant_id: variantId, quantity }]));
        setItemDraft({ variant_id: '', quantity: 1 });
    };

    const removeDraftItem = (index) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
        setItemDraftError('');
    };

    return (
        <AppModal
            isOpen={isOpen}
            onClose={onClose}
            title="Nuevo Pedido"
            tone="dark" accent="var(--bs-orange)"
            size="md"
            onSubmit={handleSubmit}
            submitLabel="Guardar Pedido"
            submitDisabled={submitDisabled}
        >
            <div className="mb-3">
                <label className="form-label">Cliente *</label>
                <CustomerSearch
                    selectedCustomer={selectedCustomer}
                    onSelect={handleSelectCustomer}
                    onClear={handleClearCustomer}
                    disabled={isLoading}
                    initialQuery={selectedCustomer?.name || ''}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Método de Pago</label>
                <select
                    className="form-select"
                    name="payment_method_id"
                    value={formData.payment_method_id}
                    onChange={handleChange}
                    disabled={isLoading}
                >
                    <option value="">(Ninguno / Por definir)</option>
                    {paymentMethods.map(pm => (
                        <option key={pm.id} value={pm.id}>
                            {pm.name || pm.code || `Método #${pm.id}`}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Dirección de Envío</label>
                <textarea
                    className="form-control"
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    rows="2"
                    placeholder="Se autocompleta con la dirección del cliente, pero puedes cambiarla"
                ></textarea>
            </div>

            <div className="mb-3">
                <label className="form-label">Notas</label>
                <textarea
                    className="form-control"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                ></textarea>
            </div>

            <div className="mb-0">
                <label className="form-label">Items del Pedido (Opcional)</label>
                <div className="row g-2 align-items-end">
                    <div className="col-6">
                        <label className="form-label small text-muted mb-1">Variant ID</label>
                        <input
                            type="number"
                            min="1"
                            className="form-control"
                            value={itemDraft.variant_id}
                            onChange={(e) => setItemDraft((prev) => ({ ...prev, variant_id: e.target.value }))}
                            placeholder="Ej. 101"
                        />
                    </div>
                    <div className="col-3">
                        <label className="form-label small text-muted mb-1">Cantidad</label>
                        <input
                            type="number"
                            min="1"
                            className="form-control"
                            value={itemDraft.quantity}
                            onChange={(e) => setItemDraft((prev) => ({ ...prev, quantity: e.target.value }))}
                        />
                    </div>
                    <div className="col-3">
                        <button type="button" className="btn btn-outline-dark w-100" onClick={addItemDraft}>
                            Agregar
                        </button>
                    </div>
                </div>

                {!!items.length && (
                    <div className="list-group mt-2">
                        {items.map((item, index) => (
                            <div key={`${item.variant_id}-${index}`} className="list-group-item d-flex justify-content-between align-items-center">
                                <span className="small">
                                    Variant #{item.variant_id} • Cantidad: {item.quantity}
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => removeDraftItem(index)}
                                >
                                    Quitar
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {itemDraftError && <div className="text-danger small mt-2">{itemDraftError}</div>}

                <div className="form-text">Si agregas items aquí, se crearán de forma atómica junto con la orden.</div>
            </div>
        </AppModal>
    );
};
