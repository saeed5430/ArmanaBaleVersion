// Include Telegram UI styles first to allow our code override the package CSS.
import '@telegram-apps/telegram-ui/dist/styles.css';

import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';

import { Root } from '@/components/Root.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { getBaleWebApp } from '@/bale/bale-webapp';

import './index.css';

// Mock the environment in case, we are outside Telegram.
import './mockEnv.ts';

const root = ReactDOM.createRoot(document.getElementById('root')!);

function renderBale() {
  root.render(
    <StrictMode>
      <Root platform="bale" />
    </StrictMode>,
  );
}

async function renderTelegram() {
  const { retrieveLaunchParams } = await import('@tma.js/sdk-react');
  const { init } = await import('@/init.ts');
  try {
    const launchParams = retrieveLaunchParams();
    const { tgWebAppPlatform: platform } = launchParams;
    const debug = (launchParams.tgWebAppStartParam || '').includes('debug')
      || import.meta.env.DEV;

    await init({
      debug,
      eruda: debug && ['ios', 'android'].includes(platform),
      mockForMacOS: platform === 'macos',
    });
    root.render(
      <StrictMode>
        <Root platform="telegram" />
      </StrictMode>,
    );
  } catch {
    root.render(<EnvUnsupported />);
  }
}

if (getBaleWebApp()) {
  renderBale();
} else {
  void renderTelegram();
}
