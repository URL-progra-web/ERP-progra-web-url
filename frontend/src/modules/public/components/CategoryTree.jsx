import React, { useEffect, useState } from 'react';
import { FiChevronDown, FiChevronRight, FiFolder, FiGrid } from 'react-icons/fi';

const hasSelectedDescendant = (category, selectedId) => {
  if (!selectedId || !category.children?.length) {
    return false;
  }

  return category.children.some((child) => child.id === selectedId || hasSelectedDescendant(child, selectedId));
};

const CategoryNode = ({ category, selectedId, onSelect, level = 0 }) => {
  const [expanded, setExpanded] = useState(hasSelectedDescendant(category, selectedId));
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = category.id === selectedId;

  useEffect(() => {
    if (hasSelectedDescendant(category, selectedId)) {
      setExpanded(true);
    }
  }, [category, selectedId]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleSelect = () => {
    onSelect(category.id);
    if (hasChildren) {
      setExpanded(true);
    }
  };

  return (
    <div className="store-category-tree__node">
      <button
        type="button"
        className={`store-category-item ${isSelected ? 'is-selected' : ''}`}
        style={{ paddingLeft: `${level * 18 + 14}px` }}
        onClick={handleSelect}
      >
        {hasChildren ? (
          <span
            onClick={handleToggle}
            aria-hidden="true"
          >
            {expanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
          </span>
        ) : (
          <span style={{ width: 14 }} />
        )}

        <span className="store-category-item__icon">
          <FiFolder size={14} />
        </span>

        <span className="flex-grow-1 text-start">{category.name}</span>

        {category.product_count > 0 && (
          <span className="store-pill ms-auto">
            {category.product_count}
          </span>
        )}
      </button>

      {hasChildren && expanded && (
        <div className="d-grid gap-2 mt-2">
          {category.children.map(child => (
            <CategoryNode
              key={child.id}
              category={child}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryTree = ({ categories, selectedId, onSelect }) => {
  const handleClearSelection = () => {
    onSelect(null);
  };

  return (
    <div className="store-category-tree">
      <div className="d-flex justify-content-between align-items-center gap-3">
        <div>
          <span className="store-kicker">Navegacion</span>
          <h3 className="store-card__title mt-2">Categorias</h3>
        </div>
        <span className="store-pill"><FiGrid size={12} /> {categories.length}</span>
      </div>

      <button
        type="button"
        className={`store-category-item ${!selectedId ? 'is-selected' : ''}`}
        onClick={handleClearSelection}
      >
        <span className="store-category-item__icon">
          <FiGrid size={14} />
        </span>
        <span className="flex-grow-1 text-start">Todas las categorias</span>
      </button>

      <div className="d-grid gap-2">
        {categories.map(category => (
          <CategoryNode
            key={category.id}
            category={category}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};
