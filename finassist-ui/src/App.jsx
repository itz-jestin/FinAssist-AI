import { useState } from "react";
import Login from "./components/Login";
import ChatWindow from "./components/ChatWindow";

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  function handleLoginSuccess(newSessionId, userId) {
    setSessionId(newSessionId);
    setCurrentUser(userId);
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h1>FinAssist</h1>
      {!sessionId ? (
        <Login onLogin={handleLoginSuccess} />
      ) : (
        <ChatWindow sessionId={sessionId} currentUser={currentUser} />
      )}
    </div>
  );
}

export default App;