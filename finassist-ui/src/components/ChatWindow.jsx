import { useState } from "react";
import { askQuestionStream } from "../api";

function ChatWindow({ sessionId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

async function handleSend() {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Add an empty assistant message that we'll fill in as chunks arrive
    setMessages((prev) => [...prev, { role: "assistant", text: "" }]);

    await askQuestionStream(input, sessionId, (chunk) => {
        setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = {
                role: "assistant",
                text: updated[lastIndex].text + chunk
            };
            return updated;
        });
    });

    setLoading(false);
}
  

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleSend();
    }
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h3>Chat as {currentUser}</h3>

      <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "12px", height: "400px", overflowY: "auto", marginBottom: "12px" }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              margin: "8px 0"
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: "12px",
                backgroundColor: msg.role === "user" ? "#DCF8C6" : "#F1F0F0",
                maxWidth: "80%"
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        {loading && <p>Assistant is typing...</p>}
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something..."
          style={{ flex: 1, padding: "8px" }}
        />
        <button onClick={handleSend} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;