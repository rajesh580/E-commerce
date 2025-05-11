import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function AdminPanel({ token }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", category: "", price: "", image: "", description: "" });
  const [search, setSearch] = useState("");
  const [adminOrders, setAdminOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const fetchProducts = useCallback(async () => {
    const res = await axios.get(`${API}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProducts(res.data);
  }, [token]);

  const fetchAdminOrders = useCallback(async () => {
    const res = await axios.get(`${API}/admin/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAdminOrders(res.data);
  }, [token]);

  useEffect(() => {
    fetchProducts();
    fetchAdminOrders();
  }, [fetchProducts, fetchAdminOrders]);

  const handleAddProduct = async () => {
    await axios.post(`${API}/products`, form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("Product listed, pending admin verification.");
    setForm({ name: "", category: "", price: "", image: "", description: "" });
    fetchProducts();
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${API}/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchProducts();
      } catch (err) {
        alert(err.response?.data?.message || "Error deleting product");
      }
    }
  };

  const handleVerify = async (id) => {
    try {
      await axios.post(`${API}/products/${id}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Error verifying product");
    }
  };

  const handleAcceptOrder = async (id) => {
    await axios.post(`${API}/admin/orders/${id}/accept`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAdminOrders();
  };

  const handleRejectOrder = async (id) => {
    await axios.post(`${API}/admin/orders/${id}/reject`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAdminOrders();
  };

  // --- EDIT FEATURE LOGIC ---
  const startEditing = (product) => {
    setEditingId(product.id || product._id); // support both id and _id
    setEditData({
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image,
      description: product.description,
    });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    await axios.put(`${API}/products/${editingId}`, editData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setEditingId(null);
    setEditData({});
    fetchProducts();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      maxWidth: 1100,
      margin: "0 auto",
      padding: "32px 12px 60px 12px",
      fontFamily: "Segoe UI, Arial, sans-serif"
    }}>
      <h2 style={{
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        color: "white",
        backgroundColor:"black",
        fontWeight: 700,
        fontSize: "2rem",
        marginBottom: 18,
        letterSpacing: 1
      }}>Admin Panel - Add Product</h2>
      <div style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 12px #e0e0e0",
        padding: 24,
        marginBottom: 36,
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        alignItems: "center"
      }}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Image URL"
          value={form.image}
          onChange={e => setForm({ ...form, image: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          style={inputStyle}
        />
        <button
          onClick={handleAddProduct}
          style={{
            display:"flex",
            justifyContent:"center",
            alignItems:"center",
            color: "white",
            backgroundColor:"black",
            border: "none",
            borderRadius: 8,
            padding: "10px 22px",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: "pointer",
            marginLeft: 8,
            marginTop: 8,
            transition: "background 0.2s"
          }}
        >Add Product</button>
      </div>

      <h2 style={{
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        color: "white",
        backgroundColor:"black",
        fontWeight: 700,
        fontSize: "1.5rem",
        marginBottom: 10,
        letterSpacing: 1
      }}>All Products</h2>
      <input
        placeholder="Search products"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ ...inputStyle, marginBottom: 16, width: 300 }}
      />
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: 24,
        marginBottom: 40
      }}>
        {filteredProducts.map(p => {
          const pid = p.id || p._id;
          if (editingId === pid) {
            // EDIT MODE
            return (
              <div key={pid} style={{
                border: "1px solid #e0e0e0",
                borderRadius: 12,
                background: "#f8f9fa",
                padding: 18,
                boxShadow: "0 2px 8px #e0e0e0",
                position: "relative",
                minHeight: 210
              }}>
                <input
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                  style={{ ...inputStyle, width: "90%", marginBottom: 8 }}
                  placeholder="Name"
                />
                <input
                  name="category"
                  value={editData.category}
                  onChange={handleEditChange}
                  style={{ ...inputStyle, width: "90%", marginBottom: 8 }}
                  placeholder="Category"
                />
                <input
                  name="price"
                  type="number"
                  value={editData.price}
                  onChange={handleEditChange}
                  style={{ ...inputStyle, width: "90%", marginBottom: 8 }}
                  placeholder="Price"
                />
                <input
                  name="image"
                  value={editData.image}
                  onChange={handleEditChange}
                  style={{ ...inputStyle, width: "90%", marginBottom: 8 }}
                  placeholder="Image URL"
                />
                <input
                  name="description"
                  value={editData.description}
                  onChange={handleEditChange}
                  style={{ ...inputStyle, width: "90%", marginBottom: 8 }}
                  placeholder="Description"
                />
                <div style={{ marginTop: 8 }}>
                  <button onClick={saveEdit} style={buttonStyle}>Save</button>
                  <button onClick={cancelEdit} style={{ ...buttonStyle, background: "#bbb", color: "#232f3e", marginLeft: 8 }}>Cancel</button>
                </div>
              </div>
            );
          }
          // NORMAL MODE
          return (
            <div key={pid} style={{
              border: "1px solid #e0e0e0",
              borderRadius: 12,
              background: "#f8f9fa",
              padding: 18,
              boxShadow: "0 2px 8px #e0e0e0",
              position: "relative",
              transition: "box-shadow 0.2s",
              minHeight: 210
            }}>
              <img src={p.image} alt="" width="100" style={{
                borderRadius: 8,
                marginBottom: 8,
                boxShadow: "0 2px 8px #e0e0e0"
              }} /><br />
              <b style={{ fontSize: "1.13rem", color: "#232f3e" }}>{p.name}</b> - <span style={{ color: "#007185" }}>{p.category}</span> - <span style={{ color: "#b12704" }}>${p.price}</span><br />
              <i style={{ color: "#555" }}>{p.description}</i><br />
              <span style={{
                display: "inline-block",
                margin: "8px 0",
                padding: "3px 12px",
                borderRadius: 8,
                background: p.verified ? "#d4f5e9" : "#fff4d6",
                color: p.verified ? "#2a9d8f" : "#b08800",
                fontWeight: 600,
                fontSize: "0.97rem"
              }}>
                Status: {p.verified ? "Verified" : "Pending"}
              </span><br />
              <div style={{ marginTop: 8 }}>
                {!p.verified && (
                  <button
                    onClick={() => handleVerify(pid)}
                    style={buttonStyle}
                  >Verify</button>
                )}
                <button
                  onClick={() => handleDeleteProduct(pid)}
                  style={{ ...buttonStyle, background: "#b12704", color: "#fff", marginLeft: 8 }}
                >Delete</button>
                <button
                  onClick={() => startEditing(p)}
                  style={{ ...buttonStyle, background: "#007185", color: "#fff", marginLeft: 8 }}
                >Edit</button>
              </div>
            </div>
          );
        })}
      </div>
      <div >
        <h2 style={{
          display:"flex",
          justifyContent:"center",
          alignItems:"center",
          color: "white",
          backgroundColor:"black",
          borderRadius: "5px",
          fontWeight: 700,
          fontSize: "1.5rem",
          marginBottom: 10,
          letterSpacing: 1
        }}>All Orders</h2>
      </div>
      {adminOrders.length === 0 && <p>No orders yet.</p>}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
        gap: 24
      }}>
        {adminOrders.map(order => (
          <div key={order.id} style={{
            border: "1px solid #e0e0e0",
            borderRadius: 12,
            background: "#f8f9fa",
            padding: 18,
            boxShadow: "0 2px 8px #e0e0e0"
          }}>
            <b style={{ fontSize: "1.1rem", color: "#232f3e" }}>Order #{order.id}</b><br />
            <b>User:</b> {order.user}<br />
            <b>Date:</b> {new Date(order.date).toLocaleString()}<br />
            <b>Address:</b> {order.address}<br />
            <b>Status:</b>
            <span style={{
              marginLeft: 6,
              padding: "2px 10px",
              borderRadius: 8,
              background: order.status === "pending" ? "#fff4d6" : (order.status === "accepted" ? "#d4f5e9" : "#ffeaea"),
              color: order.status === "pending" ? "#b08800" : (order.status === "accepted" ? "#2a9d8f" : "#b12704"),
              fontWeight: 600,
              fontSize: "0.97rem"
            }}>
              {order.status}
            </span>
            <br />
            <b>Items:</b>
            <ul style={{ margin: "8px 0 10px 0", paddingLeft: 20 }}>
              {order.items.map(item => (
                <li key={item.id} style={{ marginBottom: 2 }}>
                  <img src={item.image} alt="" width="50" style={{
                    borderRadius: 5,
                    verticalAlign: "middle",
                    marginRight: 6
                  }} />
                  <span style={{ fontWeight: 500 }}>{item.name}</span> <span style={{ color: "#b12704" }}>(${item.price})</span>
                </li>
              ))}
            </ul>
            {order.status === "pending" && (
              <div>
                <button
                  onClick={() => handleAcceptOrder(order.id)}
                  style={buttonStyle}
                >Accept</button>
                <button
                  onClick={() => handleRejectOrder(order.id)}
                  style={{ ...buttonStyle, background: "#b12704", color: "#fff", marginLeft: 8 }}
                >Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Inline styles
const inputStyle = {
  padding: "10px 12px",
  border: "1px solid #bbb",
  borderRadius: 6,
  fontSize: "1rem",
  margin: "4px 0",
  width: 160,
  background: "#f8f8fa",
  outline: "none",
  transition: "border 0.2s"
};

const buttonStyle = {
  background: "#febd69",
  color: "#232f3e",
  border: "none",
  borderRadius: 8,
  padding: "8px 18px",
  fontWeight: 600,
  fontSize: "1rem",
  cursor: "pointer",
  marginTop: 4,
  transition: "background 0.2s"
};
