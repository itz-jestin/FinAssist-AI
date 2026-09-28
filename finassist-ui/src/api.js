const BASE_URL = "http://localhost:8000";

export async function verifyUser(userId, sessionVerified) {
  const res = await fetch(`${BASE_URL}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, session_verified: sessionVerified }),
  });
  return res.json();
}

export async function adminLogin(username, password) {
  const res = await fetch(`${BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    return { success: false };
  }
  return res.json();
}

// Reads one JSON event per line: {type:"tool"} as the tool is picked, {type:"done"} with the answer.
export async function askQuestion(question, sessionId, onTool) {
  const res = await fetch(`${BASE_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, session_id: sessionId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed with status ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result = null;

  const handleLine = (line) => {
    if (!line.trim()) return;
    const event = JSON.parse(line);
    if (event.type === "tool" && onTool) onTool(event.tool);
    if (event.type === "done") result = event;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      handleLine(buffer.slice(0, idx));
      buffer = buffer.slice(idx + 1);
    }
  }
  handleLine(buffer);

  if (!result) throw new Error("No response received from the server.");
  return result; // { type, tool, answer }
}

export async function getTickets(userId) {
  const url = userId ? `${BASE_URL}/tickets?user_id=${encodeURIComponent(userId)}` : `${BASE_URL}/tickets`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function updateTicketStatus(ticketId, status, resolutionNotes, adminToken) {
  const res = await fetch(`${BASE_URL}/tickets/${encodeURIComponent(ticketId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
    },
    body: JSON.stringify({ status, resolution_notes: resolutionNotes }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update ticket (status ${res.status})`);
  }
  return res.json();
}

export async function logoutPage(sessionId) {
  const res = await fetch(`${BASE_URL}/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId }),
  });
  return res.json();
}