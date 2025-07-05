/**
 * Look up the agent's code (GET) and update the code (PUT)
 * Wrapper around the Agentverse API: https://docs.agentverse.ai/docs/api/hosting
 */
import { NextRequest, NextResponse } from 'next/server';

const BASE = 'https://agentverse.ai/v1/hosting/agents';

export async function GET(req: NextRequest) {
  const { agentAddress } = await req.json();
  if (!agentAddress) return NextResponse.json({ error: 'agentAddress is required' }, { status: 400 });

  const apiKey = process.env.AGENTVERSE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Missing Agentverse API key' }, { status: 500 });

  const resp = await fetch(`${BASE}/${agentAddress}/code`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });
  const body = await resp.json();
  return NextResponse.json(body, { status: resp.status });
}

// TODO IMPORTANT: UNCOMMENT THIS ONLY WHEN WE ADDED A PROTECTION MECHANISM (check that user owns the agent)
// export async function PUT(req: NextRequest) {
//   const { agentAddress, code } = await req.json();
//   if (!agentAddress || !code) return NextResponse.json({ error: 'agentAddress and code are required' }, { status: 400 });

//   const apiKey = process.env.AGENTVERSE_API_KEY;
//   if (!apiKey) return NextResponse.json({ error: 'Missing Agentverse API key' }, { status: 500 });

//   const resp = await fetch(`${BASE}/${agentAddress}/code`, {
//     method: 'PUT',
//     headers: {
//       'Authorization': `Bearer ${apiKey}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ code }),
//   });
//   const body = await resp.json();
//   return NextResponse.json(body, { status: resp.status });
// }
