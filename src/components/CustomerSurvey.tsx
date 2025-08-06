import { useEffect, useState } from "react";
import { EmojiRating, RatingOption } from "./EmojiRating";
import { FeedbackModal } from "./FeedbackModal";
import { sendFeedbackEmail, FeedbackData } from "@/services/emailService";
import Swal from "sweetalert2";
import { LocationSetupModal } from "./LocationSetupModal";
import { AlertButton } from "./AlertButton";
import { saveFeedbackToSupabase } from "@/services/supabaseService";

export function CustomerSurvey() {
  const [selectedRating, setSelectedRating] = useState<RatingOption | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<string>("");
  const [isLocationSetupOpen, setIsLocationSetupOpen] = useState(false);

  useEffect(() => {
    const savedLocation = localStorage.getItem("kioskLocation");
    if (savedLocation) {
      setLocation(savedLocation);
    } else {
      setIsLocationSetupOpen(true);
    }
  }, []);

  const handleLocationSet = (newLocation: string) => {
    localStorage.setItem("kioskLocation", newLocation);
    setLocation(newLocation);
    setIsLocationSetupOpen(false);
  };

  const handleRatingSelect = (rating: RatingOption) => {
    setSelectedRating(rating);
    setIsModalOpen(true);
  };

  const handleConfirmFeedback = async (comment: string) => {
    if (!selectedRating) return;

    setIsSubmitting(true);

    try {
      const feedbackData: FeedbackData = {
        rating: selectedRating.value,
        emoji: selectedRating.emoji,
        rating_label: selectedRating.label,
        comment: comment.trim() || undefined,
        timestamp: new Date().toISOString(),
        location: navigator.userAgent,
      };

      await sendFeedbackEmail(feedbackData);
      await saveFeedbackToSupabase(feedbackData);

      setIsModalOpen(false);
      setSelectedRating(null);

      await Swal.fire({
        title: "Thank you!",
        text: "Thank you for your feedback!",
        icon: "success",
        confirmButtonText: "You're welcome!",
        confirmButtonColor: "hsl(var(--success))",
        background: "hsl(var(--card))",
        color: "hsl(var(--card-foreground))",
        customClass: {
          popup: "rounded-2xl shadow-2xl",
          confirmButton: "rounded-xl px-8 py-3 text-lg font-semibold",
        },
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Error sending feedback:", error);

      await Swal.fire({
        title: "Oops!",
        text: "There was an error sending your feedback. Please try again or contact support.",
        icon: "error",
        confirmButtonText: "Try Again",
        confirmButtonColor: "hsl(var(--destructive))",
        background: "hsl(var(--card))",
        color: "hsl(var(--card-foreground))",
        customClass: {
          popup: "rounded-2xl shadow-2xl",
          confirmButton: "rounded-xl px-8 py-3 text-lg font-semibold",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRating(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-8">
      <div className="w-full max-w-7xl">
        <EmojiRating onSelect={handleRatingSelect} />

        <FeedbackModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          selectedRating={selectedRating}
          onConfirm={handleConfirmFeedback}
          isSubmitting={isSubmitting}
        />
        <LocationSetupModal
          isOpen={isLocationSetupOpen}
          onLocationSet={handleLocationSet}
        />

        {location && <AlertButton location={location} />}
      </div>
    </div>
  );
}
