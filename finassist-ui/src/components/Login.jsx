import { useState } from "react";
import { verifyUser } from "../api";
import Logo from "./Logo";
import Notes from "./Notes";

function Login({ onLogin, onAdminLogin }) {
  const [showNotes, setShowNotes] = useState(false);

  async function handleUserClick(userId, sessionVerified) {
    const result = await verifyUser(userId, sessionVerified);
    onLogin(result.session_id, userId);
  }

  if (showNotes) {
    return <Notes onBack={() => setShowNotes(false)} />;
  }

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "60px auto",
        background: "#fff",
        borderRadius: "20px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 20px 50px rgba(74,108,247,0.18)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #4A6CF7 0%, #7B5CF5 100%)",
          color: "#fff",
          padding: "30px 28px",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
          <Logo size={64} />
        </div>
        <div style={{ fontWeight: 800, fontSize: "22px" }}>Welcome to FinAssist</div>
        <div style={{ fontSize: "13px", opacity: 0.85, marginTop: "4px" }}>
          Choose how you'd like to sign in
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "26px 28px 30px" }}>
        <button
          onClick={() => handleUserClick("user_a", true)}
          style={buttonStyle("linear-gradient(135deg, #4A6CF7, #7B5CF5)", "#fff", true)}
        >
            Login as User A (Verified)
        </button>
        <button onClick={() => handleUserClick("user_b", false)} style={buttonStyle("#F3F4F8", "#333")}>
           Login as User B (Unverified)
        </button>

        <div style={{ borderTop: "1px solid #EEE", margin: "6px 0" }} />

        <button onClick={() => onAdminLogin()} style={buttonStyle("#1E2A5A", "#fff")}>
          Admin
        </button>
        <button
          onClick={() => setShowNotes(true)}
          style={{ ...buttonStyle("#fff", "#4A6CF7"), border: "1.5px solid #D6DDFB" }}
        >
          📘 How to use FinAssist
        </button>
      </div>
    </div>
  );
}

function buttonStyle(bg, color, glow = false) {
  return {
    background: bg,
    color,
    border: "none",
    borderRadius: "12px",
    padding: "13px 16px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: glow ? "0 6px 16px rgba(74,108,247,0.35)" : "none",
  };
}

export default Login;