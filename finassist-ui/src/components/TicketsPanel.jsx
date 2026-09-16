import { useEffect, useMemo, useState } from "react";
import { getTickets } from "../api";

const statusColors = {
  pending: { bg: "#FFF4E0", color: "#B8860B", label: "Pending" },
  in_progress: { bg: "#E6ECFF", color: "#3B5BDB", label: "In Progress" },
  resolved: { bg: "#E6F4EA", color: "#1E7B34", label: "Resolved" },
};

function StatusBadge({ status }) {
  const s = statusColors[status] || { bg: "#EEE", color: "#666", label: status };
  return (
    <span
      style={{
        backgroundColor: s.bg,
        color: s.color,
        padding: "2px 8px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
      }}
    >
      {s.label}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ConversationContext({ context }) {
  // User-facing view: only show actual conversational turns.
  // Tool calls and system prompts are internal/debugging detail and are
  // intentionally hidden here (they're visible in the Admin panel instead).
  const visible = (context || []).filter(
    (msg) => (msg.role === "user" || msg.role === "assistant") && msg.message && msg.message.trim()
  );

  if (visible.length === 0) {
    return (
      <div style={{ fontSize: "13px", color: "#999", textAlign: "left" }}>
        No conversation details available yet.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "left" }}>
      {visible.map((msg, i) => {
        const isUser = msg.role === "user";
        return (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: isUser ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "85%",
                backgroundColor: isUser ? "#4A6CF7" : "#F3F4F8",
                color: isUser ? "#fff" : "#1a1a1a",
                borderRadius: "12px",
                borderTopRightRadius: isUser ? "4px" : "12px",
                borderTopLeftRadius: isUser ? "12px" : "4px",
                padding: "9px 13px",
                fontSize: "13px",
                lineHeight: 1.45,
                whiteSpace: "pre-wrap",
                textAlign: "left",
              }}
            >
              {msg.message}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TicketDetail({ ticket, onClose }) {
  return (
    <div style={{ textAlign: "left" }}>
      <button
        onClick={onClose}
        style={{
          marginBottom: "14px",
          background: "none",
          border: "none",
          color: "#4A6CF7",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          padding: 0,
        }}
      >
        &larr; Back to list
      </button>

      <div
        style={{
          border: "1px solid #E5E7EB",
          borderRadius: "10px",
          padding: "16px 18px",
          backgroundColor: "#FAFBFF",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: "15px" }}>#{ticket.ticket_id}</span>{" "}
            <StatusBadge status={ticket.status} />
          </div>
          <div style={{ fontSize: "12px", color: "#999" }}>{formatDate(ticket.created_at)}</div>
        </div>

        <div style={{ fontSize: "13px", color: "#555", margin: "10px 0 0" }}>{ticket.reason}</div>

        {ticket.resolution_notes && (
          <div
            style={{
              fontSize: "13px",
              backgroundColor: "#E6F4EA",
              color: "#1E7B34",
              padding: "10px 12px",
              borderRadius: "8px",
              marginTop: "14px",
            }}
          >
            <strong>Resolution:</strong> {ticket.resolution_notes}
          </div>
        )}
      </div>

      <div style={{ fontWeight: 600, fontSize: "13px", margin: "20px 0 10px" }}>Conversation</div>
      <div
        style={{
          border: "1px solid #E5E7EB",
          borderRadius: "10px",
          padding: "16px 18px",
          backgroundColor: "#fff",
        }}
      >
        <ConversationContext context={ticket.conversation_context} />
      </div>
    </div>
  );
}

function TicketsPanel({ refreshKey = 0, currentUser }) {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  function loadTickets(silent = false) {
    if (!silent) setLoading(true);
    getTickets()
      .then((data) => {
        const all = Array.isArray(data) ? data : [];
        // Only show tickets belonging to the logged-in user
        const mine = currentUser ? all.filter((t) => t.user_id === currentUser) : all;
        setTickets(mine);
      })
      .catch((err) => setError(err.message || String(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTickets(refreshKey > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, currentUser]);

  useEffect(() => {
    const interval = setInterval(() => loadTickets(true), 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const searchLower = search.toLowerCase();
      const reason = t.reason || "";
      const category = t.category || "";
      const id = t.ticket_id || "";
      const matchesSearch =
        !search ||
        id.toLowerCase().includes(searchLower) ||
        reason.toLowerCase().includes(searchLower) ||
        category.toLowerCase().includes(searchLower);
      return matchesStatus && matchesSearch;
    });
  }, [tickets, search, statusFilter]);

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        padding: "18px 22px",
        height: "100%",
        overflowY: "auto",
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ fontWeight: 700, fontSize: "17px" }}>My Tickets</div>
        <button
          onClick={() => loadTickets(false)}
          disabled={loading}
          style={{
            backgroundColor: "#F3F4F8",
            color: "#333",
            border: "1px solid #DDD",
            borderRadius: "6px",
            padding: "6px 12px",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {!selected && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            style={{
              flex: 1,
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #DDD",
              fontSize: "13px",
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #DDD", fontSize: "13px" }}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      )}

      {loading && tickets.length === 0 && <div style={{ fontSize: "13px", color: "#999" }}>Loading tickets...</div>}
      {error && <div style={{ fontSize: "13px", color: "#c00" }}>Error loading tickets: {error}</div>}

      {!error && !selected && tickets.length > 0 && (
        <>
          {filteredTickets.length === 0 ? (
            <div style={{ fontSize: "13px", color: "#999", padding: "20px 0", textAlign: "center" }}>
              No tickets match your search.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#888" }}>
                  <th style={{ padding: "6px 0" }}>Ticket ID</th>
                  <th>Status</th>
                  <th>Subject</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((t) => (
                  <tr
                    key={t.ticket_id}
                    onClick={() => setSelected(t)}
                    style={{ borderTop: "1px solid #F0F0F0", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FAFAFA")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "8px 0", fontWeight: 600 }}>#{t.ticket_id}</td>
                    <td>
                      <StatusBadge status={t.status} />
                    </td>
                    <td>{(t.reason || "").length > 28 ? t.reason.slice(0, 28) + "..." : t.reason}</td>
                    <td>{formatDate(t.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {!error && !loading && tickets.length === 0 && !selected && (
        <div style={{ fontSize: "13px", color: "#999", padding: "20px 0", textAlign: "center" }}>
          No tickets yet.
        </div>
      )}

      {selected && <TicketDetail ticket={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default TicketsPanel;