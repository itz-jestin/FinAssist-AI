import json
import os
from dotenv import load_dotenv
from openai import OpenAI
from agents.tool_agent import use_tool
from agents.ticket import delegate_research
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
        "name": "use_tool",
        "description": "This consists of tools which can be used to perform certain tasks like weather,calculator,current date.",
        "parameters": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}
    }},
    {"type": "function", "function": {
        "name": "delegate_research",
        "description": "This tool is used to research for a given topic.",
        "parameters": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}
    }}
]

def use_rag(query):
    results = search_chunks(query, 3)
    chunks = results["documents"][0]
    if not chunks:
        return "No relevant information found in the document."
    return "\n\n".join(chunks)

available_tools = {"use_rag": use_rag, "use_tool": use_tool, "delegate_research": delegate_research}

def run_router(user_prompt):
    messages = [
        {"role": "system", "content": (
            "Your job is to only route. For questions about people, documents, or specific facts "
            "that might be in the uploaded documents, always try use_rag FIRST before considering "
            "delegate_research. Only use delegate_research for general knowledge topics not expected "
            "to be in the documents (e.g. public figures, historical events, general concepts), or "
            "if use_rag returns no relevant information. "
            "If a tool or sub-agent reports it could not retrieve verified information, relay that "
            "limitation honestly to the user — do not fill the gap with your own general knowledge, "
            "even with a disclaimer."
        )},
        {"role": "user", "content": user_prompt}
    ]

    max_loop = 8
    loop_count = 0
    while loop_count != max_loop:
        response = client.chat.completions.create(
            model="nvidia/nemotron-3-ultra-550b-a55b",
            messages=messages,
            tools=router_tools
        )
        call = response.choices[0].message
        messages.append(call.model_dump())

        if not call.tool_calls:
            return call.content

        for tool in call.tool_calls:
            function_name = tool.function.name
            args = json.loads(tool.function.arguments)
            fun_out = available_tools[function_name](args["query"])
            messages.append({"role": "tool", "tool_call_id": tool.id, "content": fun_out})

        loop_count += 1

    return "Reached max iterations without a final answer."