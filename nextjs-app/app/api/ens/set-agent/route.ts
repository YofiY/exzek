import { NextRequest, NextResponse } from 'next/server';
import NameStone from '@namestone/namestone-sdk';

export async function POST(request: NextRequest) {
  try {
    const { agentAddress } = await request.json();

    if (!agentAddress) {
      return NextResponse.json(
        { error: 'Agent address is required' },
        { status: 400 }
      );
    }


    const apiKey = "0f70d86d-1281-42ee-b6c8-4e0434ee12c9";
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ENS API key not configured' },
        { status: 500 }
      );
    }

    // Hardcoded values for the demo
    const domain = "employer.eth";
    const address = "0x5b329e932D509F3757CA37a935Fa9047CBc42aB0";
    const companyName = "exzek";
    const email = "kaleababayneh65@company.com";
    
    console.log('Setting agent address in ENS on Sepolia:', { domain, address, agentAddress });

    // Initialize NameStone SDK for Sepolia testnet
    const ns = new NameStone(apiKey, { network: "sepolia" });
    console.log('Initialized NameStone SDK for Sepolia testnet');

    // Step 1: Enable the domain first (this is required before setting text records)
    console.log('Step 1: Enabling domain on Sepolia...');
   

    // Step 2: Set the agent_address text record on Sepolia
    console.log('Step 2: Setting agent_address text record on Sepolia...');
    const setDomainResponse = await ns.setDomain({
      domain: domain,
      address: address,
      text_records: {
        "description": agentAddress
      }
    });

    console.log('Agent address setting Sepolia:', setDomainResponse);

    return NextResponse.json({
      success: true,
      data: setDomainResponse,
      domain: domain,
      address: address,
      agentAddress: agentAddress,
      network: "sepolia",
      textRecords: {
        description: agentAddress
      }
    });

  } catch (error) {
    console.error('ENS set agent address API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
