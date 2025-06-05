"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Wallet, LogOut, ExternalLink } from "lucide-react";
import { clsx } from "clsx";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-2 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">{formatAddress(address)}</span>
        </div>

        <a
          href={`https://coston2-explorer.flare.network/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          title="View on explorer"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        <button
          onClick={() => disconnect()}
          className="flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          title="Disconnect wallet"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Disconnect</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Connect your wallet to vote and comment on news articles
      </div>

      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className={clsx(
            "flex items-center gap-3 px-4 py-3 rounded-lg border transition-all",
            "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600",
            "hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-400",
            "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "text-gray-900 dark:text-white"
          )}
        >
          <Wallet className="w-5 h-5" />
          <span className="font-medium">Connect {connector.name}</span>
        </button>
      ))}

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Make sure you're on the Flare Coston2 testnet
      </div>
    </div>
  );
}
