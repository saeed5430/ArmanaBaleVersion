interface BaleBackButton {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
  onClick: (cb: () => void) => void;
  offClick: (cb: () => void) => void;
}

interface BaleWebAppFull {
  initData: string;
  version: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  ready: () => void;
  expand: () => void;
  close: () => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  onEvent: (type: string, handler: (...args: unknown[]) => void) => void;
  offEvent: (type: string, handler: (...args: unknown[]) => void) => void;
  BackButton: BaleBackButton;
}

declare global {
  interface Window {
    Bale?: { WebApp?: BaleWebAppFull };
    Telegram?: { WebApp?: { initData?: string } };
  }
}

export function getBaleWebApp(): BaleWebAppFull | null {
  return window.Bale?.WebApp ?? null;
}

export function getBaleInitData(): string {
  return getBaleWebApp()?.initData ?? '';
}

export function isBaleEnv(): boolean {
  return getBaleWebApp() !== null;
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

export function getBaleThemeParams(): Record<string, string> {
  return getBaleWebApp()?.themeParams ?? {};
}
