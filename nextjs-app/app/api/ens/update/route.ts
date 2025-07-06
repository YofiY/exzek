import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);
    
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

    // Prepare the NameStone API request
    const nameStoneApiKey = process.env.NEXT_PUBLIC_ENS_API_KEY;
    console.log('API Key available:', !!nameStoneApiKey);
    
    if (!nameStoneApiKey) {
      return NextResponse.json(
        { error: 'ENS API key not configured' },
        { status: 500 }
      );
    }

    // Step 1: Enable the domain with proper SIWE parameters for Sepolia
    console.log('Enabling domain:', domain, 'for address:', address, 'on Sepolia testnet');
    const enableResponse = await fetch('https://namestone.com/api/public_v1/enable-domain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': nameStoneApiKey,
      },
      body: JSON.stringify({
        company_name: companyName,
        email: email,
        address: address,
        domain: domain,
        signature: signature,
        api_key: nameStoneApiKey,
        chain_id: 11155111 // Specify Sepolia testnet
      }),
    });

    const enableResponseData = await enableResponse.text();
    console.log('Enable domain response:', enableResponse.status, enableResponseData);

    // If enabling fails with anything other than "already enabled", return error
    if (!enableResponse.ok) {
      let enableData;
      try {
        enableData = JSON.parse(enableResponseData);
      } catch {
        enableData = { error: enableResponseData };
      }
      
      // If domain is already enabled, that's fine, continue
      if (!enableResponseData.includes('already enabled') && !enableResponseData.includes('already exists')) {
        return NextResponse.json(
          { 
            error: `Failed to enable domain: ${enableData.error || enableResponseData}`,
            status: enableResponse.status 
          },
          { status: enableResponse.status }
        );
      }
    }

    // Step 2: Set the text records on Sepolia
    const nameStonePayload = {
      domain: domain,
      address: address,
      text_records: {
        "agent_address": agentAddress
      },
      chain_id: 11155111 // Specify Sepolia testnet
    };

    console.log('Setting domain text records:', nameStonePayload);
    const response = await fetch('https://namestone.com/api/public_v1/set-domain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': nameStoneApiKey,
      },
      body: JSON.stringify(nameStonePayload),
    });

    const responseData = await response.text();
    console.log('Set domain response:', response.status, responseData);
    
    if (!response.ok) {
      console.error('NameStone API error:', response.status, responseData);
      return NextResponse.json(
        { 
          error: `NameStone API error: ${response.status} - ${responseData}`,
          status: response.status 
        },
        { status: response.status }
      );
    }

    // Parse response if it's JSON, otherwise return as text
    let parsedData;
    try {
      parsedData = JSON.parse(responseData);
    } catch {
      parsedData = { message: responseData };
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
      domain: domain,
      agentAddress: agentAddress,
      steps: ['domain_enabled', 'text_records_set']
    });

  } catch (error) {
    console.error('ENS update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}