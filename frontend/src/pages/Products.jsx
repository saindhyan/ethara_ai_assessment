import { useEffect, useState } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../api";

const emptyForm = { name: "", sku: "", price: "", quantity: "" };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProducts = () => {
    getProducts().then((res) => setProducts(res.data));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openAdd = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity,
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity, 10),
    };

    const request = editingProduct
      ? updateProduct(editingProduct.id, payload)
      : createProduct(payload);

    request
      .then(() => {
        setShowModal(false);
        setSuccess(editingProduct ? "Product updated!" : "Product added!");
        loadProducts();
        setTimeout(() => setSuccess(""), 3000);
      })
      .catch((err) => {
        const msg = err.response?.data?.detail || "Something went wrong";
        setError(msg);
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this product?")) return;
    deleteProduct(id)
      .then(() => {
        setSuccess("Product deleted");
        loadProducts();
        setTimeout(() => setSuccess(""), 3000);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to delete product");
      });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="table-card">
        {products.length === 0 ? (
          <div className="empty-state">No products yet. Add one to get started.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>${parseFloat(p.price).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${p.quantity === 0 ? "badge-danger" : p.quantity < 10 ? "badge-warning" : "badge-success"}`}>
                      {p.quantity}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: "8px" }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProduct ? "Edit Product" : "Add Product"}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Wireless Keyboard"
                />
              </div>
              <div className="form-group">
                <label>SKU / Code</label>
                <input
                  required
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="e.g. WK-001"
                />
              </div>
              <div className="form-group">
                <label>Price ($)</label>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Quantity in Stock</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
