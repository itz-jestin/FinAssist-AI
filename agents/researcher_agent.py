from openai import OpenAI
from dotenv import load_dotenv

loaded_env = load_dotenv(".env")
client = OpenAI(
    api_key=os.getenv("NVIDIA_API_KEY"),
    base_url=os.getenv("BASE_URL")
)

def delegate_research(query):
    return research_loop(query)


def research_topic(topic):
    return "Shin chan is a good boy of 5th class."

def research_loop(query):
    research_sub_tools = [
    {
        "type":"function",
        "function":{
            "name":"research_topic",
            "description":"Researches about a topic.",
            "parameters":{
                "type":"object",
                "properties":{
                    "topic":{"type":"string"}
                },
                "required":["topic"]
            }
        }
    }
    ]
    research_avail_tools = {"research_topic":research_topic}

    messages = [{
  
    "role": "system",
    "content": (
        "You are a research assistant. Use the research_topic tool to gather information. "
        "If the tool does not return substantive, real information, explicitly say you could not "
        "retrieve verified research on this topic. Do not answer from your own general knowledge "
        "as if it were verified research."
        "What the tool is giving you have to give the same result."
        "Dont use your knowledge."
        "If the information is not relevant say - The provided information is not relevant."
    )
    }
    ,{
        "role":"user",
        "content":query
    }]

    for _ in range(3):
        response = client.chat.completions.create(
            model = "nvidia/nemotron-3-ultra-550b-a55b",
            messages=messages,
            tools=research_sub_tools
        )
        message = response.choices[0].message
        messages.append(message.model_dump())

        if not message.tool_calls:
            return message.content

        for call in message.tool_calls:
            name = call.function.name
            print(name)
            org_name = research_avail_tools[name]
            args = json.loads(call.function.arguments)
            if name == "research_topic":
                result = org_name(args["topic"].lower())
             
            messages.append({"role":"tool","tool_call_id":call.id,"content":str(result)})

    return "Reached max iterations."

