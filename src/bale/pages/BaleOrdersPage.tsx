import { useEffect, useState, type FC } from 'react';
import { baleGetMyOrders, type BaleOrder } from '../bale-client';

export const BaleOrdersPage: FC = () => {
  const [orders, setOrders] = useState<BaleOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    baleGetMyOrders().then((r) => setOrders(r.orders)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '16px', direction: 'rtl', fontFamily: 'Vazirmatn, sans-serif' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 16px' }}>سفارش‌های من</h2>
      {loading && <p style={{ textAlign: 'center', color: '#6B7280' }}>در حال بارگذاری...</p>}
      {!loading && orders.length === 0 && <p style={{ textAlign: 'center', color: '#6B7280' }}>سفارشی ثبت نشده است</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {orders.map((o) => (
          <div key={o.id} style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '12px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600 }}>سفارش #{o.id}</span>
              <span style={{ fontSize: '13px', color: o.payment_status === 'paid' ? '#22C55E' : '#F59E0B' }}>
                {o.payment_status === 'paid' ? 'پرداخت شده' : 'در انتظار پرداخت'}
              </span>
            </div>
            {(o.items ?? []).map((it, i) => (
              <div key={i} style={{ fontSize: '13px', color: '#4B5563', padding: '4px 0' }}>
                {it.product_name ?? 'محصول'}{it.color_name ? ` — ${it.color_name}` : ''}{it.size_dimensions ? ` — ${it.size_dimensions}` : ''} ×{it.quantity}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
