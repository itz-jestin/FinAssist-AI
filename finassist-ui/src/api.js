const BASE_URL = "http://localhost:8000";

export async function verifyUser(userId, sessionVerified) {
    const res = await fetch(`${BASE_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, session_verified: sessionVerified })
    });
    return res.json(); // { session_id: "..." }
}

export async function askQuestion(question, sessionId) {
    const res = await fetch(`${BASE_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, session_id: sessionId })
    });
    return res.json(); // { answer: "..." }
}