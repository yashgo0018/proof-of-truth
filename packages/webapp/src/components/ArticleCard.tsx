"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Clock,
  Users,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ArticleData } from "@/lib/config";
import {
  useArticleSentiment,
  useSubmitSentiment,
  isVotingActive,
  formatTimeRemaining,
  useVotingTimeRemaining,
} from "@/hooks/useArticles";
import { clsx } from "clsx";

interface ArticleCardProps {
  article: ArticleData;
  isHistorical?: boolean;
}

export function ArticleCard({
  article,
  isHistorical = false,
}: ArticleCardProps) {
  const { address, isConnected } = useAccount();
  const [comment, setComment] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);

  const timeRemaining = useVotingTimeRemaining(article.publishedTimestamp);
  const votingActive =
    isVotingActive(article.publishedTimestamp) && !isHistorical;

  const { data: sentiment, isLoading: sentimentLoading } = useArticleSentiment(
    article.id,
    address
  );

  const { submitSentiment, isPending, isConfirming, isConfirmed, error } =
    useSubmitSentiment();

  const handleVote = (isPositive: boolean) => {
    if (!isConnected || !votingActive) return;

    submitSentiment(article.id, isPositive, comment);
    setShowCommentInput(false);
    setComment("");
  };

  const publishedDate = new Date(Number(article.publishedTimestamp) * 1000);
  const totalVotes =
    (sentiment?.positiveCount || 0n) + (sentiment?.negativeCount || 0n);
  const positivePercentage =
    totalVotes > 0
      ? (Number(sentiment?.positiveCount || 0n) / Number(totalVotes)) * 100
      : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4 border border-gray-200 dark:border-gray-700">
      {/* Article Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
          {article.title}
        </h2>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{article.date}</span>
          </div>

          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>
              {formatDistanceToNow(publishedDate, { addSuffix: true })}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{Number(article.publicationCount)} sources</span>
          </div>

          <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
            {article.overallBias}
          </div>
        </div>
      </div>

      {/* Sentiment Display */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Community Sentiment
          </h3>
          {votingActive && (
            <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
              {formatTimeRemaining(timeRemaining)}
            </span>
          )}
        </div>

        {sentimentLoading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ) : (
          <>
            {/* Sentiment Bar */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${positivePercentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 min-w-fit">
                {Number(totalVotes)} votes
              </div>
            </div>

            {/* Sentiment Counts */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-green-500" />
                <span className="text-green-700 dark:text-green-400 font-medium">
                  {Number(sentiment?.positiveCount || 0n)} Positive
                </span>
              </div>

              <div className="flex items-center gap-2">
                <ThumbsDown className="w-5 h-5 text-red-500" />
                <span className="text-red-700 dark:text-red-400 font-medium">
                  {Number(sentiment?.negativeCount || 0n)} Negative
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User Interaction Section */}
      {isConnected && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          {sentiment?.userHasVoted ? (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {sentiment.userSentiment ? (
                  <ThumbsUp className="w-5 h-5 text-green-500" />
                ) : (
                  <ThumbsDown className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  You voted {sentiment.userSentiment ? "Positive" : "Negative"}
                </span>
              </div>
              {sentiment.userComment && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <MessageCircle className="w-4 h-4 inline mr-1" />"
                  {sentiment.userComment}"
                </div>
              )}
            </div>
          ) : votingActive ? (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What's your sentiment on this news?
              </div>

              {/* Comment Input */}
              {showCommentInput && (
                <div className="mb-3">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add your thoughts (optional)..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {comment.length}/500 characters
                  </div>
                </div>
              )}

              {/* Voting Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!showCommentInput) {
                      setShowCommentInput(true);
                    } else {
                      handleVote(true);
                    }
                  }}
                  disabled={isPending || isConfirming}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all",
                    "bg-green-100 hover:bg-green-200 text-green-800 border border-green-300",
                    "dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-200 dark:border-green-700",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <ThumbsUp className="w-5 h-5" />
                  {isPending || isConfirming ? "Submitting..." : "Positive"}
                </button>

                <button
                  onClick={() => {
                    if (!showCommentInput) {
                      setShowCommentInput(true);
                    } else {
                      handleVote(false);
                    }
                  }}
                  disabled={isPending || isConfirming}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all",
                    "bg-red-100 hover:bg-red-200 text-red-800 border border-red-300",
                    "dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-200 dark:border-red-700",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <ThumbsDown className="w-5 h-5" />
                  {isPending || isConfirming ? "Submitting..." : "Negative"}
                </button>
              </div>

              {!showCommentInput && (
                <button
                  onClick={() => setShowCommentInput(true)}
                  className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  Add comment (optional)
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <Clock className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm">Voting period has ended</div>
            </div>
          )}
        </div>
      )}

      {!isConnected && votingActive && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <div className="text-sm">
              Connect your wallet to vote and comment
            </div>
          </div>
        </div>
      )}

      {/* Transaction Status */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
          <div className="text-red-800 dark:text-red-200 text-sm">
            Error: {error.message}
          </div>
        </div>
      )}

      {isConfirmed && (
        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg">
          <div className="text-green-800 dark:text-green-200 text-sm">
            Your sentiment has been recorded on the blockchain!
          </div>
        </div>
      )}
    </div>
  );
}
