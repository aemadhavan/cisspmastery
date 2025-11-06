"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle2, XCircle, Clock, Award, TrendingUp, RotateCcw, Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QuestionResult {
  questionId: string;
  question: string;
  choices: string[];
  correctAnswers: number[];
  selectedAnswers: number[];
  isCorrect: boolean;
  pointsEarned: number;
  timeSpent: number;
  markedForReview: boolean;
  explanation?: string | null;
}

interface TestInfo {
  id: string;
  name: string;
  description?: string;
  passingScore: number;
  deck: {
    id: string;
    name: string;
    class: {
      id: string;
      name: string;
    };
  };
}

interface AttemptInfo {
  id: string;
  status: string;
  startedAt: string;
  completedAt: string;
  totalQuestions: number;
  questionsAnswered: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
  timeSpent: number;
}

interface Performance {
  accuracy: string;
  averageTimePerQuestion: string | null;
}

interface TestResults {
  attempt: AttemptInfo;
  test: TestInfo | null;
  questions: QuestionResult[] | null;
  performance: Performance;
}

export default function TestResultsPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<string>("overview");

  useEffect(() => {
    const loadResults = async () => {
      try {
        const res = await fetch(`/api/tests/results/${attemptId}`);

        if (!res.ok) {
          throw new Error("Failed to load test results");
        }

        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error("Error loading results:", error);
        toast.error("Failed to load test results");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [attemptId, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6 animate-pulse">
            <div className="h-10 w-32 bg-slate-700 rounded" />
            <div className="h-8 w-64 bg-slate-700 rounded" />
            <div className="h-96 bg-slate-800 border border-slate-700 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const { attempt, test, questions, performance } = results;
  const scorePercentage = attempt.score;
  const isPassed = attempt.passed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href={test?.deck.class.id ? `/dashboard/class/${test.deck.class.id}` : "/dashboard"}>
            <Button variant="ghost" className="text-white mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {test?.deck.class.name || "Dashboard"}
            </Button>
          </Link>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-purple-400 mb-1">{test?.deck.class.name}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {test?.name || "Test Results"}
              </h1>
              <p className="text-gray-400">{test?.deck.name}</p>
            </div>
          </div>
        </div>

        {/* Score Summary */}
        <Card className={cn(
          "mb-6 border-2",
          isPassed ? "bg-green-900/20 border-green-500" : "bg-red-900/20 border-red-500"
        )}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl text-white mb-2">
                  {isPassed ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                      <span>Passed!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle className="w-8 h-8 text-red-500" />
                      <span>Not Passed</span>
                    </div>
                  )}
                </CardTitle>
                <CardDescription className="text-lg">
                  Your score: <span className="font-bold text-white">{scorePercentage.toFixed(1)}%</span>
                  {test?.passingScore && ` • Passing score: ${test.passingScore}%`}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-white mb-2">
                  {scorePercentage.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-400">
                  {attempt.correctAnswers} / {attempt.totalQuestions} correct
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-400">Score</p>
                  <p className="text-2xl font-bold text-white">{scorePercentage.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-400">Accuracy</p>
                  <p className="text-2xl font-bold text-white">{performance.accuracy}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-400">Time Spent</p>
                  <p className="text-2xl font-bold text-white">{formatTime(attempt.timeSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-400">Questions</p>
                  <p className="text-2xl font-bold text-white">
                    {attempt.questionsAnswered}/{attempt.totalQuestions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Overview and Question Review */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">Question Review</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Performance Breakdown */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Correct Answers</span>
                    <span className="text-green-500 font-medium">
                      {attempt.correctAnswers} questions ({((attempt.correctAnswers / attempt.totalQuestions) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <Progress
                    value={(attempt.correctAnswers / attempt.totalQuestions) * 100}
                    className="h-2 bg-slate-700"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Incorrect Answers</span>
                    <span className="text-red-500 font-medium">
                      {attempt.totalQuestions - attempt.correctAnswers} questions (
                      {(((attempt.totalQuestions - attempt.correctAnswers) / attempt.totalQuestions) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <Progress
                    value={((attempt.totalQuestions - attempt.correctAnswers) / attempt.totalQuestions) * 100}
                    className="h-2 bg-slate-700"
                  />
                </div>

                {performance.averageTimePerQuestion && (
                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-sm text-gray-400 mb-1">Average time per question</p>
                    <p className="text-xl font-bold text-white">{performance.averageTimePerQuestion}s</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Test Info */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Test Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Completed</span>
                  <span className="text-white">{formatDate(attempt.completedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Time</span>
                  <span className="text-white">{formatTime(attempt.timeSpent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={cn(
                    "font-medium",
                    isPassed ? "text-green-500" : "text-red-500"
                  )}>
                    {isPassed ? "Passed" : "Not Passed"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => router.push("/dashboard/tests/history")}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                View Test History
              </Button>
              {test && (
                <Button
                  onClick={() => router.push(`/dashboard/tests/${test.id}`)}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Test
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Question Review Tab */}
          <TabsContent value="questions" className="space-y-6">
            {questions && questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((q, index) => (
                  <Card
                    key={q.questionId}
                    className={cn(
                      "bg-slate-800 border-2",
                      q.isCorrect ? "border-green-500/30" : "border-red-500/30"
                    )}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-400">Question {index + 1}</span>
                            {q.isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                          <CardTitle className="text-lg text-white">{q.question}</CardTitle>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-gray-400">Time spent</p>
                          <p className="font-medium text-white">{q.timeSpent}s</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Answer Choices */}
                      {q.choices.map((choice, choiceIndex) => {
                        const isCorrect = q.correctAnswers.includes(choiceIndex);
                        const isSelected = q.selectedAnswers.includes(choiceIndex);

                        return (
                          <div
                            key={choiceIndex}
                            className={cn(
                              "p-4 rounded-lg border-2",
                              isCorrect && "border-green-500 bg-green-900/20",
                              isSelected && !isCorrect && "border-red-500 bg-red-900/20",
                              !isSelected && !isCorrect && "border-slate-600 bg-slate-700/50"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-0.5">
                                {isCorrect ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                                ) : isSelected ? (
                                  <XCircle className="w-5 h-5 text-red-500" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-slate-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className={cn(
                                  "text-sm",
                                  isCorrect && "text-green-100 font-medium",
                                  isSelected && !isCorrect && "text-red-100",
                                  !isSelected && !isCorrect && "text-gray-300"
                                )}>
                                  {choice}
                                </p>
                                {isCorrect && (
                                  <p className="text-xs text-green-400 mt-1">Correct Answer</p>
                                )}
                                {isSelected && !isCorrect && (
                                  <p className="text-xs text-red-400 mt-1">Your Answer</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                          <p className="text-sm font-medium text-blue-400 mb-2">Explanation:</p>
                          <p className="text-sm text-gray-300">{q.explanation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-400">Detailed question review is not available for this test.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
