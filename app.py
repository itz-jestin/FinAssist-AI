from fastapi import FastAPI
from pydantic import BaseModel
from services.router_agent import run_router
import uuid
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserRequest(BaseModel):
    user_id: str = "user_a"
    session_verified: bool = True

class AskRequest(BaseModel):
    question: str
    session_id: str

sessions = {}  # session_id -> {"user_id": ..., "session_verified": ...}

@app.post("/verify")
def verify_user(data: UserRequest):
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "user_id": data.user_id,
        "session_verified": data.session_verified
    }
    return {"session_id": session_id}

@app.post("/ask")
async def ask(data: AskRequest):
    session = sessions.get(data.session_id)
    if not session:
        return {"error": "Invalid or expired session. Please log in again."}

    answer = run_router(
        data.question,
        session["user_id"],
        session["session_verified"]
    )
    return {"answer": answer}