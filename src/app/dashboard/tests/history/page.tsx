"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle2, XCircle, Clock, FileText, Filter } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TestAttempt {
  id: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  totalQuestions: number;
  questionsAnswered: number;
  correctAnswers: number;
  score: string;
  passed: boolean | null;
  timeSpent: number | null;
  testType: string;
  deckTest: {
    id: string;
    name: string;
    passingScore: number;
    deck: {
      id: string;
      name: string;
      class: {
        id: string;
        name: string;
      };
    };
  } | null;
  flashcard: {
    id: string;
    question: string;
    deck: {
      id: string;
      name: string;
      class: {
        id: string;
        name: string;
      };
    };
  } | null;
}

interface TestHistory {
  attempts: TestAttempt[];
  total: number;
  limit: number;
  offset: number;
}

export default function TestHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [history, setHistory] = useState<TestHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") || "all");

  const limit = 10;
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    loadHistory();
  }, [statusFilter, offset]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const res = await fetch(`/api/tests/history?${params.toString()}`);

      if (!res.ok) {
        throw new Error("Failed to load test history");
      }

      const data = await res.json();
      setHistory(data);
    } catch (error) {
      console.error("Error loading history:", error);
      toast.error("Failed to load test history");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setOffset(0); // Reset to first page
  };

  const handlePreviousPage = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit));
    }
  };

  const handleNextPage = () => {
    if (history && offset + limit < history.total) {
      setOffset(offset + limit);
    }
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-900/30 text-green-400 border border-green-500/30">Completed</span>;
      case "in_progress":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-900/30 text-blue-400 border border-blue-500/30">In Progress</span>;
      case "abandoned":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-900/30 text-gray-400 border border-gray-500/30">Abandoned</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-900/30 text-slate-400 border border-slate-500/30">Not Started</span>;
    }
  };

  if (loading && !history) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6 animate-pulse">
            <div className="h-10 w-32 bg-slate-700 rounded" />
            <div className="h-8 w-64 bg-slate-700 rounded" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-800 border border-slate-700 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = history ? Math.ceil(history.total / limit) : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-white mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Test History
              </h1>
              <p className="text-gray-400">
                {history?.total || 0} test{history?.total !== 1 ? 's' : ''} taken
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Filter by status:</span>
              </div>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Tests</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="abandoned">Abandoned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Test History List */}
        {history && history.attempts.length > 0 ? (
          <div className="space-y-4">
            {history.attempts.map((attempt) => {
              const testName = attempt.deckTest?.name || attempt.flashcard?.question || "Unknown Test";
              const deckName = attempt.deckTest?.deck.name || attempt.flashcard?.deck.name || "";
              const className = attempt.deckTest?.deck.class.name || attempt.flashcard?.deck.class.name || "";
              const scorePercentage = parseFloat(attempt.score);

              return (
                <Card
                  key={attempt.id}
                  className={cn(
                    "bg-slate-800 border-2 hover:border-purple-500/50 transition-colors cursor-pointer",
                    attempt.status === "completed" && attempt.passed ? "border-green-500/30" : "border-slate-700"
                  )}
                  onClick={() => {
                    if (attempt.status === "completed") {
                      router.push(`/dashboard/tests/results/${attempt.id}`);
                    } else if (attempt.status === "in_progress" && attempt.deckTest) {
                      router.push(`/dashboard/tests/${attempt.deckTest.id}`);
                    }
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-purple-400">{className}</span>
                          {getStatusBadge(attempt.status)}
                        </div>
                        <CardTitle className="text-lg text-white mb-1">
                          {testName}
                        </CardTitle>
                        <p className="text-sm text-gray-400">{deckName}</p>
                      </div>

                      {attempt.status === "completed" && (
                        <div className="text-right">
                          <div className={cn(
                            "text-3xl font-bold mb-1",
                            attempt.passed ? "text-green-500" : "text-red-500"
                          )}>
                            {scorePercentage.toFixed(0)}%
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            {attempt.passed ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-green-500">Passed</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-red-500" />
                                <span className="text-red-500">Failed</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400 mb-1">Date</p>
                        <p className="text-white font-medium">
                          {formatDate(attempt.completedAt || attempt.startedAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Questions</p>
                        <p className="text-white font-medium">
                          {attempt.questionsAnswered}/{attempt.totalQuestions}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Correct</p>
                        <p className="text-white font-medium">
                          {attempt.correctAnswers}/{attempt.totalQuestions}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Time</p>
                        <p className="text-white font-medium">
                          {formatTime(attempt.timeSpent)}
                        </p>
                      </div>
                    </div>

                    {attempt.status === "completed" && (
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/tests/results/${attempt.id}`);
                          }}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    )}

                    {attempt.status === "in_progress" && attempt.deckTest && (
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/tests/${attempt.deckTest?.id}`);
                          }}
                        >
                          Resume Test
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center py-12">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-lg text-gray-400 mb-2">No test attempts found</p>
              <p className="text-sm text-gray-500 mb-6">
                {statusFilter !== "all"
                  ? `No ${statusFilter} tests found. Try changing the filter.`
                  : "Start taking tests to see your history here."
                }
              </p>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                  Browse Tests
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {history && history.total > limit && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing {offset + 1} - {Math.min(offset + limit, history.total)} of {history.total}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handlePreviousPage}
                disabled={offset === 0}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                Previous
              </Button>
              <Button
                onClick={handleNextPage}
                disabled={offset + limit >= history.total}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {history && history.total > 0 && (
          <Card className="mt-6 bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Tests</p>
                  <p className="text-3xl font-bold text-white">{history.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-500">
                    {history.attempts.filter(a => a.status === "completed").length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Pass Rate</p>
                  <p className="text-3xl font-bold text-purple-500">
                    {history.attempts.filter(a => a.status === "completed" && a.passed).length > 0
                      ? `${((history.attempts.filter(a => a.status === "completed" && a.passed).length / history.attempts.filter(a => a.status === "completed").length) * 100).toFixed(0)}%`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
