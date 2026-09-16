import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const emptyItem = { productId: '', quantity: 1, unitPrice: '', discountPct: 0, gstPct: 18 };

// Mirrors the server's calculation (src/utils/pricing.js) purely for an
// instant on-screen preview — the number that actually gets saved is
// always recomputed by the backend from the submitted quantity/price/
// discount/GST, never trusted from this preview.
function lineTotal(item) {
  const qty = Number(item.quantity) || 0;
  const price = Number(item.unitPrice) || 0;
  const disc = Number(item.discountPct) || 0;
  const gst = Number(item.gstPct) || 0;
  const base = qty * price;
  const afterDiscount = base * (1 - disc / 100);
  return afterDiscount * (1 + gst / 100);
}

export default function Quotations() {
  const { user } = useAuth();
  const isSales = user?.role === 'SALES';

  const [quotations, setQuotations] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  const [enquiryId, setEnquiryId] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems] = useState([{ ...emptyItem }]);

  async function loadData() {
    setLoading(true);
    try {
      const [quoRes, enqRes, prodRes] = await Promise.all([
        api.get('/quotations'),
        api.get('/enquiries'),
        api.get('/products'),
      ]);
      setQuotations(quoRes.data);
      setEnquiries(enqRes.data);
      setProducts(prodRes.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateItem(index, field, value) {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== index) return it;
        const updated = { ...it, [field]: value };
        if (field === 'productId') {
          const product = products.find((p) => String(p.id) === String(value));
          if (product) updated.unitPrice = product.base_price;
        }
        return updated;
      })
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { ...emptyItem }]);
  }

  function removeItem(i) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  const previewTotal = items.reduce((sum, it) => sum + lineTotal(it), 0);

  function resetForm() {
    setEnquiryId('');
    setValidUntil('');
    setItems([{ ...emptyItem }]);
    setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const payload = {
        enquiryId: Number(enquiryId),
        validUntil: validUntil || undefined,
        items: items
          .filter((it) => it.productId)
          .map((it) => ({
            productId: Number(it.productId),
            quantity: Number(it.quantity),
            unitPrice: Number(it.unitPrice),
            discountPct: Number(it.discountPct) || 0,
            gstPct: Number(it.gstPct) || 0,
          })),
      };
      await api.post('/quotations', payload);
      resetForm();
      setShowForm(false);
      await loadData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Could not create quotation');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(id, status) {
    setActionError('');
    try {
      await api.patch(`/quotations/${id}/status`, { status });
      await loadData();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Could not update status');
    }
  }

  async function handleConvert(id) {
    setActionError('');
    try {
      await api.post(`/quotations/${id}/convert`);
      await loadData();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Could not convert to sales order');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Quotations</h2>
        {isSales && (
          <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Cancel' : '+ New Quotation'}
          </button>
        )}
      </div>

      {actionError && <div className="alert alert-error">{actionError}</div>}

      {showForm && (
        <form className="card form" onSubmit={handleSubmit}>
          {formError && <div className="alert alert-error">{formError}</div>}
          <label>
            Enquiry
            <select value={enquiryId} onChange={(e) => setEnquiryId(e.target.value)} required>
              <option value="">Select enquiry…</option>
              {enquiries.map((en) => (
                <option key={en.id} value={en.id}>
                  {en.enquiryNumber} — {en.companyName} ({en.status})
                </option>
              ))}
            </select>
          </label>
          <label>
            Valid until
            <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          </label>

          <h4>Line items</h4>
          <div className="item-row-header quotation-item-row">
            <span>Product</span>
            <span>Qty</span>
            <span>Unit price</span>
            <span>Disc %</span>
            <span>GST %</span>
            <span>Line total</span>
            <span />
          </div>
          {items.map((item, i) => (
            <div className="item-row quotation-item-row" key={i}>
              <select value={item.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)} required>
                <option value="">Product…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.product_code}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                required
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.unitPrice}
                onChange={(e) => updateItem(i, 'unitPrice', e.target.value)}
                required
              />
              <input
                type="number"
                min="0"
                max="100"
                value={item.discountPct}
                onChange={(e) => updateItem(i, 'discountPct', e.target.value)}
              />
              <input
                type="number"
                min="0"
                value={item.gstPct}
                onChange={(e) => updateItem(i, 'gstPct', e.target.value)}
              />
              <span className="line-total">₹{lineTotal(item).toFixed(2)}</span>
              {items.length > 1 && (
                <button type="button" className="btn btn-ghost" onClick={() => removeItem(i)}>
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-ghost" onClick={addItem}>
            + Add line
          </button>

          <div className="preview-total">
            Estimated total: <strong>₹{previewTotal.toFixed(2)}</strong>{' '}
            <span className="muted">(recalculated by the server on save)</span>
          </div>

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Quotation'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Quotation #</th>
              <th>Customer</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th>Grand Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((q) => (
              <tr key={q.id}>
                <td>{q.quotationNumber}</td>
                <td>{q.companyName}</td>
                <td>{q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '—'}</td>
                <td>
                  <span className={`badge badge-${q.status.toLowerCase()}`}>{q.status}</span>
                </td>
                <td>₹{Number(q.grandTotal).toFixed(2)}</td>
                <td className="actions">
                  {isSales && q.status === 'DRAFT' && (
                    <button className="btn btn-small" onClick={() => handleStatusChange(q.id, 'SENT')}>
                      Mark Sent
                    </button>
                  )}
                  {isSales && q.status === 'SENT' && (
                    <>
                      <button
                        className="btn btn-small btn-success"
                        onClick={() => handleStatusChange(q.id, 'ACCEPTED')}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleStatusChange(q.id, 'REJECTED')}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {isSales && q.status === 'ACCEPTED' && (
                    <button className="btn btn-small btn-primary" onClick={() => handleConvert(q.id)}>
                      Convert to Order
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {quotations.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">
                  No quotations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
