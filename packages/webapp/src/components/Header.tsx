"use client";

import { TrendingUp } from "lucide-react";
import { AuthStatus } from "./auth/AuthStatus";

export function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Proof of Trust
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Building Trust Through Blockchain
              </p>
            </div>
          </div>
          {/* Wallet Connection */}
          <div className="flex items-center">
            <AuthStatus />
          </div>
        </div>
      </div>
    </header>
  );
}
