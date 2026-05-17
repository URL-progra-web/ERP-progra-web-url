import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiImage, FiSearch, FiTrash2, FiUploadCloud, FiX } from 'react-icons/fi';

const getStem = (filename) => filename.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
const normalize = (value) => String(value || '').trim().toLowerCase();
const compactFileName = (filename) => {
    const extension = filename.includes('.') ? filename.split('.').pop() : '';
    const stem = getStem(filename);
    return extension ? `${stem.slice(0, 34)}.${extension}` : stem.slice(0, 38);
};

const ProductImageBulkPanel = ({ images, productNames, onImagesChange, onClearImages }) => {
    const inputRef = useRef(null);
    const imagesRef = useRef(images);
    const [searchByImage, setSearchByImage] = useState({});
    const visibleProductNames = useMemo(() => productNames || [], [productNames]);

    useEffect(() => {
        imagesRef.current = images;
    }, [images]);

    useEffect(() => () => {
        imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    }, []);

    const handleFiles = (files) => {
        const nextImages = Array.from(files || []).flatMap((file) => {
            if (!file.type.startsWith('image/')) return [];
            const stem = getStem(file.name);
            const normalizedStem = normalize(stem);
            const matches = visibleProductNames.filter((name) => {
                const normalizedName = normalize(name);
                return normalizedName.includes(normalizedStem) || normalizedStem.includes(normalizedName);
            });
            return [{
                id: `${file.name}-${file.lastModified}-${Math.random().toString(16).slice(2)}`,
                file,
                fileName: file.name,
                productNames: matches,
                previewUrl: URL.createObjectURL(file),
            }];
        });

        onImagesChange([...images, ...nextImages]);
        if (inputRef.current) inputRef.current.value = '';
    };

    const addProduct = (imageId, productName) => {
        if (!productName) return;
        onImagesChange(images.map((image) => {
            if (image.id !== imageId) return image;
            const currentNames = image.productNames || [];
            if (currentNames.includes(productName)) return image;
            return { ...image, productNames: [...currentNames, productName] };
        }));
        setSearchByImage((current) => ({ ...current, [imageId]: '' }));
    };

    const removeProduct = (imageId, productName) => {
        onImagesChange(images.map((image) => (
            image.id === imageId
                ? { ...image, productNames: (image.productNames || []).filter((name) => name !== productName) }
                : image
        )));
    };

    const removeImage = (imageId) => {
        const imageToRemove = images.find((image) => image.id === imageId);
        if (imageToRemove) URL.revokeObjectURL(imageToRemove.previewUrl);
        onImagesChange(images.filter((image) => image.id !== imageId));
        setSearchByImage((current) => {
            const next = { ...current };
            delete next[imageId];
            return next;
        });
    };

    const setAllProducts = (imageId) => {
        onImagesChange(images.map((image) => (
            image.id === imageId ? { ...image, productNames: visibleProductNames } : image
        )));
    };

    const clearProducts = (imageId) => {
        onImagesChange(images.map((image) => (
            image.id === imageId ? { ...image, productNames: [] } : image
        )));
    };

    const getSuggestions = (image) => {
        const search = normalize(searchByImage[image.id]);
        const assigned = new Set(image.productNames || []);
        return visibleProductNames
            .filter((name) => !assigned.has(name) && (!search || normalize(name).includes(search)))
            .slice(0, 8);
    };

    return (
        <div className="bulk-images-panel bulk-images-panel-premium">
            <div className="bulk-image-upload-column">
                <button
                    type="button"
                    className="bulk-drop-zone"
                    onClick={() => inputRef.current?.click()}
                >
                    <FiUploadCloud size={28} className="text-accent" />
                    <span className="fw-semibold">Cargar imagenes de productos</span>
                    <span className="small text-muted">Busca productos y agregalos a cada imagen</span>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="d-none"
                        onChange={(event) => handleFiles(event.target.files)}
                    />
                </button>
                <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center gap-2"
                    onClick={onClearImages}
                    disabled={!images.length}
                    title="Quita todas las imagenes cargadas y sus asignaciones"
                >
                    <FiTrash2 size={15} />
                    Limpiar imagenes
                </button>
            </div>

            <div className="bulk-image-list">
                {images.length === 0 && (
                    <div className="bulk-image-empty">
                        <FiImage />
                        <span>Las imagenes se asignan aqui y no forman parte del Excel</span>
                    </div>
                )}

                {images.map((image) => {
                    const suggestions = getSuggestions(image);
                    const searchValue = searchByImage[image.id] || '';

                    return (
                        <div className="bulk-image-row bulk-image-row-premium" key={image.id}>
                            <img src={image.previewUrl} alt={image.fileName} />
                        <div className="bulk-image-meta min-w-0">
                            <div className="d-flex align-items-start justify-content-between gap-2">
                                <div className="min-w-0">
                                        <div className="bulk-image-title" title={image.fileName}>{compactFileName(image.fileName)}</div>
                                        <div className="bulk-image-count">{(image.productNames || []).length} producto(s) asignado(s)</div>
                                    </div>
                                    <button type="button" className="bulk-icon-button" onClick={() => removeImage(image.id)} aria-label="Quitar imagen">
                                        <FiX size={15} />
                                    </button>
                                </div>
                                <div className="bulk-image-actions">
                                    <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setAllProducts(image.id)}>
                                        Todos
                                    </button>
                                    <button type="button" className="btn btn-link btn-sm p-0 text-muted" onClick={() => clearProducts(image.id)}>
                                        Ninguno
                                    </button>
                                </div>
                            </div>

                            <div className="bulk-product-picker">
                                <div className="bulk-picker-label">Buscar y asignar producto</div>
                                <div className="bulk-search-box">
                                    <FiSearch size={15} />
                                    <input
                                        type="text"
                                        value={searchValue}
                                        placeholder="Escribe el nombre del producto"
                                        onChange={(event) => setSearchByImage((current) => ({ ...current, [image.id]: event.target.value }))}
                                    />
                                </div>

                                {searchValue && (
                                    <div className="bulk-suggestion-list">
                                        {suggestions.length === 0 && (
                                            <div className="bulk-suggestion-empty">Sin coincidencias</div>
                                        )}
                                        {suggestions.map((name) => (
                                            <button
                                                type="button"
                                                key={`${image.id}-${name}`}
                                                className="bulk-suggestion-item"
                                                onClick={() => addProduct(image.id, name)}
                                            >
                                                <span>{name}</span>
                                                <small>Agregar</small>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="bulk-product-chip-list">
                                    {(image.productNames || []).length === 0 && (
                                        <span className="bulk-chip-empty">Sin productos asignados</span>
                                    )}
                                    {(image.productNames || []).map((name) => (
                                        <span className="bulk-product-chip" key={`${image.id}-chip-${name}`}>
                                            {name}
                                            <button type="button" onClick={() => removeProduct(image.id, name)} aria-label={`Quitar ${name}`}>
                                                <FiX size={13} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProductImageBulkPanel;
