import time
import requests
from uagents import Agent, Context, Model
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Message(Model):
    message : str

class Request(Model):
    text: str

class Response(Model):
    timestamp: int
    text: str
    agent_address: str

agent = Agent(
    name="agent-0x0796A4fDcb243369b4d5264bDd7311Fa4ce20573", # will be done dynamically in javascript
    port=8000,  # You can change this to any available port
    endpoint="http://localhost:8000/submit"
)

# Helper function to call ASI1 API
def prompt_as1(prompt: str) -> str:
    url = "https://api.asi1.ai/v1/chat/completions"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {os.getenv("ASI1_API_KEY")}'
    }

    payload = {
        "model": "asi1-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 0
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content']

    except requests.exceptions.RequestException as e:
        return f"API Request Error: {str(e)}"

    except json.JSONDecodeError:
        return "API Error: Unable to parse JSON response"

@agent.on_event("startup")
async def language_tutor_demo(ctx: Context):
    ctx.logger.info("Agent started")

# For more info on communication: https://innovationlab.fetch.ai/resources/docs/agent-communication/uagent-uagent-communication

# Callback when a message is received
@agent.on_message(model = Message)
async def message_handler(ctx: Context, sender : str, msg: Message):
    ctx.logger.info(f'I have received a message from {sender}.')
    ctx.logger.info(f'I have received a message {msg.message}.')

# User queries agent via the chat assistant
@agent.on_rest_post("/rest/post", Request, Response)
async def handle_post(ctx: Context, req: Request) -> Response:
    ctx.logger.info("Received POST request")
    return Response(
        text=f"Received: {req.text}",
        agent_address=ctx.agent.address,
        timestamp=int(time.time()),
    )
    
    # A user can do two things:
    # 1. Add infomation about himself to the agent memory
    # 2. Ask the agent something about another user
    
    # TODO: logic
    

if __name__ == "__main__":
    agent.run()