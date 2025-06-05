"use client";

import { UserButton as CivicUserButton } from "@civic/auth-web3/react";

export function UserButton() {
  return (
    <div className="flex items-center">
      <CivicUserButton />
    </div>
  );
}
