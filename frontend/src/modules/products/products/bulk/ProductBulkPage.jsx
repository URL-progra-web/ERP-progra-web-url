import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { FiCheckCircle, FiDatabase, FiDownload, FiFileText, FiPlus, FiSave, FiTrash2, FiUpload, FiUploadCloud } from 'react-icons/fi';
import AppAlert from '~/core/components/AppAlert';
import AppCard from '~/core/components/AppCard';
import PageHeader from '~/core/components/PageHeader';
import { categoryService } from '../../categories/services/categoryService';
import { productService } from '../services/productService';
import DatalistCellEditor from './DatalistCellEditor';
import ProductImageBulkPanel from './ProductImageBulkPanel';
import {
    buildCategoryDatalistValues,
    buildDatalistValues,
    createEmptyBulkRow,
    findMatchingCategoryLabel,
    findMatchingOptionLabel,
    getCategoryPathLabel,
    normalizeText,
    REQUIRED_FIELDS,
    resolveCategoryId,
    resolveOptionId,
} from './productBulkConfig';
import {
    exportRowsXlsx,
    exportTemplateXlsx,
    readBulkFile,
} from './productBulkFiles';
import './ProductBulkPage.css';

ModuleRegistry.registerModules([AllCommunityModule]);

const normalizeResult = (result) => (Array.isArray(result) ? result : result?.results || []);
const BASE_ROW_COUNT = 12;
const GRID_FIELDS = ['name', 'description', 'category', 'entrepreneur', 'business_unit', 'base_uom'];
const rowHasContent = (row) => GRID_FIELDS.some((field) => String(row[field] || '').trim());
const sameOptionalId = (left, right) => String(left || '') === String(right || '');

const StatusRenderer = ({ value, data }) => {
    const status = value || data?.status || 'draft';
    const label = status === 'ready' ? 'Lista' : status === 'error' ? 'Revisar' : 'Borrador';
    return <span className={`bulk-status-badge ${status}`}>{label}</span>;
};

