from data.mock_accounts import accounts

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