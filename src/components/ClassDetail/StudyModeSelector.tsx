import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

type StudyMode = "progressive" | "random";

interface StudyModeSelectorProps {
  mode: StudyMode;
  onModeChange: (mode: StudyMode) => void;
  onShowInfo: () => void;
}

export function StudyModeSelector({ mode, onModeChange, onShowInfo }: StudyModeSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-white/95 p-1 rounded-lg">
      <button
        onClick={() => onModeChange("progressive")}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
          mode === "progressive"
            ? "bg-gray-900 text-white"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        PROGRESSIVE
      </button>
      <button
        onClick={() => onModeChange("random")}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
          mode === "random"
            ? "bg-gray-900 text-white"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        RANDOM
      </button>
      <Button
        variant="outline"
        size="sm"
        onClick={onShowInfo}
        className="border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-1.5 ml-1"
      >
        What&apos;s this?
        <HelpCircle className="w-4 h-4" />
      </Button>
    </div>
  );
}
