from agents.account_tools import check_account_balance,check_transaction_status,calculate_refund_eligibility , run_account_agent
from data.mock_accounts import accounts
import json
from agents.ticket import escalate_to_human 
import time
from agents.ticket import load_tickets, save_tickets
from openai import OpenAI
from dotenv import load_dotenv
import os

loaded_env = load_dotenv(".env")
client = OpenAI(
    api_key=os.getenv("NVIDIA_API_KEY"),
    base_url=os.getenv("BASE_URL")
)


# for i,user in enumerate(accounts): 
#     curr_user = accounts[user]["user_id"]
#     ver_status = accounts[user]["verified"]
#     print("Account balance checking: ",check_account_balance(curr_user,ver_status))
#     for transactions in (accounts[user]["transactions"]):
#         print("Transaction Status: ",check_transaction_status(curr_user,ver_status,transactions["id"]))
#         print("calculate refund eligibility: ",calculate_refund_eligibility(curr_user,ver_status,transactions["id"]))
#     print()

# print("--- Edge cases ---")
# print(check_transaction_status("user_a", True, "txn_999"))  # doesn't exist
# print(check_transaction_status("user_a", False, "txn_001"))  # verified user id but marked unverified in the call
# print(check_account_balance("nonexistent_user", True))  # user doesn't exist at all    
# print(calculate_refund_eligibility("user_b", False, "txn_001"))
start = time.time()
user = "For user USR-9999, please escalate a fraud report — there was an unauthorized transaction on the account."
print(run_account_agent(user, "user_a", True))
end = time.time()
print(f"Execution time: {end - start} seconds")

# # tickets = load_tickets()
# # print(tickets[-1]["conversation_context"])

# models = client.models.list()
# for m in models.data:
#     print(m.id)

print(run_account_agent("What is your refund policy?", "user_a", True))



