import { useEffect, useState, type FC } from 'react';
import { baleGetMyOrders, type BaleOrder } from '../bale-client';
import './BaleOrdersPage.css';

export const BaleOrdersPage: FC = () => {
  const [orders, setOrders] = useState<BaleOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    baleGetMyOrders().then((r) => setOrders(r.orders)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <main className="bale-orders">
      <h1>سفارش‌های من</h1>
      {loading && <p className="bale-orders-empty">در حال دریافت سفارش‌ها...</p>}
      {!loading && orders.length === 0 && <p className="bale-orders-empty">هنوز سفارشی ثبت نکرده‌اید.</p>}
      {!loading && orders.length > 0 && (
        <div className="bale-orders-list">
          {orders.map((o) => (
            <div key={o.id} className="bale-order-card">
              <div className="bale-order-header">
                <strong>سفارش #{o.id}</strong>
                <span className={`bale-order-status ${o.payment_status === 'paid' ? 'bale-order-status-paid' : 'bale-order-status-pending'}`}>
                  {o.payment_status === 'paid' ? 'پرداخت شده' : 'در انتظار پرداخت'}
                </span>
              </div>
              {(o.items ?? []).length > 0 && (
                <ul className="bale-order-items">
                  {(o.items ?? []).map((it, i) => (
                    <li key={i} className="bale-order-item">
                      <span>{it.product_name ?? 'محصول'}{it.color_name ? ` — ${it.color_name}` : ''}{it.size_dimensions ? ` — ${it.size_dimensions}` : ''}</span>
                      <span className="bale-order-qty">×{it.quantity}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
};
