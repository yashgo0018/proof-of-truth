"use client";

import { useCallback } from "react";
import { useUser } from "@civic/auth-web3/react";

interface SignInButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function SignInButton({ className = "", children }: SignInButtonProps) {
  const { user, isLoading } = useUser();

  const doSignIn = useCallback(() => {
    console.log("Starting sign-in process");
    // The sign-in is handled by the UserButton component from Civic
    // This component is just for display when user is not signed in
  }, []);

  if (isLoading) {
    return (
      <button disabled className={`opacity-50 cursor-not-allowed ${className}`}>
        Loading...
      </button>
    );
  }

  if (user) {
    return null; // User is already signed in
  }

  return (
    <button
      onClick={doSignIn}
      className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors ${className}`}
    >
      {children || "Sign In with Civic"}
    </button>
  );
}
