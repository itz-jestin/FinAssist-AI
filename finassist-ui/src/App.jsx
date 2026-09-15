import { useState } from "react";
import Login from "./components/Login";
import ChatWindow from "./components/ChatWindow";
import TicketsPanel from "./components/TicketsPanel";

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [ticketRefreshKey, setTicketRefreshKey] = useState(0);

  function handleLoginSuccess(newSessionId, userId) {
    setSessionId(newSessionId);
    setCurrentUser(userId);
  }

  function triggerTicketRefresh() {
    setTicketRefreshKey((k) => k + 1);
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
        }}
      >
        FinAssist
      </div>

      <div style={{ padding: "20px" }}>
        {!sessionId ? (
          <Login onLogin={handleLoginSuccess} />
        ) : (
          <div style={{ display: "flex", gap: "20px", height: "80vh" }}>
            <div style={{ flex: 2 }}>
              <ChatWindow
                sessionId={sessionId}
                currentUser={currentUser}
                onMessageSent={triggerTicketRefresh}
              />
            </div>
            <div style={{ flex: 1 }}>
              <TicketsPanel refreshKey={ticketRefreshKey} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;