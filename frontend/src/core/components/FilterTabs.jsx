import React from 'react';

/*
 * Consistent filter / tab toggle buttons (separated, not joined).
 *
 * Usage:
 *   <FilterTabs
 *     options={[{ value: 'all', label: 'Todos' }, { value: 'active', label: 'Activos' }]}
 *     value={currentFilter}
 *     onChange={(val) => setFilter(val)}
 *   />
 *
 * Optional: pass `badge` per option: { value, label, badge: 3 }
 */

const FilterTabs = ({ options, value, onChange, size = 'sm' }) => {
    const padding = size === 'sm' ? '5px 14px' : '7px 18px';
    const fontSize = size === 'sm' ? '12px' : '13px';

    return (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {options.map((opt) => {
                const isActive = opt.value === value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        style={{
                            padding,
                            fontSize,
                            fontFamily: 'var(--font-display)',
                            fontWeight: isActive ? 700 : 600,
                            border: '1px solid',
                            borderColor: isActive
                                ? 'rgba(var(--bs-primary-rgb), 0.5)'
                                : 'var(--bs-border-color)',
                            borderRadius: 'var(--radius-sm)',
                            background: isActive
                                ? 'rgba(var(--bs-primary-rgb), 0.12)'
                                : 'transparent',
                            color: isActive
                                ? 'var(--bs-primary)'
                                : 'var(--bs-secondary-color)',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s, color 0.15s',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {opt.label}
                        {opt.badge != null && (
                            <span
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: 18,
                                    height: 18,
                                    borderRadius: '9px',
                                    padding: '0 5px',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    background: isActive
                                        ? 'var(--bs-primary)'
                                        : 'var(--bs-border-color)',
                                    color: isActive ? 'white' : 'var(--bs-secondary-color)',
                                    transition: 'background-color 0.15s, color 0.15s',
                                }}
                            >
                                {opt.badge}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default FilterTabs;
