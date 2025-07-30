import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RatingOption } from "./EmojiRating";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRating: RatingOption | null;
  onConfirm: (comment: string) => void;
  isSubmitting: boolean;
}

export function FeedbackModal({
  isOpen,
  onClose,
  selectedRating,
  onConfirm,
  isSubmitting,
}: FeedbackModalProps) {
  const [comment, setComment] = useState("");

  const handleConfirm = () => {
    onConfirm(comment);
    setComment("");
  };

  const handleClose = () => {
    onClose();
    setComment("");
  };

  if (!selectedRating) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-md md:max-w-lg lg:max-w-xl p-6 md:p-8 rounded-2xl shadow-[var(--shadow-modal)] border-2"
        style={{ boxShadow: "var(--shadow-modal)" }}
      >
        <DialogHeader className="text-center space-y-4">
          <div className="flex flex-col items-center gap-4">
            <img
              src={selectedRating.image}
              alt={selectedRating.label}
              className="w-16 h-16 md:w-36 md:h-36 mb-2 rounded-full object-cover"
            />
            <DialogTitle className="text-2xl md:text-3xl font-bold">
              {selectedRating.label}
            </DialogTitle>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground">
            You selected "{selectedRating.label}" rating
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div>
            <label className="text-base md:text-lg font-medium text-foreground mb-3 block">
              Tell us how we can improve (optional):
            </label>
            <Textarea
              placeholder="Share your thoughts on how we can make your experience better..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-24 md:min-h-32 text-base md:text-lg p-4 rounded-xl border-2 resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="cancel"
              size="kiosk"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 bg-orange-100 text-gray-600 hover:bg-orange-50"
            >
              Cancel
            </Button>
            <Button
              variant="confirm"
              size="kiosk"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-500 px-3"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                "Confirm Feedback"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
