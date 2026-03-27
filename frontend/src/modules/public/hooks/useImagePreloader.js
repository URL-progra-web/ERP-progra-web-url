import { useEffect, useState } from 'react';

export const useImagePreloader = (urls, enabled = true) => {
  const [state, setState] = useState({
    loaded: !enabled,
    loadedCount: 0,
    total: 0,
  });

  useEffect(() => {
    const normalizedUrls = [...new Set((urls || []).filter(Boolean))];

    if (!enabled || normalizedUrls.length === 0) {
      setState({ loaded: true, loadedCount: 0, total: normalizedUrls.length });
      return undefined;
    }

    let cancelled = false;
    let loadedCount = 0;

    setState({ loaded: false, loadedCount: 0, total: normalizedUrls.length });

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
  }, [enabled, urls]);

  return {
    ...state,
    progress: state.total > 0 ? Math.round((state.loadedCount / state.total) * 100) : 100,
  };
};
