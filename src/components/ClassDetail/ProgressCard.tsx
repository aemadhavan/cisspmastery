import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressCardProps {
  className: string;
  overallProgress: number;
  totalStudied: number;
  totalCards: number;
}

export function ProgressCard({
  className,
  overallProgress,
  totalStudied,
  totalCards,
}: ProgressCardProps) {
  return (
    <Card className="bg-white border-gray-200 mb-6 shadow-sm">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Overall Progress</h2>
          <span className="text-2xl font-bold text-blue-600">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-2 mb-3" aria-label={`${className} overall progress`} />
        <p className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded inline-block">
          {totalStudied} of {totalCards} unique cards studied
        </p>
      </CardContent>
    </Card>
  );
}
