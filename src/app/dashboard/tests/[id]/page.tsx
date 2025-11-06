"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Flag, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TestQuestion {
  id: string;
  question: string;
  choices: string[];
  pointValue: number;
  timeLimit?: number;
  difficulty?: number;
  explanation?: string | null;
}

interface TestAttempt {
  id: string;
  status: string;
  totalQuestions: number;
  timeLimit?: number;
  passingScore?: number;
}

interface TestSession {
  attempt: TestAttempt;
  questions: TestQuestion[];
}

interface UserAnswer {
  questionId: string;
  selectedAnswers: number[];
  timeSpent: number;
  markedForReview: boolean;
}

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [session, setSession] = useState<TestSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, UserAnswer>>(new Map());
  const [selectedChoices, setSelectedChoices] = useState<Set<number>>(new Set());
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());

  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  const currentQuestion = session?.questions[currentQuestionIndex];
  const progress = session ? ((currentQuestionIndex + 1) / session.questions.length) * 100 : 0;

  // Start the test
  useEffect(() => {
    const startTest = async () => {
      try {
        const res = await fetch("/api/tests/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deckTestId: testId,
            testType: "deck",
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to start test");
        }

        const data = await res.json();
        setSession(data);
        setStartTime(Date.now());
        setQuestionStartTime(Date.now());
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to start test";
        toast.error(errorMessage);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    startTest();
  }, [testId, router]);

  // Timer for overall test time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Save answer to backend
  const saveAnswer = useCallback(async (questionId: string, userAnswer: UserAnswer) => {
    if (!session) return;

    try {
      const res = await fetch("/api/tests/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: session.attempt.id,
          testQuestionId: questionId,
          selectedAnswers: userAnswer.selectedAnswers,
          timeSpent: userAnswer.timeSpent,
          markedForReview: userAnswer.markedForReview,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save answer");
      }
    } catch (error) {
      console.error("Error saving answer:", error);
      toast.error("Failed to save answer. Please try again.");
    }
  }, [session]);

  // Handle answer selection
  const handleChoiceSelect = (choiceIndex: number) => {
    const newSelection = new Set(selectedChoices);
    if (newSelection.has(choiceIndex)) {
      newSelection.delete(choiceIndex);
    } else {
      // For now, only allow single selection (can be enhanced for multi-select)
      newSelection.clear();
      newSelection.add(choiceIndex);
    }
    setSelectedChoices(newSelection);
  };

  // Navigate to next question
  const handleNext = async () => {
    if (!currentQuestion || !session) return;

    // Save current answer
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedAnswers: Array.from(selectedChoices),
      timeSpent,
      markedForReview: markedForReview.has(currentQuestion.id),
    };

    // Update answers map
    const newAnswers = new Map(answers);
    newAnswers.set(currentQuestion.id, userAnswer);
    setAnswers(newAnswers);

    // Save to backend
    if (selectedChoices.size > 0) {
      await saveAnswer(currentQuestion.id, userAnswer);
    }

    // Move to next question
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionStartTime(Date.now());

      // Load saved answer for next question if exists
      const nextQuestion = session.questions[currentQuestionIndex + 1];
      const savedAnswer = newAnswers.get(nextQuestion.id);
      if (savedAnswer) {
        setSelectedChoices(new Set(savedAnswer.selectedAnswers));
      } else {
        setSelectedChoices(new Set());
      }
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0 && session) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setQuestionStartTime(Date.now());

      // Load saved answer for previous question
      const prevQuestion = session.questions[currentQuestionIndex - 1];
      const savedAnswer = answers.get(prevQuestion.id);
      if (savedAnswer) {
        setSelectedChoices(new Set(savedAnswer.selectedAnswers));
      } else {
        setSelectedChoices(new Set());
      }
    }
  };

  // Toggle mark for review
  const handleToggleReview = () => {
    if (!currentQuestion) return;

    const newMarked = new Set(markedForReview);
    if (newMarked.has(currentQuestion.id)) {
      newMarked.delete(currentQuestion.id);
    } else {
      newMarked.add(currentQuestion.id);
    }
    setMarkedForReview(newMarked);
  };

  // Submit test
  const handleSubmitTest = async () => {
    if (!session) return;

    // Check if all questions are answered
    const unanswered = session.questions.filter(q => !answers.has(q.id) && !selectedChoices.has(0));

    if (unanswered.length > 0) {
      const confirmed = window.confirm(
        `You have ${unanswered.length} unanswered question(s). Are you sure you want to submit?`
      );
      if (!confirmed) return;
    }

    // Save current question answer if any
    if (currentQuestion && selectedChoices.size > 0) {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      const userAnswer: UserAnswer = {
        questionId: currentQuestion.id,
        selectedAnswers: Array.from(selectedChoices),
        timeSpent,
        markedForReview: markedForReview.has(currentQuestion.id),
      };
      await saveAnswer(currentQuestion.id, userAnswer);
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: session.attempt.id,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit test");
      }

      const result = await res.json();
      toast.success("Test submitted successfully!");

      // Redirect to results page
      router.push(`/dashboard/tests/results/${session.attempt.id}`);
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("Failed to submit test. Please try again.");
      setSubmitting(false);
    }
  };

  // Jump to specific question
  const handleJumpToQuestion = (index: number) => {
    if (!session) return;

    // Save current answer before jumping
    if (currentQuestion && selectedChoices.size > 0) {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      const userAnswer: UserAnswer = {
        questionId: currentQuestion.id,
        selectedAnswers: Array.from(selectedChoices),
        timeSpent,
        markedForReview: markedForReview.has(currentQuestion.id),
      };

      const newAnswers = new Map(answers);
      newAnswers.set(currentQuestion.id, userAnswer);
      setAnswers(newAnswers);
      saveAnswer(currentQuestion.id, userAnswer);
    }

    setCurrentQuestionIndex(index);
    setQuestionStartTime(Date.now());

    // Load saved answer for the target question
    const targetQuestion = session.questions[index];
    const savedAnswer = answers.get(targetQuestion.id);
    if (savedAnswer) {
      setSelectedChoices(new Set(savedAnswer.selectedAnswers));
    } else {
      setSelectedChoices(new Set());
    }
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

  if (!session || !currentQuestion) {
    return null;
  }

  const answeredCount = answers.size + (selectedChoices.size > 0 && !answers.has(currentQuestion.id) ? 1 : 0);
  const reviewCount = markedForReview.size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Test
              </Button>
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white">
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Question {currentQuestionIndex + 1} of {session.questions.length}</span>
              <span>{answeredCount} answered • {reviewCount} marked for review</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Question Card */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-white mb-2">
                      {currentQuestion.question}
                    </CardTitle>
                    {currentQuestion.pointValue && (
                      <CardDescription className="text-purple-400">
                        {currentQuestion.pointValue} point{currentQuestion.pointValue !== 1 ? 's' : ''}
                        {currentQuestion.difficulty && ` • Difficulty: ${'★'.repeat(currentQuestion.difficulty)}`}
                      </CardDescription>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleReview}
                    className={cn(
                      "text-yellow-500 hover:text-yellow-400",
                      markedForReview.has(currentQuestion.id) && "bg-yellow-500/20"
                    )}
                  >
                    <Flag className="w-5 h-5" fill={markedForReview.has(currentQuestion.id) ? "currentColor" : "none"} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentQuestion.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleChoiceSelect(index)}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border-2 transition-all",
                      "hover:border-purple-500 hover:bg-purple-500/10",
                      selectedChoices.has(index)
                        ? "border-purple-500 bg-purple-500/20 text-white"
                        : "border-slate-600 bg-slate-700/50 text-gray-300"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                        selectedChoices.has(index) ? "border-purple-500 bg-purple-500" : "border-slate-500"
                      )}>
                        {selectedChoices.has(index) && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="flex-1">{choice}</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestionIndex === session.questions.length - 1 ? (
                  <Button
                    onClick={handleSubmitTest}
                    disabled={submitting}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  >
                    {submitting ? "Submitting..." : "Submit Test"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Question Navigator Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg text-white">Question Navigator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {session.questions.map((q, index) => {
                    const isAnswered = answers.has(q.id) || (index === currentQuestionIndex && selectedChoices.size > 0);
                    const isMarked = markedForReview.has(q.id);
                    const isCurrent = index === currentQuestionIndex;

                    return (
                      <button
                        key={q.id}
                        onClick={() => handleJumpToQuestion(index)}
                        className={cn(
                          "aspect-square rounded-lg text-sm font-medium transition-all relative",
                          isCurrent && "ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-800",
                          isAnswered && !isCurrent && "bg-green-600 text-white hover:bg-green-700",
                          !isAnswered && !isCurrent && "bg-slate-700 text-gray-400 hover:bg-slate-600",
                          isCurrent && "bg-purple-600 text-white"
                        )}
                      >
                        {index + 1}
                        {isMarked && (
                          <Flag className="w-3 h-3 absolute -top-1 -right-1 text-yellow-500" fill="currentColor" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-6 space-y-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-600" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-slate-700" />
                    <span>Not answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-purple-600" />
                    <span>Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-yellow-500" fill="currentColor" />
                    <span>Marked for review</span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitTest}
                  disabled={submitting}
                  className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                >
                  {submitting ? "Submitting..." : "Submit Test"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test Tips */}
        <div className="mt-6 max-w-3xl">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p className="font-semibold text-white mb-1">Test Tips:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use the flag button to mark questions you want to review later</li>
                    <li>You can navigate between questions using the sidebar or Previous/Next buttons</li>
                    <li>Your answers are automatically saved as you progress</li>
                    <li>Make sure to answer all questions before submitting</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
