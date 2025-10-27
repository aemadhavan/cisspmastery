"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Flashcard {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  explanation?: string;
  difficulty: number;
  order: number;
  isPublished: boolean;
}

interface Deck {
  id: string;
  name: string;
  description: string | null;
  cardCount: number;
  order: number;
  isPremium: boolean;
}

interface Topic {
  id: string;
  name: string;
  description: string | null;
  order: number;
  decks: Deck[];
}

interface Domain {
  id: string;
  name: string;
  description: string | null;
  order: number;
  icon: string | null;
  topics: Topic[];
}

export default function AdminFlashcardsPage() {
  const [selectedDeckId] = useState<string>("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  // Domain/Topic/Deck data
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    explanation: "",
    difficulty: 3,
    deckId: "",
  });

  const loadDomains = async () => {
    try {
      // Fetch all domains with full hierarchy from admin endpoint
      const res = await fetch('/api/admin/domains');
      if (!res.ok) throw new Error("Failed to load domains");
      const data = await res.json();

      setDomains(data.domains || []);
    } catch (error) {
      console.error("Failed to load domains:", error);
      toast.error("Failed to load domains");
    }
  };

  const loadFlashcards = async (deckId?: string) => {
    setLoading(true);
    try {
      const url = deckId
        ? `/api/admin/flashcards?deckId=${deckId}`
        : '/api/admin/flashcards';
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load flashcards");
      const data = await res.json();
      setFlashcards(data.flashcards || []);
    } catch {
      toast.error("Failed to load flashcards");
    } finally {
      setLoading(false);
    }
  };

  // Load domains and flashcards on page mount
  useEffect(() => {
    loadDomains();
    loadFlashcards();
  }, []);

  const handleCreateOrUpdate = async () => {
    if (!formData.question || !formData.answer || !formData.deckId) {
      toast.error("Question, answer, and deck are required");
      return;
    }

    setLoading(true);
    try {
      const url = editingCard
        ? `/api/admin/flashcards/${editingCard.id}`
        : "/api/admin/flashcards";

      const method = editingCard ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save flashcard");
      }

      toast.success(editingCard ? "Flashcard updated" : "Flashcard created");
      setDialogOpen(false);
      resetForm();

      if (selectedDeckId) {
        loadFlashcards(selectedDeckId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save flashcard";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flashcard?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/flashcards/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete flashcard");

      toast.success("Flashcard deleted");

      if (selectedDeckId) {
        loadFlashcards(selectedDeckId);
      }
    } catch {
      toast.error("Failed to delete flashcard");
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (card: Flashcard) => {
    setEditingCard(card);
    setFormData({
      question: card.question,
      answer: card.answer,
      explanation: card.explanation || "",
      difficulty: card.difficulty,
      deckId: card.deckId,
    });

    // Find and set the domain and topic for the deck
    for (const domain of domains) {
      for (const topic of domain.topics) {
        const deck = topic.decks.find(d => d.id === card.deckId);
        if (deck) {
          setSelectedDomainId(domain.id);
          setSelectedTopicId(topic.id);
          break;
        }
      }
    }

    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCard(null);
    setSelectedDomainId("");
    setSelectedTopicId("");
    setFormData({
      question: "",
      answer: "",
      explanation: "",
      difficulty: 3,
      deckId: "",
    });
  };

  const handleDomainChange = (domainId: string) => {
    setSelectedDomainId(domainId);
    setSelectedTopicId("");
    setFormData({ ...formData, deckId: "" });
  };

  const handleTopicChange = (topicId: string) => {
    setSelectedTopicId(topicId);
    setFormData({ ...formData, deckId: "" });
  };

  const handleDeckChange = (deckId: string) => {
    setFormData({ ...formData, deckId });
  };

  // Get filtered topics and decks based on selections
  const selectedDomain = domains.find(d => d.id === selectedDomainId);
  const availableTopics = selectedDomain?.topics || [];
  const selectedTopic = availableTopics.find(t => t.id === selectedTopicId);
  const availableDecks = selectedTopic?.decks || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Manage Flashcards
            </h1>
            <p className="text-gray-300">
              Create, edit, and organize flashcards
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                New Flashcard
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCard ? "Edit Flashcard" : "Create New Flashcard"}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Fill in the flashcard details below
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Domain Selection */}
                <div>
                  <Label htmlFor="domain">Domain (Required)</Label>
                  <Select
                    value={selectedDomainId}
                    onValueChange={handleDomainChange}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue placeholder="Select a domain..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {domains.map((domain) => (
                        <SelectItem key={domain.id} value={domain.id}>
                          {domain.icon && `${domain.icon} `}{domain.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Topic Selection */}
                <div>
                  <Label htmlFor="topic">Topic (Required)</Label>
                  <Select
                    value={selectedTopicId}
                    onValueChange={handleTopicChange}
                    disabled={!selectedDomainId}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue placeholder={selectedDomainId ? "Select a topic..." : "Select domain first"} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {availableTopics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Deck Selection */}
                <div>
                  <Label htmlFor="deck">Deck (Required)</Label>
                  <Select
                    value={formData.deckId}
                    onValueChange={handleDeckChange}
                    disabled={!selectedTopicId}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue placeholder={selectedTopicId ? "Select a deck..." : "Select topic first"} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {availableDecks.map((deck) => (
                        <SelectItem key={deck.id} value={deck.id}>
                          {deck.name} ({deck.cardCount} cards)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="question">Question (Required)</Label>
                  <Textarea
                    id="question"
                    placeholder="Enter the question..."
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="answer">Answer (Required)</Label>
                  <Textarea
                    id="answer"
                    placeholder="Enter the answer..."
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="explanation">Explanation (Optional)</Label>
                  <Textarea
                    id="explanation"
                    placeholder="Additional context or tips..."
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty (1-5)</Label>
                  <Select
                    value={formData.difficulty.toString()}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: parseInt(value) })}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          Level {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                    className="border-slate-700 text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateOrUpdate}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-purple-700"
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingCard ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Flashcards List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Flashcards</CardTitle>
          <CardDescription className="text-gray-400">
            {flashcards.length} flashcards
            {selectedDeckId && " in selected deck"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : flashcards.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No flashcards yet. Create your first one!
            </p>
          ) : (
            <div className="space-y-4">
              {flashcards.map((card) => (
                <div
                  key={card.id}
                  className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2">
                        <span className="text-xs text-gray-400">Question:</span>
                        <p className="text-white mt-1">{card.question}</p>
                      </div>
                      <div className="mb-2">
                        <span className="text-xs text-gray-400">Answer:</span>
                        <p className="text-gray-300 mt-1">{card.answer}</p>
                      </div>
                      {card.explanation && (
                        <div>
                          <span className="text-xs text-gray-400">Explanation:</span>
                          <p className="text-gray-400 text-sm mt-1">{card.explanation}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                          Difficulty: {card.difficulty}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          card.isPublished
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {card.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(card)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(card.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
