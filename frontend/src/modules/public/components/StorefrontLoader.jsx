import React from 'react';

export const StorefrontLoader = ({ visible, progress = 0, label = 'Cargando experiencia visual' }) => {
  if (!visible) {
    return null;
  }

  return (
    <div className="storefront-loader" role="status" aria-live="polite">
      <div className="storefront-loader__panel glass-surface">
        <span className="storefront-kicker">Storefront</span>
        <h2 className="storefront-loader__title">{label}</h2>
        <p className="storefront-loader__text">
          Estamos preparando las imagenes editoriales y el recorrido de compra<span className="store-loader-dots"></span>
        </p>
        <div className="storefront-loader__bar">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="storefront-loader__meta">
          <span>Assets en preparacion</span>
          <strong>{progress}%</strong>
        </div>
      </div>
    </div>
  );
};
