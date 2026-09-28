import { useEffect, useRef, useState } from "react";
import { askQuestion } from "../api";
import MessageBubble from "./MessageBubble";
import Logo from "./Logo";

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const LIVE_TOOL_LABELS = {
  use_rag: { emoji: "📄", text: "Searching policy documents" },
  run_account_agent: { emoji: "💰", text: "Checking your account" },
  escalate_to_human: { emoji: "🚨", text: "Escalating to a human agent" },
};

const SUGGESTIONS = ["What is my balance?", "What is the refund policy?", "Check my transaction status"];

const animations = `
@keyframes fa-bounce { 0%, 80%, 100% { transform: translateY(0); opacity: .4 } 40% { transform: translateY(-5px); opacity: 1 } }
@keyframes fa-fade { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
@keyframes fa-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(74,108,247,.35) } 50% { box-shadow: 0 0 0 6px rgba(74,108,247,0) } }
`;

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
  const [currentTool, setCurrentTool] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, currentTool]);

  async function handleSend(textOverride) {
    const question = (textOverride ?? input).trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: question, timestamp: formatTime() }]);
    setInput("");
    setLoading(true);
    setCurrentTool(null);

    try {
      const { tool, answer } = await askQuestion(question, sessionId, setCurrentTool);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: answer, timestamp: formatTime(), source: tool },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: err.message || "Sorry, something went wrong reaching the server.",
          timestamp: formatTime(),
          source: null,
        },
      ]);
      console.error("askQuestion failed:", err);
    } finally {
      setLoading(false);
      setCurrentTool(null);
      if (onMessageSent) onMessageSent();
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSend();
  }

  const live = currentTool ? LIVE_TOOL_LABELS[currentTool] : null;
  const showSuggestions = messages.length === 1 && !loading;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#fff",
        borderRadius: "18px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 10px 30px rgba(74,108,247,0.10)",
        overflow: "hidden",
      }}
    >
      <style>{animations}</style>

      <div
        style={{
          padding: "16px 22px",
          background: "linear-gradient(135deg, #4A6CF7 0%, #7B5CF5 100%)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <Logo size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "16px" }}>FinAssist</div>
          <div style={{ fontSize: "12px", opacity: 0.85 }}>
            <span style={{ color: "#7CFFB2" }}>●</span> Your AI banking assistant
          </div>
        </div>
        {currentUser && (
          <div
            style={{
              fontSize: "12px",
              background: "rgba(255,255,255,0.2)",
              padding: "4px 12px",
              borderRadius: "999px",
              fontWeight: 600,
            }}
          >
            {currentUser}
          </div>
        )}
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "18px 22px",
          background: "linear-gradient(180deg, #F8F9FF 0%, #FFFFFF 100%)",
        }}
      >
        {messages.map((msg, i) => (
          <MessageBubble key={i} {...msg} />
        ))}

        {showSuggestions && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginLeft: "42px" }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                style={{
                  background: "#fff",
                  border: "1px solid #D6DDFB",
                  color: "#4A6CF7",
                  borderRadius: "999px",
                  padding: "6px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div style={{ marginLeft: "42px", animation: "fa-fade .25s ease" }}>
            {live && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#EEF1FF",
                  color: "#4A6CF7",
                  fontSize: "13px",
                  fontWeight: 600,
                  padding: "5px 12px",
                  borderRadius: "999px",
                  marginBottom: "6px",
                  animation: "fa-pulse 1.4s infinite",
                }}
              >
                <span>{live.emoji}</span>
                <span>{live.text}...</span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#888" }}>
              <span style={{ display: "inline-flex", gap: "4px" }}>
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: "#4A6CF7",
                      animation: `fa-bounce 1.2s ${d * 0.15}s infinite`,
                    }}
                  />
                ))}
              </span>
              FinAssist is typing...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          padding: "14px 20px",
          borderTop: "1px solid #EEF0F6",
          background: "#fff",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something..."
          style={{
            flex: 1,
            padding: "12px 18px",
            borderRadius: "999px",
            border: "1px solid #DDE1F0",
            background: "#F8F9FF",
            fontSize: "14px",
            outline: "none",
          }}
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          style={{
            background: "linear-gradient(135deg, #4A6CF7 0%, #7B5CF5 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "999px",
            padding: "0 22px",
            fontWeight: 700,
            fontSize: "14px",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            opacity: loading || !input.trim() ? 0.55 : 1,
            boxShadow: "0 4px 12px rgba(74,108,247,0.35)",
          }}
        >
          Send ➤
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;