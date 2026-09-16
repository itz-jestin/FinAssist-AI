import { useEffect, useMemo, useState } from "react";
import { getTickets, updateTicketStatus } from "../api";

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
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ConversationContext({ context }) {
  if (!context || context.length === 0) {
    return <div style={{ fontSize: "13px", color: "#999" }}>No conversation context.</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "left" }}>
      {context.map((msg, i) => {
        if (!msg.message || !msg.message.trim()) return null;
        const isUser = msg.role === "user";
        const isTool = msg.role === "tool";
        const isSystem = msg.role === "system";

        if (isTool) {
          return (
            <div key={i} style={{ fontSize: "12px", fontFamily: "monospace", backgroundColor: "#F5F5F5", border: "1px dashed #DDD", borderRadius: "6px", padding: "8px 10px", color: "#666", textAlign: "left" }}>
              tool result: {msg.message}
            </div>
          );
        }
        if (isSystem) {
          return (
            <div key={i} style={{ fontSize: "12px", backgroundColor: "#FFF9E6", border: "1px solid #F0E4B0", borderRadius: "6px", padding: "8px 10px", color: "#8a6d00", textAlign: "left" }}>
              system: {msg.message}
            </div>
          );
        }
        return (
          <div key={i} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "85%", backgroundColor: isUser ? "#EEF1FF" : "#F3F4F8", borderRadius: "10px", padding: "8px 12px", fontSize: "13px", whiteSpace: "pre-wrap", textAlign: "left" }}>
              {msg.message}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TicketResolutionDetail({ ticket, onClose, onResolved }) {
  const [status, setStatus] = useState(ticket.status);
  const [notes, setNotes] = useState(ticket.resolution_notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateTicketStatus(ticket.ticket_id, status, notes);
      onResolved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const controlStyle = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "6px",
    border: "1px solid #DDD",
    fontSize: "13px",
    marginBottom: "12px",
    backgroundColor: "#fff",
    color: "#1a1a1a",
    boxSizing: "border-box",
    colorScheme: "light",
  };

  return (
    <div style={{ textAlign: "left" }}>
      <button
        onClick={onClose}
        style={{ marginBottom: "14px", background: "none", border: "none", color: "#4A6CF7", fontSize: "13px", fontWeight: 600, cursor: "pointer", padding: 0 }}
      >
        &larr; Back to list
      </button>

      <div style={{ border: "1px solid #E5E7EB", borderRadius: "10px", padding: "16px 18px", backgroundColor: "#FAFBFF", marginBottom: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: "15px" }}>#{ticket.ticket_id}</span>{" "}
            <span style={{ fontSize: "12px", color: "#888" }}>({ticket.user_id})</span>
          </div>
          <div style={{ fontSize: "12px", color: "#999" }}>{formatDate(ticket.created_at)}</div>
        </div>
        <div style={{ fontSize: "13px", color: "#555", marginTop: "8px" }}>{ticket.reason}</div>
      </div>

      <div style={{ fontWeight: 600, fontSize: "13px", marginBottom: "10px" }}>Conversation Context</div>
      <div style={{ border: "1px solid #E5E7EB", borderRadius: "10px", padding: "16px 18px", backgroundColor: "#fff", marginBottom: "20px" }}>
        <ConversationContext context={ticket.conversation_context} />
      </div>

      <div style={{ border: "1px solid #E5E7EB", borderRadius: "10px", padding: "16px 18px", backgroundColor: "#fff" }}>
        <div style={{ fontWeight: 600, fontSize: "13px", marginBottom: "12px" }}>Resolve Ticket</div>

        <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "6px" }}>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={controlStyle}>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "6px" }}>Resolution notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          style={{ ...controlStyle, resize: "vertical" }}
          placeholder="What was done to resolve this?"
        />

        {error && <div style={{ color: "#c00", fontSize: "13px", marginBottom: "10px" }}>{error}</div>}

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ backgroundColor: "#4A6CF7", color: "#fff", border: "none", borderRadius: "6px", padding: "9px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onClose}
            style={{ background: "none", border: "1px solid #DDD", borderRadius: "6px", padding: "9px 18px", fontSize: "13px", cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({ onLogout }) {
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
    loadTickets();
    const interval = setInterval(() => loadTickets(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const searchLower = search.toLowerCase();
      const reason = t.reason || "";
      const userId = t.user_id || "";
      const id = t.ticket_id || "";
      const matchesSearch =
        !search ||
        id.toLowerCase().includes(searchLower) ||
        reason.toLowerCase().includes(searchLower) ||
        userId.toLowerCase().includes(searchLower);
      return matchesStatus && matchesSearch;
    });
  }, [tickets, search, statusFilter]);

  function handleResolved(updatedTicket) {
    setTickets((prev) =>
      prev.map((t) => (t.ticket_id === updatedTicket.ticket_id ? { ...t, ...updatedTicket } : t))
    );
    setSelected(null);
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F6FA" }}>
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
        <span>FinAssist — Admin</span>
        <button
          onClick={onLogout}
          style={{ backgroundColor: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "6px", padding: "6px 14px", fontSize: "13px", cursor: "pointer" }}
        >
          Logout
        </button>
      </div>

      <div style={{ padding: "20px" }}>
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            padding: "20px 24px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ fontWeight: 700, fontSize: "18px" }}>All Support Tickets</div>
            <button
              onClick={() => loadTickets(false)}
              disabled={loading}
              style={{ backgroundColor: "#F3F4F8", color: "#333", border: "1px solid #DDD", borderRadius: "6px", padding: "6px 14px", fontSize: "13px", cursor: "pointer" }}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {!selected && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ticket ID, user, or reason..."
                style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", border: "1px solid #DDD", fontSize: "13px" }}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #DDD", fontSize: "13px" }}
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
                      <th style={{ padding: "8px 0" }}>Ticket ID</th>
                      <th>User</th>
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
                        <td style={{ padding: "10px 0", fontWeight: 600 }}>#{t.ticket_id}</td>
                        <td>{t.user_id}</td>
                        <td>
                          <StatusBadge status={t.status} />
                        </td>
                        <td>{(t.reason || "").length > 35 ? t.reason.slice(0, 35) + "..." : t.reason}</td>
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

          {selected && (
            <TicketResolutionDetail
              ticket={selected}
              onClose={() => setSelected(null)}
              onResolved={handleResolved}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;