import React, { useEffect, useMemo, useState } from 'react';
import {
    FiAlertCircle,
    FiArrowLeft,
    FiCheckCircle,
    FiCreditCard,
    FiMapPin,
    FiPackage,
    FiShoppingCart,
    FiUser,
} from 'react-icons/fi';
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
import './order-create.css';

const formatMoney = (value) => `Q ${Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})}`;

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

    const shippingCostValue = useMemo(() => Number(formData.shipping_cost), [formData.shipping_cost]);

    const blockingIssues = useMemo(() => {
        const issues = [];
        if (!formData.customer_id) issues.push('Selecciona un cliente.');
        if (!items.length) issues.push('Agrega al menos una variante al carrito.');
        if (formData.shipping_cost !== '' && (!Number.isFinite(shippingCostValue) || shippingCostValue < 0)) {
            issues.push('Revisa el costo de envio; debe ser un numero valido mayor o igual a 0.');
        }
        return issues;
    }, [formData.customer_id, formData.shipping_cost, items.length, shippingCostValue]);

    const readinessSuggestions = useMemo(() => {
        const suggestions = [];
        if (selectedCustomer && !formData.shipping_address?.trim()) {
            suggestions.push('Agrega una direccion de envio para evitar aclaraciones posteriores.');
        }
        if (!formData.payment_method_id) {
            suggestions.push('Puedes definir el metodo de pago ahora o dejarlo pendiente.');
        }
        if (!formData.notes?.trim()) {
            suggestions.push('Si el pedido tiene condiciones especiales, deja una nota interna.');
        }
        return suggestions;
    }, [formData.notes, formData.payment_method_id, formData.shipping_address, selectedCustomer]);

    const readinessChecks = useMemo(() => ([
        {
            id: 'customer',
            label: 'Cliente seleccionado',
            detail: selectedCustomer
                ? `${selectedCustomer.name || `Cliente #${selectedCustomer.id}`}`
                : 'Falta seleccionar un cliente.',
            completed: Boolean(formData.customer_id),
        },
        {
            id: 'cart',
            label: 'Carrito con productos',
            detail: items.length
                ? `${summary.totalQuantity} unidad(es) en ${summary.totalItems} variante(s).`
                : 'Aun no hay variantes en el carrito.',
            completed: items.length > 0,
        },
        {
            id: 'shipping',
            label: 'Costo de envio valido',
            detail: formData.shipping_cost === ''
                ? 'Se usara Q 0.00 si lo dejas vacio.'
                : Number.isFinite(shippingCostValue) && shippingCostValue >= 0
                    ? `Costo actual ${formatMoney(shippingCostValue)}.`
                    : 'El costo de envio no es valido.',
            completed: formData.shipping_cost === '' || (Number.isFinite(shippingCostValue) && shippingCostValue >= 0),
        },
    ]), [
        formData.customer_id,
        formData.shipping_cost,
        items.length,
        selectedCustomer,
        shippingCostValue,
        summary.totalItems,
        summary.totalQuantity,
    ]);

    const nextStepLabel = useMemo(() => {
        if (!formData.customer_id) return 'Selecciona un cliente';
        if (!items.length) return 'Agrega variantes al carrito';
        if (blockingIssues.length) return 'Corrige los datos faltantes';
        return 'Listo para confirmar';
    }, [blockingIssues.length, formData.customer_id, items.length]);

    const handleSubmit = async () => {
        if (blockingIssues.length) {
            setOrderError(`No puedes enviar el pedido: ${blockingIssues.join(' ')}`);
            return;
        }

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

    const submitDisabled = isSubmitting || isLoadingCatalogs || blockingIssues.length > 0;

    return (
        <div className="container-fluid p-0 order-create-page">
            <PageHeader
                title="Crear Pedido"
                subtitle="Arma el pedido en tres pasos: cliente, catalogo y confirmacion"
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

            <div className="order-create-hero mb-4">
                <div className="order-create-hero__content">
                    <div className="order-create-hero__eyebrow">Flujo guiado</div>
                    <h2 className="order-create-hero__title">Orden para creara un pedido.</h2>
                    <p className="order-create-hero__copy">
                        La pantalla ahora te muestra que falta, que ya está listo y como llegar al envio sin adivinar el siguiente paso.
                    </p>
                </div>
                <div className="order-create-hero__status">
                    <div className="small text-uppercase fw-semibold text-muted mb-2">Estado actual</div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                        {blockingIssues.length ? <FiAlertCircle size={18} /> : <FiCheckCircle size={18} />}
                        <span className="fw-semibold">{nextStepLabel}</span>
                    </div>
                    <div className="small text-muted">
                        {blockingIssues.length
                            ? `${blockingIssues.length} bloqueo(s) antes de confirmar.`
                            : 'Ya puedes confirmar el pedido cuando quieras.'}
                    </div>
                </div>
            </div>

            <div className="row g-4 align-items-start">
                <div className="col-12 col-xl-7">
                    <div className="d-flex flex-column gap-4">
                        <AppCard accent="var(--bs-orange)">
                            <AppCard.Section label="Paso 1 · Cliente y contexto">
                                <div className="p-3 p-md-4 d-flex flex-column gap-4">
                                    <div className="order-create-section-copy">
                                        <span className="order-create-section-icon"><FiUser size={16} /></span>
                                        <div>
                                            <div className="fw-semibold">Selecciona el cliente correcto antes de armar el pedido.</div>
                                            <div className="small text-muted">
                                                Puedes buscar por nombre, correo, telefono o una búsqueda general.
                                            </div>
                                        </div>
                                    </div>

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

                                    <div className="row g-3">
                                        <div className="col-12 col-lg-6">
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

                                        <div className="col-12 col-lg-6">
                                            <label className="form-label" htmlFor="orderCreateShippingCost">Costo de Envio</label>
                                            <input
                                                id="orderCreateShippingCost"
                                                type="number"
                                                name="shipping_cost"
                                                autoComplete="off"
                                                step="0.01"
                                                min="0"
                                                className="form-control"
                                                value={formData.shipping_cost}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                            />
                                        </div>
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
                                            placeholder="Indicaciones internas, condiciones de entrega o detalles del pedido"
                                        />
                                    </div>
                                </div>
                            </AppCard.Section>
                        </AppCard>

                        <AppCard accent="var(--bs-orange)">
                            <AppCard.Section label="Paso 2 · Catalogo y variantes">
                                <div className="p-3 p-md-4 border-bottom">
                                    <div className="order-create-section-copy mb-3">
                                        <span className="order-create-section-icon"><FiPackage size={16} /></span>
                                        <div>
                                            <div className="fw-semibold">Filtra rapido y agrega sin salir de la pantalla.</div>
                                            <div className="small text-muted">
                                                En móvil verás tarjetas; en escritorio se mantiene la tabla completa.
                                            </div>
                                        </div>
                                    </div>
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
                </div>

                <div className="col-12 col-xl-5">
                    <div className="d-flex flex-column gap-4 order-create-sticky">
                        <AppCard accent="var(--bs-orange)">
                            <AppCard.Section label="Paso 3 · Estado del pedido">
                                <div className="p-3 p-md-4">
                                    <div className="order-create-checklist">
                                        {readinessChecks.map((check) => (
                                            <div
                                                key={check.id}
                                                className={`order-create-checklist__item ${check.completed ? 'is-complete' : 'is-pending'}`}
                                            >
                                                <div className="order-create-checklist__icon">
                                                    {check.completed ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
                                                </div>
                                                <div>
                                                    <div className="fw-semibold">{check.label}</div>
                                                    <div className="small text-muted">{check.detail}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="order-create-pills mt-3">
                                        <span className={`order-create-pill ${blockingIssues.length ? 'order-create-pill--warning' : 'order-create-pill--success'}`}>
                                            {blockingIssues.length ? `${blockingIssues.length} bloqueo(s)` : 'Sin bloqueos'}
                                        </span>
                                        <span className="order-create-pill">
                                            {summary.totalItems} variante(s)
                                        </span>
                                        <span className="order-create-pill">
                                            Total {formatMoney(totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </AppCard.Section>
                        </AppCard>

                        <AppCard accent="var(--bs-orange)">
                            <AppCard.Section label="Carrito y confirmacion">
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
                                        readinessIssues={blockingIssues}
                                        readinessSuggestions={readinessSuggestions}
                                    />

                                    <div className="mt-4 d-grid gap-2">
                                        <button type="button" className="btn btn-dark btn-lg" onClick={handleSubmit} disabled={submitDisabled}>
                                            {isSubmitting ? 'Confirmando carrito...' : 'Confirmar pedido'}
                                        </button>
                                        <div className="text-center small text-muted">
                                            {summary.totalQuantity} unidad(es) en carrito • Total estimado {formatMoney(totalAmount)}
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
