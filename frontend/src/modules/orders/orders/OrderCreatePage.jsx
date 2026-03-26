import React, { useEffect, useMemo, useState } from 'react';
import { FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PageHeader from '~/core/components/PageHeader';
import AppAlert from '~/core/components/AppAlert';
import { useAuth } from '~/core/auth/AuthContext';
import { getDashboardPath } from '~/core/registry/dashboardPaths';
import { CustomerSearch } from './components/CustomerSearch';
import { OrderCatalogFilters } from './components/OrderCatalogFilters';
import { OrderCatalogTable } from './components/OrderCatalogTable';
import { OrderCartSummary } from './components/OrderCartSummary';
import { useVariantCatalog } from './hooks/useVariantCatalog';
import { useOrderCart } from './hooks/useOrderCart';
import { normalizeList } from './helpers/normalizeList';
import { orderService } from './services/orderService';
import { useOrders } from './hooks/useOrders';

const OrderCreatePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const ordersListPath = `${getDashboardPath(user?.role?.name)}/orders/list`;

    const {
        variants,
        products,
        colors,
        sizes,
        uoms,
        isLoading,
        error: catalogError,
        setError: setCatalogError,
        searchInput,
        setSearchInput,
        handleSearch,
        productFilter,
        setProductFilter,
        colorFilter,
        setColorFilter,
        sizeFilter,
        setSizeFilter,
        uomFilter,
        setUomFilter,
        resetFilters,
    } = useVariantCatalog();

    const {
        items,
        addVariant,
        removeItem,
        updateQuantity,
        incrementItem,
        decrementItem,
        clearCart,
        summary,
    } = useOrderCart();

    const { createOrder, error: orderError, setError: setOrderError } = useOrders({ autoFetch: false });

    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        customer_id: '',
        payment_method_id: '',
        shipping_address: '',
        shipping_cost: '0',
        notes: '',
    });

    useEffect(() => {
        const loadCatalogs = async () => {
            setIsLoadingCatalogs(true);
            try {
                const data = await orderService.catalogs();
                setPaymentMethods(normalizeList(data?.payment_methods));
            } catch {
                setOrderError('No se pudieron cargar los metodos de pago.');
                setPaymentMethods([]);
            } finally {
                setIsLoadingCatalogs(false);
            }
        };

        loadCatalogs();
    }, [setOrderError]);

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setFormData((prev) => ({
            ...prev,
            customer_id: String(customer.id),
            shipping_address: customer.address || prev.shipping_address || '',
        }));
    };

    const handleClearCustomer = () => {
        setSelectedCustomer(null);
        setFormData((prev) => ({
            ...prev,
            customer_id: '',
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const totalAmount = useMemo(() => {
        const shipping = Number(formData.shipping_cost || 0);
        return summary.subtotal + (Number.isFinite(shipping) ? shipping : 0);
    }, [summary.subtotal, formData.shipping_cost]);

    const handleSubmit = async () => {
        if (!formData.customer_id || !items.length) return;

        const payload = {
            customer_id: Number(formData.customer_id),
            items: items.map((item) => ({
                variant_id: Number(item.variant_id),
                quantity: Number(item.quantity),
            })),
        };

        if (formData.payment_method_id) payload.payment_method_id = Number(formData.payment_method_id);
        if (formData.shipping_address) payload.shipping_address = formData.shipping_address;
        if (formData.notes) payload.notes = formData.notes;
        if (formData.shipping_cost !== '' && formData.shipping_cost !== null) {
            payload.shipping_cost = Number(formData.shipping_cost);
        }

        setIsSubmitting(true);
        const createdOrder = await createOrder(payload);
        setIsSubmitting(false);

        if (createdOrder?.id) {
            clearCart();
            navigate(`${getDashboardPath(user?.role?.name)}/orders/detail/${createdOrder.id}`, {
                state: {
                    successMessage: `Pedido creado correctamente. El pedido es ${createdOrder.short_id}.`,
                },
            });
        }
    };

    const submitDisabled = isSubmitting || isLoadingCatalogs || !formData.customer_id || !items.length;

    return (
        <div className="container-fluid p-0">
            <PageHeader
                title="Crear Pedido"
                subtitle="Explora el catalogo, agrega variantes al carrito y confirma el pedido"
                icon={FiShoppingCart}
                actionLabel="Volver"
                actionIcon={FiArrowLeft}
                onAction={() => navigate(ordersListPath)}
            />

            {orderError && (
                <AppAlert
                    type="danger"
                    header="Error"
                    content={orderError}
                    onClose={() => setOrderError(null)}
                />
            )}

            {catalogError && (
                <AppAlert
                    type="warning"
                    header="Catalogo"
                    content={catalogError}
                    onClose={() => setCatalogError(null)}
                />
            )}

            <div className="row g-4 align-items-start">
                <div className="col-12 col-xl-8">
                    <div className="card border-0 shadow-sm overflow-hidden">
                        <div className="card-header bg-dark text-white px-4 py-3">
                            <h6 className="mb-1 text-uppercase">Catalogo de Variantes</h6>
                            <small className="text-white-50">Solo se muestran variantes activas con stock disponible.</small>
                        </div>
                        <div className="card-body border-bottom p-4">
                            <OrderCatalogFilters
                                searchInput={searchInput}
                                onSearchChange={setSearchInput}
                                onSearch={handleSearch}
                                productFilter={productFilter}
                                onProductChange={setProductFilter}
                                colorFilter={colorFilter}
                                onColorChange={setColorFilter}
                                sizeFilter={sizeFilter}
                                onSizeChange={setSizeFilter}
                                uomFilter={uomFilter}
                                onUomChange={setUomFilter}
                                products={products}
                                colors={colors}
                                sizes={sizes}
                                uoms={uoms}
                                onReset={resetFilters}
                            />
                        </div>
                        <OrderCatalogTable
                            variants={variants}
                            isLoading={isLoading}
                            onAdd={addVariant}
                            cartItems={items}
                        />
                    </div>
                </div>

                <div className="col-12 col-xl-4">
                    <div className="d-flex flex-column gap-4" style={{ position: 'sticky', top: '1rem' }}>
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-body px-4 py-3">
                                <h6 className="mb-0 text-uppercase text-muted small">Datos del Pedido</h6>
                            </div>
                            <div className="card-body p-4 d-flex flex-column gap-3">
                                <div>
                                    <label className="form-label">Cliente *</label>
                                    <CustomerSearch
                                        selectedCustomer={selectedCustomer}
                                        onSelect={handleSelectCustomer}
                                        onClear={handleClearCustomer}
                                        disabled={isSubmitting}
                                        initialQuery={selectedCustomer?.name || ''}
                                    />
                                </div>

                                <div>
                                    <label className="form-label">Metodo de Pago</label>
                                    <select
                                        className="form-select"
                                        name="payment_method_id"
                                        value={formData.payment_method_id}
                                        onChange={handleChange}
                                        disabled={isLoadingCatalogs}
                                    >
                                        <option value="">(Ninguno / Por definir)</option>
                                        {paymentMethods.map((pm) => (
                                            <option key={pm.id} value={pm.id}>{pm.name || pm.code || `Metodo #${pm.id}`}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Direccion de Envio</label>
                                    <textarea
                                        className="form-control"
                                        rows="2"
                                        name="shipping_address"
                                        value={formData.shipping_address}
                                        onChange={handleChange}
                                        placeholder="Se autocompleta desde el cliente, pero puedes editarla"
                                    />
                                </div>

                                <div>
                                    <label className="form-label">Notas</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4">
                                <OrderCartSummary
                                    items={items}
                                    shippingCost={formData.shipping_cost}
                                    onShippingCostChange={(value) => setFormData((prev) => ({ ...prev, shipping_cost: value }))}
                                    onIncrement={incrementItem}
                                    onDecrement={decrementItem}
                                    onQuantityChange={updateQuantity}
                                    onRemove={removeItem}
                                    onClear={clearCart}
                                />

                                <div className="mt-4 d-grid gap-2">
                                    <button type="button" className="btn btn-dark btn-lg" onClick={handleSubmit} disabled={submitDisabled}>
                                        {isSubmitting ? 'Confirmando carrito...' : 'Confirmar carrito'}
                                    </button>
                                    <div className="text-center small text-muted">
                                        {summary.totalQuantity} unidad(es) en carrito • Total estimado Q {totalAmount.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderCreatePage;
