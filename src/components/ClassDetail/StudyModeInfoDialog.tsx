import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StudyModeInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudyModeInfoDialog({ open, onOpenChange }: StudyModeInfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Study Modes</DialogTitle>
          <div className="space-y-4 pt-4 text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Progressive Mode</h4>
              <p className="text-sm">
                Focuses on cards that need the most attention. Shows cards with low confidence
                ratings or those due for review based on spaced repetition.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Random Mode</h4>
              <p className="text-sm">
                Cards are shuffled randomly to test your knowledge in an unpredictable order.
                Perfect for simulating exam conditions.
              </p>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
