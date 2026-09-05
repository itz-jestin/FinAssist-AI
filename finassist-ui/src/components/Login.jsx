import { useState } from "react";
import {verifyUser} from "../api";

function Login(){
  const  [verified , setVerified] = useState(null);
  const [isVerified , setIsVerified] = useState(false);
  async function handleClick(userId, sessionVerified){
    const result = await verifyUser(userId, sessionVerified);
    setVerified(result);
    setIsVerified(sessionVerified);
  }
  return(
    <div>
      <button onClick={() => handleClick("user_a", true)}>user_a</button>
      <button onClick={() => handleClick("user_b", false)}>user_b</button>
      {verified ? "Logged in" : "Not logged in"}
      {isVerified ? "Verified" : "Not Verified"}
    </div>
    )
  }


export default Login;