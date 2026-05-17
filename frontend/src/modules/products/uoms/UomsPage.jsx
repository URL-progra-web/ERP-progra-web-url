import React from 'react';
import { FiPlus, FiBox } from 'react-icons/fi';
import FilterTabs from '~/core/components/FilterTabs';
import { useUoms } from './hooks/useUoms';
import { useUomPageState } from './hooks/useUomPageState';
import { UomModal } from './components/UomModal';
import { ConversionModal } from './components/ConversionModal';
import { UomsTable } from './components/UomsTable';
import { ConversionsTab } from './components/ConversionsTab';
import AppAlert from '~/core/components/AppAlert';
import AppCard from '~/core/components/AppCard';
import PageHeader from '~/core/components/PageHeader';
import AppPagination from '~/core/components/AppPagination';
import './uoms-ui.css';

const UomsPage = () => {
    const {
        uoms, uomCount, uomNumPages, uomPage, setUomPage,
        isLoadingUoms, createUom, updateUom, deleteUom,
        conversions, convCount, convNumPages, convPage, setConvPage,
        isLoadingConversions,
        fromUomFilter, setFromUomFilter,
        toUomFilter, setToUomFilter,
        createConversion, updateConversion, deleteConversion,
        error, setError,
    } = useUoms();

    const {
        activeTab, setActiveTab,
        uomModal, setUomModal,
        convModal, setConvModal,
        alertConfig, closeAlert,
        handleSaveUom, handleDeleteUom,
        handleSaveConversion, handleDeleteConversion,
    } = useUomPageState({
        createUom, updateUom, deleteUom,
        createConversion, updateConversion, deleteConversion,
        setError,
    });

    return (
        <div className="container-fluid p-0">
            <PageHeader
                title="Unidades de Medida"
                subtitle="Administra UOMs y sus conversiones"
                icon={FiBox}
                actionLabel={activeTab === 'uoms' ? 'Nueva UOM' : 'Nueva Conversión'}
                actionIcon={FiPlus}
                onAction={() => (activeTab === 'uoms' ? setUomModal('new') : setConvModal('new'))}
                isDark
            />

            {error && (
                <AppAlert
                    type="warning"
                    header="Error"
                    content={error}
                    onClose={() => setError(null)}
                />
            )}

            <AppCard accent="var(--bs-primary)">
                <AppCard.Section label="Tipo">
                    <div className="p-3 p-md-4 border-bottom">
                        <div className="uoms-page-tabs-shell">
                            <span className="uoms-page-tabs-shell__eyebrow">Espacio de trabajo</span>
                            <div className="uoms-page-tabs-shell__copy">
                                Alterna entre el catálogo base de unidades y la matriz de equivalencias que usa el inventario.
                            </div>
                            <FilterTabs
                                options={[
                                    { value: 'uoms', label: 'Unidades de Medida', badge: uomCount },
                                    { value: 'conversions', label: 'Conversiones', badge: convCount },
                                ]}
                                value={activeTab}
                                onChange={setActiveTab}
                                size="lg"
                            />
                        </div>
                    </div>
                </AppCard.Section>

                <AppCard.Section label={activeTab === 'uoms' ? 'Unidades de Medida' : 'Conversiones'}>
                    <div className="p-3 p-md-4">
                        <div className="uoms-page-section-intro">
                            <div>
                                <h3 className="uoms-page-section-intro__title">
                                    {activeTab === 'uoms' ? 'Catálogo base de unidades' : 'Mapa de conversiones'}
                                </h3>
                                <p className="uoms-page-section-intro__text">
                                    {activeTab === 'uoms'
                                        ? 'Mantén códigos cortos y nombres claros para que el catálogo sea fácil de reutilizar en productos e inventario.'
                                        : 'Define relaciones exactas entre unidades de origen y destino para que los movimientos y presentaciones mantengan consistencia.'}
                                </p>
                            </div>
                            <span className="uoms-page-section-intro__pill">
                                {activeTab === 'uoms' ? uomCount : convCount}
                            </span>
                        </div>

                        {activeTab === 'uoms' && (
                            <div className="table-responsive bg-body">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="text-uppercase text-muted small">
                                        <tr>
                                            <th className="border-0 px-4 py-3">Código</th>
                                            <th className="border-0 py-3">Nombre</th>
                                            <th className="border-0 px-4 py-3 text-end">Acciones</th>
                                        </tr>
                                    </thead>
                                    <UomsTable
                                        uoms={uoms}
                                        isLoading={isLoadingUoms}
                                        onEdit={setUomModal}
                                        onDelete={handleDeleteUom}
                                    />
                                </table>
                            </div>
                        )}

                        {activeTab === 'conversions' && (
                            <ConversionsTab
                                conversions={conversions}
                                isLoading={isLoadingConversions}
                                uoms={uoms}
                                fromUomFilter={fromUomFilter}
                                setFromUomFilter={setFromUomFilter}
                                toUomFilter={toUomFilter}
                                setToUomFilter={setToUomFilter}
                                onEdit={setConvModal}
                                onDelete={handleDeleteConversion}
                            />
                        )}
                    </div>

                    <AppPagination
                        page={activeTab === 'uoms' ? uomPage : convPage}
                        numPages={activeTab === 'uoms' ? uomNumPages : convNumPages}
                        count={activeTab === 'uoms' ? uomCount : convCount}
                        onPageChange={activeTab === 'uoms' ? setUomPage : setConvPage}
                    />
                </AppCard.Section>
            </AppCard>

            {uomModal && (
                <UomModal
                    uom={uomModal === 'new' ? null : uomModal}
                    onClose={() => setUomModal(null)}
                    onSave={handleSaveUom}
                />
            )}
            {convModal && (
                <ConversionModal
                    conversion={convModal === 'new' ? null : convModal}
                    uoms={uoms}
                    onClose={() => setConvModal(null)}
                    onSave={handleSaveConversion}
                />
            )}

            {alertConfig && (
                <AppAlert
                    type={alertConfig.type}
                    header={alertConfig.header}
                    content={alertConfig.content}
                    confirmLabel={alertConfig.confirmLabel}
                    onConfirm={alertConfig.onConfirm}
                    onClose={closeAlert}
                />
            )}
        </div>
    );
};

export default UomsPage;
