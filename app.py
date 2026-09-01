from fastapi import FastAPI
from pydantic import BaseModel
from services.router_agent import run_router

app = FastAPI()


class UserRequest(BaseModel):
    user_id: str
    session_verified: bool


class AskRequest(BaseModel):
    question: str
    

user_sessions = {"user_id":"","session_verified":False}

@app.post("/verify")
def verify_user(data: UserRequest):
    user_sessions["user_id"] = data.user_id
    user_sessions["session_verified"] = data.session_verified



@app.post("/ask")
async def ask(data: AskRequest):

    answer = run_router(
        data.question,
        user_sessions["user_id"],
        user_sessions["session_verified"]
    )

    return {
        "answer": answer
    }