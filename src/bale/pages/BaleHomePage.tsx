import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBaleAuth } from '../BaleAuthContext';

export const BaleHomePage: FC = () => {
  const navigate = useNavigate();
  const { user } = useBaleAuth();
  const isProfileComplete = Boolean(user?.phone && user?.first_name && user?.last_name);

  const cards = [
    { title: 'مشخصات مشتری', desc: isProfileComplete ? 'مشاهده و ویرایش اطلاعات' : 'تکمیل اطلاعات برای سفارش', path: '/profile', badge: !isProfileComplete },
    { title: 'سفارش آنلاین', desc: isProfileComplete ? 'مشاهده محصولات و ثبت سفارش' : 'ابتدا مشخصات خود را تکمیل کنید', path: isProfileComplete ? '/shop' : '/profile', badge: false },
    { title: 'پیگیری سفارش‌ها', desc: 'مشاهده وضعیت سفارش‌ها', path: '/orders', badge: false },
  ];

  return (
    <div style={{ padding: '16px', direction: 'rtl', fontFamily: 'Vazirmatn, sans-serif' }}>
      <div style={{ textAlign: 'center', padding: '32px 16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>به فروشگاه آرمانا خوش آمدید</h1>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>شال و روسری با کیفیت</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {cards.map((card) => (
          <button
            key={card.title}
            type="button"
            onClick={() => navigate(card.path)}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '16px', border: '1px solid #E5E7EB', background: '#fff', textAlign: 'right', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>{card.title}</div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>{card.desc}</div>
            </div>
            {card.badge && <span style={{ background: '#EF4444', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>!</span>}
          </button>
        ))}
      </div>
    </div>
  );
};
