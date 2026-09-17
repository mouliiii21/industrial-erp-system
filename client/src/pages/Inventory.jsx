import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadInventory() {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/inventory');
      setInventory(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load inventory'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  async function updateStock(productId, physicalQty) {
    try {
      setMessage('');
      setError('');

      await api.patch(`/inventory/${productId}`, {
        physicalQty: Number(physicalQty),
      });

      setMessage('Inventory updated successfully.');
      await loadInventory();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update inventory'
      );
    }
  }

  if (loading) {
    return (
      <div className="card">
        <p className="muted">Loading inventory...</p>
      </div>
    );
  }

  const totalProducts = inventory.length;

  const totalReserved = inventory.reduce(
    (sum, item) => sum + Number(item.reservedQty),
    0
  );

  const totalAvailable = inventory.reduce(
    (sum, item) => sum + Number(item.availableQty),
    0
  );

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p className="muted">
            Manage physical stock and monitor product availability.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="inventory-summary">
        <div className="inventory-summary-card">
          <div className="label">Total Products</div>
          <div className="value">{totalProducts}</div>
        </div>

        <div className="inventory-summary-card">
          <div className="label">Reserved Stock</div>
          <div className="value">{totalReserved}</div>
        </div>

        <div className="inventory-summary-card">
          <div className="label">Available Stock</div>
          <div className="value">{totalAvailable}</div>
        </div>
      </div>

      {message && (
        <div className="alert">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Inventory Table */}
      <div className="card">
        <div className="page-header">
          <div>
            <h2>Stock Overview</h2>
            <p className="muted">
              Current physical, reserved and available quantities.
            </p>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Code</th>
              <th>Physical</th>
              <th>Reserved</th>
              <th>Available</th>
              <th>Update Stock</th>
            </tr>
          </thead>

          <tbody>
            {inventory.map((item) => (
              <tr key={item.productId}>
                <td>
                  <strong>{item.productName}</strong>
                </td>

                <td>{item.productCode}</td>

                <td>{item.physicalQty}</td>

                <td>
                  <span className="badge badge-pending">
                    {item.reservedQty}
                  </span>
                </td>

                <td>
                  <span className="badge badge-confirmed">
                    {item.availableQty}
                  </span>
                </td>

                <td>
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <input
                      type="number"
                      min={item.reservedQty}
                      defaultValue={item.physicalQty}
                      id={`stock-${item.productId}`}
                      style={{
                        width: '90px',
                        padding: '8px 10px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />

                    <button
                      className="btn btn-primary btn-small"
                      onClick={() =>
                        updateStock(
                          item.productId,
                          document.getElementById(
                            `stock-${item.productId}`
                          ).value
                        )
                      }
                    >
                      Update
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}