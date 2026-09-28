import json
import os
from dotenv import load_dotenv
from openai import AsyncOpenAI
from agents.account_tools import run_account_agent
from services.chroma_service import search_chunks

load_dotenv(".env")

ERROR_MSG = "I'm having trouble connecting to the service right now. Please try again in a moment."


def make_client(key_env, url_env):
    return AsyncOpenAI(
        api_key=os.getenv(key_env),
        base_url=os.getenv(url_env),
        max_retries=0,
        timeout=20,
    )


PROVIDERS = [
    {"name": "bynara", "client": make_client("BYNARA_API_KEY", "BYNARA_BASE_URL"), "model": os.getenv("BYNARA_MODEL")},
    {"name": "nvidia", "client": make_client("NVIDIA_API_KEY", "NVIDIA_BASE_URL"), "model": os.getenv("NVIDIA_MODEL")},
]


async def chat_with_fallback(**kwargs):
    last_err = None
    for p in PROVIDERS:
        if not p["model"]:
            continue
        try:
            return await p["client"].chat.completions.create(model=p["model"], **kwargs)
        except Exception as e:
            print(f"Provider {p['name']} failed: {e}")
            last_err = e
    raise last_err or RuntimeError("No providers configured")


router_tools = [
    {"type": "function", "function": {
        "name": "use_rag",
        "description": "Searches company policy documents — general refund policy, fee schedules, FAQ, KYC requirements, terms of service.",
        "parameters": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}
    }},
    {"type": "function", "function": {
        "name": "run_account_agent",
        "description": "Checks the LOGGED-IN USER'S specific account data — their balance, their transaction status, refund eligibility or to raise a ticket like escalate to human for a SPECIFIC transaction ID they provide. Do NOT use this for general policy questions like 'what is your refund policy' — use use_rag for those.",
        "parameters": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}
    }}
]


def use_rag(query):
    results = search_chunks(query, 2)
    chunks = results["documents"][0]
    if not chunks:
        return "No relevant information found in the document."
    return "\n\n".join(chunks)


available_tools = {"use_rag": use_rag, "run_account_agent": run_account_agent}


async def run_router(user_prompt, user_id, session_verified, chat_history):
    """Async generator. Yields {"type": "tool", ...} events, then one {"type": "done", ...}."""
    messages = [
        {"role": "system", "content": (
            "Your job is to only route. "
            "For questions about people, documents, or specific facts, use the use_rag tool. "
            "For account-related questions (balance, transactions, refunds), use run_account_agent. "
            "\n\nYou do not need to check verification status yourself — simply call the "
            "appropriate tool. If the tool's result indicates verification is required, "
            "relay that to the user by saying: 'Please verify first in the account section.' "
            "Do not ask the user for their OTP, PIN, or account number as a form of "
            "verification. "
            "\n\nDo not answer questions directly — only use the tools provided. "
            "If you cannot find an answer, say 'I cannot find an answer to that question.' "
            "Answer respectfully to the user. Use plain text only, no markdown."
        )}
    ]
    messages.extend(chat_history)
    messages.append({"role": "user", "content": user_prompt})

    max_loop = 8
    loop_count = 0
    last_tool_used = None
    last_tool_output = None
    final_text = None

    while loop_count < max_loop:
        try:
            response = await chat_with_fallback(
                messages=messages,
                tools=router_tools,
                max_tokens=1500,
            )
        except Exception as e:
            print(f"All providers failed: {e}")
            yield {"type": "done", "tool": last_tool_used, "answer": ERROR_MSG}
            return

        call = response.choices[0].message
        messages.append(call.model_dump())

        if not call.tool_calls:
            final_text = call.content
            break

        for tool in call.tool_calls:
            function_name = tool.function.name
            last_tool_used = function_name
            yield {"type": "tool", "tool": function_name}  # shown in the UI instantly

            fn = available_tools.get(function_name)
            print(f"Calling tool: {function_name}")
            try:
                args = json.loads(tool.function.arguments or "{}")
            except json.JSONDecodeError:
                args = {}

            fun_out = "Unknown tool."
            if fn == use_rag:
                fun_out = fn(args.get("query", user_prompt))
            elif fn == run_account_agent:
                fun_out = await fn(args.get("query", user_prompt), user_id, session_verified)
                print("Function out of account agent: ", fun_out)

            last_tool_output = fun_out
            messages.append({"role": "tool", "tool_call_id": tool.id, "content": str(fun_out)})

        loop_count += 1

    if loop_count >= max_loop:
        yield {"type": "done", "tool": last_tool_used,
               "answer": "Maximum loop count reached. The router could not find a suitable answer."}
        return

    answer = (final_text or "").strip() or last_tool_output or "I cannot find an answer to that question."
    yield {"type": "done", "tool": last_tool_used, "answer": answer}