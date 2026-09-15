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
  if (!context || context.length === 0) {
    return <div style={{ fontSize: "13px", color: "#999" }}>No conversation context.</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {context.map((msg, i) => {
        if (!msg.message || !msg.message.trim()) return null;

        const isUser = msg.role === "user";
        const isTool = msg.role === "tool";
        const isSystem = msg.role === "system";

        if (isTool) {
          return (
            <div
              key={i}
              style={{
                fontSize: "12px",
                fontFamily: "monospace",
                backgroundColor: "#F5F5F5",
                border: "1px dashed #DDD",
                borderRadius: "6px",
                padding: "8px 10px",
                color: "#666",
              }}
            >
              tool result: {msg.message}
            </div>
          );
        }

        if (isSystem) {
          return (
            <div
              key={i}
              style={{
                fontSize: "12px",
                backgroundColor: "#FFF9E6",
                border: "1px solid #F0E4B0",
                borderRadius: "6px",
                padding: "8px 10px",
                color: "#8a6d00",
              }}
            >
              system: {msg.message}
            </div>
          );
        }

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
                backgroundColor: isUser ? "#EEF1FF" : "#F3F4F8",
                borderRadius: "10px",
                padding: "8px 12px",
                fontSize: "13px",
                whiteSpace: "pre-wrap",
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
    <div style={{ borderTop: "1px solid #EEE", marginTop: "12px", paddingTop: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontWeight: 700 }}>#{ticket.ticket_id}</span> <StatusBadge status={ticket.status} />
        </div>
        <div style={{ fontSize: "12px", color: "#999" }}>{formatDate(ticket.created_at)}</div>
      </div>

      <div style={{ fontSize: "13px", color: "#555", margin: "6px 0 12px" }}>{ticket.reason}</div>

      {ticket.resolution_notes && (
        <div
          style={{
            fontSize: "13px",
            backgroundColor: "#E6F4EA",
            color: "#1E7B34",
            padding: "8px 10px",
            borderRadius: "6px",
            marginBottom: "12px",
          }}
        >
          {ticket.resolution_notes}
        </div>
      )}

      <div style={{ fontWeight: 600, fontSize: "13px", marginBottom: "8px" }}>Conversation Context</div>
      <ConversationContext context={ticket.conversation_context} />

      <button
        onClick={onClose}
        style={{
          marginTop: "12px",
          background: "none",
          border: "none",
          color: "#4A6CF7",
          fontSize: "13px",
          cursor: "pointer",
          padding: 0,
        }}
      >
        &larr; Back to list
      </button>
    </div>
  );
}

function TicketsPanel({ refreshKey = 0 }) {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  function loadTickets(silent = false) {
    if (!silent) setLoading(true);
    getTickets()
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || String(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTickets(refreshKey > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

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
        padding: "16px 20px",
        height: "100%",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ fontWeight: 700, fontSize: "16px" }}>Support Tickets</div>
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