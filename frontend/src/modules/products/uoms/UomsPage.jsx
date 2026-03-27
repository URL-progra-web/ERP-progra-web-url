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
import PageHeader from '~/core/components/PageHeader';
import AppPagination from '~/core/components/AppPagination';

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
            {/* Header */}
            <PageHeader
                title="Unidades de Medida"
                subtitle="Administra UOMs y sus conversiones"
                icon={FiBox}
                actionLabel={activeTab === 'uoms' ? 'Nueva UOM' : 'Nueva Conversión'}
                actionIcon={FiPlus}
                onAction={() => (activeTab === 'uoms' ? setUomModal('new') : setConvModal('new'))}
            />

            {/* Global error */}
            {error && (
                <AppAlert
                    type="warning"
                    header="Error"
                    content={error}
                    onClose={() => setError(null)}
                />
            )}

            <div className="rounded-4 border shadow-sm overflow-hidden bg-body">
                {/* Tabs */}
                <div className="px-4 py-3 border-bottom" style={{ background: 'var(--bs-tertiary-bg)' }}>
                    <FilterTabs
                        options={[
                            { value: 'uoms',        label: 'Unidades de Medida', badge: uoms.length },
                            { value: 'conversions', label: 'Conversiones',       badge: conversions.length },
                        ]}
                        value={activeTab}
                        onChange={setActiveTab}
                    />
                </div>

                <div className="bg-body p-3 p-md-4">
                    {/* Tab: UOMs */}
                    {activeTab === 'uoms' && (
                        <UomsTable
                            uoms={uoms}
                            isLoading={isLoadingUoms}
                            onEdit={setUomModal}
                            onDelete={handleDeleteUom}
                        />
                    )}

                    {/* Tab: Conversions */}
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
            </div>

            {/* Modals */}
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

            {/* AppAlert: confirmations and error messages */}
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
