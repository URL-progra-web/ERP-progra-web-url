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
        short_id: ''
    });

    const [paymentMethods, setPaymentMethods] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

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
                customer_id: String(initialCustomer.id)
            }));
        } else {
            setSelectedCustomer(null);
            setFormData(prev => ({
                ...prev,
                customer_id: ''
            }));
        }
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
        if (formData.short_id) payload.short_id = formData.short_id;

        const success = await onSubmit(payload);
        if (success) {
            setFormData({
                customer_id: '',
                payment_method_id: '',
                shipping_address: '',
                shipping_cost: 0,
                notes: '',
                short_id: ''
            });
            setSelectedCustomer(null);
            onClose();
        }
    };
    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setFormData(prev => ({
            ...prev,
            customer_id: String(customer.id)
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

    return (
        <AppModal
            isOpen={isOpen}
            onClose={onClose}
            title="Nuevo Pedido"
            tone="dark"
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
                <label className="form-label">Notas</label>
                <textarea
                    className="form-control"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                ></textarea>
            </div>
        </AppModal>
    );
};
