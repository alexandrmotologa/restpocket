import { useEffect, useState, useCallback } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          start_param?: string;
        };
        colorScheme?: 'light' | 'dark';
        themeParams?: Record<string, string>;
        isExpanded?: boolean;
        viewportHeight?: number;
        expand: () => void;
        close: () => void;
        ready: () => void;
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        openLink?: (url: string) => void;
        openTelegramLink?: (url: string) => void;
      };
    };
  }
}

export function useTelegram() {
  const [isInsideTelegram, setIsInsideTelegram] = useState(false);
  const [user, setUser] = useState<{ id: number | string; first_name: string; username?: string } | null>(null);
  const [initData, setInitData] = useState<string>('');

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg && tg.initData) {
      setIsInsideTelegram(true);
      setInitData(tg.initData);
      tg.ready();
      tg.expand();

      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      }

      // Apply theme CSS variables
      if (tg.themeParams) {
        const root = document.documentElement;
        for (const [key, value] of Object.entries(tg.themeParams)) {
          root.style.setProperty(`--tg-theme-${key.replace(/_/g, '-')}`, value);
        }
      }
    } else {
      // Standalone browser mode fallback
      setIsInsideTelegram(false);
      setUser({
        id: 'browser_guest',
        first_name: 'Developer',
        username: 'local_user',
      });
    }
  }, []);

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error') => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.HapticFeedback) return;

    try {
      if (type === 'selection') {
        tg.HapticFeedback.selectionChanged();
      } else if (type === 'success' || type === 'warning' || type === 'error') {
        tg.HapticFeedback.notificationOccurred(type);
      } else {
        tg.HapticFeedback.impactOccurred(type);
      }
    } catch {
      // Haptics not supported in browser, ignore
    }
  }, []);

  return {
    isInsideTelegram,
    user,
    initData,
    triggerHaptic,
  };
}
