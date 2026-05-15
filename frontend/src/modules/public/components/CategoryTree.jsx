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
        className={`${isSelected ? 'fw-semibold' : ''}`}
        style={{
          paddingLeft: `${level * 14 + 4}px`,
          padding: '6px 8px',
          fontSize: '0.875rem',
          background: isSelected ? 'rgba(var(--bs-primary-rgb), 0.1)' : 'transparent',
          borderRadius: isSelected ? '10px' : '6px',
          border: 'none',
          width: '100%',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: isSelected ? 'var(--bs-primary)' : 'var(--bs-body-color)',
          fontWeight: isSelected ? 600 : 400,
          cursor: 'pointer',
          transition: 'color 0.2s, background 0.2s, border-radius 0.2s',
          onClick={handleSelect},
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--bs-primary)'},
        onMouseLeave={(e) => {
          <span
            onClick={handleToggle}
            aria-hidden="true"
            style={{ width: '14px', display: 'flex', alignItems: 'center' }}
          >
            {expanded ? <FiChevronDown size={12} /> : <FiChevronRight size={12} />}
          </span>
        ) : (
          <span style={{ width: 14 }} />
        )}

        <span style={{ display: 'flex', alignItems: 'center' }}>
          <FiFolder size={12} />
        </span>

        <span className="flex-grow-1">{category.name}</span>

        {category.product_count > 0 && (
          <span style={{ 
            fontSize: '0.7rem', 
            opacity: 0.6,
            marginLeft: 'auto'
          }}>
            {category.product_count}
          </span>
        )}
      </button>

      {hasChildren && expanded && (
        <div style={{ marginTop: '2px' }}>
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
      <button
        type="button"
        className={`${!selectedId ? 'fw-semibold' : ''}`}
        style={{
          padding: '6px 8px',
          fontSize: '0.875rem',
          background: !selectedId ? 'rgba(var(--bs-primary-rgb), 0.1)' : 'transparent',
          borderRadius: !selectedId ? '10px' : '6px',
          border: 'none',
          width: '100%',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: !selectedId ? 'var(--bs-primary)' : 'var(--bs-body-color)',
          fontWeight: !selectedId ? 600 : 400,
          cursor: 'pointer',
          transition: 'color 0.2s, background 0.2s, border-radius 0.2s'
        }}
        onClick={handleClearSelection}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--bs-primary)'}
        onMouseLeave={(e) => {
          if (selectedId) e.currentTarget.style.color = 'var(--bs-body-color)';
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <FiGrid size={12} />
        </span>
        <span className="flex-grow-1">Todas</span>
      </button>

      <div style={{ marginTop: '2px' }}>
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
