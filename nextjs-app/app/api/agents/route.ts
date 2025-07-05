/**
 * Look up a specific agent (GET) and create a new agent (POST)
 * Wrapper around the Agentverse API: https://docs.agentverse.ai/docs/api/hosting
 */
import { NextRequest, NextResponse } from 'next/server';

const BASE = 'https://agentverse.ai/v1/hosting/agents';

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
