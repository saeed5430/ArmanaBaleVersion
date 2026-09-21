import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getBaleInitData, baleReady, isBaleEnv } from '@/bale/bale-webapp';
import { baleLogin, baleMe, type BaleUser } from '@/bale/bale-client';

interface BaleAuthContextType {
  user: BaleUser | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const BaleAuthContext = createContext<BaleAuthContextType>({
  user: null,
  loading: true,
  error: null,
  refreshUser: async () => {},
});

export function useBaleAuth() {
  return useContext(BaleAuthContext);
}

export function BaleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BaleUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    baleReady();
    if (!isBaleEnv()) {
      setError('لطفا از داخل بله وارد شوید');
      setLoading(false);
      return;
    }
    doLogin();
  }, []);

  async function doLogin() {
    try {
      const initData = getBaleInitData();
      const result = await baleLogin(initData);
      if (result.success && result.session_token) {
        localStorage.setItem('bale_session_token', result.session_token);
        const res = await baleMe();
        setUser(res.user);
      } else {
        setError(result.error || 'خطا در ورود');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ورود');
    } finally {
      setLoading(false);
    }
  }

  async function refreshUser() {
    try {
      const res = await baleMe();
      setUser(res.user);
    } catch {
      return;
    }
  }

  return (
    <BaleAuthContext.Provider value={{ user, loading, error, refreshUser }}>
      {children}
    </BaleAuthContext.Provider>
  );
}
