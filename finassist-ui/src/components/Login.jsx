import { useState } from "react";
import { verifyUser } from "../api";

function Login({ onLogin }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (userId, verified) => {
    setLoading(true);
    const data = await verifyUser(userId, verified);
    onLogin(data.session_id, userId, verified);  // pass info up to parent
    setLoading(false);
  };

  return (
    <div>
      <button onClick={() => handleLogin("user_a", true)}>
        Login as User A (Verified)
      </button>
      <button onClick={() => handleLogin("user_b", false)}>
        Login as User B (Unverified)
      </button>
    </div>
  );
}

export default Login;