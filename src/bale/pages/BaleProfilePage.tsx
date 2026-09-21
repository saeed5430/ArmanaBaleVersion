import { useEffect, useState, type FC } from 'react';
import { useBaleAuth } from '../BaleAuthContext';
import { baleUpdateProfile } from '../bale-client';

export const BaleProfilePage: FC = () => {
  const { user, refreshUser } = useBaleAuth();
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', address: '', postal_code: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        address: user.address || '',
        postal_code: user.postal_code || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await baleUpdateProfile(form);
      await refreshUser();
      setMessage('ذخیره شد');
    } catch {
      setMessage('خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div style={{ padding: '16px', direction: 'rtl', fontFamily: 'Vazirmatn, sans-serif' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px' }}>مشخصات مشتری</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Field label="نام" value={form.first_name} onChange={set('first_name')} />
        <Field label="نام خانوادگی" value={form.last_name} onChange={set('last_name')} />
        <Field label="تلفن (۱۱ رقم)" value={form.phone} onChange={set('phone')} inputMode="numeric" />
        <Field label="کد پستی (۱۰ رقم)" value={form.postal_code} onChange={set('postal_code')} inputMode="numeric" />
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
          آدرس
          <textarea value={form.address} onChange={set('address')} rows={3} style={inputStyle} />
        </label>
        <button type="submit" disabled={saving} style={submitStyle}>{saving ? 'در حال ذخیره...' : 'ذخیره'}</button>
        {message && <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>{message}</p>}
      </form>
    </div>
  );
};

function Field({ label, value, onChange, inputMode }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; inputMode?: 'numeric' }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
      {label}
      <input value={value} onChange={onChange} inputMode={inputMode} style={inputStyle} />
    </label>
  );
}

const inputStyle: React.CSSProperties = { padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB', fontFamily: 'inherit', fontSize: '14px', boxSizing: 'border-box' };
const submitStyle: React.CSSProperties = { padding: '14px', borderRadius: '14px', border: 'none', background: '#7C3AED', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' };
