from openai import OpenAI
from dotenv import load_dotenv
import os
import json
from datetime import datetime , timezone

loaded_env = load_dotenv(".env")
client = OpenAI(
    api_key=os.getenv("NVIDIA_API_KEY"),
    base_url=os.getenv("BASE_URL")
)


TICKET_FILE = "data/tickets.json"

def load_tickets():
    if not os.path.exists(TICKET_FILE):
        return []
    with open(TICKET_FILE, "r") as f:
        return json.load(f)

def save_tickets(tickets):
    with open(TICKET_FILE, "w") as f:
        json.dump(tickets, f, indent=2)

def escalate_to_human(query, reason, user_id=None, conversation_context=None):
    tickets = load_tickets()

    for ticket in tickets:
        if(
            ticket["user_id"]== user_id
            and ticket["reason"]==reason
            and ticket ["status"] in ("pending","in_progress")):
            return f"You already have an open ticket for this ({ticket['ticket_id']}). A human agent will follow up."
        
    ticket_no = len(tickets) + 1
    now = datetime.now(timezone.utc).isoformat()

    new_ticket = {
      "ticket_id": f"TCK-{ticket_no:04d}",
      "user_id": user_id,
      "query": query,
      "reason": reason,
      "status": "pending",
      "created_at": now,
      "conversation_context": conversation_context or [],
      "priority": "medium",
      "resolved_by": None,
      "resolution_notes": None,
      "category": reason,
      "updated_at": now
    }
    tickets.append(new_ticket)
    save_tickets(tickets)
    return f"Escalated to human support (ticket #{new_ticket['ticket_id']})"