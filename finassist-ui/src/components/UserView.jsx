import { useState } from "react";
import ChatWindow from "./ChatWindow";
import TicketsPanel from "./TicketsPanel";
import Logo from "./Logo";

function UserView({ sessionId, currentUser }) {
  const [activeTab, setActiveTab] = useState("chat"); // "chat" | "tickets"
  const [ticketRefreshKey, setTicketRefreshKey] = useState(0);

  function triggerTicketRefresh() {
    setTicketRefreshKey((k) => k + 1);
  }

  return (
    <div style={{ display: "flex", gap: "20px", height: "80vh" }}>
      <div
        style={{
          width: "210px",
          background: "#fff",
          borderRadius: "18px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 10px 30px rgba(74,108,247,0.08)",
          padding: "18px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          height: "fit-content",
        }}
      >
        <div style={{ padding: "0 8px 12px", borderBottom: "1px solid #F0F1F7", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Logo size={28} rounded={false} />
            <div
              style={{
                fontWeight: 800,
                fontSize: "18px",
                background: "linear-gradient(135deg, #4A6CF7, #7B5CF5)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              FinAssist
            </div>
          </div>
          {currentUser && (
            <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>Signed in as {currentUser}</div>
          )}
        </div>

        <NavItem label="Chat" icon="💬" active={activeTab === "chat"} onClick={() => setActiveTab("chat")} />
        <NavItem label="Tickets" icon="🎫" active={activeTab === "tickets"} onClick={() => setActiveTab("tickets")} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {activeTab === "chat" ? (
          <ChatWindow sessionId={sessionId} currentUser={currentUser} onMessageSent={triggerTicketRefresh} />
        ) : (
          <TicketsPanel refreshKey={ticketRefreshKey} currentUser={currentUser} />
        )}
      </div>
    </div>
  );
}

function NavItem({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "11px 14px",
        borderRadius: "10px",
        border: "none",
        background: active ? "linear-gradient(135deg, #4A6CF7, #7B5CF5)" : "transparent",
        color: active ? "#fff" : "#444",
        fontWeight: active ? 700 : 500,
        fontSize: "14px",
        cursor: "pointer",
        textAlign: "left",
        boxShadow: active ? "0 4px 12px rgba(74,108,247,0.3)" : "none",
        transition: "all .15s ease",
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default UserView;