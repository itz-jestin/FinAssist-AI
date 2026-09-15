import SourceBadge from "./SourceBadge";

function MessageBubble({ role, text, timestamp, source }) {
  const isUser = role === "user";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
        gap: "10px",
        margin: "14px 0",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          backgroundColor: isUser ? "#4A6CF7" : "#EEF1FF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: "16px",
        }}
      >
        {isUser ? "🧑" : "🤖"}
      </div>

      <div style={{ maxWidth: "70%" }}>
        <div
          style={{
            backgroundColor: isUser ? "#4A6CF7" : "#F3F4F8",
            color: isUser ? "#fff" : "#1a1a1a",
            padding: "10px 14px",
            borderRadius: "14px",
            borderTopLeftRadius: isUser ? "14px" : "4px",
            borderTopRightRadius: isUser ? "4px" : "14px",
            fontSize: "14px",
            lineHeight: 1.4,
            whiteSpace: "pre-wrap",
          }}
        >
          {text}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "#999",
            marginTop: "4px",
            textAlign: isUser ? "right" : "left",
          }}
        >
          {timestamp}
        </div>
        {source && !isUser && (
          <div style={{ textAlign: "left" }}>
            <SourceBadge label={source} />
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;