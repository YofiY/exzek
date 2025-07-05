"use client";
import React, { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";
import type { JsonRpcSigner } from "ethers";
import { Wallet } from "lucide-react";

export default function ConnectWalletButton() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // @ts-expect-error
    if (typeof window !== "undefined" && window.ethereum) {
      // @ts-expect-error
      const ethProvider = new BrowserProvider(window.ethereum);
      setProvider(ethProvider);
    } else {
      setError("MetaMask is not installed");
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) {
      setError("No Ethereum provider found");
      return;
    }

    try {
      // prompt user to connect wallet
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setSigner(signer);
      setAddress(addr);
      setError("");
    } catch (err: any) {
      setError(err.message || "Connection error");
    }
  };

  return (
    <div>
      {/* <button
        onClick={connectWallet}
        style={{
          padding: "0.5rem 1rem",
          background: address ? "#4CAF50" : "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {address ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
      </button> */}

      <button
                onClick={connectWallet}
                className={address ? "px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center gap-2 transition-all duration-300 flex-shrink-0 whitespace-nowrap"
                                   : "px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center gap-2 transition-all duration-300 flex-shrink-0 whitespace-nowrap"}
              >
                <Wallet size={16} className="text-white" />
                <span className="text-white text-sm font-medium">{address ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}</span>
              </button>
      {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}
    </div>
  );
}
