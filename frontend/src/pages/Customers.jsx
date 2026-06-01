import { useEffect, useState } from "react";
import { getCustomers, createCustomer, deleteCustomer } from "../api";

const emptyForm = { name: "", email: "", phone: "" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCustomers = () => {
    getCustomers().then((res) => setCustomers(res.data));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    createCustomer({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() })
      .then(() => {
        setShowModal(false);
        setSuccess("Customer added!");
        loadCustomers();
        setTimeout(() => setSuccess(""), 3000);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Something went wrong");
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this customer? This will also delete their orders.")) return;
    deleteCustomer(id)
      .then(() => {
        setSuccess("Customer deleted");
        loadCustomers();
        setTimeout(() => setSuccess(""), 3000);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to delete customer");
      });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Customers</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Customer</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="table-card">
        {customers.length === 0 ? (
          <div className="empty-state">No customers yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
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
            <h2>Add Customer</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 555 000 0000"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
