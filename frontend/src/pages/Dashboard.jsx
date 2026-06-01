import { useEffect, useState } from "react";
import { getDashboardStats } from "../api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => setError("Failed to load dashboard stats"));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{stats.total_products}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{stats.total_customers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{stats.total_orders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Low Stock Items</div>
          <div className="stat-value" style={{ color: stats.low_stock_products.length > 0 ? "#e74c3c" : "inherit" }}>
            {stats.low_stock_products.length}
          </div>
        </div>
      </div>

      <div className="section-title">Low Stock Products (qty &lt; 10)</div>
      <div className="table-card">
        {stats.low_stock_products.length === 0 ? (
          <div className="empty-state">All products are well stocked</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {stats.low_stock_products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>
                    <span className={`badge ${p.quantity === 0 ? "badge-danger" : "badge-warning"}`}>
                      {p.quantity}
                    </span>
                  </td>
                  <td>${parseFloat(p.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
