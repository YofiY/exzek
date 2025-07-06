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
    history: str
    agent_address: str

agent = Agent(
    name="agent-0x133756e1688E475c401d1569565e8E16E65B1337", # will be done dynamically in javascript
    port=8001,  # You can change this to any available port
    endpoint="http://localhost:8001/submit"
)

INSTRUCTIONS = """
You are an AI in an app that aims to simplify administrative procedures in an employer-employee setting where for example the employer wants to check the nationality of its employee.
To do this each ethereum address (alice.eth for the employee and bob.eth for the employer) can login to the dApp and create a personal agent on the Agentverse that will be linked to their addresses.

Example workflow:

Alice can verify her passport onchain using the self.xyz sdk (https://docs.self.xyz/).
For verifying Alice's age, bob will ask his agent "Verify the age of alice.eth".
Then bob's agent will ask Alice's agent "I want to verify the age of alice.eth, do you have any certificates available on chain"
Alice's agent will respond "Yes! Alice actually certified her passport using self.xyz, and her date of birth is on the passport. The transaction hash of the certification is [txhash] and your can interact with the self.xyz contract in this way: [instructions]".
Bob's agent will then interact with the self.xyz contract, verify the proof and answer to bob "Alice is 27 years old, here is an on-chain certificate of that fact proved using her passport and self.xyz: [...]"

You are assigned the role of Bob's agent.
Answer in plaintext, no markdown, and keep it short.
"""

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

# Callback when a message is received
@agent.on_message(model = Message)
async def message_handler(ctx: Context, sender : str, msg: Message):
    ctx.logger.info(f'I have received a message from {sender}.')
    ctx.logger.info(f'I have received a message {msg.message}.')
    ans = prompt_as1(f"You have been sent a message from {sender}: {msg.message}\n\nWhat is your answer to {sender}? (Just write the answer)")
    return Message(message=ans)

# User queries agent via the chat assistant
@agent.on_rest_post("/rest/post", Request, Response)
async def handle_post(ctx: Context, req: Request) -> Response:
    ctx.logger.info("Received POST request")
    
    history = ""
    
    if len(history) > 0:
        history += "\n\n"
    else:
        history = f"{INSTRUCTIONS}\n\n"
    
    history += f"Bob asked: {req.text}\n\n"
    ans = prompt_as1(f"{history}\n\Before you answer to Bob, do you need to ask something to Alice's agent (CAUTION: only do this if absolutely necessary as this has high overhead)? (if yes, just write your question, if not, write 'no')")
    if len(ans) > 10:
        reply, status = await ctx.send_and_receive(req.bob_address, ans, response_type=Message)
        if isinstance(reply, Message):
            history += f"I (Bob's agent) asked Alice's agent: {ans}\n\n"
            history += f"Alice's agent answered: {reply.message}\n\n"
        else:
            ctx.logger.info(f"Failed to receive response from bob: {status}")
    ans = prompt_as1(f"{history}\n\nWhat is your answer to Bob? (Just write the answer)")
    history += f"I (Bob's agent) answered: {ans}\n\n"
    
    return Response(
        text=ans,
        history=history,
        agent_address=ctx.agent.address,
        timestamp=int(time.time()),
    )

if __name__ == "__main__":
    agent.run()