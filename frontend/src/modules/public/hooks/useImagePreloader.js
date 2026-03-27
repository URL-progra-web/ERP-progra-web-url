import { useEffect, useMemo, useState } from 'react';

export const useImagePreloader = (urls, enabled = true) => {
  const cacheKey = useMemo(() => [...new Set((urls || []).filter(Boolean))].join('|'), [urls]);
  const normalizedUrls = useMemo(() => (cacheKey ? cacheKey.split('|') : []), [cacheKey]);

  const [state, setState] = useState({
    loaded: !enabled,
    loadedCount: 0,
    total: 0,
  });

  useEffect(() => {
    if (!enabled || normalizedUrls.length === 0) {
      setState((previous) => {
        if (previous.loaded && previous.total === normalizedUrls.length && previous.loadedCount === 0) {
          return previous;
        }

        return { loaded: true, loadedCount: 0, total: normalizedUrls.length };
      });
      return undefined;
    }

    let cancelled = false;
    let loadedCount = 0;

    setState((previous) => {
      if (!previous.loaded && previous.loadedCount === 0 && previous.total === normalizedUrls.length) {
        return previous;
      }

      return { loaded: false, loadedCount: 0, total: normalizedUrls.length };
    });

    const handleAssetReady = () => {
      loadedCount += 1;

      if (!cancelled) {
        setState({
          loaded: loadedCount >= normalizedUrls.length,
          loadedCount,
          total: normalizedUrls.length,
        });
      }
    };

    const imageRefs = normalizedUrls.map((url) => {
      const image = new Image();
      image.onload = handleAssetReady;
      image.onerror = handleAssetReady;
      image.src = url;
      return image;
    });

    return () => {
      cancelled = true;
      imageRefs.forEach((image) => {
        image.onload = null;
        image.onerror = null;
      });
    };
  }, [cacheKey, enabled]);

  return {
    ...state,
    progress: state.total > 0 ? Math.round((state.loadedCount / state.total) * 100) : 100,
  };
};
