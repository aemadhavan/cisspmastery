import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { type QuizFile } from "@/lib/validations/quiz";

interface QuizFilePreviewProps {
  quizData: QuizFile;
  fileName: string;
  onRemove: () => void;
}

export function QuizFilePreview({ quizData, fileName, onRemove }: QuizFilePreviewProps) {
  const questionCount = quizData.questions.length;
  const previewQuestions = quizData.questions.slice(0, 2);
  const hasMoreQuestions = questionCount > 2;
  const questionLabel = questionCount !== 1 ? 's' : '';

  return (
    <div className="p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-blue-300">
            ✓ {questionCount} question{questionLabel} loaded
          </p>
          <p className="text-xs text-blue-400 mt-1">{fileName}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-blue-300 hover:text-blue-100 hover:bg-blue-800"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="mt-2 pt-2 border-t border-blue-700">
        <p className="text-xs text-blue-300 font-medium mb-1">Preview:</p>
        <div className="space-y-1">
          {previewQuestions.map((q, idx) => (
            <div key={idx} className="text-xs text-blue-200">
              <p className="font-medium">Q{idx + 1}: {q.question}</p>
              <p className="text-blue-400 ml-2 mt-0.5">
                {q.options.length} options, {q.options.filter(o => o.isCorrect).length} correct
              </p>
            </div>
          ))}
          {hasMoreQuestions && (
            <p className="text-xs text-blue-400 italic">
              +{questionCount - 2} more question(s)...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
