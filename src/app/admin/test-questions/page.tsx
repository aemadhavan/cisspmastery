"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Upload, Filter, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TestQuestion {
  id: string;
  flashcardId: string;
  question: string;
  choices: string[];
  correctAnswers: number[];
  explanation?: string | null;
  pointValue: number;
  timeLimit?: number | null;
  difficulty?: number | null;
  order: number;
  isActive: boolean;
  flashcard?: {
    question: string;
    deck: {
      name: string;
    };
  };
}

interface QuestionFormData {
  flashcardId: string;
  question: string;
  choices: string[];
  correctAnswers: number[];
  explanation: string;
  pointValue: number;
  timeLimit?: number;
  difficulty?: number;
  order: number;
  isActive: boolean;
}

export default function AdminTestQuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterFlashcardId, setFilterFlashcardId] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<TestQuestion | null>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);

  const [formData, setFormData] = useState<QuestionFormData>({
    flashcardId: "",
    question: "",
    choices: ["", ""],
    correctAnswers: [],
    explanation: "",
    pointValue: 1,
    timeLimit: undefined,
    difficulty: undefined,
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    loadQuestions();
  }, [filterFlashcardId]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterFlashcardId !== "all") {
        params.append("flashcardId", filterFlashcardId);
      }

      const res = await fetch(`/api/admin/test-questions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load questions");

      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error("Error loading questions:", error);
      toast.error("Failed to load test questions");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    try {
      const res = await fetch("/api/admin/test-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create question");
      }

      toast.success("Test question created successfully!");
      setShowCreateDialog(false);
      resetForm();
      loadQuestions();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create question";
      toast.error(errorMessage);
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    try {
      const res = await fetch(`/api/admin/test-questions/${editingQuestion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingQuestion.id,
          ...formData,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update question");
      }

      toast.success("Test question updated successfully!");
      setShowEditDialog(false);
      setEditingQuestion(null);
      resetForm();
      loadQuestions();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update question";
      toast.error(errorMessage);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deletingQuestionId) return;

    try {
      const res = await fetch(`/api/admin/test-questions/${deletingQuestionId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete question");
      }

      toast.success("Test question deleted successfully!");
      setShowDeleteDialog(false);
      setDeletingQuestionId(null);
      loadQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  const openEditDialog = (question: TestQuestion) => {
    setEditingQuestion(question);
    setFormData({
      flashcardId: question.flashcardId,
      question: question.question,
      choices: [...question.choices],
      correctAnswers: [...question.correctAnswers],
      explanation: question.explanation || "",
      pointValue: question.pointValue,
      timeLimit: question.timeLimit || undefined,
      difficulty: question.difficulty || undefined,
      order: question.order,
      isActive: question.isActive,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (questionId: string) => {
    setDeletingQuestionId(questionId);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      flashcardId: "",
      question: "",
      choices: ["", ""],
      correctAnswers: [],
      explanation: "",
      pointValue: 1,
      timeLimit: undefined,
      difficulty: undefined,
      order: 0,
      isActive: true,
    });
  };

  const addChoice = () => {
    if (formData.choices.length < 6) {
      setFormData({
        ...formData,
        choices: [...formData.choices, ""],
      });
    }
  };

  const removeChoice = (index: number) => {
    if (formData.choices.length > 2) {
      const newChoices = formData.choices.filter((_, i) => i !== index);
      const newCorrectAnswers = formData.correctAnswers
        .filter((a) => a !== index)
        .map((a) => (a > index ? a - 1 : a));
      setFormData({
        ...formData,
        choices: newChoices,
        correctAnswers: newCorrectAnswers,
      });
    }
  };

  const updateChoice = (index: number, value: string) => {
    const newChoices = [...formData.choices];
    newChoices[index] = value;
    setFormData({
      ...formData,
      choices: newChoices,
    });
  };

  const toggleCorrectAnswer = (index: number) => {
    const newCorrectAnswers = formData.correctAnswers.includes(index)
      ? formData.correctAnswers.filter((i) => i !== index)
      : [...formData.correctAnswers, index];
    setFormData({
      ...formData,
      correctAnswers: newCorrectAnswers.sort((a, b) => a - b),
    });
  };

  const QuestionForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="flashcardId" className="text-white">Flashcard ID</Label>
        <Input
          id="flashcardId"
          value={formData.flashcardId}
          onChange={(e) => setFormData({ ...formData, flashcardId: e.target.value })}
          placeholder="UUID of the flashcard"
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>

      <div>
        <Label htmlFor="question" className="text-white">Question Text</Label>
        <Textarea
          id="question"
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          placeholder="Enter the question..."
          className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-white">Answer Choices (2-6)</Label>
          <Button size="sm" onClick={addChoice} disabled={formData.choices.length >= 6}>
            <Plus className="w-4 h-4 mr-1" />
            Add Choice
          </Button>
        </div>
        <div className="space-y-2">
          {formData.choices.map((choice, index) => (
            <div key={index} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleCorrectAnswer(index)}
                className={cn(
                  "w-6 h-6 rounded flex items-center justify-center flex-shrink-0",
                  formData.correctAnswers.includes(index)
                    ? "bg-green-500"
                    : "bg-slate-600 border border-slate-500"
                )}
              >
                {formData.correctAnswers.includes(index) && (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                )}
              </button>
              <Input
                value={choice}
                onChange={(e) => updateChoice(index, e.target.value)}
                placeholder={`Choice ${index + 1}`}
                className="flex-1 bg-slate-700 border-slate-600 text-white"
              />
              {formData.choices.length > 2 && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeChoice(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">Click the circle to mark as correct answer</p>
      </div>

      <div>
        <Label htmlFor="explanation" className="text-white">Explanation (Optional)</Label>
        <Textarea
          id="explanation"
          value={formData.explanation}
          onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
          placeholder="Explain why the answer is correct..."
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pointValue" className="text-white">Point Value</Label>
          <Input
            id="pointValue"
            type="number"
            min="1"
            max="10"
            value={formData.pointValue}
            onChange={(e) => setFormData({ ...formData, pointValue: parseInt(e.target.value) })}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
        <div>
          <Label htmlFor="difficulty" className="text-white">Difficulty (1-5)</Label>
          <Input
            id="difficulty"
            type="number"
            min="1"
            max="5"
            value={formData.difficulty || ""}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="Optional"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="timeLimit" className="text-white">Time Limit (seconds)</Label>
          <Input
            id="timeLimit"
            type="number"
            min="10"
            max="600"
            value={formData.timeLimit || ""}
            onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="Optional"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
        <div>
          <Label htmlFor="order" className="text-white">Display Order</Label>
          <Input
            id="order"
            type="number"
            min="0"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="w-4 h-4"
        />
        <Label htmlFor="isActive" className="text-white">Active (visible in tests)</Label>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-64 bg-slate-700 rounded" />
          <div className="h-96 bg-slate-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Test Questions Management
        </h1>
        <p className="text-gray-400">Create and manage multiple-choice test questions</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Question
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Create Test Question</DialogTitle>
              <DialogDescription className="text-gray-400">
                Add a new multiple-choice question for a flashcard
              </DialogDescription>
            </DialogHeader>
            <QuestionForm />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateQuestion}
                disabled={!formData.flashcardId || !formData.question || formData.correctAnswers.length === 0}
              >
                Create Question
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
          <Upload className="w-4 h-4 mr-2" />
          Bulk Import (JSON)
        </Button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center py-12">
              <p className="text-gray-400">No test questions found. Create your first question to get started.</p>
            </CardContent>
          </Card>
        ) : (
          questions.map((question) => (
            <Card key={question.id} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-white mb-2">{question.question}</CardTitle>
                    {question.flashcard && (
                      <CardDescription className="text-gray-400">
                        Flashcard: {question.flashcard.question.substring(0, 50)}...
                        <br />
                        Deck: {question.flashcard.deck.name}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {question.isActive ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-900/30 text-green-400 border border-green-500/30">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-900/30 text-gray-400 border border-gray-500/30">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Choices */}
                <div className="space-y-2">
                  {question.choices.map((choice, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-3 rounded-lg border-2",
                        question.correctAnswers.includes(index)
                          ? "border-green-500 bg-green-900/20"
                          : "border-slate-600 bg-slate-700/50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {question.correctAnswers.includes(index) ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        )}
                        <span className="text-sm text-gray-300">{choice}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-700">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(question)} className="border-slate-600 text-white">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openDeleteDialog(question.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Test Question</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the question details
            </DialogDescription>
          </DialogHeader>
          <QuestionForm />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateQuestion}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Test Question</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this question? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteQuestion}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
