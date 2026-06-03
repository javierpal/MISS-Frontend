import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'miss-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  private currentTheme: ThemeMode = 'light';

  /** Get the currently active theme mode. */
  get theme(): ThemeMode {
    return this.currentTheme;
  }

  /** Check if dark theme is active. */
  get isDark(): boolean {
    return this.currentTheme === 'dark';
  }

  /** Initialize theme from localStorage or system preference. */
  init(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const storage = this.document.defaultView?.localStorage;
    if (storage) {
      const stored = storage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        this.currentTheme = stored;
      } else {
        // Respect OS preference
        if (
          this.document.defaultView?.matchMedia &&
          this.document.defaultView.matchMedia('(prefers-color-scheme: dark)').matches
        ) {
          this.currentTheme = 'dark';
        }
      }
      this.applyTheme();
    }
  }

  /** Toggle between light and dark. */
  toggle(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme();
    this.persist();
  }

  /** Set theme explicitly. */
  setTheme(mode: ThemeMode): void {
    this.currentTheme = mode;
    this.applyTheme();
    this.persist();
  }

  /** Get current theme as string for template binding. */
  getTheme(): string {
    return this.currentTheme;
  }

  private applyTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const body = this.document.querySelector('body');
    if (body) {
      body.classList.toggle('theme-dark', this.currentTheme === 'dark');
    }
    const html = this.document.querySelector('html');
    if (html) {
      html.setAttribute('color-scheme', this.currentTheme);
    }
  }

  private persist(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const storage = this.document.defaultView?.localStorage;
    if (storage) {
      storage.setItem(THEME_STORAGE_KEY, this.currentTheme);
    }
  }
}
