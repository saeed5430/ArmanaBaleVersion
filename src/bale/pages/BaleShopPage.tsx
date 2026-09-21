import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { baleGetCategories, baleGetProduct, baleGetProducts, baleCreateOrder, type BaleCategory, type BaleProduct, type BaleVariant } from '../bale-client';

interface SelectedItem {
  variantId: number;
  quantity: number;
}

export const BaleShopPage: FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<BaleCategory[]>([]);
  const [products, setProducts] = useState<BaleProduct[]>([]);
  const [variantsByProduct, setVariantsByProduct] = useState<Record<number, BaleVariant[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Map<number, SelectedItem>>(new Map());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    baleGetCategories().then((r) => setCategories(r.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    baleGetProducts(selectedCategory ?? undefined, search || undefined)
      .then(async (res) => {
        setProducts(res.items);
        const entries = await Promise.all(res.items.map(async (p) => {
          try {
            const detail = await baleGetProduct(p.id);
            return [p.id, detail.variants] as const;
          } catch {
            return [p.id, []] as const;
          }
        }));
        setVariantsByProduct(Object.fromEntries(entries));
        setLoading(false);
      })
      .catch(() => { setProducts([]); setLoading(false); });
  }, [selectedCategory, search]);

  const toggleVariant = useCallback((variantId: number) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(variantId)) next.delete(variantId);
      else next.set(variantId, { variantId, quantity: 1 });
      return next;
    });
  }, []);

  const changeQty = useCallback((variantId: number, delta: number) => {
    setSelected((prev) => {
      const next = new Map(prev);
      const item = next.get(variantId);
      if (!item) return prev;
      const qty = item.quantity + delta;
      if (qty <= 0) next.delete(variantId);
      else next.set(variantId, { ...item, quantity: qty });
      return next;
    });
  }, []);

  const totalQty = useMemo(() => {
    let total = 0;
    selected.forEach((i) => { total += i.quantity; });
    return total;
  }, [selected]);

  const handleSubmit = useCallback(async () => {
    if (submitting || selected.size === 0) return;
    setSubmitting(true);
    try {
      await baleCreateOrder({
        delivery_method: 'in_person',
        items: Array.from(selected.values()).map((i) => ({ variant_id: i.variantId, quantity: i.quantity })),
      });
      setSuccess(true);
      setSelected(new Map());
      setTimeout(() => navigate('/'), 1500);
    } catch {
      setSubmitting(false);
    }
  }, [submitting, selected, navigate]);

  return (
    <div style={{ padding: '16px', direction: 'rtl', fontFamily: 'Vazirmatn, sans-serif' }}>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="جستجو..."
        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E5E7EB', marginBottom: '12px', fontFamily: 'inherit', boxSizing: 'border-box' }}
      />
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px' }}>
        <button type="button" onClick={() => setSelectedCategory(null)} style={chipStyle(selectedCategory === null)}>همه</button>
        {categories.map((c) => (
          <button key={c.id} type="button" onClick={() => setSelectedCategory(c.id)} style={chipStyle(selectedCategory === c.id)}>{c.name}</button>
        ))}
      </div>

      {loading && <p style={{ textAlign: 'center', color: '#6B7280' }}>در حال بارگذاری...</p>}
      {!loading && products.length === 0 && <p style={{ textAlign: 'center', color: '#6B7280' }}>محصولی یافت نشد</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {products.map((p) => (
          <div key={p.id} style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '12px', background: '#fff' }}>
            {p.images[0] && <img src={p.images[0]} alt={p.name} style={{ width: '100%', borderRadius: '12px', marginBottom: '8px' }} />}
            <div style={{ fontWeight: 600, fontSize: '15px' }}>{p.name}</div>
            {p.price > 0 && <div style={{ fontSize: '14px', color: '#7C3AED', marginTop: '4px' }}>{p.price.toLocaleString('fa-IR')} تومان</div>}
            {(variantsByProduct[p.id] ?? []).map((v) => (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', padding: '8px', background: '#F9FAFB', borderRadius: '10px' }}>
                <div style={{ fontSize: '13px' }}>
                  {(v.colors ?? []).map((c) => c.name).join('، ') || `مدل ${v.id}`}
                  {(v.sizes ?? []).length > 0 && ` — ${(v.sizes ?? []).map((s) => s.dimensions).join('، ')}`}
                </div>
                {selected.has(v.id) ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button type="button" onClick={() => changeQty(v.id, 1)} style={qtyBtn}>+</button>
                    <span>{selected.get(v.id)?.quantity}</span>
                    <button type="button" onClick={() => changeQty(v.id, -1)} style={qtyBtn}>−</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => toggleVariant(v.id)} style={addBtn}>افزودن</button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {success && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>سفارش با موفقیت ثبت شد!</div>
      </div>}

      {totalQty > 0 && !success && (
        <button type="button" onClick={handleSubmit} disabled={submitting} style={submitBtn}>
          {submitting ? 'در حال ثبت...' : `ثبت سفارش (${totalQty} کالا)`}
        </button>
      )}
    </div>
  );
};

const chipStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 16px', borderRadius: '20px', border: active ? 'none' : '1px solid #E5E7EB',
  background: active ? '#7C3AED' : '#fff', color: active ? '#fff' : '#374151',
  whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px',
});

const qtyBtn: React.CSSProperties = { width: '28px', height: '28px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer' };
const addBtn: React.CSSProperties = { padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#7C3AED', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px' };
const submitBtn: React.CSSProperties = { position: 'sticky', bottom: '16px', width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: '#7C3AED', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginTop: '16px' };
