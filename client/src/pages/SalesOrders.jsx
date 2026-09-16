import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function SalesOrders() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  const [dispatchingId, setDispatchingId] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [ordersRes, invRes] = await Promise.all([api.get('/sales-orders'), api.get('/inventory')]);
      setOrders(ordersRes.data);
      setInventory(invRes.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleConfirm(id) {
    setActionError('');
    try {
      await api.post(`/sales-orders/${id}/confirm`);
      await loadData();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Could not confirm order');
    }
  }

  function openDispatch(id) {
    setDispatchingId(id);
    setVehicleNumber('');
    setDriverName('');
  }

  async function submitDispatch(e) {
    e.preventDefault();
    setSubmitting(true);
    setActionError('');
    try {
      await api.post(`/sales-orders/${dispatchingId}/dispatch`, { vehicleNumber, driverName });
      setDispatchingId(null);
      await loadData();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Could not dispatch order');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id) {
    setActionError('');
    try {
      await api.post(`/sales-orders/${id}/cancel`);
      await loadData();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Could not cancel order');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Sales Orders</h2>
      </div>

      {actionError && <div className="alert alert-error">{actionError}</div>}

      <section className="card">
        <h3>Inventory Availability</h3>
        <table className="data-table compact">
          <thead>
            <tr>
              <th>Code</th>
              <th>Product</th>
              <th>Physical</th>
              <th>Reserved</th>
              <th>Available</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((i) => (
              <tr key={i.productId}>
                <td>{i.productCode}</td>
                <td>{i.productName}</td>
                <td>{i.physicalQty}</td>
                <td>{i.reservedQty}</td>
                <td>
                  <strong>{i.availableQty}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th>Items</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.orderNumber}</td>
                <td>{o.companyName}</td>
                <td>{new Date(o.orderDate).toLocaleDateString()}</td>
                <td>
                  <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span>
                </td>
                <td>₹{Number(o.totalAmount).toFixed(2)}</td>
                <td>{o.items.map((it) => `${it.productName} ×${it.quantity}`).join(', ')}</td>
                {isAdmin && (
                  <td className="actions">
                    {o.status === 'PENDING' && (
                      <>
                        <button className="btn btn-small btn-primary" onClick={() => handleConfirm(o.id)}>
                          Confirm
                        </button>
                        <button className="btn btn-small btn-danger" onClick={() => handleCancel(o.id)}>
                          Cancel
                        </button>
                      </>
                    )}
                    {o.status === 'CONFIRMED' && (
                      <>
                        <button className="btn btn-small btn-primary" onClick={() => openDispatch(o.id)}>
                          Dispatch
                        </button>
                        <button className="btn btn-small btn-danger" onClick={() => handleCancel(o.id)}>
                          Cancel
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="empty">
                  No sales orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {dispatchingId && (
        <div className="modal-backdrop" onClick={() => setDispatchingId(null)}>
          <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={submitDispatch}>
            <h3>Dispatch Order</h3>
            <label>
              Vehicle number
              <input value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} required />
            </label>
            <label>
              Driver name
              <input value={driverName} onChange={(e) => setDriverName(e.target.value)} required />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setDispatchingId(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Dispatching…' : 'Dispatch'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
