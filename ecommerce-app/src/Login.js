import React, { useState } from "react";
import axios from "axios";
const API = "http://localhost:5000/api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    setErr("");
    try {
      const res = await axios.post(`${API}/login`, { username, password });
      onLogin(res.data.token);
    } catch (err) {
      setErr(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        width: "320px",
        margin: "40px auto",
        background: "#f9f9f9",
      }}
    >
      <h2
        style={{
          color: "blue",
          fontSize: "24px",
          marginBottom: "16px",
        }}
      >
        Login
      </h2>
      {err && (
        <div style={{ color: "red", marginBottom: "12px" }}>{err}</div>
      )}
      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
        style={{
          padding: "10px",
          marginBottom: "12px",
          width: "100%",
          borderRadius: "4px",
          border: "1px solid #ccc",
          fontSize: "16px",
        }}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={{
          padding: "10px",
          marginBottom: "14px",
          width: "100%",
          borderRadius: "4px",
          border: "1px solid #ccc",
          fontSize: "16px",
        }}
      />
      <button
        type="submit"
        style={{
          padding: "10px",
          width: "100%",
          borderRadius: "4px",
          border: "none",
          background: "blue",
          color: "white",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Login
      </button>
    </form>
  );
}
