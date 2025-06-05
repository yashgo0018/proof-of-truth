"use client";

import { useState } from "react";
import { Calendar, Clock, Newspaper, Filter } from "lucide-react";
import { format } from "date-fns";
import { clsx } from "clsx";

import { ArticleCard } from "@/components/ArticleCard";
import { Header } from "@/components/Header";
import { AuthDebug } from "@/components/auth/AuthDebug";
import {
  useTodaysArticles,
  useAvailableDates,
  useArticlesByDate,
  useCurrentDate,
} from "@/hooks/useArticles";

type FilterType = "today" | "past";

export default function HomePage() {
  const [filter, setFilter] = useState<FilterType>("today");
  const [selectedDate, setSelectedDate] = useState<bigint | null>(null);

  // Fetch data
  const {
    data: todaysArticles,
    isLoading: todaysLoading,
    error: todaysError,
  } = useTodaysArticles();
  const { data: availableDates, isLoading: datesLoading } = useAvailableDates();
  const { data: currentDate } = useCurrentDate();
  const { data: pastArticles, isLoading: pastLoading } = useArticlesByDate(
    selectedDate || undefined
  );

  // Get unique dates for dropdown
  const sortedDates = availableDates
    ? [...availableDates]
        .filter((date) => (currentDate ? date < currentDate : true))
        .sort((a, b) => Number(b) - Number(a))
    : [];

  const displayedArticles = filter === "today" ? todaysArticles : pastArticles;
  const isLoading = filter === "today" ? todaysLoading : pastLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Civic Auth */}
      <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Today's Articles
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todaysLoading ? "..." : todaysArticles?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Available Dates
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {datesLoading ? "..." : availableDates?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Network
                </p>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-400">
                  Coston2
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filter Articles
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("today")}
                className={clsx(
                  "px-4 py-2 rounded-lg font-medium transition-all",
                  filter === "today"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                Today's News
              </button>

              <button
                onClick={() => setFilter("past")}
                className={clsx(
                  "px-4 py-2 rounded-lg font-medium transition-all",
                  filter === "past"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                Past News
              </button>
            </div>

            {/* Date Selector for Past News */}
            {filter === "past" && (
              <div className="flex-1 max-w-xs">
                <select
                  value={selectedDate ? selectedDate.toString() : ""}
                  onChange={(e) =>
                    setSelectedDate(
                      e.target.value ? BigInt(e.target.value) : null
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a date...</option>
                  {sortedDates.map((date) => (
                    <option key={date.toString()} value={date.toString()}>
                      {format(
                        new Date(Number(date) * 24 * 60 * 60 * 1000),
                        "MMM dd, yyyy"
                      )}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Articles List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayedArticles && displayedArticles.length > 0 ? (
            displayedArticles.map((article) => (
              <ArticleCard
                key={article.id.toString()}
                article={article}
                isHistorical={filter === "past"}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <Newspaper className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {filter === "today"
                    ? "No articles today"
                    : "No articles for selected date"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {filter === "today"
                    ? "New articles are fetched daily. Check back later!"
                    : "Try selecting a different date from the dropdown above."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error States */}
        {todaysError && filter === "today" && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">
              Error loading today's articles. Please try again later.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="mb-2">Proof of Trust - Built on Flare Blockchain</p>
            <p className="text-sm">
              Building trust through transparent, immutable news sentiment
              tracking powered by Web3
            </p>
          </div>
        </div>
      </footer>

      {/* Debug component for development */}
      <AuthDebug />
    </div>
  );
}
