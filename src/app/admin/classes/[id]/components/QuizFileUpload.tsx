import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type QuizFile } from "@/lib/validations/quiz";
import { QuizFilePreview } from "./QuizFilePreview";

interface QuizFileUploadProps {
  quizData: QuizFile | null;
  fileName: string;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  isRequired?: boolean;
}

export function QuizFileUpload({
  quizData,
  fileName,
  onFileSelect,
  onRemove,
  isRequired = false
}: QuizFileUploadProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="deckQuiz">
        Quiz Questions File {isRequired && '*'}
      </Label>
      <p className="text-xs text-gray-400">
        Upload a JSON file with multiple-choice questions for this quiz deck
      </p>

      <Input
        id="deckQuiz"
        type="file"
        accept=".json"
        onChange={onFileSelect}
        className="bg-slate-900 border-slate-700 text-white cursor-pointer"
      />

      {quizData && (
        <QuizFilePreview
          quizData={quizData}
          fileName={fileName}
          onRemove={onRemove}
        />
      )}
    </div>
  );
}
