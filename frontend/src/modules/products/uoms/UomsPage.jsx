import React from 'react';
import { FiPlus } from 'react-icons/fi';
import { useUoms } from './hooks/useUoms';
import { useUomPageState } from './hooks/useUomPageState';
import { UomModal } from './components/UomModal';
import { ConversionModal } from './components/ConversionModal';
import { UomsTable } from './components/UomsTable';
import { ConversionsTab } from './components/ConversionsTab';
import AppAlert from '~/core/components/AppAlert';

const UomsPage = () => {
    const {
        uoms, isLoadingUoms, createUom, updateUom, deleteUom,
        conversions, isLoadingConversions,
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-0">Unidades de Medida</h2>
                    <small className="text-muted">Administra UOMs y sus conversiones</small>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center fw-bold shadow-sm"
                    onClick={() => activeTab === 'uoms' ? setUomModal('new') : setConvModal('new')}
                >
                    <FiPlus className="me-2" />
                    {activeTab === 'uoms' ? 'Nueva UOM' : 'Nueva Conversión'}
                </button>
            </div>

            {/* Global error */}
            {error && (
                <AppAlert
                    type="warning"
                    header="Error"
                    content={error}
                    onClose={() => setError(null)}
                />
            )}

            <div className="card border-0 shadow-sm bg-body">
                {/* Tabs */}
                <div className="card-header bg-body border-bottom-0 pb-0">
                    <ul className="nav nav-tabs card-header-tabs">
                        <li className="nav-item">
                            <button
                                className={`nav-link fw-semibold ${activeTab === 'uoms' ? 'active' : ''}`}
                                onClick={() => setActiveTab('uoms')}
                            >
                                Unidades de Medida
                                <span className="badge bg-secondary ms-2">{uoms.length}</span>
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link fw-semibold ${activeTab === 'conversions' ? 'active' : ''}`}
                                onClick={() => setActiveTab('conversions')}
                            >
                                Conversiones
                                <span className="badge bg-secondary ms-2">{conversions.length}</span>
                            </button>
                        </li>
                    </ul>
                </div>

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
