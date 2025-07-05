'use client';
import React, { useState, useEffect, useContext } from 'react';
import { BrowserProvider } from 'ethers';
import type { JsonRpcSigner } from 'ethers';
import { Bot, Wallet } from 'lucide-react';
import { UserContext } from '../UserContext';

export default function ConnectWalletButton() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { setWalletAddress, setAgentCertificate } = useContext(UserContext);

  useEffect(() => {
    // detect MetaMask
    // @ts-expect-error
    if (typeof window !== 'undefined' && window.ethereum) {
      // @ts-expect-error
      setProvider(new BrowserProvider(window.ethereum));
    } else {
      setError('MetaMask is not installed');
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) {
      setError('No Ethereum provider found');
      return;
    }

    try {
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setSigner(signer);
      setAddress(addr);
      setError('');
      // push into global context
      setWalletAddress(addr);
    } catch (err: any) {
      setError(err.message || 'Connection error');
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

      // TODO: update the code of the agent using /v1/hosting/agents/{agentAddress}/code (doc: https://docs.agentverse.ai/docs/api/hosting)
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
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {address && signer &&(
        <button
          onClick={createAgent}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center gap-2 transition-all duration-300 whitespace-nowrap"
        >
          <Bot size={16} className="text-white" />
          <span className="text-white text-sm font-medium">
            Create Agent
          </span>
        </button>
      )}
    </div>
  );
}
