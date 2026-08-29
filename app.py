# app.py
from fastapi import FastAPI
from services.router_agent import run_router

app = FastAPI()

@app.post("/ask")
async def ask(question: str):
    answer = run_router(question)
    return {"answer": answer}