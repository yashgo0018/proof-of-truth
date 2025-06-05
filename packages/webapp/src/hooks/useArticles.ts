import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useState, useEffect } from "react";
import {
  ARTICLES_FETCHER_ADDRESS,
  ARTICLES_FETCHER_ABI,
  ArticleData,
  ArticleSentimentView,
} from "@/lib/config";

// Hook for fetching today's articles
export function useTodaysArticles() {
  return useReadContract({
    address: ARTICLES_FETCHER_ADDRESS,
    abi: ARTICLES_FETCHER_ABI,
    functionName: "getTodaysArticles",
  });
}

// Hook for fetching articles by date
export function useArticlesByDate(targetDate: bigint | undefined) {
  return useReadContract({
    address: ARTICLES_FETCHER_ADDRESS,
    abi: ARTICLES_FETCHER_ABI,
    functionName: "getArticlesByDate",
    args: targetDate ? [targetDate] : undefined,
    query: {
      enabled: !!targetDate,
    },
  });
}

// Hook for fetching available dates
export function useAvailableDates() {
  return useReadContract({
    address: ARTICLES_FETCHER_ADDRESS,
    abi: ARTICLES_FETCHER_ABI,
    functionName: "getAvailableDates",
  });
}

// Hook for fetching current blockchain date
export function useCurrentDate() {
  return useReadContract({
    address: ARTICLES_FETCHER_ADDRESS,
    abi: ARTICLES_FETCHER_ABI,
    functionName: "getCurrentDate",
  });
}

// Hook for fetching article sentiment
export function useArticleSentiment(
  articleId: bigint | undefined,
  userAddress: `0x${string}` | undefined
) {
  return useReadContract({
    address: ARTICLES_FETCHER_ADDRESS,
    abi: ARTICLES_FETCHER_ABI,
    functionName: "getArticleSentiment",
    args: articleId && userAddress ? [articleId, userAddress] : undefined,
    query: {
      enabled: !!(articleId && userAddress),
    },
  });
}

// Hook for submitting sentiment
export function useSubmitSentiment() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const submitSentiment = (
    articleId: bigint,
    isPositive: boolean,
    comment: string
  ) => {
    writeContract({
      address: ARTICLES_FETCHER_ADDRESS,
      abi: ARTICLES_FETCHER_ABI,
      functionName: "submitSentiment",
      args: [articleId, isPositive, comment],
    });
  };

  return {
    submitSentiment,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

// Utility hook for getting time remaining for voting
export function useVotingTimeRemaining(publishedTimestamp: bigint) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const VOTING_WINDOW = 24 * 60 * 60; // 24 hours in seconds

  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const deadline = Number(publishedTimestamp) + VOTING_WINDOW;
      const remaining = Math.max(0, deadline - now);
      setTimeRemaining(remaining);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [publishedTimestamp]);

  return timeRemaining;
}

// Helper to format time remaining
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "Voting ended";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s remaining`;
  } else {
    return `${secs}s remaining`;
  }
}

// Helper to check if voting is still active
export function isVotingActive(publishedTimestamp: bigint): boolean {
  const now = Math.floor(Date.now() / 1000);
  const VOTING_WINDOW = 24 * 60 * 60; // 24 hours in seconds
  const deadline = Number(publishedTimestamp) + VOTING_WINDOW;
  return now < deadline;
}
