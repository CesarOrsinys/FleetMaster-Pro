import { LanguageManager } from '../i18n/LanguageManager.js';

export class LoadingService {
  private static activeCount = 0;
  private static overlayEl: HTMLElement | null = null;
  private static textEl: HTMLElement | null = null;
  private static hideTimer: any = null;
  private static minDisplayStart = 0;
  private static MIN_DURATION_MS = 320; // Ensures the car driving animation displays smoothly and feels responsive

  public static init(): void {
    this.overlayEl = document.getElementById('global-service-loader');
    this.textEl = document.getElementById('global-loader-text');
    this.interceptFetch();
  }

  public static show(customMessage?: string): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    if (this.textEl) {
      this.textEl.textContent = customMessage || LanguageManager.t('loadingServiceText');
    }

    this.activeCount++;
    if (this.activeCount === 1) {
      this.minDisplayStart = Date.now();
      if (this.overlayEl) {
        this.overlayEl.classList.remove('hide');
        // Force reflow for smooth transition
        void this.overlayEl.offsetHeight;
        this.overlayEl.classList.add('active');
      }
    }
  }

  public static hide(): void {
    this.activeCount = Math.max(0, this.activeCount - 1);
    if (this.activeCount === 0) {
      const elapsed = Date.now() - this.minDisplayStart;
      const remaining = Math.max(0, this.MIN_DURATION_MS - elapsed);

      this.hideTimer = setTimeout(() => {
        if (this.activeCount === 0 && this.overlayEl) {
          this.overlayEl.classList.remove('active');
          setTimeout(() => {
            if (this.activeCount === 0 && this.overlayEl) {
              this.overlayEl.classList.add('hide');
            }
          }, 200);
        }
      }, remaining);
    }
  }

  private static interceptFetch(): void {
    if (typeof window === 'undefined' || !window.fetch) return;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = typeof args[0] === 'string' 
        ? args[0] 
        : (args[0] && typeof (args[0] as Request).url === 'string') 
        ? (args[0] as Request).url 
        : '';

      const isApiService = typeof url === 'string' && url.includes('/api/');

      if (isApiService) {
        LoadingService.show();
      }

      try {
        return await originalFetch(...args);
      } finally {
        if (isApiService) {
          LoadingService.hide();
        }
      }
    };
  }
}
