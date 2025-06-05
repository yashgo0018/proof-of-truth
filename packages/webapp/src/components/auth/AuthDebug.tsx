"use client";

import { useUser } from "@civic/auth-web3/react";

export function AuthDebug() {
  const { user, isLoading } = useUser();

  if (process.env.NODE_ENV !== "development") {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm">
      <div className="font-bold mb-2">🔍 Auth Debug</div>
      <div>Loading: {isLoading ? "Yes" : "No"}</div>
      <div>User: {user ? "Authenticated" : "Not authenticated"}</div>
      {user && (
        <div className="mt-2 space-y-1">
          <div>Name: {user.name || "N/A"}</div>
          <div>Email: {user.email || "N/A"}</div>
          <div>ID: {user.sub || "N/A"}</div>
        </div>
      )}
      <div className="mt-2 text-xs text-gray-300">
        Refresh page if stuck loading
      </div>
    </div>
  );
}
