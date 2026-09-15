import { useState } from "react";
import { askQuestionStream } from "../api";
import MessageBubble from "./MessageBubble";

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ChatWindow({ sessionId, currentUser, onMessageSent }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! How can I help you today?",
      timestamp: formatTime(),
      source: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input, timestamp: formatTime() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: "", timestamp: formatTime(), source: "Account Data" },
    ]);

    try {
      await askQuestionStream(input, sessionId, (chunk) => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = {
            ...updated[lastIndex],
            text: updated[lastIndex].text + chunk,
          };
          return updated;
        });
      });
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = {
          ...updated[lastIndex],
          text: "Sorry, something went wrong reaching the server.",
        };
        return updated;
      });
      console.error("askQuestionStream failed:", err);
    }

    setLoading(false);

    if (onMessageSent) onMessageSent();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSend();
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#fff",
        borderRadius: "12px",
        border: "1px solid #E5E7EB",
      }}
    >
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #EEE" }}>
        <div style={{ fontWeight: 700, fontSize: "16px" }}>Chat with FinAssist</div>
        <div style={{ fontSize: "13px", color: "#888" }}>Your AI banking assistant</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} {...msg} />
        ))}
        {loading && (
          <div style={{ fontSize: "13px", color: "#999", marginLeft: "42px" }}>
            FinAssist is typing...
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "8px", padding: "14px 20px", borderTop: "1px solid #EEE" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something..."
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid #DDD",
            fontSize: "14px",
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            backgroundColor: "#4A6CF7",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0 18px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;