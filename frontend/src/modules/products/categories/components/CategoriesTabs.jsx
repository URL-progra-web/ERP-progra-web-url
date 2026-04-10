import React from 'react';

const CategoriesTabs = ({
    rootCategories,
    activeRoot,
    onChange,
    branchCounts,
    totalCount,
}) => {
    const getButtonClasses = (isActive) => `btn btn-sm rounded-pill fw-semibold px-3 py-2 text-nowrap ${isActive
        ? 'btn-dark'
        : 'btn-outline-secondary border-0 bg-body-tertiary text-body'
    }`;

    const renderCount = (count) => (
        <span className="badge bg-body-secondary text-body-secondary rounded-pill ms-2">
            {count}
        </span>
    );

    return (
        <div className="px-4 py-3 bg-body-tertiary border-bottom overflow-auto">
            <div className="d-flex gap-2 flex-nowrap">
                <button
                    type="button"
                    className={getButtonClasses(activeRoot === 'all')}
                    onClick={() => onChange('all')}
                >
                    Todas las categorías
                    {renderCount(totalCount)}
                </button>
                {rootCategories.map(category => (
                    <button
                        key={category.id}
                        type="button"
                        className={getButtonClasses(activeRoot === category.id)}
                        onClick={() => onChange(category.id)}
                        title={`Ver árbol dentro de ${category.name}`}
                    >
                        {category.name}
                        {renderCount(branchCounts[category.id] || 0)}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoriesTabs;
