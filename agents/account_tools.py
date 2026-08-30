from data.mock_accounts import accounts
from openai import OpenAI
from dotenv import load_dotenv
import os
import json

loaded_env = load_dotenv(".env")
client = OpenAI(
    api_key=os.getenv("NVIDIA_API_KEY"),
    base_url=os.getenv("BASE_URL")
)

def check_account_balance(user_id, session_verified):
    if not session_verified:
        return {"error": "verification_required", "message": "Please verify your identity to view account details."}
    account = accounts.get(user_id)
    if not account:
        return {"error": "not_found"}
    return {"balance": account["balance"]}

def check_transaction_status(user_id, session_verified, transaction_id):
    if not session_verified:
        return {"error": "verification_required", "message": "Please verify your identity to view transaction details."}
    account = accounts.get(user_id)
    if not account:
        return {"error": "not_found"}
    for txn in account["transactions"]:
        if txn["id"] == transaction_id:
            return txn
    return {"error": "transaction_not_found"}

def calculate_refund_eligibility(user_id, session_verified, transaction_id):
    if not session_verified:
        return {"error": "verification_required", "message": "Please verify your identity."}
    account = accounts.get(user_id)
    for txn in account.get("transactions", []):
        if txn["id"] == transaction_id and txn["status"] == "disputed":
            return {"eligible": True, "amount": abs(txn["amount"])}
    return {"eligible": False}

def run_account_agent(query,user_id,session_verified):

    tool_schemas = [
        {
            "type":"function",
            "function":{
                "name":"check_account_balance",
                "description":"This tool helps to check account balance.",
                "parameters":{
                    "type":"object",
                    "properties":{},
                    "required":[]
                }
            }
        },
        {
            "type":"function",
            "function":{
                "name":"check_transaction_status",
                "description":"This tool helps to check transaction status.",
                "parameters":{
                    "type":"object",
                    "properties":{"transaction_id":{"type":"string"}},
                    "required":["transaction_id"]
                }
            }
        },
        {
            "type":"function",
            "function":{
                "name":"calculate_refund_eligibility",
                "description":"This tool helps to calculate refund eligibility of a user.",
                "parameters":{
                    "type":"object",
                    "properties":{"transaction_id":{"type":"string"}},
                    "required":["transaction_id"]
                }
            }
        }        
    ]

    available_functions = {"check_account_balance":check_account_balance, "check_transaction_status":check_transaction_status, "calculate_refund_eligibility":calculate_refund_eligibility}

    messages = [{
        "role":"system",
        "content":"You are a helpful assistant that helps user to check their account related informations."
    },
    {
        "role":"user",
        "content":query
    }]

    for _ in range(3):
            response = client.chat.completions.create(
                model = "nvidia/nemotron-3-ultra-550b-a55b",
                messages=messages,
                tools=tool_schemas
            )
            message = response.choices[0].message
            messages.append(message.model_dump())
    
            if not message.tool_calls:
                return message.content
    
            for call in message.tool_calls:
                name = call.function.name
                print(name)
                org_name = available_functions[name]
                args = json.loads(call.function.arguments)
                if name == "check_account_balance":
                    # result = org_name(args["user_id"].lower(),args["session_verified"].lower())
                    result = org_name(user_id,session_verified)
                if name == "check_transaction_status":
                    # result = org_name(args["user_id"].lower(),args["session_verified"].lower(),args["transaction_id"].lower())
                    result = org_name(user_id,session_verified,args["transaction_id"].lower())
                if name == "calculate_refund_eligibility":
                    # result = org_name(args["user_id"].lower(),args["session_verified"].lower(),args["transaction_id"].lower())
                    result = org_name(user_id,session_verified,args["transaction_id"].lower())
                messages.append({"role":"tool","tool_call_id":call.id,"content":str(result)})
    
    return "Reached max iterations."

