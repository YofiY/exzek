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
                // "value": "\n# Congratulations on creating your first agent!\n#\n# This agent simply writes a greeting in the logs on a scheduled time interval.\n#\n# In this example we will use:\n# - 'agent': this is your instance of the 'Agent' class that we will give an 'on_interval' task\n# - 'ctx': this is the agent's 'Context', which gives you access to all the agent's important functions\n\n# A decorator (marked by the '@' symbol) just wraps the function defined under it in another function.\n# This decorator tells your agent to run the function on a time interval with the specified 'period' in seconds.\n# These functions must be 'async' because agents need to be able to perform many tasks concurrently.\n@agent.on_interval(period=3.0)\nasync def say_hello(ctx: Context):\n    # ctx.logger is a standard Python logger that can log text with various levels of urgency\n    # (exception, warning, info, debug). Here we will just use the 'info' level to write a greeting\n    ctx.logger.info(f\"Hello, I'm an agent and my address is {agent.address}.\")\n",
                "value" : `
from uagents import Agent, Context

agent = Agent()

@agent.on_interval(period=10.0)
async def greet(ctx: Context):
    ctx.logger.info(f"Hi, I'm agent {agent.address}")
`,
                "language": "python"
            },
            {
                "id": 1,
                "name": ".env",
                "value": `AGENT_SEED=${walletAddress}`, // or derived seed
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
