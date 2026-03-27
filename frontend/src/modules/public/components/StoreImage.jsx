import React, { useEffect, useState, useRef } from 'react';

export const StoreImage = ({
  src,
  alt,
  className = '',
  imageClassName = '',
  loading = 'lazy',
  priority = false,
  children,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setIsLoaded(false);
    
    // Si la imagen ya está en caché, onLoad puede no dispararse
    // Verificamos si ya está cargada
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    }
  }, [src]);

  return (
    <div className={`store-image-shell ${isLoaded ? 'is-loaded' : ''} ${className}`.trim()}>
      <div className="store-image-skeleton" aria-hidden="true" />
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`store-image ${imageClassName}`.trim()}
        loading={priority ? 'eager' : loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
      />
      {children ? <div className="store-image-overlay">{children}</div> : null}
    </div>
  );
};
