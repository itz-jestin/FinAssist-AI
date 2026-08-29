# data/mock_accounts.py

accounts = {
    "user_a": {
        "user_id": "user_a",
        "name": "Test User A",
        "verified": True,
        "balance": 45230.50,
        "transactions": [
            {"id": "txn_001", "date": "2026-08-20", "amount": -1200, "desc": "Rent payment", "status": "completed"},
            {"id": "txn_002", "date": "2026-08-22", "amount": -450, "desc": "Grocery store", "status": "completed"},
            {"id": "txn_003", "date": "2026-08-25", "amount": -89.99, "desc": "Subscription - Streamify", "status": "disputed"},
        ]
    },
    "user_b": {
        "user_id": "user_b",
        "name": "Test User B",
        "verified": False,
        "balance": 12000.00,
        "transactions": []
    }
}