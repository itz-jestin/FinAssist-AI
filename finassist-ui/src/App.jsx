import { useState } from "react";
import Login from "./components/Login";
import UserView from "./components/UserView";
import AdminPanel from "./components/AdminPanel";

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  function handleLoginSuccess(newSessionId, userId) {
    setSessionId(newSessionId);
    setCurrentUser(userId);
  }

  function handleAdminLogin() {
    setIsAdmin(true);
  }

  function handleLogout() {
    setSessionId(null);
    setCurrentUser(null);
    setIsAdmin(false);
  }

  if (isAdmin) {
    return <AdminPanel onLogout={handleLogout} />;
  }

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", backgroundColor: "#F5F6FA" }}>
      <div
        style={{
          backgroundColor: "#1E2A5A",
          color: "#fff",
          padding: "14px 24px",
          fontWeight: 700,
          fontSize: "18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>FinAssist</span>
        {sessionId && (
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "transparent",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.4)",
              borderRadius: "6px",
              padding: "6px 14px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        )}
      </div>

      <div style={{ padding: "20px" }}>
        {!sessionId ? (
          <Login onLogin={handleLoginSuccess} onAdminLogin={handleAdminLogin} />
        ) : (
          <UserView sessionId={sessionId} currentUser={currentUser} />
        )}
      </div>
    </div>
  );
}

export default App;