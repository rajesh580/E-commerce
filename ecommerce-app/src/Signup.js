import React, { useState } from "react";
import axios from "axios";
const API = "http://localhost:5000/api";

export default function Signup({ onSignup }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    try {
      await axios.post(`${API}/signup`, { username, password, isAdmin });
      setSuccess("Signup successful! Please login.");
      onSignup();
    } catch (err) {
      setErr(err.response?.data?.message || "Signup failed");
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
          color: "green",
          fontSize: "24px",
          marginBottom: "16px",
        }}
      >
        Signup
      </h2>
      {err && (
        <div style={{ color: "red", marginBottom: "12px" }}>{err}</div>
      )}
      {success && (
        <div style={{ color: "green", marginBottom: "12px" }}>{success}</div>
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
          marginBottom: "12px",
          width: "100%",
          borderRadius: "4px",
          border: "1px solid #ccc",
          fontSize: "16px",
        }}
      />
      <label
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
          fontSize: "16px",
          width: "100%",
        }}
      >
      </label>
      <button
        type="submit"
        style={{
          padding: "10px",
          width: "100%",
          borderRadius: "4px",
          border: "none",
          background: "green",
          color: "white",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Signup
      </button>
    </form>
  );
}
