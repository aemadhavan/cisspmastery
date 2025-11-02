"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play, Pencil, Info, Plus, FileUp, Check } from "lucide-react";
import type { ClassData } from "@/lib/api/class-server";

// Lazy load Dialog for better initial bundle size
const Dialog = dynamic(() => import("@/components/ui/dialog").then(mod => ({ default: mod.Dialog })), {
  ssr: false,
});
const DialogContent = dynamic(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogContent })), {
  ssr: false,
});
const DialogDescription = dynamic(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogDescription })), {
  ssr: false,
});
const DialogHeader = dynamic(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogHeader })), {
  ssr: false,
});
const DialogTitle = dynamic(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogTitle })), {
  ssr: false,
});
const DialogTrigger = dynamic(() => import("@/components/ui/dialog").then(mod => ({ default: mod.DialogTrigger })), {
  ssr: false,
});

type StudyMode = "all" | "progressive" | "random";

interface ClassDetailClientProps {
  classData: ClassData;
  isAdmin: boolean;
}

export default function ClassDetailClient({ classData, isAdmin }: ClassDetailClientProps) {
  const [studyMode, setStudyMode] = useState<StudyMode>("progressive");
  const [selectedDecks, setSelectedDecks] = useState<Set<string>>(new Set());

  const decks = classData.decks;

  // Memoized calculations
  const totalCards = useMemo(() => decks.reduce((sum, deck) => sum + deck.cardCount, 0), [decks]);
  const totalStudied = useMemo(() => decks.reduce((sum, deck) => sum + deck.studiedCount, 0), [decks]);
  const overallProgress = useMemo(
    () => totalCards > 0 ? Math.round((totalStudied / totalCards) * 100) : 0,
    [totalCards, totalStudied]
  );

  // Handle deck selection toggle - memoized to prevent re-renders
  const toggleDeckSelection = useCallback((deckId: string) => {
    setSelectedDecks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deckId)) {
        newSet.delete(deckId);
      } else {
        newSet.add(deckId);
      }
      return newSet;
    });
  }, []);

  // Toggle select all decks - memoized with decks dependency
  const toggleSelectAll = useCallback(() => {
    if (selectedDecks.size === decks.length) {
      setSelectedDecks(new Set());
    } else {
      setSelectedDecks(new Set(decks.map(d => d.id)));
    }
  }, [selectedDecks.size, decks]);

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_auto] gap-8">
          {/* Left: Class Info */}
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {classData.name}
            </h1>
            {classData.description && (
              <p className="text-slate-600 mb-4">{classData.description}</p>
            )}

            {/* Overall Progress */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Overall Progress</span>
                <span className="text-sm font-semibold text-slate-800">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2 mb-2" />
              <p className="text-xs text-slate-600">
                {totalStudied} of {totalCards} unique cards studied
              </p>
            </div>
          </div>

          {/* Right: Study Controls */}
          <div className="flex flex-col gap-4">
            {/* Study Mode Selector */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-full">
              <button
                onClick={() => setStudyMode("progressive")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  studyMode === "progressive"
                    ? "bg-slate-800 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                PROGRESSIVE
              </button>
              <button
                onClick={() => setStudyMode("random")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  studyMode === "random"
                    ? "bg-slate-800 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                RANDOM
              </button>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="p-2 rounded-full text-slate-600 hover:text-slate-800 hover:bg-slate-200 transition-all">
                    <Info className="w-5 h-5" />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Study Modes</DialogTitle>
                    <DialogDescription className="space-y-4 pt-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Progressive Mode</h4>
                        <p className="text-sm text-slate-600">
                          Focuses on cards that need the most attention. Shows cards with low confidence
                          ratings or those due for review based on spaced repetition.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Random Mode</h4>
                        <p className="text-sm text-slate-600">
                          Cards are shuffled randomly to test your knowledge in an unpredictable order.
                          Perfect for simulating exam conditions.
                        </p>
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>

            {/* Select All Checkbox */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  selectedDecks.size === decks.length
                    ? 'bg-blue-500'
                    : 'bg-slate-200 hover:bg-slate-300'
                }`}
              >
                <Check className={`w-6 h-6 ${
                  selectedDecks.size === decks.length ? 'text-white' : 'text-slate-600'
                }`} />
              </button>
              <span className="text-sm font-medium text-slate-700">
                {selectedDecks.size === decks.length ? 'Deselect All' : 'Select All'}
              </span>
            </div>

            {/* Study Button */}
            <Link
              href={
                selectedDecks.size > 0
                  ? `/dashboard/class/${classData.id}/study?mode=${studyMode}&decks=${Array.from(selectedDecks).join(',')}`
                  : `/dashboard/class/${classData.id}/study?mode=${studyMode}`
              }
            >
              <Button
                size="lg"
                className={`w-full text-white px-8 rounded-full transition-all ${
                  selectedDecks.size > 0
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                <Play className="w-5 h-5 mr-2 fill-white" />
                {selectedDecks.size > 0
                  ? `STUDY SELECTED (${selectedDecks.size})`
                  : 'STUDY'
                }
              </Button>
            </Link>

            {/* Action Buttons */}
            {isAdmin && (
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="rounded-full border-slate-300">
                  <FileUp className="w-4 h-4 mr-2" />
                  Import/Make Flashcards
                  <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    NEW
                  </span>
                </Button>
                <Button variant="outline" className="rounded-full border-slate-300">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Deck
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Deck List */}
        <div className="mt-8">
          {decks.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-slate-500">
                  No decks available in this class yet.
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {decks.map((deck) => {
                const isSelected = selectedDecks.has(deck.id);
                return (
                  <Card
                    key={deck.id}
                    onClick={() => toggleDeckSelection(deck.id)}
                    className={`cursor-pointer transition-all border-2 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-slate-200 hover:shadow-md'
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        {/* Selection Checkbox */}
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-blue-500'
                              : 'bg-slate-200'
                          }`}>
                            <Check className={`w-6 h-6 ${
                              isSelected ? 'text-white' : 'text-slate-600'
                            }`} />
                          </div>
                        </div>

                        {/* Progress Indicator */}
                        <div className="flex-shrink-0">
                          <div className="text-2xl font-bold text-slate-800">
                            {deck.progress}%
                          </div>
                        </div>

                        {/* Deck Info */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-800 mb-1">
                            {deck.name}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {deck.studiedCount} of {deck.cardCount} unique cards studied
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Link href={`/dashboard/deck/${deck.id}?mode=progressive`}>
                            <Button size="sm" variant="outline" className="rounded-full">
                              <Play className="w-4 h-4 fill-current" />
                            </Button>
                          </Link>
                          {isAdmin && (
                            <Link href={`/admin/classes/${classData.id}/decks/${deck.id}/edit`}>
                              <Button size="sm" variant="ghost">
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <Progress value={deck.progress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
