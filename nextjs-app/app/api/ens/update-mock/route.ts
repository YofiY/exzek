import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Mock ENS update - Received request body:', body);
    
    const { domain, address, agentAddress, signature, email, companyName } = body;

    // Validate inputs
    if (!domain || !domain.endsWith('.eth')) {
      console.log('Invalid domain:', domain);
      return NextResponse.json(
        { error: 'Invalid ENS domain' },
        { status: 400 }
      );
    }

    if (!address || !agentAddress) {
      console.log('Missing parameters - address:', address, 'agentAddress:', agentAddress);
      return NextResponse.json(
        { error: 'Missing required parameters: address and agentAddress' },
        { status: 400 }
      );
    }

    if (!signature || !email || !companyName) {
      console.log('Missing SIWE parameters - signature:', !!signature, 'email:', !!email, 'companyName:', !!companyName);
      return NextResponse.json(
        { error: 'Missing required parameters for domain enablement: signature, email, and companyName' },
        { status: 400 }
      );
    }

    console.log('Mock ENS update - Processing for Sepolia testnet:', {
      domain,
      address,
      agentAddress,
      chainId: 11155111
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful response
    return NextResponse.json({
      success: true,
      data: {
        message: `Mock ENS update completed for ${domain} on Sepolia testnet`,
        domain: domain,
        agent_address: agentAddress,
        chain_id: 11155111,
        mock: true
      },
      domain: domain,
      agentAddress: agentAddress,
      steps: ['domain_enabled_mock', 'text_records_set_mock'],
      warning: 'This is a mock update for Sepolia testnet. Real ENS domains exist on Ethereum mainnet.'
    });

  } catch (error) {
    console.error('Mock ENS update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
