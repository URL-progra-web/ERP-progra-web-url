import React from 'react';
import { FiHome, FiChevronRight } from 'react-icons/fi';

export const Breadcrumb = ({ path, onNavigate }) => {
  return (
    <nav className="store-breadcrumb" aria-label="breadcrumb">
      <button type="button" onClick={() => onNavigate(null)}>
        <FiHome size={14} />
        Inicio
      </button>

      {!!path.length && <FiChevronRight size={14} className="text-muted" />}

      {path.map((category, index) => {
        const isLast = index === path.length - 1;

        return (
          <React.Fragment key={category.id}>
            {isLast ? (
              <span className="store-breadcrumb__current">{category.name}</span>
            ) : (
              <button type="button" onClick={() => onNavigate(category.id)}>
                {category.name}
              </button>
            )}
            {!isLast && <FiChevronRight size={14} className="text-muted" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
