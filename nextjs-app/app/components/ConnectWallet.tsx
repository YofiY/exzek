'use client';
import React, { useState, useEffect, useContext } from 'react';
import { BrowserProvider } from 'ethers';
import type { JsonRpcSigner } from 'ethers';
import { Bot, Wallet } from 'lucide-react';
import { UserContext } from '../UserContext';
import NameStone from "@namestone/namestone-sdk";

export default function ConnectWalletButton() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [ensUpdateStatus, setEnsUpdateStatus] = useState<string>('');
  const { setWalletAddress, setAgentCertificate } = useContext(UserContext);

  const setAgentAddressInENS = async () => {
    if (!signer) {
      setError('No Ethereum signer found');
      return;
    }

    setIsCreatingAgent(true);
    setError('');
    setEnsUpdateStatus('Setting agent address in ENS...');
    
    try {
      // Generate a placeholder agent address for now
      const placeholderAgentAddress = prompt('Enter the agent address to set in ENS (or leave empty for placeholder):') || 
        `agent_placeholder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      setEnsUpdateStatus('🔄 Checking network...');

      // Verify we're on Sepolia testnet
      const network = await provider?.getNetwork();
      const chainId = Number(network?.chainId);
      
      if (chainId !== 11155111) {
        throw new Error(`Must be on Sepolia testnet! Current network chain ID: ${chainId}. Please switch to Sepolia (11155111).`);
      }

      console.log('✅ Confirmed on Sepolia testnet (Chain ID: 11155111)');
      setEnsUpdateStatus('✅ On Sepolia testnet - Getting SIWE message...');

      // Get SIWE message from NameStone for Sepolia
      const ns = new NameStone("0f70d86d-1281-42ee-b6c8-4e0434ee12c9", { network: "sepolia" });
      const address = "0x5b329e932D509F3757CA37a935Fa9047CBc42aB0";
      
      
    
      setEnsUpdateStatus('🔄 Setting agent address via backend...');

      // Call our backend API to handle all ENS operations on Sepolia
      const response = await fetch('/api/ens/set-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentAddress: placeholderAgentAddress,
         
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      console.log('Agent address set successfully on Sepolia:', data);
      
      setEnsUpdateStatus(`✅ Agent address set successfully in ${data.domain} on Sepolia testnet! Agent: ${placeholderAgentAddress.slice(0, 20)}...`);
      
      // Sign the agent address to prove ownership
      const agentSignature = await signer.signMessage(placeholderAgentAddress);
      setAgentCertificate(placeholderAgentAddress, agentSignature);
      
      // Clear status after 7 seconds
      setTimeout(() => setEnsUpdateStatus(''), 7000);
      
    } catch (error) {
      let errorMessage = 'Failed to set agent address in ENS';
      
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setEnsUpdateStatus(`❌ ${errorMessage}`);
      console.error("ENS agent address error:", error);
      
      // Clear error after 10 seconds
      setTimeout(() => setEnsUpdateStatus(''), 10000);
    } finally {
      setIsCreatingAgent(false);
    }
  };

  useEffect(() => {
    // detect MetaMask - type assertion needed for window.ethereum
    // @ts-expect-error - window.ethereum is not typed in TypeScript
    if (typeof window !== 'undefined' && window.ethereum) {
      // @ts-expect-error - BrowserProvider constructor expects ethereum provider
      setProvider(new BrowserProvider(window.ethereum));
    } else {
      setError('MetaMask is not installed');
    }
  }, []);

  const switchToSepolia = async () => {
    if (!provider) return;
    
    try {
      // Try to switch to Sepolia
      await provider.send('wallet_switchEthereumChain', [
        { chainId: '0xAA36A7' } // Sepolia chain ID in hex
      ]);
    } catch (error: unknown) {
      // If Sepolia is not added, add it
      if (error && typeof error === 'object' && 'code' in error && (error as { code: number }).code === 4902) {
        try {
          await provider.send('wallet_addEthereumChain', [
            {
              chainId: '0xAA36A7',
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'SEP',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.sepolia.org'], // Public Sepolia RPC
              blockExplorerUrls: ['https://sepolia.etherscan.io/'],
            },
          ]);
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
        }
      } else {
        console.error('Failed to switch to Sepolia:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (!provider) {
      setError('No Ethereum provider found');
      return;
    }

    try {
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      
      // Check if we're on Sepolia testnet
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      if (chainId !== 11155111) {
        setError(`Wrong network! Please switch to Sepolia testnet (Chain ID: 11155111). Current: ${chainId}`);
        // Don't return here, still set the address but show error
      } else {
        setError(''); // Clear any previous network errors
      }
      
      setSigner(signer);
      setAddress(addr);
      setError('');
      // push into global context
      setWalletAddress(addr);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Connection error';
      setError(errorMessage);
    }
  };

  const createAgent = async () => {
    if (!provider) {
      setError('No Ethereum provider found');
      return;
    }

    if (!signer) {
      setError('No Ethereum signer found');
      return;
    }
    const resp = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: address })
    });
    const data = await resp.json();
    if (resp.ok) {
      // user signs that it is their agent
      const signature = await signer.signMessage(data.agentAddress);
      setAgentCertificate(data.agentAddress, signature);
      // // Optionally redirect to the hosted agent inspect page:
      // window.open(data.hostedUrl, '_blank');
      
      // Update ENS with the real agent address from AgentVerse
      await setAgentAddressInENS();
    } else {
      setError(data.error || 'Agent creation failed');
    }
  };

  return (
    <div>
      <button
        onClick={connectWallet}
        className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center gap-2 transition-all duration-300 whitespace-nowrap"
      >
        <Wallet size={16} className="text-white" />
        <span className="text-white text-sm font-medium">
          {address
            ? `Connected: ${address.slice(0, 6)}…${address.slice(-4)}`
            : 'Connect Wallet'}
        </span>
      </button>
      {error && (
        <div className="mt-2">
          <p className="text-sm text-red-400">{error}</p>
          {error.includes('Wrong network') && (
            <button
              onClick={switchToSepolia}
              className="mt-2 px-3 py-1 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-600/40 rounded-md text-orange-400 text-xs"
            >
              Switch to Sepolia
            </button>
          )}
        </div>
      )}

      {address && signer && !error.includes('Wrong network') && (
        <div className="space-y-2">
          <div className="text-xs text-white/60 bg-white/5 border border-white/10 rounded-lg p-2">
            💡 <strong>ENS Domain:</strong> employer.eth → 0x5b32...2aB0 (Sepolia ✅)
            <br />
            <strong>Connected:</strong> {address.slice(0, 6)}...{address.slice(-4)}
            {address.toLowerCase() === "0x5b329e932D509F3757CA37a935Fa9047CBc42aB0".toLowerCase() ? 
              " ✅ Domain Owner" : " ⚠️ Not Domain Owner"}
          </div>
          
          <button
            onClick={setAgentAddressInENS}
            disabled={isCreatingAgent}
            className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/40 rounded-full flex items-center gap-2 transition-all duration-300 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Bot size={16} className="text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">
              {isCreatingAgent ? 'Setting ENS Record...' : 'Set Agent Address in ENS'}
            </span>
          </button>
          
          <button
            onClick={createAgent}
            disabled={isCreatingAgent}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center gap-2 transition-all duration-300 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Bot size={16} className="text-white" />
            <span className="text-white text-sm font-medium">
              {isCreatingAgent ? 'Creating Agent...' : 'Create Agent (Limited Credits)'}
            </span>
          </button>
          
          {ensUpdateStatus && (
            <div className="bg-white/10 border border-white/20 rounded-lg p-3">
              <p className="text-white text-sm">{ensUpdateStatus}</p>
              {ensUpdateStatus.includes('🔄') && (
                <div className="mt-2 text-xs text-white/60">
                  Working on Sepolia testnet - updating ENS text records...
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
