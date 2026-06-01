import { useEffect, useState } from "react";
import { getOrders, getOrder, createOrder, deleteOrder, getCustomers, getProducts } from "../api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create order form state
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([{ product_id: "", quantity: 1 }]);

  const loadOrders = () => getOrders().then((res) => setOrders(res.data));

  useEffect(() => {
    loadOrders();
    getCustomers().then((res) => setCustomers(res.data));
    getProducts().then((res) => setProducts(res.data));
  }, []);

  const openCreate = () => {
    setCustomerId("");
    setItems([{ product_id: "", quantity: 1 }]);
    setError("");
    setShowCreateModal(true);
  };

  const addItem = () => setItems([...items, { product_id: "", quantity: 1 }]);

  const removeItem = (index) => {
    if (items.length === 1) return; // keep at least one row
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setError("");

    // Simple front-end check before hitting the API
    if (!customerId) { setError("Please select a customer"); return; }
    if (items.some((it) => !it.product_id)) { setError("Please select a product for each row"); return; }

    const payload = {
      customer_id: parseInt(customerId),
      items: items.map((it) => ({ product_id: parseInt(it.product_id), quantity: parseInt(it.quantity) })),
    };

    createOrder(payload)
      .then(() => {
        setShowCreateModal(false);
        setSuccess("Order created!");
        loadOrders();
        setTimeout(() => setSuccess(""), 3000);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to create order");
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Cancel this order? Stock will be restored.")) return;
    deleteOrder(id)
      .then(() => {
        setSuccess("Order cancelled");
        loadOrders();
        setTimeout(() => setSuccess(""), 3000);
      })
      .catch((err) => setError(err.response?.data?.detail || "Failed to cancel order"));
  };

  const handleView = (id) => {
    getOrder(id).then((res) => setViewingOrder(res.data));
  };

  return (
    <div>
      <div className="page-header">
        <h1>Orders</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Order</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="table-card">
        {orders.length === 0 ? (
          <div className="empty-state">No orders yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.customer.name}</td>
                  <td>{o.items.length}</td>
                  <td>${parseFloat(o.total_amount).toFixed(2)}</td>
                  <td><span className="badge badge-success">{o.status}</span></td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td style={{ display: "flex", gap: "8px" }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleView(o.id)}>View</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Order</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Customer</label>
                <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  <option value="">-- Select customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#444", display: "block", marginBottom: 8 }}>
                Order Items
              </label>

              {items.map((item, idx) => (
                <div className="order-item-row" key={idx}>
                  <select
                    required
                    value={item.product_id}
                    onChange={(e) => updateItem(idx, "product_id", e.target.value)}
                  >
                    <option value="">-- Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (stock: {p.quantity})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    required
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                    placeholder="Qty"
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removeItem(idx)}
                    title="Remove item"
                  >
                    ×
                  </button>
                </div>
              ))}

              <button type="button" className="btn btn-secondary btn-sm" onClick={addItem} style={{ marginBottom: 16 }}>
                + Add Item
              </button>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Place Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {viewingOrder && (
        <div className="modal-overlay" onClick={() => setViewingOrder(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Order #{viewingOrder.id}</h2>
            <p style={{ marginBottom: 12, fontSize: "0.875rem", color: "#666" }}>
              Customer: <strong>{viewingOrder.customer.name}</strong> &mdash; {viewingOrder.customer.email}
            </p>
            <ul className="items-list">
              {viewingOrder.items.map((item) => (
                <li key={item.id}>
                  <strong>{item.product.name}</strong> &times; {item.quantity}
                  &nbsp;&mdash;&nbsp;
                  ${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                  <span style={{ fontSize: "0.78rem", color: "#888", marginLeft: 6 }}>
                    (${parseFloat(item.unit_price).toFixed(2)} each)
                  </span>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 16, fontWeight: 700, textAlign: "right" }}>
              Total: ${parseFloat(viewingOrder.total_amount).toFixed(2)}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
