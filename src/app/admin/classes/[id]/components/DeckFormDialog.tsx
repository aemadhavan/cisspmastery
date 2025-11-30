import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { type QuizFile } from "@/lib/validations/quiz";
import { QuizFileUpload } from "./QuizFileUpload";

interface DeckFormData {
  name: string;
  description: string;
  type: 'flashcard' | 'quiz';
  order: number;
  isPremium: boolean;
  isPublished: boolean;
}

interface Deck {
  id: string;
  name: string;
  description: string | null;
  type: 'flashcard' | 'quiz';
  order: number;
  isPremium: boolean;
  isPublished: boolean;
}

interface QuizFileProps {
  data: QuizFile | null;
  fileName: string;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

interface DeckFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  deck: Deck | null;
  formData: DeckFormData;
  setFormData: (data: DeckFormData) => void;
  quizFile: QuizFileProps;
  onSave: () => void;
  isSaving: boolean;
}

export function DeckFormDialog({
  isOpen,
  onOpenChange,
  deck,
  formData,
  setFormData,
  quizFile,
  onSave,
  isSaving,
}: DeckFormDialogProps) {
  const isEditMode = Boolean(deck);
  const dialogTitle = isEditMode ? "Edit Deck" : "Create New Deck";
  const dialogDescription = isEditMode
    ? "Update the deck details below"
    : "Add a new deck to this class";
  const saveButtonText = isEditMode ? "Update" : "Create";
  const isQuizType = formData.type === 'quiz';

  const updateFormField = <K extends keyof DeckFormData>(
    field: K,
    value: DeckFormData[K]
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="name">Deck Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormField('name', e.target.value)}
              placeholder="e.g., Security Architecture and Engineering"
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormField('description', e.target.value)}
              placeholder="Brief description of this deck..."
              className="bg-slate-900 border-slate-700 text-white min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Deck Type *</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => updateFormField('type', e.target.value as 'flashcard' | 'quiz')}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="flashcard">Flashcard</option>
              <option value="quiz">Quiz</option>
            </select>
            <p className="text-xs text-gray-400">
              {isQuizType
                ? 'Quiz deck with multiple-choice questions (requires JSON file upload)'
                : 'Traditional flashcard deck with questions and answers'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => updateFormField('order', parseInt(e.target.value) || 0)}
              className="bg-slate-900 border-slate-700 text-white"
              min={0}
            />
            <p className="text-xs text-gray-400">
              Lower numbers appear first in the list
            </p>
          </div>

          {isQuizType && (
            <QuizFileUpload
              quizData={quizFile.data}
              fileName={quizFile.fileName}
              onFileSelect={quizFile.onFileSelect}
              onRemove={quizFile.onRemove}
              isRequired
            />
          )}

          <div className="flex items-center justify-between py-2 px-3 bg-slate-900 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="isPremium">Premium Content</Label>
              <p className="text-xs text-gray-400">
                Requires paid subscription to access
              </p>
            </div>
            <Switch
              id="isPremium"
              checked={formData.isPremium}
              onCheckedChange={(checked) => updateFormField('isPremium', checked)}
            />
          </div>

          <div className="flex items-center justify-between py-2 px-3 bg-slate-900 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="isPublished">Published</Label>
              <p className="text-xs text-gray-400">
                Make this deck visible to users
              </p>
            </div>
            <Switch
              id="isPublished"
              checked={formData.isPublished}
              onCheckedChange={(checked) => updateFormField('isPublished', checked)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="border-slate-700 text-gray-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>{saveButtonText} Deck</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
