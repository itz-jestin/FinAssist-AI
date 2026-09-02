from services.chroma_service import search_chunks
import os
import json
from datetime import date
from openai import OpenAI
from dotenv import load_dotenv


loaded_env = load_dotenv(".env")
client = OpenAI(
    api_key=os.getenv("NVIDIA_API_KEY"),
    base_url=os.getenv("BASE_URL")
)

def weather(city):
    if city=="kochi":
        return{
            "weather":"cloudy",
            "temprature":30
        }
    elif city=="banglore":
        return{
            "weather":"rainy",
            "temprature":29
        }
    elif city=="bhilai":
        return{
            "weather":"cold",
            "temprature":25
        }

def calculator(a,b,operator):
    if operator=="add":
        return a+b
    elif operator=="sub":
        return a-b
    elif operator=="div":
        return a/b
    elif operator=="mul":
        return a*b
    elif operator=="mod":
        return a%b
    else:
        return "operation unsuccesfull"

def current_date():
    return date.today()


def run_tool_agent(query):
    print(f"Running tool agent for query: {query}")
    sub_agent_tools = [
        {
            "type":"function",
            "function":{
                "name":"weather",
                "description":"Gives current weather and temprature of current cities.",
                "parameters":{
                    "type":"object",
                    "properties":{
                        "city":{"type":"string"}
                    },
                    "required":["city"]
                }
            }
        },
        {
            "type":"function",
            "function":{
                "name":"calculator",
                "description":"It calculates and give the result.",
                "parameters":{
                    "type":"object",
                    "properties":{
                        "a":{"type":"number"},
                        "b":{"type":"number"},
                        "operator":{"type":"string","enum":["add","sub","div","mul","mode"]}
                    },
                    "required":["a","b","operator"]
                }
            }
        },{
            "type":"function",
            "function":{
                "name":"current_date",
                "description":"Gives current date.",
                "parameters":{
                    "type":"object",
                    "properties":{},
                    "required":[]
                }
            }
        }
    ]

    sub_agent_functions = {"weather":weather,"calculator":calculator,"current_date":current_date}

    messages1=[
        {"role":"system","content":"You are a helpful assistant with tools."},
        {"role":"user","content":query}
    ]
    for _ in range(5):
        response = client.chat.completions.create(
            model = os.getenv("MODEL"),
            messages=messages1,
            tools=sub_agent_tools
        )
        message = response.choices[0].message
        messages1.append(message.model_dump())

        if not message.tool_calls:
            return message.content

        for call in message.tool_calls:
            name = call.function.name
            print(name)
            org_name = sub_agent_functions[name]
            args = json.loads(call.function.arguments)
            if name == "weather":
                result = org_name(args["city"].lower())
            elif name == "calculator":
                result = org_name(args["a"],args["b"],args["operator"])
            elif name == "current_date":
                result = org_name() 
                print(result)  
            messages1.append({"role":"tool","tool_call_id":call.id,"content":str(result)})

    return "Reached max iterations."         
    
def use_rag(query):
    results = search_chunks(query,3)
    chunks = results["documents"][0]
    if not chunks:
        return "No relevant information found in the document."
    return "\n\n".join(chunks)


def use_tool(query):
        return run_tool_agent(query)




