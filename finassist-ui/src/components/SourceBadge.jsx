const TOOL_LABELS = {
  use_rag: { emoji: "📄", label: "Policy Search" },
  run_account_agent: { emoji: "💰", label: "Account Data" },
  escalate_to_human: { emoji: "🚨", label: "Escalated" },
};

function SourceBadge({ toolName }) {
  const badge = TOOL_LABELS[toolName];
  if (!badge) return null;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        backgroundColor: "#E6F4EA",
        color: "#1E7B34",
        fontSize: "12px",
        fontWeight: 600,
        padding: "2px 10px",
        borderRadius: "999px",
        marginTop: "6px",
      }}
    >
      {badge.emoji} {badge.label}
    </span>
  );
}

export default SourceBadge;