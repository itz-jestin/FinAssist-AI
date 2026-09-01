import json
import os
from dotenv import load_dotenv
from openai import OpenAI
from agents.account_tools import run_account_agent
from services.chroma_service import search_chunks

load_dotenv(".env")

client = OpenAI(
    api_key=os.getenv("NVIDIA_API_KEY"),
    base_url=os.getenv("BASE_URL")
)

router_tools = [
    {"type": "function", "function": {
        "name": "use_rag",
        "description": "This tool can check documents and give peoples information.",
        "parameters": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}
    }},
    {"type": "function", "function": {
        "name": "run_account_agent",
        "description": "This tool can be used to perform account-related tasks like checking account balance, transaction status, refund eligibility, and human escalation.",
        "parameters": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}
    }}
]

def use_rag(query):
    results = search_chunks(query, 3)
    chunks = results["documents"][0]
    if not chunks:
        return "No relevant information found in the document."
    return "\n\n".join(chunks)

available_tools = {"use_rag": use_rag, "run_account_agent": run_account_agent}

def run_router(user_prompt, user_id, session_verified):
    messages = [
        {"role": "system", "content": (
            "Your job is to only route. For questions about people, documents, or specific facts use use_rag tool. For account-related questions, use run_account_agent. "
        )},
        {"role": "user", "content": user_prompt}
    ]

    max_loop = 8
    loop_count = 0
    while loop_count != max_loop:
        response = client.chat.completions.create(
            model="nvidia/nemotron-3-nano-30b-a3b",
            messages=messages,
            tools=router_tools,
            max_tokens=400
        )
        call = response.choices[0].message
        messages.append(call.model_dump())

        if not call.tool_calls:
            return call.content

        for tool in call.tool_calls:
            function_name = tool.function.name
            org_function_name = available_tools.get(function_name)
            print(f"Calling tool: {function_name}")
            args = json.loads(tool.function.arguments)
            if org_function_name == use_rag:
                fun_out = org_function_name(args["query"])
            elif org_function_name == run_account_agent:
                fun_out = org_function_name(args["query"], user_id, session_verified)
                print(fun_out)
            messages.append({"role": "tool", "tool_call_id": tool.id, "content": fun_out})

        loop_count += 1

    return "Reached max iterations without a final answer."