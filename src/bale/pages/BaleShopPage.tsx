import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { baleGetCategories, baleGetProduct, baleGetProducts, baleCreateOrder, type BaleCategory, type BaleProduct, type BaleVariant } from '../bale-client';
import './BaleShopPage.css';

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
    <div className="bale-shop">
      <div className="bale-shop-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو..." />
      </div>

      <div className="bale-shop-chips">
        <button type="button" onClick={() => setSelectedCategory(null)} className={`bale-chip ${selectedCategory === null ? 'bale-chip-active' : ''}`}>همه</button>
        {categories.map((c) => (
          <button key={c.id} type="button" onClick={() => setSelectedCategory(c.id)} className={`bale-chip ${selectedCategory === c.id ? 'bale-chip-active' : ''}`}>{c.name}</button>
        ))}
      </div>

      {loading && <div className="bale-shop-loading">در حال بارگذاری...</div>}
      {!loading && products.length === 0 && (
        <div className="bale-shop-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p>محصولی یافت نشد</p>
        </div>
      )}

      <div className="bale-shop-list">
        {products.map((p) => (
          <div key={p.id} className="bale-product">
            {p.images[0] && <img src={p.images[0]} alt={p.name} />}
            <div className="bale-product-body">
              <h3 className="bale-product-name">{p.name}</h3>
              {p.price > 0 && <p className="bale-product-price">{p.price.toLocaleString('fa-IR')} تومان</p>}
              {(variantsByProduct[p.id] ?? []).map((v) => (
                <div key={v.id} className="bale-variant">
                  <span>
                    {(v.colors ?? []).map((c) => (
                      <span key={c.id}>
                        <span className="bale-variant-dot" style={{ backgroundColor: c.hex }} />
                        {c.name}{' '}
                      </span>
                    ))}
                    {(v.colors ?? []).length === 0 && `مدل ${v.id}`}
                    {(v.sizes ?? []).length > 0 && ` — ${(v.sizes ?? []).map((s) => s.dimensions).join('، ')}`}
                  </span>
                  {selected.has(v.id) ? (
                    <span className="bale-qty">
                      <button type="button" className="bale-qty-btn" onClick={() => changeQty(v.id, 1)}>+</button>
                      <span className="bale-qty-val">{selected.get(v.id)?.quantity}</span>
                      <button type="button" className="bale-qty-btn" onClick={() => changeQty(v.id, -1)}>−</button>
                    </span>
                  ) : (
                    <button type="button" className="bale-add-btn" onClick={() => toggleVariant(v.id)}>افزودن</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {success && (
        <div className="bale-shop-overlay">
          <div className="bale-shop-success">سفارش با موفقیت ثبت شد!</div>
        </div>
      )}

      {totalQty > 0 && !success && (
        <button type="button" className="bale-submit" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'در حال ثبت...' : `ثبت سفارش (${totalQty} کالا)`}
        </button>
      )}
    </div>
  );
};
