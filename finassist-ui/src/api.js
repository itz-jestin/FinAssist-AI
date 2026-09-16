const BASE_URL = "http://localhost:8000";

export async function verifyUser(userId, sessionVerified) {
  const res = await fetch(`${BASE_URL}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, session_verified: sessionVerified }),
  });
  return res.json(); // { session_id: "..." }
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
  return res.json(); // { success: true, token: "..." }
}

export async function askQuestion(question, sessionId) {
  const res = await fetch(`${BASE_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, session_id: sessionId }),
  });
  return res.json(); // { answer: "..." }
}

export async function askQuestionStream(question, sessionId, onChunk) {
  const res = await fetch(`${BASE_URL}/ask_stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, session_id: sessionId }),
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunkText = decoder.decode(value, { stream: true });
    onChunk(chunkText);
  }
}

// Returns all tickets. Filtering by user is done client-side in TicketsPanel,
// unless your backend supports ?user_id=... filtering, in which case pass userId here.
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