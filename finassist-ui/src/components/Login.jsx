import { verifyUser } from "../api";

function Login({ onLogin, onAdminLogin }) {
  async function handleUserClick(userId, sessionVerified) {
    const result = await verifyUser(userId, sessionVerified);
    onLogin(result.session_id, userId);
  }

  return (
    <div
      style={{
        maxWidth: "380px",
        margin: "60px auto",
        backgroundColor: "#fff",
        borderRadius: "12px",
        border: "1px solid #E5E7EB",
        padding: "28px",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "18px", marginBottom: "6px", textAlign: "center" }}>
        Welcome to FinAssist
      </div>
      <div style={{ fontSize: "13px", color: "#888", marginBottom: "22px", textAlign: "center" }}>
        Choose how you'd like to sign in
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <button onClick={() => handleUserClick("user_a", true)} style={buttonStyle("#4A6CF7", "#fff")}>
          Login as User A (Verified)
        </button>
        <button onClick={() => handleUserClick("user_b", false)} style={buttonStyle("#F3F4F8", "#333")}>
          Login as User B (Unverified)
        </button>

        <div style={{ borderTop: "1px solid #EEE", margin: "10px 0" }} />

        <button onClick={() => onAdminLogin()} style={buttonStyle("#1E2A5A", "#fff")}>
          Admin
        </button>
      </div>
    </div>
  );
}

function buttonStyle(bg, color) {
  return {
    backgroundColor: bg,
    color: color,
    border: "none",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  };
}

export default Login;