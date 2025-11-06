"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DeckTest {
  id: string;
  deckId: string;
  name: string;
  description?: string | null;
  testType: string;
  questionCount?: number | null;
  timeLimit?: number | null;
  passingScore: number;
  shuffleQuestions: boolean;
  shuffleChoices: boolean;
  showCorrectAnswers: boolean;
  allowRetakes: boolean;
  maxAttempts?: number | null;
  isPremium: boolean;
  isPublished: boolean;
  deck: {
    name: string;
    class: {
      name: string;
    };
  };
}

interface DeckTestFormData {
  deckId: string;
  name: string;
  description: string;
  testType: "flashcard" | "deck" | "random";
  questionCount?: number;
  timeLimit?: number;
  passingScore: number;
  shuffleQuestions: boolean;
  shuffleChoices: boolean;
  showCorrectAnswers: boolean;
  allowRetakes: boolean;
  maxAttempts?: number;
  isPremium: boolean;
  isPublished: boolean;
}

export default function AdminDeckTestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<DeckTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingTest, setEditingTest] = useState<DeckTest | null>(null);
  const [deletingTestId, setDeletingTestId] = useState<string | null>(null);

  const [formData, setFormData] = useState<DeckTestFormData>({
    deckId: "",
    name: "",
    description: "",
    testType: "deck",
    questionCount: undefined,
    timeLimit: undefined,
    passingScore: 70,
    shuffleQuestions: true,
    shuffleChoices: true,
    showCorrectAnswers: true,
    allowRetakes: true,
    maxAttempts: undefined,
    isPremium: false,
    isPublished: true,
  });

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/deck-tests");
      if (!res.ok) throw new Error("Failed to load tests");

      const data = await res.json();
      setTests(data.tests || []);
    } catch (error) {
      console.error("Error loading tests:", error);
      toast.error("Failed to load deck tests");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async () => {
    try {
      const res = await fetch("/api/admin/deck-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create test");
      }

      toast.success("Deck test created successfully!");
      setShowCreateDialog(false);
      resetForm();
      loadTests();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create test";
      toast.error(errorMessage);
    }
  };

  const handleUpdateTest = async () => {
    if (!editingTest) return;

    try {
      const res = await fetch(`/api/admin/deck-tests/${editingTest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTest.id,
          ...formData,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update test");
      }

      toast.success("Deck test updated successfully!");
      setShowEditDialog(false);
      setEditingTest(null);
      resetForm();
      loadTests();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update test";
      toast.error(errorMessage);
    }
  };

  const handleDeleteTest = async () => {
    if (!deletingTestId) return;

    try {
      const res = await fetch(`/api/admin/deck-tests/${deletingTestId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete test");
      }

      toast.success("Deck test deleted successfully!");
      setShowDeleteDialog(false);
      setDeletingTestId(null);
      loadTests();
    } catch (error) {
      console.error("Error deleting test:", error);
      toast.error("Failed to delete test");
    }
  };

  const openEditDialog = (test: DeckTest) => {
    setEditingTest(test);
    setFormData({
      deckId: test.deckId,
      name: test.name,
      description: test.description || "",
      testType: test.testType as "flashcard" | "deck" | "random",
      questionCount: test.questionCount || undefined,
      timeLimit: test.timeLimit || undefined,
      passingScore: test.passingScore,
      shuffleQuestions: test.shuffleQuestions,
      shuffleChoices: test.shuffleChoices,
      showCorrectAnswers: test.showCorrectAnswers,
      allowRetakes: test.allowRetakes,
      maxAttempts: test.maxAttempts || undefined,
      isPremium: test.isPremium,
      isPublished: test.isPublished,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (testId: string) => {
    setDeletingTestId(testId);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      deckId: "",
      name: "",
      description: "",
      testType: "deck",
      questionCount: undefined,
      timeLimit: undefined,
      passingScore: 70,
      shuffleQuestions: true,
      shuffleChoices: true,
      showCorrectAnswers: true,
      allowRetakes: true,
      maxAttempts: undefined,
      isPremium: false,
      isPublished: true,
    });
  };

  const TestForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="deckId" className="text-white">Deck ID</Label>
        <Input
          id="deckId"
          value={formData.deckId}
          onChange={(e) => setFormData({ ...formData, deckId: e.target.value })}
          placeholder="UUID of the deck"
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>

      <div>
        <Label htmlFor="name" className="text-white">Test Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Domain 1 Security Assessment"
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-white">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the test..."
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="testType" className="text-white">Test Type</Label>
          <Select
            value={formData.testType}
            onValueChange={(value: "flashcard" | "deck" | "random") =>
              setFormData({ ...formData, testType: value })
            }
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="deck">Deck Test</SelectItem>
              <SelectItem value="random">Random Selection</SelectItem>
              <SelectItem value="flashcard">Single Flashcard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="questionCount" className="text-white">
            Question Count (Optional)
          </Label>
          <Input
            id="questionCount"
            type="number"
            min="1"
            max="100"
            value={formData.questionCount || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                questionCount: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            placeholder="All questions"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="timeLimit" className="text-white">
            Time Limit (seconds)
          </Label>
          <Input
            id="timeLimit"
            type="number"
            min="60"
            max="7200"
            value={formData.timeLimit || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                timeLimit: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            placeholder="No limit"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>

        <div>
          <Label htmlFor="passingScore" className="text-white">
            Passing Score (%)
          </Label>
          <Input
            id="passingScore"
            type="number"
            min="0"
            max="100"
            value={formData.passingScore}
            onChange={(e) =>
              setFormData({ ...formData, passingScore: parseInt(e.target.value) })
            }
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="maxAttempts" className="text-white">
          Max Attempts (Optional)
        </Label>
        <Input
          id="maxAttempts"
          type="number"
          min="1"
          max="100"
          value={formData.maxAttempts || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              maxAttempts: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
          placeholder="Unlimited"
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="shuffleQuestions"
            checked={formData.shuffleQuestions}
            onChange={(e) =>
              setFormData({ ...formData, shuffleQuestions: e.target.checked })
            }
            className="w-4 h-4"
          />
          <Label htmlFor="shuffleQuestions" className="text-white">
            Shuffle Questions
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="shuffleChoices"
            checked={formData.shuffleChoices}
            onChange={(e) =>
              setFormData({ ...formData, shuffleChoices: e.target.checked })
            }
            className="w-4 h-4"
          />
          <Label htmlFor="shuffleChoices" className="text-white">
            Shuffle Choices
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showCorrectAnswers"
            checked={formData.showCorrectAnswers}
            onChange={(e) =>
              setFormData({ ...formData, showCorrectAnswers: e.target.checked })
            }
            className="w-4 h-4"
          />
          <Label htmlFor="showCorrectAnswers" className="text-white">
            Show Correct Answers After Completion
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allowRetakes"
            checked={formData.allowRetakes}
            onChange={(e) =>
              setFormData({ ...formData, allowRetakes: e.target.checked })
            }
            className="w-4 h-4"
          />
          <Label htmlFor="allowRetakes" className="text-white">
            Allow Retakes
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPremium"
            checked={formData.isPremium}
            onChange={(e) =>
              setFormData({ ...formData, isPremium: e.target.checked })
            }
            className="w-4 h-4"
          />
          <Label htmlFor="isPremium" className="text-white">
            Premium Content (requires Pro subscription)
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublished"
            checked={formData.isPublished}
            onChange={(e) =>
              setFormData({ ...formData, isPublished: e.target.checked })
            }
            className="w-4 h-4"
          />
          <Label htmlFor="isPublished" className="text-white">
            Published (visible to users)
          </Label>
        </div>
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
          Deck Tests Management
        </h1>
        <p className="text-gray-400">Create and manage test configurations for decks</p>
      </div>

      {/* Actions */}
      <div className="mb-6">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Deck Test
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Create Deck Test</DialogTitle>
              <DialogDescription className="text-gray-400">
                Configure a new test for a deck
              </DialogDescription>
            </DialogHeader>
            <TestForm />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateTest}
                disabled={!formData.deckId || !formData.name}
              >
                Create Test
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        {tests.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center py-12">
              <p className="text-gray-400">
                No deck tests found. Create your first test to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          tests.map((test) => (
            <Card
              key={test.id}
              className={cn(
                "bg-slate-800 border-2",
                test.isPublished ? "border-slate-700" : "border-gray-600"
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg text-white">{test.name}</CardTitle>
                      <div className="flex gap-2">
                        {test.isPublished ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-900/30 text-green-400 border border-green-500/30 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Published
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-900/30 text-gray-400 border border-gray-500/30 flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            Draft
                          </span>
                        )}
                        {test.isPremium && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-900/30 text-purple-400 border border-purple-500/30">
                            Premium
                          </span>
                        )}
                      </div>
                    </div>
                    <CardDescription className="text-gray-400">
                      {test.deck.class.name} • {test.deck.name}
                      {test.description && (
                        <>
                          <br />
                          {test.description}
                        </>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Test Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Type</p>
                    <p className="text-white font-medium capitalize">{test.testType}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Passing Score</p>
                    <p className="text-white font-medium">{test.passingScore}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Questions</p>
                    <p className="text-white font-medium">
                      {test.questionCount || "All"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Max Attempts</p>
                    <p className="text-white font-medium">
                      {test.maxAttempts || "Unlimited"}
                    </p>
                  </div>
                </div>

                {/* Settings */}
                <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                  {test.shuffleQuestions && (
                    <span className="px-2 py-1 bg-slate-700 rounded">Shuffle Questions</span>
                  )}
                  {test.shuffleChoices && (
                    <span className="px-2 py-1 bg-slate-700 rounded">Shuffle Choices</span>
                  )}
                  {test.showCorrectAnswers && (
                    <span className="px-2 py-1 bg-slate-700 rounded">Show Answers</span>
                  )}
                  {test.allowRetakes && (
                    <span className="px-2 py-1 bg-slate-700 rounded">Allow Retakes</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-700">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(test)}
                    className="border-slate-600 text-white"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openDeleteDialog(test.id)}
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
            <DialogTitle className="text-white">Edit Deck Test</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the test configuration
            </DialogDescription>
          </DialogHeader>
          <TestForm />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTest}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Deck Test</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this test? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTest}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
