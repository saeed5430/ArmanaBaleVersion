import { useEffect, useCallback, type FC, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBaleWebApp } from '../bale-webapp';
import './BaleTopBar.css';

interface BaleTopBarProps {
  title: string;
  backTo?: string;
  backLabel?: string;
  children?: ReactNode;
}

export const BaleTopBar: FC<BaleTopBarProps> = ({ title, backTo = '/', backLabel = 'بازگشت', children }) => {
  const navigate = useNavigate();

  const goBack = useCallback(() => {
    navigate(backTo);
  }, [navigate, backTo]);

  useEffect(() => {
    const app = getBaleWebApp();
    if (!app?.BackButton) return;
    app.BackButton.show();
    app.BackButton.onClick(goBack);
    return () => {
      app.BackButton.offClick(goBack);
      app.BackButton.hide();
    };
  }, [goBack]);

  return (
    <header className="bale-topbar">
      <button type="button" className="bale-topbar-back" onClick={goBack} aria-label={backLabel}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span>{backLabel}</span>
      </button>
      <h1 className="bale-topbar-title">{title}</h1>
      <div className="bale-topbar-slot">{children}</div>
    </header>
  );
};
