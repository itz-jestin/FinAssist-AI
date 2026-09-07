import { useState } from "react";
import { verifyUser } from "../api";

function Login({ onLogin }) {
  async function handleClick(userId, sessionVerified) {
    const result = await verifyUser(userId, sessionVerified);
    onLogin(result.session_id, userId);
  }

  return (
    <div>
      <button onClick={() => handleClick("user_a", true)}>Login as User A (Verified)</button>
      <button onClick={() => handleClick("user_b", false)}>Login as User B (Unverified)</button>
    </div>
  );
}

export default Login;