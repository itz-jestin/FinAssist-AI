const tools = [
  {
    icon: "📄",
    name: "Policy Search",
    tag: "use_rag",
    what: "Looks up company policy documents: refund policy, fee schedules, FAQ, KYC requirements, terms of service.",
    how: ["What is the refund policy?", "What are the fees for transfers?", "What documents are needed for KYC?"],
  },
  {
    icon: "💰",
    name: "Account Data",
    tag: "run_account_agent",
    what: "Checks your own account. It works only for verified users, and it has four actions inside:",
    how: [],
    sub: [
      { name: "Check balance", ask: "What is my balance?" },
      { name: "Transaction status", ask: "Check the status of transaction TXN1001" },
      { name: "Refund eligibility", ask: "Am I eligible for a refund on transaction TXN1002?" },
      { name: "Escalate to human", ask: "Escalate this to a human agent, I think there is fraud on my account" },
    ],
  },
  {
    icon: "🚨",
    name: "Escalation",
    tag: "escalate_to_human",
    what: "Raises a ticket for human review: account closure, fraud reports, disputes the assistant can't resolve. Track it in the Tickets tab.",
    how: ["I want to close my account", "Report fraud on my account"],
  },
];

// TODO: replace with the real IDs from data/mock_accounts.py
const transactions = [
  { id: "TXN1001", note: "Example: completed transaction. Refund not eligible." },
  { id: "TXN1002", note: "Example: disputed transaction. Refund eligible." },
  { id: "TXN1003", note: "Example: pending transaction." },
];

const sections = [
  {
    icon: "🚀",
    title: "Getting started",
    items: [
      "Pick how you want to sign in on the login page.",
      "User A (Verified) can see account details like balance and transactions.",
      "User B (Unverified) can use the assistant, but account details are blocked until verification.",
      "Admin opens the ticket management panel.",
    ],
  },
  {
    icon: "💬",
    title: "Chatting with FinAssist",
    items: [
      "Type your question in the box at the bottom and press Enter or click Send.",
      "Tap one of the suggested questions on the first screen for a quick start.",
      "While the assistant works, you will see which tool it is using, such as 'Checking your account'.",
      "Each answer has a badge showing where it came from.",
    ],
  },
  {
    icon: "🏷️",
    title: "Answer badges",
    items: [
      "📄 Policy Search: the answer came from company policy documents.",
      "💰 Account Data: the answer came from your own account.",
      "🚨 Escalated: your request was passed to a human agent.",
    ],
  },
  {
    icon: "🔐",
    title: "Verification",
    items: [
      "Account questions need a verified session.",
      "If you are unverified, the assistant replies: 'Please verify first in the account section.'",
      "The assistant never asks for your OTP, PIN, password, or account number in chat.",
    ],
  },
  {
    icon: "🎫",
    title: "Tickets",
    items: [
      "Open the Tickets tab in the left menu to see your tickets.",
      "Status shows Pending, In Progress, or Resolved.",
      "Click a ticket to see its reason, resolution notes, and the conversation.",
      "Use the search box and status filter to find tickets, and Refresh to reload.",
    ],
  },
  {
    icon: "🛡️",
    title: "For admins",
    items: [
      "Admins can review all tickets.",
      "Update a ticket's status and add resolution notes when it is handled.",
    ],
  },
  {
    icon: "💡",
    title: "Tips",
    items: [
      "Ask one thing at a time for the best answers.",
      "Always include the transaction ID when asking about a specific transaction.",
      "If a reply says there is a connection problem, wait a moment and try again.",
    ],
  },
];

const card = {
  border: "1px solid #E8EBF7",
  borderRadius: "14px",
  padding: "16px 18px",
  background: "#FAFBFF",
};

const chip = {
  display: "inline-block",
  background: "#fff",
  border: "1px solid #D6DDFB",
  color: "#4A6CF7",
  borderRadius: "999px",
  padding: "3px 12px",
  fontSize: "12.5px",
  fontWeight: 600,
  margin: "3px 6px 3px 0",
};

function Notes({ onBack }) {
  return (
    <div
      style={{
        maxWidth: "720px",
        margin: "40px auto",
        background: "#fff",
        borderRadius: "20px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 20px 50px rgba(74,108,247,0.18)",
        overflow: "hidden",
        textAlign: "left",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #4A6CF7 0%, #7B5CF5 100%)",
          color: "#fff",
          padding: "24px 28px",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            border: "none",
            borderRadius: "999px",
            padding: "6px 14px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: "12px",
          }}
        >
          ← Back to login
        </button>
        <div style={{ fontWeight: 800, fontSize: "22px" }}>📘 How to use FinAssist</div>
        <div style={{ fontSize: "13px", opacity: 0.85, marginTop: "4px" }}>
          Everything you need to know in one place
        </div>
      </div>

      <div style={{ padding: "22px 28px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Tools */}
        <div style={{ ...card, background: "#fff" }}>
          <div style={{ fontWeight: 800, fontSize: "16px", marginBottom: "12px", color: "#1E2A5A" }}>
            🧰 Available tools
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {tools.map((t) => (
              <div key={t.tag} style={card}>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "#1E2A5A" }}>
                  {t.icon} {t.name}{" "}
                  <span style={{ fontSize: "11px", color: "#8A90A8", fontWeight: 600 }}>({t.tag})</span>
                </div>
                <div style={{ fontSize: "13.5px", color: "#444", margin: "6px 0 8px", lineHeight: 1.6 }}>
                  {t.what}
                </div>
                {t.sub && (
                  <ul style={{ margin: "0 0 4px", paddingLeft: "20px", fontSize: "13.5px", lineHeight: 1.8, color: "#444" }}>
                    {t.sub.map((s) => (
                      <li key={s.name}>
                        <strong>{s.name}:</strong> <em>"{s.ask}"</em>
                      </li>
                    ))}
                  </ul>
                )}
                {t.how.length > 0 && (
                  <div>
                    <span style={{ fontSize: "12.5px", color: "#666", fontWeight: 600 }}>Try: </span>
                    {t.how.map((h) => (
                      <span key={h} style={chip}>
                        {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Transaction IDs */}
        <div style={{ ...card, background: "#fff" }}>
          <div style={{ fontWeight: 800, fontSize: "16px", marginBottom: "6px", color: "#1E2A5A" }}>
            🧾 Transaction IDs
          </div>
          <div style={{ fontSize: "13.5px", color: "#444", marginBottom: "10px", lineHeight: 1.6 }}>
            Transaction status and refund questions need a transaction ID. Type it exactly as shown
            in your account. Refunds are only approved for transactions with a disputed status.
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#888" }}>
                <th style={{ padding: "6px 0" }}>Transaction ID</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} style={{ borderTop: "1px solid #F0F0F0" }}>
                  <td style={{ padding: "8px 0", fontWeight: 700, color: "#4A6CF7" }}>{t.id}</td>
                  <td style={{ color: "#555" }}>{t.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sections.map((s) => (
          <div key={s.title} style={card}>
            <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "8px", color: "#1E2A5A" }}>
              {s.icon} {s.title}
            </div>
            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13.5px", lineHeight: 1.7, color: "#444" }}>
              {s.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notes;