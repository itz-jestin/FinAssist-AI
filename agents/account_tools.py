from data.mock_accounts import accounts
from openai import AsyncOpenAI
from dotenv import load_dotenv
import os
import json
from agents.ticket import escalate_to_human
import time

load_dotenv(".env")
client = AsyncOpenAI(
    api_key=os.getenv("NVIDIA_API_KEY"),
    base_url=os.getenv("NVIDIA_BASE_URL"),
)

VERIFY_MSG = "Please verify first in the account section."


def check_account_balance(user_id, session_verified):
    if not session_verified:
        return {"error": "verification_required", "message": VERIFY_MSG}
    account = accounts.get(user_id)
    if not account:
        return {"error": "not_found"}
    return {"balance": account["balance"]}


def check_transaction_status(user_id, session_verified, transaction_id):
    if not session_verified:
        return {"error": "verification_required", "message": VERIFY_MSG}
    account = accounts.get(user_id)
    if not account:
        return {"error": "not_found"}
    for txn in account["transactions"]:
        if txn["id"] == transaction_id:
            return txn
    return {"error": "transaction_not_found"}


def calculate_refund_eligibility(user_id, session_verified, transaction_id):
    if not session_verified:
        return {"error": "verification_required", "message": VERIFY_MSG}
    account = accounts.get(user_id) or {}
    for txn in account.get("transactions", []):
        if txn["id"] == transaction_id:
            if txn["status"] == "disputed":
                return {"eligible": True, "amount": abs(txn["amount"])}
            return {"eligible": False, "reason": f"Transaction status is '{txn['status']}', not disputed."}
    return {"eligible": False, "reason": "Transaction not found."}


def _fallback_text(result):
    """Readable text from a raw tool result, used if the LLM gives no usable answer."""
    if isinstance(result, dict):
        if "message" in result:
            return result["message"]
        if "balance" in result:
            return f"Your current account balance is {result['balance']}."
    return str(result) if result is not None else "I could not complete that request. Please try again."


async def run_account_agent(query, user_id, session_verified):
    print(f"Running account agent for user_id: {user_id}, session_verified: {session_verified}")

    # Enforce verification in code, not via the LLM
    if not session_verified:
        return VERIFY_MSG

    tool_schemas = [
        {"type": "function", "function": {
            "name": "check_account_balance",
            "description": "This tool helps to check account balance.",
            "parameters": {"type": "object", "properties": {}, "required": []}}},
        {"type": "function", "function": {
            "name": "check_transaction_status",
            "description": "This tool helps to check transaction status.",
            "parameters": {"type": "object", "properties": {"transaction_id": {"type": "string"}}, "required": ["transaction_id"]}}},
        {"type": "function", "function": {
            "name": "calculate_refund_eligibility",
            "description": "This tool helps to calculate refund eligibility of a user.",
            "parameters": {"type": "object", "properties": {"transaction_id": {"type": "string"}}, "required": ["transaction_id"]}}},
        {"type": "function", "function": {
            "name": "escalate_to_human",
            "description": "Use this tool when the request requires human review - account closure, fraud reports, disputes the system can't resolve, or anything sensitive/out of scope.",
            "parameters": {"type": "object", "properties": {"reason": {"type": "string"}}, "required": ["reason"]}}},
    ]

    available_functions = {
        "check_account_balance": check_account_balance,
        "check_transaction_status": check_transaction_status,
        "calculate_refund_eligibility": calculate_refund_eligibility,
        "escalate_to_human": escalate_to_human,
    }

    messages = [
        {"role": "system", "content": (
            "You are a helpful assistant that helps users with account-related information "
            "(balance, transactions, refund eligibility for a specific transaction). "
            "You do NOT have access to general policy information. If asked about general "
            "policies rather than the user's specific account, say you don't have that "
            "information here and that it should be looked up separately. Never invent "
            "policy details. "
            "\n\nSimply call the appropriate tool for the user's request. If the tool's "
            "result indicates verification is required, tell the user they must verify "
            "their identity in the account section before you can access that information. "
            "Never ask the user for OTP, PIN, account number, password, verification code, "
            "or other authentication credentials — verification happens through the app, "
            "not through chat. Reply in short plain text, no markdown."
        )},
        {"role": "user", "content": query},
    ]

    last_result = None

    for _ in range(3):
        start = time.time()
        response = await client.chat.completions.create(
            model=os.getenv("NVIDIA_MODEL"),
            messages=messages,
            tools=tool_schemas,
            max_tokens=1500,
        )
        print(f"API call took {time.time() - start} seconds")
        choice = response.choices[0]
        message = choice.message
        messages.append(message.model_dump())

        if not message.tool_calls:
            content = (message.content or "").strip()
            if "<tool_call>" in content:
                continue
            truncated = choice.finish_reason == "length"
            leaked = content.lower().startswith("here's a thinking process")
            if not content or truncated or leaked:
                return _fallback_text(last_result)
            return content

        for call in message.tool_calls:
            name = call.function.name
            print(name)
            fn = available_functions.get(name)
            if fn is None:
                result = {"error": "unknown_tool"}
            else:
                try:
                    args = json.loads(call.function.arguments or "{}")
                except json.JSONDecodeError:
                    args = {}
                if name == "check_account_balance":
                    result = fn(user_id, session_verified)
                elif name in ("check_transaction_status", "calculate_refund_eligibility"):
                    result = fn(user_id, session_verified, str(args.get("transaction_id", "")).lower())
                else:  # escalate_to_human
                    result = fn(query, str(args.get("reason", "")).lower(), user_id, messages[-5:])
            last_result = result
            messages.append({"role": "tool", "tool_call_id": call.id, "content": str(result)})

    return _fallback_text(last_result)