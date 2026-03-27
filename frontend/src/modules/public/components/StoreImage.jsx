import React, { useEffect, useState } from 'react';

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

  useEffect(() => {
    setIsLoaded(false);
  }, [src]);

  return (
    <div className={`store-image-shell ${isLoaded ? 'is-loaded' : ''} ${className}`.trim()}>
      <div className="store-image-skeleton" aria-hidden="true" />
      <img
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
