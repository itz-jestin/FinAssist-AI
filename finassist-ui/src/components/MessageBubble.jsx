import SourceBadge from "./SourceBadge";
import Logo from "./Logo";
import userImg from "../assets/user.png";

// Removes markdown symbols (**bold**, * bullets, # headings, `code`) from LLM text
function cleanText(t = "") {
  return t
    .replace(/\*\*(.*?)\*\*/gs, "$1")
    .replace(/__(.*?)__/gs, "$1")
    .replace(/^\s*[*-]\s+/gm, "• ")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*/g, "")
    .trim();
}

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
        animation: "fa-fade .3s ease",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: isUser ? "#fff" : "#EEF1FF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        {isUser ? (
          <img
            src={userImg}
            alt="You"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Logo size={22} rounded={false} />
        )}
      </div>

      <div style={{ maxWidth: "70%" }}>
        <div
          style={{
            background: isUser ? "linear-gradient(135deg, #4A6CF7 0%, #7B5CF5 100%)" : "#fff",
            color: isUser ? "#fff" : "#1a1a1a",
            border: isUser ? "none" : "1px solid #E8EBF7",
            padding: "11px 16px",
            borderRadius: "16px",
            borderTopLeftRadius: isUser ? "16px" : "4px",
            borderTopRightRadius: isUser ? "4px" : "16px",
            fontSize: "14px",
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            boxShadow: isUser ? "0 4px 12px rgba(74,108,247,0.25)" : "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          {isUser ? text : cleanText(text)}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "#A0A4B8",
            marginTop: "4px",
            textAlign: isUser ? "right" : "left",
          }}
        >
          {timestamp}
        </div>
        {source && !isUser && (
          <div style={{ textAlign: "left" }}>
            <SourceBadge toolName={source} />
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;