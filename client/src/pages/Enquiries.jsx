import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const emptyItem = { productId: '', quantity: 1 };
const emptyCustomer = { companyName: '', contactPerson: '', mobile: '', email: '', city: '' };

export default function Enquiries() {
  const { user } = useAuth();
  const isSales = user?.role === 'SALES';

  const [enquiries, setEnquiries] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [customerMode, setCustomerMode] = useState('new'); // 'new' | 'existing'
  const [customerId, setCustomerId] = useState('');
  const [customer, setCustomer] = useState(emptyCustomer);
  const [requiredDate, setRequiredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ ...emptyItem }]);

  async function loadData() {
    setLoading(true);
    try {
      const [enqRes, prodRes] = await Promise.all([api.get('/enquiries'), api.get('/products')]);
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
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { ...emptyItem }]);
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function resetForm() {
    setCustomerMode('new');
    setCustomerId('');
    setCustomer(emptyCustomer);
    setRequiredDate('');
    setNotes('');
    setItems([{ ...emptyItem }]);
    setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const payload = {
        items: items
          .filter((it) => it.productId)
          .map((it) => ({ productId: Number(it.productId), quantity: Number(it.quantity) })),
        requiredDate: requiredDate || undefined,
        notes: notes || undefined,
      };
      if (customerMode === 'existing') {
        payload.customerId = Number(customerId);
      } else {
        payload.customer = customer;
      }
      await api.post('/enquiries', payload);
      resetForm();
      setShowForm(false);
      await loadData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Could not create enquiry');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Enquiries</h2>
        {isSales && (
          <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Cancel' : '+ New Enquiry'}
          </button>
        )}
      </div>

      {showForm && (
        <form className="card form" onSubmit={handleSubmit}>
          {formError && <div className="alert alert-error">{formError}</div>}

          <div className="segmented">
            <button
              type="button"
              className={customerMode === 'new' ? 'seg active' : 'seg'}
              onClick={() => setCustomerMode('new')}
            >
              New customer
            </button>
            <button
              type="button"
              className={customerMode === 'existing' ? 'seg active' : 'seg'}
              onClick={() => setCustomerMode('existing')}
            >
              Existing customer ID
            </button>
          </div>

          {customerMode === 'existing' ? (
            <label>
              Customer ID
              <input
                type="number"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              />
            </label>
          ) : (
            <div className="grid-2">
              <label>
                Company name
                <input
                  value={customer.companyName}
                  onChange={(e) => setCustomer({ ...customer, companyName: e.target.value })}
                  required
                />
              </label>
              <label>
                Contact person
                <input
                  value={customer.contactPerson}
                  onChange={(e) => setCustomer({ ...customer, contactPerson: e.target.value })}
                  required
                />
              </label>
              <label>
                Mobile
                <input
                  value={customer.mobile}
                  onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })}
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                />
              </label>
              <label>
                City
                <input
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                />
              </label>
            </div>
          )}

          <div className="grid-2">
            <label>
              Required date
              <input type="date" value={requiredDate} onChange={(e) => setRequiredDate(e.target.value)} />
            </label>
            <label>
              Notes
              <input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
          </div>

          <h4>Products</h4>
          {items.map((item, i) => (
            <div className="item-row" key={i}>
              <select
                value={item.productId}
                onChange={(e) => updateItem(i, 'productId', e.target.value)}
                required
              >
                <option value="">Select product…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.product_code} — {p.name}
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
              {items.length > 1 && (
                <button type="button" className="btn btn-ghost" onClick={() => removeItem(i)}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-ghost" onClick={addItem}>
            + Add product line
          </button>

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Enquiry'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Enquiry #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Required</th>
              <th>Status</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((e) => (
              <tr key={e.id}>
                <td>{e.enquiryNumber}</td>
                <td>{e.companyName}</td>
                <td>{new Date(e.enquiryDate).toLocaleDateString()}</td>
                <td>{e.requiredDate ? new Date(e.requiredDate).toLocaleDateString() : '—'}</td>
                <td>
                  <span className={`badge badge-${e.status.toLowerCase()}`}>{e.status}</span>
                </td>
                <td>{e.items.map((it) => `${it.productName} ×${it.quantity}`).join(', ')}</td>
              </tr>
            ))}
            {enquiries.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">
                  No enquiries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
