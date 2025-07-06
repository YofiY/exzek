/**
 * Look up a specific agent (GET) and create a new agent (POST)
 * Wrapper around the Agentverse API: https://docs.agentverse.ai/docs/api/hosting
 */
import { NextRequest, NextResponse } from 'next/server';

const BASE = 'https://agentverse.ai/v1/hosting/agents';

/**
 * Creates a new agent associated with the given wallet address,
 * updates its code, and starts it.
 */
export async function POST(req: NextRequest) {
  const { walletAddress }: { walletAddress?: string } = await req.json();
  if (!walletAddress) return NextResponse.json({ error: 'walletAddress is required'}, { status: 400 });

  const apiKey = process.env.AGENTVERSE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Missing Agentverse API key' }, { status: 500 });

  const name = `agent-${walletAddress}`;  // agent associated with wallet address

  try {
    const resp = await fetch(BASE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    const body = await resp.json();
    if (!resp.ok) return NextResponse.json({ error: body }, { status: resp.status });

    // update the agent's code
    const codePayload_raw = {
        "code": [
            {
                "id": 0,
                "name": "agent.py",
                "value" : `
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
`,
                "language": "python"
            },
            {
                "id": 1,
                "name": ".env",
                "value": `AGENT_SEED=${walletAddress}\nASI1_API_KEY=${process.env.ASI1_API_KEY}`, // or derived seed
                "language": "python"
            }
        ]
    };

    const codePayload = {
      "code" : JSON.stringify(codePayload_raw.code)
    }


    const resp2 = await fetch(`${BASE}/${body.address}/code`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(codePayload),
    });    

    const body2 = await resp2.json();
    if (!resp2.ok) return NextResponse.json({ error: body2 }, { status: resp2.status });

    // start the agent
    const resp3 = await fetch(`${BASE}/${body.address}/start`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      }
    });
    if (!resp3.ok) return NextResponse.json({ error: body2 }, { status: resp3.status });

    return NextResponse.json({
      agentAddress: body.address,
      walletAddress,
      hostedUrl: `https://agentverse.ai/inspect/?address=${body.address}`
    });
  } catch (err) {
    return NextResponse.json({ error: 'Agentverse API request failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const agentAddress = searchParams.get('agentAddress');
  if (!agentAddress) return NextResponse.json({ error: 'agentAddress query is required' }, { status: 400 });

  const apiKey = process.env.AGENTVERSE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Missing Agentverse API key' }, { status: 500 });

  try {
    const resp = await fetch(`${BASE}/${agentAddress}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    const body = await resp.json();
    return NextResponse.json(body, { status: resp.status });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch agent info' }, { status: 500 });
  }
}
