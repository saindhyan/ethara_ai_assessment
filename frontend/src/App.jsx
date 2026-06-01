import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <h2>Inventory</h2>
          </div>
          <nav>
            <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Dashboard
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Products
            </NavLink>
            <NavLink to="/customers" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Customers
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Orders
            </NavLink>
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
