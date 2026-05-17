import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { FiChevronDown } from 'react-icons/fi';

const EMPTY_OPTIONS = [];

const normalizeOptions = (options) => (
    options.map((option) => ({
        ...option,
        value: String(option.value ?? ''),
        label: option.label ?? String(option.value ?? ''),
    }))
);

const AppSelect = ({
    id,
    name,
    value = '',
    options = EMPTY_OPTIONS,
    onChange,
    placeholder = 'Seleccionar',
    ariaLabel,
    disabled = false,
    className = '',
}) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const triggerRef = useRef(null);
    const listRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState(null);

    const normalizedOptions = useMemo(() => normalizeOptions(options), [options]);
    const normalizedValue = String(value ?? '');
    const selectedOption = normalizedOptions.find((option) => option.value === normalizedValue);

    const syncMenuPosition = () => {
        const trigger = triggerRef.current;
        if (!trigger) return;

        const rect = trigger.getBoundingClientRect();
        const menu = listRef.current;
        const viewportPadding = 12;
        const maxWidth = window.innerWidth - (viewportPadding * 2);
        const contentWidth = menu ? menu.scrollWidth + 2 : rect.width;
        const width = Math.min(Math.max(rect.width, contentWidth), maxWidth);
        const left = Math.max(
            viewportPadding,
            Math.min(rect.left, window.innerWidth - width - viewportPadding)
        );

        setMenuStyle({
            top: rect.bottom + 6,
            left,
            width,
            maxWidth,
        });
    };

    useEffect(() => {
        if (!isOpen) return undefined;

        syncMenuPosition();
        const frameId = window.requestAnimationFrame(syncMenuPosition);

        const handlePointerDown = (event) => {
            if (
                triggerRef.current?.contains(event.target)
                || listRef.current?.contains(event.target)
            ) {
                return;
            }
            setIsOpen(false);
        };

        const handleViewportChange = () => syncMenuPosition();
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('resize', handleViewportChange);
        window.addEventListener('scroll', handleViewportChange, true);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            window.cancelAnimationFrame(frameId);
            document.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('resize', handleViewportChange);
            window.removeEventListener('scroll', handleViewportChange, true);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, normalizedOptions]);

    const handleSelect = (nextValue) => {
        onChange?.(nextValue);
        setIsOpen(false);
        triggerRef.current?.focus();
    };

    return (
        <>
            {name && <input type="hidden" name={name} value={normalizedValue} />}
            <button
                id={selectId}
                ref={triggerRef}
                type="button"
                className={`app-select ${isOpen ? 'is-open' : ''}${className ? ` ${className}` : ''}`}
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                disabled={disabled}
                onClick={() => setIsOpen((open) => !open)}
            >
                <span className={`app-select__value ${selectedOption ? '' : 'is-placeholder'}`}>
                    {selectedOption?.label || placeholder}
                </span>
                <FiChevronDown size={16} className="app-select__chevron" aria-hidden="true" />
            </button>

            {isOpen && menuStyle && ReactDOM.createPortal(
                <div
                    ref={listRef}
                    className="app-select__menu"
                    style={menuStyle}
                    role="listbox"
                    aria-labelledby={selectId}
                >
                    {normalizedOptions.map((option) => (
                        <button
                            key={`${option.value}-${option.label}`}
                            type="button"
                            role="option"
                            aria-selected={option.value === normalizedValue}
                            disabled={option.disabled}
                            className={`app-select__option ${option.value === normalizedValue ? 'is-selected' : ''}`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
};

export default AppSelect;
