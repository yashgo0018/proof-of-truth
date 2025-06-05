import { createCivicAuthPlugin } from "@civic/auth-web3/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: "28d2cadf-d1e8-42ee-89b9-76bd72504a69",
});

export default withCivicAuth(nextConfig);
