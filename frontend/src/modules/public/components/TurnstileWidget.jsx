import React, { useEffect, useRef } from 'react';
import { useTheme } from '~/core/theme/ThemeContext';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'; // Test key para desarrollo

export const TurnstileWidget = ({ onVerify, onError }) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const loadTurnstile = () => {
      if (containerRef.current && window.turnstile && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: (token) => {
            onVerify?.(token);
          },
          'error-callback': () => {
            onError?.('Error en verificación de seguridad');
          },
          'expired-callback': () => {
            onError?.('La verificación ha expirado, intenta de nuevo');
          },
          theme: theme === 'dark' ? 'dark' : 'light',
        });
      }
    };

    // Cargar script de Turnstile si no existe
    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = loadTurnstile;
      document.head.appendChild(script);
    } else {
      loadTurnstile();
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // Widget may already be removed
        }
        widgetIdRef.current = null;
      }
    };
  }, [onVerify, onError, theme]);

  return <div ref={containerRef} className="mb-0" />;
};
