import React, { useState, useEffect, useCallback } from "react";
import { FaShoppingCart } from "react-icons/fa";
import './App.css';
import axios from "axios";
import AdminPanel from "./AdminPanel";
import Login from "./Login";
import Signup from "./Signup";

const API = "http://localhost:5000/api";

function App() {
  const [token, setToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [address, setAddress] = useState("");
  const [view, setView] = useState("products");
  const [showLogin, setShowLogin] = useState(true);
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState(null);

  // Order summary and payment states
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentInfo, setPaymentInfo] = useState({ card: "", expiry: "", cvc: "", bank: "" });
  const [paymentError, setPaymentError] = useState("");

  // Receipt state
  const [receipt, setReceipt] = useState(null);

  // Helper for category images
  function getCategoryImage(cat) {
    switch (cat) {
      case "Books":
        return "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80";
      case "Clothes":
        return "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80";
      case "Electrical Items":
        return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80";
      case "Accessories":
        return "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80";
      case "Others":
        return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80";
      default:
        return "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80";
    }
  }

  // Fetch categories from backend
  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/categories`);
      setCategories(["All", ...res.data]);
    } catch (e) {
      setCategories(["All"]);
    }
  }, []);

  // Fetch products, optionally by category and search
  const fetchProducts = useCallback(async () => {
    if (!token) return;
    let url = `${API}/products`;
    const params = [];
    if (selectedCategory && selectedCategory !== "All") params.push(`category=${encodeURIComponent(selectedCategory)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (params.length) url += "?" + params.join("&");
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Add discounts to 6 products (by index)
    const discounts = [20, 15, 10, 25, 5, 30];
    const productsWithDiscounts = res.data.map((p, idx) =>
      [0, 2, 4, 6, 8, 10].includes(idx)
        ? { ...p, discount: discounts[idx % discounts.length] }
        : p
    );
    setProducts(productsWithDiscounts);
  }, [token, selectedCategory, search]);

  const fetchCart = useCallback(async () => {
    if (!token) return;
    const res = await axios.get(`${API}/cart`, { headers: { Authorization: `Bearer ${token}` } });
    setCart(res.data);
  }, [token]);

  const fetchWishlist = useCallback(async () => {
    if (!token) return;
    const res = await axios.get(`${API}/wishlist`, { headers: { Authorization: `Bearer ${token}` } });
    setWishlist(res.data);
  }, [token]);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    const res = await axios.get(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } });
    setOrders(res.data);
  }, [token]);

  // On login, fetch everything
  useEffect(() => {
    if (token) {
      fetchCategories();
      fetchProducts();
      fetchCart();
      fetchWishlist();
      fetchOrders();
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(decoded.isAdmin);
      } catch (e) {
        setIsAdmin(false);
      }
    }
  }, [token, fetchCategories, fetchProducts, fetchCart, fetchWishlist, fetchOrders]);

  // Refetch products when category or search changes
  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [selectedCategory, search, fetchProducts, token]);

  // Notification timeout
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Cart/Wishlist logic
  const handleAddCart = async (id) => {
    await axios.post(`${API}/cart`, { productId: id }, { headers: { Authorization: `Bearer ${token}` } });
    fetchCart();
    setNotification("Added to Cart!");
  };

  const handleRemoveCart = async (id) => {
    await axios.delete(`${API}/cart/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchCart();
    setNotification("Removed from Cart!");
  };

  const handleAddWishlist = async (id) => {
    await axios.post(`${API}/wishlist`, { productId: id }, { headers: { Authorization: `Bearer ${token}` } });
    fetchWishlist();
    setNotification("Added to Wishlist!");
  };

  const handleRemoveWishlist = async (id) => {
    await axios.delete(`${API}/wishlist/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchWishlist();
    setNotification("Removed from Wishlist!");
  };

  const handleAddress = async (address) => {
    await axios.post(`${API}/address`, { address }, { headers: { Authorization: `Bearer ${token}` } });
    setAddress(address);
    setNotification("Address updated!");
  };

  // Payment logic
  const handleOrder = () => {
    setShowOrderSummary(true);
    setShowPayment(false);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentError("");

    if (!paymentMethod) {
      setPaymentError("Please select a payment method.");
      return;
    }

    if (paymentMethod === "card") {
      if (!paymentInfo.card || !paymentInfo.expiry || !paymentInfo.cvc) {
        setPaymentError("Please fill all card details.");
        return;
      }
    }

    if (paymentMethod === "mobilebanking" && !paymentInfo.bank) {
      setPaymentError("Please enter your mobile banking app/bank name.");
      return;
    }

    if (!address) {
      setPaymentError("Please enter your delivery address before placing an order.");
      return;
    }

    if (!cart.length) {
      setPaymentError("Your cart is empty.");
      return;
    }

    try {
      // The backend should return the order details (receipt)
      const res = await axios.post(`${API}/order`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setShowPayment(false);
      setPaymentInfo({ card: "", expiry: "", cvc: "", bank: "" });
      setPaymentMethod("");
      setNotification("Payment successful! Order placed.");
      fetchOrders();
      fetchCart();
      setReceipt(res.data.order); // <-- Set the receipt state
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setPaymentError(error.response.data.message);
      } else {
        setPaymentError("Order failed. Please try again.");
      }
    }
  };

  const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem("token", token);
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setIsAdmin(decoded.isAdmin);
    } catch (e) {
      setIsAdmin(false);
    }
    setShowLogin(false);
  };

  const handleLogout = () => {
    setToken("");
    setIsAdmin(false);
    localStorage.removeItem("token");
    setShowLogin(true);
  };

  if (!token) {
    return (
      <div>
        {showLogin ? (
          <>
            <Login onLogin={handleLogin} />
            <p style={{ textAlign: "center", fontSize: "16px", marginTop: "16px" }}>
              Don't have an account?{" "}
              <button
                onClick={() => setShowLogin(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "blue",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontSize: "16px",
                  padding: 0,
                  fontFamily: "inherit",
                }}
              >Signup</button>
            </p>
          </>
        ) : (
          <>
            <Signup onSignup={() => setShowLogin(true)} />
            <p style={{ textAlign: "center", fontSize: "16px", marginTop: "16px" }}>
              Already have an account?{" "}
              <button onClick={() => setShowLogin(true)} style={{
                background: "none",
                border: "none",
                color: "blue",
                textDecoration: "underline",
                cursor: "pointer",
                fontSize: "16px",
                padding: 0,
                fontFamily: "inherit",
              }}>Login</button>
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="main-layout">
      {/* Navbar */}
      <div className="navbar-dropdown" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(90deg, #232f3e 80%, #febd69 100%)",
        padding: "18px 24px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.09)",
        gap: 16
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span className="navbar-brand" style={{
            color: "#febd69",
            fontWeight: 700,
            fontSize: "1.4rem",
            letterSpacing: 2,
            fontFamily: "'Segoe UI', Arial, sans-serif"
          }}>
            ShopEase
          </span>
          <select
            value={view}
            onChange={e => setView(e.target.value)}
            className="navbar-select"
            style={{
              fontSize: "1.1rem",
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: "#fff",
              color: "#232f3e",
              fontWeight: 600,
              minWidth: 180,
              outline: "none",
              boxShadow: "0 2px 8px #e0e0e0",
              transition: "border 0.18s"
            }}
          >
            <option value="products">Products</option>
            <option value="wishlist">Wishlist</option>
            <option value="orders">Orders</option>
            <option value="address">Address</option>
            {isAdmin && <option value="admin">Admin Panel</option>}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Cart Icon Button */}
          <button
            className="navbar-cart-btn"
            onClick={() => setView("cart")}
            style={{
              background: "#fff",
              color: "#232f3e",
              border: "1.5px solid #febd69",
              borderRadius: "50%",
              width: 58,
              height: 58,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              position: "relative",
              cursor: "pointer",
              marginRight: 8,
              boxShadow: "0 2px 8px #febd69",
              transition: "box-shadow 0.15s"
            }}
            title="View Cart"
          >
            <FaShoppingCart />
            {cart.length > 0 && (
              <span style={{
                position: "absolute",
                top: -11,
                right: -5,
                color: "red",
                borderRadius: "50%",
                fontSize: 17,
                minWidth: 26,
                height: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                padding: "0 6px",
              }}>
                {cart.length}
              </span>
            )}
          </button>

          <button
            className="navbar-logout-btn"
            onClick={handleLogout}
            style={{
              background: "#b12704",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "12px 26px",
              fontSize: "1.1rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.18s"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="notification">{notification}</div>
      )}

      {/* Receipt Modal/Section */}
      {receipt && (
        <div className="receipt" style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 12px #e0e0e0",
          padding: 28,
          maxWidth: 480,
          margin: "32px auto",
          position: "relative",
          zIndex: 1000
        }}>
          <h2 style={{ marginBottom: 10 }}>Order Receipt</h2>
          <div>
            <b>Order ID:</b> {receipt.id}<br />
            <b>Date:</b> {new Date(receipt.date).toLocaleString()}<br />
            <b>Delivery Address:</b> {receipt.address}<br />
            <b>Status:</b> {receipt.status}<br />
            <b>Items:</b>
            <ul>
              {receipt.items.map((item, idx) => (
                <li key={idx}>
                  {item.name} - ${item.price}
                  {item.discount ? (
                    <span style={{ color: "#2a9d8f", marginLeft: 8 }}>(-{item.discount}%)</span>
                  ) : null}
                </li>
              ))}
            </ul>
            <b>Total:</b> ${receipt.total}
          </div>
          <button onClick={() => setReceipt(null)} style={{
            marginTop: 16,
            background: "#febd69",
            color: "#232f3e",
            border: "none",
            borderRadius: 8,
            padding: "8px 18px",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: "pointer"
          }}>Close</button>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        {/* PRODUCTS PAGE */}
        {view === "products" && (
          <div className="main-amazon-bg">
            {/* Hero Section with Banner */}
            <div className="hero-banner">
              <h1>Welcome to ShopEase</h1>
              <p>Find everything you need, from Books, Accessories to Electronics</p>
            </div>

            {/* Promoted Filters */}
            <div className="promoted-filters">
              <button onClick={() => setSearch("polarized")}>Polarized Ski Goggles</button>
              <button onClick={() => setSelectedCategory("Books")}>Bestselling Books</button>
              <button onClick={() => setSelectedCategory("Electrical Items")}>Top Electronics</button>
              <button onClick={() => setSelectedCategory("Clothes")}>Fashion Deals</button>
            </div>

            {/* Category Grid */}
            <div className="category-grid">
              {categories
                .filter(cat => cat !== "All")
                .map(cat => (
                  <div
                    key={cat}
                    className={
                      "category-card-amazon" +
                      (selectedCategory === cat ? " selected-category-card" : "")
                    }
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      backgroundImage: `url(${getCategoryImage(cat)})`,
                    }}
                  >
                    <div className="category-card-overlay">
                      <h2>{cat}</h2>
                      <span>Shop now</span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Filter/Search Bar */}
            <div className="product-search-bar">
              <input
                placeholder="Search products"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button onClick={() => setSearch("")}>Clear</button>
            </div>

            {/* Product Grid */}
            <div className="product-grid">
              {products.length === 0 && <p>No products found in this category.</p>}
              {products.map(p => {
                const inCart = cart.some(item => item.id === p.id);
                const inWishlist = wishlist.some(item => item.id === p.id);
                const hasDiscount = p.discount && p.discount > 0;
                const discountedPrice = hasDiscount
                  ? (p.price - (p.price * p.discount) / 100).toFixed(2)
                  : p.price;

                return (
                  <div key={p.id} className="product-card-amazon">
                    <img src={p.image} alt={p.name} />
                    <h3>{p.name}</h3>
                    <p className="product-cat">{p.category}</p>
                    <div className="product-price">
                      {hasDiscount ? (
                        <>
                          <span style={{
                            color: "#b12704",
                            fontWeight: "bold",
                            fontSize: "1.12rem",
                            marginRight: 8
                          }}>
                            ${discountedPrice}
                          </span>
                          <span style={{
                            textDecoration: "line-through",
                            color: "#888",
                            fontSize: "0.98rem",
                            marginRight: 8
                          }}>
                            ${p.price}
                          </span>
                          <span style={{
                            background: "#2a9d8f",
                            color: "#fff",
                            fontWeight: 700,
                            borderRadius: 6,
                            padding: "2px 8px",
                            fontSize: "0.92rem"
                          }}>
                            -{p.discount}%
                          </span>
                        </>
                      ) : (
                        <span style={{
                          color: "#b12704",
                          fontWeight: "bold",
                          fontSize: "1.12rem"
                        }}>
                          ${p.price}
                        </span>
                      )}
                    </div>
                    <div className="product-desc">{p.description}</div>
                    {inCart ? (
                      <button disabled className="already-added-btn">Already in Cart</button>
                    ) : (
                      <button onClick={() => handleAddCart(p.id)}>Add to Cart</button>
                    )}
                    {inWishlist ? (
                      <button disabled className="already-added-btn">In Wishlist</button>
                    ) : (
                      <button onClick={() => handleAddWishlist(p.id)}>Add to Wishlist</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CART PAGE */}
        {view === "cart" && (
          <div>
            <h2>Cart</h2>
            {cart.length === 0 && <p>Your cart is empty.</p>}
            {cart.map(p => {
              const hasDiscount = p.discount && p.discount > 0;
              const discountedPrice = hasDiscount
                ? (p.price - (p.price * p.discount) / 100).toFixed(2)
                : p.price;
              return (
                <div key={p.id} className="cart-item">
                  <img src={p.image} alt="" width="100" /><br />
                  <b>{p.name}</b> - {p.category} -{" "}
                  {hasDiscount ? (
                    <>
                      <span style={{ color: "#b12704", fontWeight: "bold" }}>${discountedPrice}</span>
                      <span style={{ textDecoration: "line-through", color: "#888", marginLeft: 6 }}>${p.price}</span>
                      <span style={{
                        background: "#2a9d8f",
                        color: "#fff",
                        fontWeight: 700,
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontSize: "0.92rem",
                        marginLeft: 8
                      }}>
                        -{p.discount}%
                      </span>
                    </>
                  ) : (
                    <span style={{ color: "#b12704", fontWeight: "bold" }}>${p.price}</span>
                  )}
                  <br />
                  <i>{p.description}</i><br />
                  <button onClick={() => handleRemoveCart(p.id)}>Remove from Cart</button>
                </div>
              );
            })}
            {/* Order Summary Step */}
            {cart.length > 0 && !showOrderSummary && !showPayment && (
              <button onClick={handleOrder}>Proceed to Payment</button>
            )}

            {/* Order Summary Modal/Section */}
            {showOrderSummary && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 2px 12px #e0e0e0",
                  padding: 28,
                  maxWidth: 480,
                  margin: "32px auto",
                  position: "relative"
                }}
              >
                <h3 style={{ color: "#232f3e", marginBottom: 18 }}>Order Summary</h3>
                <div>
                  {cart.map(p => {
                    const hasDiscount = p.discount && p.discount > 0;
                    const discountedPrice = hasDiscount
                      ? (p.price - (p.price * p.discount) / 100).toFixed(2)
                      : p.price;
                    return (
                      <div key={p.id} style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 12,
                        borderBottom: "1px solid #eee",
                        paddingBottom: 8
                      }}>
                        <img src={p.image} alt={p.name} width={50} style={{ borderRadius: 6, marginRight: 12 }} />
                        <div style={{ flex: 1 }}>
                          <b>{p.name}</b>
                          <div style={{ fontSize: "0.97rem", color: "#555" }}>{p.category}</div>
                          {hasDiscount ? (
                            <span>
                              <span style={{ color: "#b12704", fontWeight: "bold" }}>${discountedPrice}</span>
                              <span style={{ textDecoration: "line-through", color: "#888", marginLeft: 6 }}>${p.price}</span>
                              <span style={{
                                background: "#2a9d8f",
                                color: "#fff",
                                fontWeight: 700,
                                borderRadius: 6,
                                padding: "2px 8px",
                                fontSize: "0.92rem",
                                marginLeft: 8
                              }}>
                                -{p.discount}%
                              </span>
                            </span>
                          ) : (
                            <span style={{ color: "#b12704", fontWeight: "bold" }}>${p.price}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ marginTop: 18, fontWeight: 600 }}>
                    Total: $
                    {cart.reduce((sum, p) => {
                      const hasDiscount = p.discount && p.discount > 0;
                      const discountedPrice = hasDiscount
                        ? (p.price - (p.price * p.discount) / 100)
                        : p.price;
                      return sum + Number(discountedPrice);
                    }, 0).toFixed(2)}
                  </div>
                  <div style={{ marginTop: 12, color: "#232f3e", fontSize: "1rem" }}>
                    <b>Delivery Address:</b>
                    <div style={{ marginTop: 4, color: "#555" }}>{address || <span style={{ color: "red" }}>No address saved!</span>}</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
                  <button
                    onClick={() => setShowOrderSummary(false)}
                    style={{
                      background: "#bbb",
                      color: "#232f3e",
                      border: "none",
                      borderRadius: 8,
                      padding: "10px 20px",
                      fontWeight: 600,
                      fontSize: "1rem",
                      cursor: "pointer"
                    }}
                  >Back</button>
                  <button
                    onClick={() => {
                      setShowOrderSummary(false);
                      setShowPayment(true);
                    }}
                    style={{
                      background: "#febd69",
                      color: "#232f3e",
                      border: "none",
                      borderRadius: 8,
                      padding: "10px 20px",
                      fontWeight: 600,
                      fontSize: "1rem",
                      cursor: address ? "pointer" : "not-allowed",
                      opacity: address ? 1 : 0.7
                    }}
                    disabled={!address}
                  >Confirm & Continue</button>
                </div>
              </div>
            )}

            {/* Payment Form (only after summary is confirmed) */}
            {showPayment && (
              <form className="payment-form" onSubmit={handlePaymentSubmit}>
                <h3>Choose Payment Method</h3>
                <div className="payment-methods">
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                    />
                    Credit/Debit Card
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="gpay"
                      checked={paymentMethod === "gpay"}
                      onChange={() => setPaymentMethod("gpay")}
                    />
                    Google Pay
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mobilebanking"
                      checked={paymentMethod === "mobilebanking"}
                      onChange={() => setPaymentMethod("mobilebanking")}
                    />
                    Mobile Banking
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                    />
                    Cash on Delivery
                  </label>
                </div>

                {/* Card fields */}
                {paymentMethod === "card" && (
                  <>
                    <input
                      type="text"
                      placeholder="Card Number"
                      value={paymentInfo.card}
                      onChange={e => setPaymentInfo({ ...paymentInfo, card: e.target.value })}
                      maxLength={19}
                    />
                    <input
                      type="text"
                      placeholder="Expiry (MM/YY)"
                      value={paymentInfo.expiry}
                      onChange={e => setPaymentInfo({ ...paymentInfo, expiry: e.target.value })}
                      maxLength={5}
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      value={paymentInfo.cvc}
                      onChange={e => setPaymentInfo({ ...paymentInfo, cvc: e.target.value })}
                      maxLength={4}
                    />
                  </>
                )}

                {/* Google Pay */}
                {paymentMethod === "gpay" && (
                  <div className="gpay-info">
                    <p>
                      <b>Google Pay:</b> For demo, assume Google Pay flow completes after clicking “Pay & Place Order”.
                    </p>
                  </div>
                )}

                {/* Mobile Banking */}
                {paymentMethod === "mobilebanking" && (
                  <input
                    type="text"
                    placeholder="Enter Mobile Banking App/Bank Name"
                    value={paymentInfo.bank}
                    onChange={e => setPaymentInfo({ ...paymentInfo, bank: e.target.value })}
                  />
                )}

                {/* Cash on Delivery */}
                {paymentMethod === "cod" && (
                  <div>
                    <p>Pay with cash when your order is delivered.</p>
                  </div>
                )}

                {paymentError && <div style={{ color: "red" }}>{paymentError}</div>}
                <button type="submit">Pay & Place Order</button>
                <button type="button" onClick={() => setShowPayment(false)} style={{ background: "#bbb", color: "#232f3e" }}>Cancel</button>
              </form>
            )}
          </div>
        )}

        {/* WISHLIST PAGE */}
        {view === "wishlist" && (
          <div>
            <h2>Wishlist</h2>
            {wishlist.length === 0 && <p>Your wishlist is empty.</p>}
            {wishlist.map(p => {
              const inCart = cart.some(item => item.id === p.id);
              const hasDiscount = p.discount && p.discount > 0;
              const discountedPrice = hasDiscount
                ? (p.price - (p.price * p.discount) / 100).toFixed(2)
                : p.price;
              return (
                <div key={p.id} className="wishlist-item">
                  <img src={p.image} alt="" width="100" /><br />
                  <b>{p.name}</b> - {p.category} -{" "}
                  {hasDiscount ? (
                    <>
                      <span style={{ color: "#b12704", fontWeight: "bold" }}>${discountedPrice}</span>
                      <span style={{ textDecoration: "line-through", color: "#888", marginLeft: 6 }}>${p.price}</span>
                      <span style={{
                        background: "#2a9d8f",
                        color: "#fff",
                        fontWeight: 700,
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontSize: "0.92rem",
                        marginLeft: 8
                      }}>
                        -{p.discount}%
                      </span>
                    </>
                  ) : (
                    <span style={{ color: "#b12704", fontWeight: "bold" }}>${p.price}</span>
                  )}
                  <br />
                  <i>{p.description}</i><br />
                  {inCart ? (
                    <button disabled className="already-added-btn">Already in Cart</button>
                  ) : (
                    <button onClick={() => handleAddCart(p.id)}>Add to Cart</button>
                  )}
                  <button onClick={() => handleRemoveWishlist(p.id)}>Remove from Wishlist</button>
                </div>
              );
            })}
          </div>
        )}

        {/* ORDERS PAGE */}
        {view === "orders" && (
          <div>
            <h2>Orders</h2>
            {orders.length === 0 && <p>No orders placed yet.</p>}
            {orders.map((o, i) => (
              <div key={i} className="order-card">
                <b>Date:</b> {new Date(o.date).toLocaleString()}<br />
                <b>Address:</b> {o.address}<br />
                <b>Status:</b> {o.status}<br />
                <b>Items:</b> {o.items.map(p => p.name).join(", ")}
              </div>
            ))}
          </div>
        )}

        {/* ADDRESS PAGE */}
        {view === "address" && (
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 12px #e0e0e0",
              padding: "36px 24px 28px 24px",
              maxWidth: 400,
              margin: "48px auto 0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <h2
              style={{
                color: "#232f3e",
                fontWeight: 700,
                fontSize: "1.4rem",
                marginBottom: 18,
                letterSpacing: 1
              }}
            >
              Delivery Address
            </h2>
            <input
              placeholder="Address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              style={{
                padding: "12px 14px",
                border: "1px solid #bbb",
                borderRadius: 8,
                fontSize: "1rem",
                width: "100%",
                marginBottom: 18,
                background: "#f8f8fa",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
            <button
              onClick={() => handleAddress(address)}
              style={{
                background: "#febd69",
                color: "#232f3e",
                border: "none",
                borderRadius: 8,
                padding: "11px 0",
                fontWeight: 600,
                fontSize: "1.07rem",
                width: "100%",
                cursor: "pointer",
                transition: "background 0.2s"
              }}
            >
              Save Address
            </button>
            {address && (
              <div
                style={{
                  marginTop: 32,
                  background: "#f8f8fa",
                  borderRadius: 8,
                  padding: "16px 14px",
                  width: "100%",
                  textAlign: "left",
                  boxShadow: "0 1px 4px #e0e0e0",
                  color: "#232f3e",
                  fontSize: "1.08rem",
                  fontWeight: 500,
                  letterSpacing: 0.2
                }}
              >
                <span style={{ color: "#007185", fontWeight: 700 }}>Saved Address:</span>
                <br />
                {address}
              </div>
            )}
          </div>
        )}

        {/* ADMIN PAGE */}
        {view === "admin" && isAdmin && <AdminPanel token={token} />}
      </main>
    </div>
  );
}

export default App;
