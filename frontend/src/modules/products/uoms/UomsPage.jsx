import React from 'react';
import { FiPlus, FiBox } from 'react-icons/fi';
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
                <div className="bg-dark text-white px-4 py-3 d-flex flex-wrap gap-3 align-items-center">
                    <div className="d-flex gap-2 flex-wrap">
                        <button
                            className={`btn btn-sm px-4 py-2 rounded-3 border-0 ${activeTab === 'uoms' ? 'bg-white text-dark fw-semibold shadow-sm' : 'bg-transparent text-white-50 fw-semibold border border-light-subtle'}`}
                            style={activeTab === 'uoms' ? { color: '#1f1f1f' } : {}}
                            onClick={() => setActiveTab('uoms')}
                        >
                            Unidades de Medida
                            <span className="badge bg-dark-subtle text-dark ms-2">{uoms.length}</span>
                        </button>
                        <button
                            className={`btn btn-sm px-4 py-2 rounded-3 ${activeTab === 'conversions' ? 'bg-white text-dark fw-semibold shadow-sm border-0' : 'bg-transparent text-white-50 fw-semibold border border-light-subtle'}`}
                            style={activeTab === 'conversions' ? { color: '#1f1f1f' } : {}}
                            onClick={() => setActiveTab('conversions')}
                        >
                            Conversiones
                            <span className="badge bg-dark-subtle text-dark ms-2">{conversions.length}</span>
                        </button>
                    </div>
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
