from fastapi import FastAPI
from pydantic import BaseModel, json
from services.router_agent import run_router
import uuid
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import json


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TICKETS_PATH = os.path.join(BASE_DIR, "data/tickets.json")

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

@app.post("/ask_stream")
async def ask_stream(data: AskRequest):
    session = sessions.get(data.session_id)
    if not session:
        return {"error": "Invalid or expired session. Please log in again."}

    async def event_generator():
        for chunk in run_router(
            data.question,
            session["user_id"],
            session["session_verified"]
        ):
            yield chunk

    return StreamingResponse(event_generator(), media_type="text/plain")

@app.get("/tickets")
def get_tickets():
    with open(TICKETS_PATH) as f:
        return json.load(f)

@app.post("/hello")
def hello():
    return {"message": "Hello, world!"}