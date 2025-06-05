"use client";

import { http, createConfig } from "wagmi";
import { defineChain } from "viem";
import { QueryClient } from "@tanstack/react-query";

// Define Flare Coston2 testnet manually
export const coston2 = defineChain({
  id: 114,
  name: "Flare Testnet Coston2",
  nativeCurrency: {
    decimals: 18,
    name: "Coston2 Flare",
    symbol: "C2FLR",
  },
  rpcUrls: {
    default: {
      http: ["https://coston2-api.flare.network/ext/bc/C/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "Coston2 Explorer",
      url: "https://coston2-explorer.flare.network",
    },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [coston2],
  transports: {
    [coston2.id]: http(),
  },
});

export const queryClient = new QueryClient();

// Contract configuration
export const ARTICLES_FETCHER_ADDRESS =
  "0xa692540b8c89A8B4aFF92225B55C01dbD2085D7A" as const;

export const ARTICLES_FETCHER_ABI = [
  // Read functions
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "getArticleByIndex",
    outputs: [
      {
        components: [
          { internalType: "string", name: "title", type: "string" },
          { internalType: "string", name: "date", type: "string" },
          { internalType: "uint256", name: "contentLength", type: "uint256" },
          {
            internalType: "uint256",
            name: "publicationCount",
            type: "uint256",
          },
          { internalType: "string", name: "overallBias", type: "string" },
          {
            internalType: "uint256",
            name: "publishedTimestamp",
            type: "uint256",
          },
          { internalType: "uint256", name: "id", type: "uint256" },
        ],
        internalType: "struct ArticleData",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "articleId", type: "uint256" }],
    name: "getArticleById",
    outputs: [
      {
        components: [
          { internalType: "string", name: "title", type: "string" },
          { internalType: "string", name: "date", type: "string" },
          { internalType: "uint256", name: "contentLength", type: "uint256" },
          {
            internalType: "uint256",
            name: "publicationCount",
            type: "uint256",
          },
          { internalType: "string", name: "overallBias", type: "string" },
          {
            internalType: "uint256",
            name: "publishedTimestamp",
            type: "uint256",
          },
          { internalType: "uint256", name: "id", type: "uint256" },
        ],
        internalType: "struct ArticleData",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "articleId", type: "uint256" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "getArticleSentiment",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "positiveCount", type: "uint256" },
          { internalType: "uint256", name: "negativeCount", type: "uint256" },
          { internalType: "bool", name: "userHasVoted", type: "bool" },
          { internalType: "bool", name: "userSentiment", type: "bool" },
          { internalType: "string", name: "userComment", type: "string" },
          { internalType: "bool", name: "votingActive", type: "bool" },
        ],
        internalType: "struct ArticleSentimentView",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTodaysArticles",
    outputs: [
      {
        components: [
          { internalType: "string", name: "title", type: "string" },
          { internalType: "string", name: "date", type: "string" },
          { internalType: "uint256", name: "contentLength", type: "uint256" },
          {
            internalType: "uint256",
            name: "publicationCount",
            type: "uint256",
          },
          { internalType: "string", name: "overallBias", type: "string" },
          {
            internalType: "uint256",
            name: "publishedTimestamp",
            type: "uint256",
          },
          { internalType: "uint256", name: "id", type: "uint256" },
        ],
        internalType: "struct ArticleData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "targetDate", type: "uint256" }],
    name: "getArticlesByDate",
    outputs: [
      {
        components: [
          { internalType: "string", name: "title", type: "string" },
          { internalType: "string", name: "date", type: "string" },
          { internalType: "uint256", name: "contentLength", type: "uint256" },
          {
            internalType: "uint256",
            name: "publicationCount",
            type: "uint256",
          },
          { internalType: "string", name: "overallBias", type: "string" },
          {
            internalType: "uint256",
            name: "publishedTimestamp",
            type: "uint256",
          },
          { internalType: "uint256", name: "id", type: "uint256" },
        ],
        internalType: "struct ArticleData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAvailableDates",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentDate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [
      { internalType: "uint256", name: "articleId", type: "uint256" },
      { internalType: "bool", name: "isPositive", type: "bool" },
      { internalType: "string", name: "comment", type: "string" },
    ],
    name: "submitSentiment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "articleId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "voter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isPositive",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "string",
        name: "comment",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "SentimentSubmitted",
    type: "event",
  },
] as const;

export type ArticleData = {
  title: string;
  date: string;
  contentLength: bigint;
  publicationCount: bigint;
  overallBias: string;
  publishedTimestamp: bigint;
  id: bigint;
};

export type ArticleSentimentView = {
  positiveCount: bigint;
  negativeCount: bigint;
  userHasVoted: boolean;
  userSentiment: boolean;
  userComment: string;
  votingActive: boolean;
};
