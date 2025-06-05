"use client";

import { useUser } from "@civic/auth-web3/react";
import { UserButton } from "./UserButton";

export function AuthStatus() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">Not authenticated</span>
        <UserButton />
      </div>
    );
  }

  const walletAddress = user.wallet as string | undefined;

  return (
    <div className="flex items-center space-x-4">
      <div className="text-sm">
        <div className="font-medium text-gray-900">
          Welcome, {user.name || user.email}
        </div>
        {walletAddress && (
          <div className="text-xs text-gray-500">
            Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
        )}
      </div>
      <UserButton />
    </div>
  );
}
