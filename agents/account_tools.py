from data.mock_accounts import accounts
from openai import OpenAI
from dotenv import load_dotenv
import os
import json
from agents.ticket import escalate_to_human
import time

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
        if txn["id"] == transaction_id:
            if txn["status"] == "disputed":
                return {"eligible": True, "amount": abs(txn["amount"])}
            else:
                return {"eligible": False, "reason": f"Transaction status is '{txn['status']}', not disputed."}
    return {"eligible": False, "reason": "Transaction not found."}

def run_account_agent(query,user_id,session_verified):
    print(f"Running account agent for user_id: {user_id}, session_verified: {session_verified}")
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
        },
        {
            "type":"function",
            "function":{
                "name":"escalate_to_human",
                "description":"Use this tool when the request requires human review - account closure,fraud reports,disputes the system can't resolve, or anything sensitive/out of scope.",
                "parameters":{
                    "type":"object",
                    "properties":{
                        "reason":{"type":"string"},
                    },
                    "required":["reason"]
                }
            }
        }        
    ]

    available_functions = {"check_account_balance":check_account_balance, "check_transaction_status":check_transaction_status, "calculate_refund_eligibility":calculate_refund_eligibility,"escalate_to_human":escalate_to_human}

    messages = [{
        "role":"system",
        "content": (
    "You are a helpful assistant that helps users with account-related information "
    "(balance, transactions, refund eligibility for a specific transaction). "
    "You do NOT have access to general policy information. If asked about general "
    "policies rather than the user's specific account, say you don't have that "
    "information here and that it should be looked up separately. Never invent "
    "policy details."
)
    },
    {
        "role":"user",
        "content":query
    }]

    for _ in range(3):
            start = time.time()
            response = client.chat.completions.create(
                model = os.getenv("MODEL"),
                messages=messages,
                tools=tool_schemas,
                max_tokens=400,
            )
            # models_to_test = [
            #     "nvidia/nemotron-3-nano-30b-a3b",
            #     # "nvidia/llama-3.1-nemotron-70b-instruct",
            #     # "nvidia/nemotron-3-ultra-550b-a55b"  # baseline, current model
            # ]
            # for model_name in models_to_test:
            #     start = time.time()
            #     response = client.chat.completions.create(
            #         model=model_name,
            #         messages=messages,
            #         tools=tool_schemas,
            #         max_tokens=400
            #     )
            #     print(f"{model_name}: {time.time() - start:.2f}s")
            #     print(response.choices[0].message.tool_calls)
            print(f"API call took {time.time() - start} seconds")
            message = response.choices[0].message
            print(message.model_dump())
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
                elif name == "check_transaction_status":
                    # result = org_name(args["user_id"].lower(),args["session_verified"].lower(),args["transaction_id"].lower())
                    result = org_name(user_id,session_verified,args["transaction_id"].lower())
                elif name == "calculate_refund_eligibility":
                    # result = org_name(args["user_id"].lower(),args["session_verified"].lower(),args["transaction_id"].lower())
                    result = org_name(user_id,session_verified,args["transaction_id"].lower())
                elif name == "escalate_to_human":
                    result = org_name(query,args["reason"].lower(),user_id,messages[-5:])  
                messages.append({"role":"tool","tool_call_id":call.id,"content":str(result)})
    
    return "Reached max iterations."


