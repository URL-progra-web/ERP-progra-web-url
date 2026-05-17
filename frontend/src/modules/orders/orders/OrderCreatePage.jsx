import React, { useEffect, useMemo, useState } from 'react';
import { FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '~/core/components/PageHeader';
import AppAlert from '~/core/components/AppAlert';
import AppCard from '~/core/components/AppCard';
import AppPagination from '~/core/components/AppPagination';
import { AppSelect } from '~/core/components';
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
    const location = useLocation();
    const { user } = useAuth();
    const ordersListPath = `${getDashboardPath(user?.role?.name)}/orders/list`;

    const {
        variants,
        count,
        numPages,
        page,
        setPage,
        products,
        entrepreneurs,
        businessUnits,
        colors,
        sizes,
        uoms,
        conversionsByBaseUom,
        isLoading,
        error: catalogError,
        setError: setCatalogError,
        searchInput,
        setSearchInput,
        handleSearch,
        productFilter,
        setProductFilter,
        entrepreneurFilter,
        setEntrepreneurFilter,
        businessUnitFilter,
        setBusinessUnitFilter,
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

    useEffect(() => {
        const preselectedCustomer = location.state?.initialCustomer;
        if (!preselectedCustomer?.id) return;

        setSelectedCustomer(preselectedCustomer);
        setFormData((prev) => ({
            ...prev,
            customer_id: String(preselectedCustomer.id),
            shipping_address: preselectedCustomer.address || prev.shipping_address || '',
        }));
    }, [location.state?.initialCustomer?.id]);

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
                selected_uom_id: Number(item.selected_uom_id),
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
                    <AppCard accent="var(--bs-orange)">
                        <AppCard.Section label="Catálogo de Variantes">
                            <div className="p-3 p-md-4 border-bottom">
                                <OrderCatalogFilters
                                    searchInput={searchInput}
                                    onSearchChange={setSearchInput}
                                    onSearch={handleSearch}
                                    productFilter={productFilter}
                                    onProductChange={setProductFilter}
                                    entrepreneurFilter={entrepreneurFilter}
                                    onEntrepreneurChange={setEntrepreneurFilter}
                                    businessUnitFilter={businessUnitFilter}
                                    onBusinessUnitChange={setBusinessUnitFilter}
                                    colorFilter={colorFilter}
                                    onColorChange={setColorFilter}
                                    sizeFilter={sizeFilter}
                                    onSizeChange={setSizeFilter}
                                    uomFilter={uomFilter}
                                    onUomChange={setUomFilter}
                                    products={products}
                                    entrepreneurs={entrepreneurs}
                                    businessUnits={businessUnits}
                                    colors={colors}
                                    sizes={sizes}
                                    uoms={uoms}
                                    onReset={resetFilters}
                                />
                            </div>
                        </AppCard.Section>

                        <AppCard.Section label="Variantes disponibles">
                            <OrderCatalogTable
                                variants={variants}
                                isLoading={isLoading}
                                onAdd={addVariant}
                                cartItems={items}
                                uoms={uoms}
                                conversionsByBaseUom={conversionsByBaseUom}
                            />

                            <AppPagination
                                page={page}
                                numPages={numPages}
                                count={count}
                                onPageChange={setPage}
                            />
                        </AppCard.Section>
                    </AppCard>
                </div>

                <div className="col-12 col-xl-4">
                    <div className="d-flex flex-column gap-4" style={{ position: 'sticky', top: '1rem' }}>
                        <AppCard accent="var(--bs-orange)">
                            <AppCard.Section label="Datos del Pedido">
                                <div className="p-3 p-md-4 d-flex flex-column gap-3">
                                    <div>
                                        <label className="form-label" htmlFor="orderCreateCustomerSearch">Cliente *</label>
                                        <CustomerSearch
                                            selectedCustomer={selectedCustomer}
                                            onSelect={handleSelectCustomer}
                                            onClear={handleClearCustomer}
                                            disabled={isSubmitting}
                                            initialQuery={selectedCustomer?.name || ''}
                                            inputId="orderCreateCustomerSearch"
                                        />
                                    </div>

                                    <div>
                                        <label className="form-label" htmlFor="orderCreatePaymentMethod">Metodo de Pago</label>
                                        <AppSelect
                                            id="orderCreatePaymentMethod"
                                            name="payment_method_id"
                                            value={formData.payment_method_id}
                                            onChange={(paymentMethodId) => handleChange({ target: { name: 'payment_method_id', value: paymentMethodId } })}
                                            disabled={isLoadingCatalogs}
                                            options={[
                                                { value: '', label: '(Ninguno / Por definir)' },
                                                ...paymentMethods.map((pm) => ({
                                                    value: pm.id,
                                                    label: pm.name || pm.code || `Metodo #${pm.id}`,
                                                })),
                                            ]}
                                        />
                                    </div>

                                    <div>
                                        <label className="form-label" htmlFor="orderCreateShippingAddress">Direccion de Envio</label>
                                        <textarea
                                            id="orderCreateShippingAddress"
                                            className="form-control"
                                            rows="2"
                                            name="shipping_address"
                                            autoComplete="street-address"
                                            value={formData.shipping_address}
                                            onChange={handleChange}
                                            placeholder="Se autocompleta desde el cliente, pero puedes editarla"
                                        />
                                    </div>

                                    <div>
                                        <label className="form-label" htmlFor="orderCreateNotes">Notas</label>
                                        <textarea
                                            id="orderCreateNotes"
                                            className="form-control"
                                            rows="3"
                                            name="notes"
                                            autoComplete="off"
                                            value={formData.notes}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </AppCard.Section>
                        </AppCard>

                        <AppCard accent="var(--bs-orange)">
                            <AppCard.Section label="Carrito">
                                <div className="p-3 p-md-4">
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
                            </AppCard.Section>
                        </AppCard>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderCreatePage;
