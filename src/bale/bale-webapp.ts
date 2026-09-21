export interface BaleWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface BaleWebApp {
  initData: string;
  version: string;
  colorScheme: 'light' | 'dark';
  ready: () => void;
  expand: () => void;
  close: () => void;
}

declare global {
  interface Window {
    Bale?: { WebApp?: BaleWebApp };
  }
}

export function getBaleWebApp(): BaleWebApp | null {
  return window.Bale?.WebApp ?? null;
}

export function getBaleInitData(): string {
  return getBaleWebApp()?.initData ?? '';
}

export function isBaleEnv(): boolean {
  return getBaleInitData().length > 0;
}

export function baleReady(): void {
  try {
    const app = getBaleWebApp();
    app?.ready();
    app?.expand();
  } catch {
    return;
  }
}

export function getBaleColorScheme(): 'light' | 'dark' {
  return getBaleWebApp()?.colorScheme ?? 'light';
}
