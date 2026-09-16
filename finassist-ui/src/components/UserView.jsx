import { useState } from "react";
import ChatWindow from "./ChatWindow";
import TicketsPanel from "./TicketsPanel";

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
          width: "190px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
          padding: "16px 10px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          height: "fit-content",
        }}
      >
        <NavItem
          label="Chat"
          icon="💬"
          active={activeTab === "chat"}
          onClick={() => setActiveTab("chat")}
        />
        <NavItem
          label="Tickets"
          icon="🎫"
          active={activeTab === "tickets"}
          onClick={() => setActiveTab("tickets")}
        />
      </div>

      <div style={{ flex: 1 }}>
        {activeTab === "chat" ? (
          <ChatWindow
            sessionId={sessionId}
            currentUser={currentUser}
            onMessageSent={triggerTicketRefresh}
          />
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
        padding: "10px 12px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: active ? "#EEF1FF" : "transparent",
        color: active ? "#4A6CF7" : "#444",
        fontWeight: active ? 700 : 500,
        fontSize: "14px",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default UserView;