const ProductBulkPage = () => {
    const gridRef = useRef(null);
    const fileInputRef = useRef(null);
    const historyRef = useRef([]);
    const [rows, setRows] = useState(() => Array.from({ length: BASE_ROW_COUNT }, (_, index) => createEmptyBulkRow(index)));
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [entrepreneurs, setEntrepreneurs] = useState([]);
    const [businessUnits, setBusinessUnits] = useState([]);
    const [uoms, setUoms] = useState([]);
    const [images, setImages] = useState([]);
    const [alert, setAlert] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const productNames = useMemo(() => buildDatalistValues(products), [products]);
    const categoryNames = useMemo(() => buildCategoryDatalistValues(categories), [categories]);
    const entrepreneurNames = useMemo(() => buildDatalistValues(entrepreneurs), [entrepreneurs]);
    const businessUnitNames = useMemo(() => buildDatalistValues(businessUnits), [businessUnits]);
    const uomNames = useMemo(() => buildDatalistValues(uoms), [uoms]);
    const imageProductNames = useMemo(() => {
        const names = [...productNames, ...rows.map((row) => row.name).filter(Boolean)];
        const uniqueNames = new Map();
        names.forEach((name) => uniqueNames.set(normalizeText(name), name));
        return [...uniqueNames.values()].sort((a, b) => a.localeCompare(b));
    }, [productNames, rows]);

    const productToBulkRow = useCallback((product, index) => ({
        ...createEmptyBulkRow(index),
        id: product.id || '',
        name: product.name || '',
        description: product.description || '',
        category: getCategoryPathLabel(categories.find((category) => String(category.id) === String(product.category)), categories) || product.category_name || '',
        entrepreneur: product.entrepreneur_name || '',
        business_unit: product.business_unit_name || '',
        base_uom: product.base_uom_name || '',
    }), [categories]);

    const validateRow = useCallback((row) => {
        if (!rowHasContent(row)) {
            return { ...row, status: 'draft', errors: [] };
        }

        const errors = [];
        REQUIRED_FIELDS.forEach((field) => {
            if (!String(row[field] || '').trim()) errors.push(field);
        });

        if (row.category && !resolveCategoryId(row.category, categories)) errors.push('category');
        if (row.entrepreneur && !resolveOptionId(row.entrepreneur, entrepreneurs)) errors.push('entrepreneur');
        if (row.business_unit && !resolveOptionId(row.business_unit, businessUnits)) errors.push('business_unit');
        if (row.base_uom && !resolveOptionId(row.base_uom, uoms)) errors.push('base_uom');

        return {
            ...row,
            status: errors.length ? 'error' : 'ready',
            errors: [...new Set(errors)],
        };
    }, [businessUnits, categories, entrepreneurs, uoms]);

    const getRowIdentity = useCallback((row) => {
        const name = normalizeText(row.name);
        const entrepreneurId = resolveOptionId(row.entrepreneur, entrepreneurs);
        const businessUnitId = resolveOptionId(row.business_unit, businessUnits);
        const baseUomId = resolveOptionId(row.base_uom, uoms);
        const categoryId = resolveCategoryId(row.category, categories) || '';

        if (!name || !entrepreneurId || !businessUnitId || !baseUomId) return null;
        return [name, entrepreneurId, businessUnitId, baseUomId, categoryId].join('|');
    }, [businessUnits, categories, entrepreneurs, uoms]);

    const validateRows = useCallback((nextRows) => {
        const rowsWithBaseValidation = nextRows.map(validateRow);
        const identityCounts = rowsWithBaseValidation.reduce((acc, row) => {
            if (!rowHasContent(row)) return acc;
            const key = getRowIdentity(row);
            if (!key) return acc;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        return rowsWithBaseValidation.map((row) => {
            const key = getRowIdentity(row);
            if (!key || identityCounts[key] < 2) return row;
            const errors = [...new Set([...(row.errors || []), 'name'])];
            return { ...row, status: 'error', errors };
        });
    }, [getRowIdentity, validateRow]);

    const commitRows = useCallback((updater, { track = true } = {}) => {
        setRows((currentRows) => {
            const nextRows = typeof updater === 'function' ? updater(currentRows) : updater;
            if (track) {
                historyRef.current = [...historyRef.current.slice(-19), currentRows];
            }
            return validateRows(nextRows);
        });
    }, [validateRows]);

    const fetchCatalogs = useCallback(async ({ clearAlert = true } = {}) => {
        try {
            setIsLoading(true);
            const [productsRes, categoriesRes, entrepreneursRes, businessUnitsRes, uomsRes] = await Promise.all([
                productService.getProducts({ page_size: 5000 }),
                categoryService.getCategories(),
                productService.getEntrepreneurs(),
                productService.getBusinessUnits(),
                productService.getUoms(),
            ]);
            setProducts(normalizeResult(productsRes));
            setCategories(normalizeResult(categoriesRes));
            setEntrepreneurs(normalizeResult(entrepreneursRes));
            setBusinessUnits(normalizeResult(businessUnitsRes));
            setUoms(normalizeResult(uomsRes));
            if (clearAlert) setAlert(null);
            return normalizeResult(productsRes);
        } catch {
            setAlert({ type: 'danger', header: 'Error', content: 'No se pudieron cargar los catalogos de soporte.' });
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCatalogs();
    }, [fetchCatalogs]);

    useEffect(() => {
        commitRows((currentRows) => currentRows, { track: false });
    }, [commitRows]);

    const findExistingProductForRow = useCallback((row) => {
        const normalizedName = normalizeText(row.name);
        const entrepreneurId = resolveOptionId(row.entrepreneur, entrepreneurs);
        const businessUnitId = resolveOptionId(row.business_unit, businessUnits);
        const baseUomId = resolveOptionId(row.base_uom, uoms);
        const categoryId = resolveCategoryId(row.category, categories);

        if (!normalizedName || !entrepreneurId || !businessUnitId || !baseUomId) return null;

        return products.find((product) => (
            normalizeText(product.name) === normalizedName &&
            String(product.entrepreneur) === String(entrepreneurId) &&
            String(product.business_unit) === String(businessUnitId) &&
            String(product.base_uom) === String(baseUomId) &&
            (!categoryId || sameOptionalId(product.category, categoryId))
        )) || null;
    }, [businessUnits, categories, entrepreneurs, products, uoms]);

    const hydrateProductMatch = useCallback((row) => {
        const normalizedName = normalizeText(row.name);
        const exactMatch = products.find((product) => normalizeText(product.name) === normalizedName);
        const partialMatch = products.find((product) => normalizeText(product.name).startsWith(normalizedName));
        const match = exactMatch || partialMatch;

        if (!match || !normalizedName) return row;

        const hydratedRow = {
            ...row,
            id: '',
            name: match.name,
            description: row.description || match.description || '',
            category: row.category || getCategoryPathLabel(categories.find((category) => String(category.id) === String(match.category)), categories) || match.category_name || '',
            entrepreneur: row.entrepreneur || match.entrepreneur_name || '',
            business_unit: row.business_unit || match.business_unit_name || '',
            base_uom: row.base_uom || match.base_uom_name || '',
        };

        const existingProduct = findExistingProductForRow(hydratedRow);
        return { ...hydratedRow, id: existingProduct?.id || '' };
    }, [categories, findExistingProductForRow, products]);

    const hydrateRowsWithProductMatches = useCallback((nextRows) => (
        nextRows.map((row) => hydrateProductMatch(row))
    ), [hydrateProductMatch]);

    const handleCellValueChanged = useCallback((event) => {
        commitRows((currentRows) => currentRows.map((row) => {
            if (row.rowId !== event.data.rowId) return row;
            const nextRow = { ...event.data };
            if (event.colDef.field === 'name') return hydrateProductMatch(nextRow);
            if (event.colDef.field === 'category') nextRow.category = findMatchingCategoryLabel(nextRow.category, categories);
            if (event.colDef.field === 'entrepreneur') nextRow.entrepreneur = findMatchingOptionLabel(nextRow.entrepreneur, entrepreneurNames);
            if (event.colDef.field === 'business_unit') nextRow.business_unit = findMatchingOptionLabel(nextRow.business_unit, businessUnitNames);
            if (event.colDef.field === 'base_uom') nextRow.base_uom = findMatchingOptionLabel(nextRow.base_uom, uomNames);
            return nextRow;
        }));
    }, [businessUnitNames, categories, commitRows, entrepreneurNames, hydrateProductMatch, uomNames]);

    const undoLastChange = useCallback(() => {
        const previousRows = historyRef.current.pop();
        if (!previousRows) return;
        setRows(validateRows(previousRows));
    }, [validateRows]);

    const copyFocusedCell = useCallback(async () => {
        const focusedCell = gridRef.current?.api?.getFocusedCell();
        if (!focusedCell) return;
        const row = rows[focusedCell.rowIndex];
        const field = focusedCell.column.getColId();
        if (!row || !GRID_FIELDS.includes(field)) return;
        await navigator.clipboard?.writeText(String(row[field] || ''));
    }, [rows]);

    const normalizePastedRow = useCallback((row) => {
        const nextRow = { ...row };
        nextRow.category = findMatchingCategoryLabel(nextRow.category, categories);
        nextRow.entrepreneur = findMatchingOptionLabel(nextRow.entrepreneur, entrepreneurNames);
        nextRow.business_unit = findMatchingOptionLabel(nextRow.business_unit, businessUnitNames);
        nextRow.base_uom = findMatchingOptionLabel(nextRow.base_uom, uomNames);
        return hydrateProductMatch(nextRow);
    }, [businessUnitNames, categories, entrepreneurNames, hydrateProductMatch, uomNames]);

    const handleGridPaste = useCallback((event) => {
        const text = event.clipboardData?.getData('text/plain');
        const focusedCell = gridRef.current?.api?.getFocusedCell();
        if (!text || !focusedCell) return;

        event.preventDefault();
        const startRowIndex = focusedCell.rowIndex;
        const startFieldIndex = Math.max(0, GRID_FIELDS.indexOf(focusedCell.column.getColId()));
        const pastedRows = text.replace(/\r/g, '').split('\n').filter((line) => line.length).map((line) => line.split('\t'));

        commitRows((currentRows) => {
            const nextRows = [...currentRows];
            const requiredLength = startRowIndex + pastedRows.length;
            while (nextRows.length < requiredLength) {
                nextRows.push(createEmptyBulkRow(nextRows.length));
            }

            pastedRows.forEach((pastedRow, rowOffset) => {
                const targetIndex = startRowIndex + rowOffset;
                const targetRow = { ...nextRows[targetIndex] };
                pastedRow.forEach((value, columnOffset) => {
                    const field = GRID_FIELDS[startFieldIndex + columnOffset];
                    if (field) targetRow[field] = value;
                });
                nextRows[targetIndex] = normalizePastedRow(targetRow);
            });

            return nextRows;
        });
    }, [commitRows, normalizePastedRow]);

    const handleCellKeyDown = useCallback((event) => {
        const keyboardEvent = event.event;
        if (!keyboardEvent?.ctrlKey && !keyboardEvent?.metaKey) return;
        const key = keyboardEvent.key.toLowerCase();

        if (key === 'z') {
            keyboardEvent.preventDefault();
            undoLastChange();
        }

        if (key === 'c') {
            copyFocusedCell();
        }
    }, [copyFocusedCell, undoLastChange]);

    const columnDefs = useMemo(() => [
        {
            field: 'status',
            headerName: 'Revision',
            width: 112,
            editable: false,
            pinned: 'left',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            tooltipValueGetter: (params) => {
                if (params.data?.status === 'ready') return 'Fila lista para guardar';
                if (params.data?.status === 'error') return 'Faltan datos obligatorios o catalogos validos';
                return 'Fila vacia o pendiente';
            },
            cellRenderer: StatusRenderer,
        },
        {
            field: 'name',
            headerName: 'Nombre del producto',
            minWidth: 230,
            editable: true,
            headerClass: 'bulk-required-header',
            cellEditor: DatalistCellEditor,
            cellEditorParams: { values: productNames },
        },
        {
            field: 'description',
            headerName: 'Descripcion',
            minWidth: 260,
            editable: true,
            cellEditor: 'agLargeTextCellEditor',
            cellEditorPopup: true,
        },
        {
            field: 'category',
            headerName: 'Categoria/Subcategoria',
            minWidth: 230,
            editable: true,
            cellEditor: DatalistCellEditor,
            cellEditorParams: { values: categoryNames },
        },
        {
            field: 'entrepreneur',
            headerName: 'Emprendedor',
            minWidth: 220,
            editable: true,
            headerClass: 'bulk-required-header',
            cellEditor: DatalistCellEditor,
            cellEditorParams: { values: entrepreneurNames },
        },
        {
            field: 'business_unit',
            headerName: 'Sede',
            minWidth: 190,
            editable: true,
            headerClass: 'bulk-required-header',
            cellEditor: DatalistCellEditor,
            cellEditorParams: { values: businessUnitNames },
        },
        {
            field: 'base_uom',
            headerName: 'Unidad base',
            minWidth: 160,
            editable: true,
            headerClass: 'bulk-required-header',
            cellEditor: DatalistCellEditor,
            cellEditorParams: { values: uomNames },
        },
    ], [businessUnitNames, categoryNames, entrepreneurNames, productNames, uomNames]);

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: true,
        editable: true,
        singleClickEdit: true,
        cellClassRules: {
            'bulk-cell-error': (params) => params.data?.errors?.includes(params.colDef.field),
        },
    }), []);

    const stats = useMemo(() => {
        const usedRows = rows.filter((row) => row.name || row.description || row.category || row.entrepreneur || row.business_unit || row.base_uom);
        return {
            total: usedRows.length,
            ready: usedRows.filter((row) => row.status === 'ready').length,
            errors: usedRows.filter((row) => row.status === 'error').length,
            images: images.reduce((total, image) => total + (image.productNames?.length || 0), 0),
        };
    }, [images, rows]);

    const addRows = () => {
        commitRows((currentRows) => [
            ...currentRows,
            ...Array.from({ length: 8 }, (_, index) => createEmptyBulkRow(currentRows.length + index)),
        ]);
    };

    const removeSelectedRows = () => {
        const selectedRows = gridRef.current?.api?.getSelectedRows() || [];
        if (!selectedRows.length) {
            setAlert({ type: 'warning', header: 'Selecciona una fila', content: 'Marca una o varias filas de la plantilla para eliminarlas.' });
            return;
        }

        const selectedIds = new Set(selectedRows.map((row) => row.rowId));
        commitRows((currentRows) => {
            const nextRows = currentRows.filter((row) => !selectedIds.has(row.rowId));
            return nextRows.length ? nextRows : Array.from({ length: BASE_ROW_COUNT }, (_, index) => createEmptyBulkRow(index));
        });
    };

    const clearRows = () => {
        historyRef.current = [];
        setRows(Array.from({ length: BASE_ROW_COUNT }, (_, index) => createEmptyBulkRow(index)));
        setAlert(null);
    };

    const clearImages = () => {
        images.forEach((image) => {
            if (image?.previewUrl) {
                URL.revokeObjectURL(image.previewUrl);
            }
        });
        setImages([]);
        setAlert(null);
    };

    const loadCurrentProducts = async () => {
        try {
            const currentProducts = await fetchCatalogs({ clearAlert: false });
            const productRows = currentProducts.map(productToBulkRow);
            commitRows(productRows.length ? productRows : Array.from({ length: BASE_ROW_COUNT }, (_, index) => createEmptyBulkRow(index)));
            setAlert({ type: 'success', header: 'Productos cargados', content: `${currentProducts.length} producto(s) actuales cargados en la plantilla.` });
        } catch {
            setAlert({ type: 'danger', header: 'Error', content: 'No se pudieron cargar los productos actuales.' });
        }
    };

    const handleImportFile = async (file) => {
        if (!file) return;
        try {
            const importedRows = await readBulkFile(file);
            commitRows(importedRows.length ? hydrateRowsWithProductMatches(importedRows) : [createEmptyBulkRow()]);
            setAlert({ type: 'success', header: 'Archivo importado', content: `${importedRows.length} fila(s) listas para revisar.` });
        } catch {
            setAlert({ type: 'danger', header: 'Importacion fallida', content: 'El archivo debe ser CSV, XLS o XLSX con los encabezados de la plantilla.' });
        } finally {
            fileInputRef.current.value = '';
        }
    };

    const buildPayload = (row) => {
        const productImage = images.find((image) => image.productNames?.includes(row.name));
        return {
            name: row.name.trim(),
            description: row.description || '',
            category: resolveCategoryId(row.category, categories),
            entrepreneur: resolveOptionId(row.entrepreneur, entrepreneurs),
            business_unit: resolveOptionId(row.business_unit, businessUnits),
            base_uom: resolveOptionId(row.base_uom, uoms),
            image: productImage?.file || null,
            remove_image: false,
        };
    };

    const buildExistingProductPayload = (product, imageFile) => ({
        name: product.name,
        description: product.description || '',
        category: product.category || null,
        entrepreneur: product.entrepreneur,
        business_unit: product.business_unit,
        base_uom: product.base_uom,
        image: imageFile,
        remove_image: false,
    });

    const getExistingImageUpdates = (readyRows) => {
        const readyNames = new Set(readyRows.map((row) => normalizeText(row.name)));
        return images.flatMap((image) => (image.productNames || [])
            .filter((productName) => !readyNames.has(normalizeText(productName)))
            .map((productName) => {
                const product = products.find((item) => normalizeText(item.name) === normalizeText(productName));
                return product ? { product, imageFile: image.file } : null;
            })
            .filter(Boolean));
    };

    const handleSave = async () => {
        if (isSaving) return;

        const checkedRows = validateRows(rows);
        setRows(checkedRows);
        const readyRows = checkedRows.filter((row) => row.status === 'ready');
        const errorRows = checkedRows.filter((row) => row.status === 'error');
        const existingImageUpdates = getExistingImageUpdates(readyRows);

        if (errorRows.length) {
            setAlert({ type: 'danger', header: 'Revisa la plantilla', content: 'Hay filas incompletas, catalogos invalidos o productos duplicados dentro del bulk.' });
            return;
        }

        if (!readyRows.length && !existingImageUpdates.length) {
            setAlert({ type: 'danger', header: 'Sin datos para guardar', content: 'Agrega productos en la plantilla o asigna imagenes a productos existentes.' });
            return;
        }

        try {
            setIsSaving(true);
            await Promise.all(readyRows.map((row) => {
                const payload = buildPayload(row);
                const existingProduct = findExistingProductForRow(row);
                const productId = row.id || existingProduct?.id;
                return productId ? productService.updateProduct(productId, payload) : productService.createProduct(payload);
            }));
            await Promise.all(existingImageUpdates.map(({ product, imageFile }) => (
                productService.updateProduct(product.id, buildExistingProductPayload(product, imageFile))
            )));
            await fetchCatalogs({ clearAlert: false });
            historyRef.current = [];
            setRows(Array.from({ length: BASE_ROW_COUNT }, (_, index) => createEmptyBulkRow(index)));
            setImages([]);
            const totalOperations = readyRows.length + existingImageUpdates.length;
            setAlert({ type: 'success', header: 'Carga completada', content: `${totalOperations} operacion(es) guardada(s) correctamente. La plantilla quedo limpia para una nueva carga.` });
        } catch (error) {
            const detail = error.response?.data;
            const content = detail && typeof detail === 'object'
                ? Object.values(detail).flat().join(' ')
                : 'No se pudo completar la carga masiva.';
            setAlert({ type: 'danger', header: 'Error al guardar', content });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container-fluid p-0 product-bulk-page">
            <PageHeader
                title="Carga Masiva de Productos"
                subtitle="Plantilla editable con importacion CSV XLSX imagenes y validacion"
                icon={FiUploadCloud}
                actions={(
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                        onClick={loadCurrentProducts}
                        disabled={isLoading}
                        title="Carga los productos actuales del sistema en la plantilla para revisarlos o actualizarlos"
                    >
                        <FiDatabase size={15} />
                        Cargar productos actuales
                    </button>
                )}
            />

            {alert && (
                <AppAlert
                    type={alert.type}
                    header={alert.header}
                    content={alert.content}
                    onClose={() => setAlert(null)}
                />
            )}

            <AppCard accent="var(--bs-primary)">
                <AppCard.Section label="Plantilla bulk">
                    <div className="bulk-command-bar">
                        <div className="bulk-command-group">
                            <button type="button" className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={handleSave} disabled={isSaving || isLoading} title="Guarda productos nuevos actualizaciones e imagenes asignadas">
                                <FiSave size={15} />
                                {isSaving ? 'Guardando' : 'Guardar carga'}
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" onClick={addRows} title="Agrega filas vacias a la plantilla">
                                <FiPlus size={15} />
                                Agregar filas
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" onClick={removeSelectedRows} title="Elimina las filas seleccionadas en la tabla">
                                <FiTrash2 size={15} />
                                Eliminar fila
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" onClick={clearRows} title="Limpia toda la plantilla de productos sin quitar imagenes">
                                <FiTrash2 size={15} />
                                Limpiar productos
                            </button>
                        </div>

                        <div className="bulk-command-group">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xls,.xlsx"
                                className="d-none"
                                onChange={(event) => handleImportFile(event.target.files?.[0])}
                            />
                            <button type="button" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" onClick={() => fileInputRef.current?.click()} title="Importa un archivo CSV XLS o XLSX con la plantilla de productos">
                                <FiUpload size={15} />
                                Importar
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" onClick={exportTemplateXlsx} title="Descarga un Excel de ejemplo con las columnas correctas">
                                <FiFileText size={15} />
                                Descargar plantilla
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" onClick={() => exportRowsXlsx(rows)} title="Exporta lo que esta actualmente en la tabla a Excel">
                                <FiDownload size={15} />
                                Exportar tabla
                            </button>
                        </div>
                    </div>
                    <div className="bulk-help-line">
                        <span><strong>Importar</strong> carga CSV XLS o XLSX</span>
                        <span><strong>Descargar plantilla</strong> baja el formato correcto</span>
                        <span><strong>Exportar tabla</strong> guarda lo que estas editando</span>
                    </div>

                    <div className="bulk-status-strip">
                        <div className="bulk-stat"><span>Filas usadas</span><strong>{stats.total}</strong></div>
                        <div className="bulk-stat"><span>Listas</span><strong>{stats.ready}</strong></div>
                        <div className="bulk-stat"><span>Con errores</span><strong>{stats.errors}</strong></div>
                        <div className="bulk-stat"><span>Imagenes asignadas</span><strong>{stats.images}</strong></div>
                    </div>

                    <div className="bulk-revision-legend">
                        <span className="bulk-legend-title">Revision de filas</span>
                        <span><span className="bulk-status-badge ready">Lista</span> Se puede guardar</span>
                        <span><span className="bulk-status-badge error">Revisar</span> Falta corregir datos</span>
                        <span><span className="bulk-status-badge draft">Borrador</span> Fila vacia o pendiente</span>
                    </div>

                    <div className="bulk-grid-shell ag-theme-quartz" onPaste={handleGridPaste}>
                        <AgGridReact
                            ref={gridRef}
                            rowData={rows}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            getRowId={(params) => params.data.rowId}
                            animateRows
                            undoRedoCellEditing
                            enableCellTextSelection
                            rowSelection="multiple"
                            suppressDragLeaveHidesColumns
                            stopEditingWhenCellsLoseFocus
                            onCellValueChanged={handleCellValueChanged}
                            onCellKeyDown={handleCellKeyDown}
                        />
                    </div>
                </AppCard.Section>

                <AppCard.Section label="Imagenes bulk">
                    <ProductImageBulkPanel
                        rows={rows}
                        productNames={imageProductNames}
                        images={images}
                        onImagesChange={setImages}
                        onClearImages={clearImages}
                    />
                </AppCard.Section>
            </AppCard>

            <div className="small text-muted d-flex align-items-center gap-2 px-1">
                <FiCheckCircle />
                Puedes copiar y pegar rangos desde Excel y deshacer el ultimo cambio con Ctrl Z
            </div>
        </div>
    );
};

export default ProductBulkPage;
