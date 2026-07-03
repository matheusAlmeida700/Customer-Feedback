import { useEffect, useState } from "react";
import { EmojiRating, RatingOption } from "./EmojiRating";
import { FeedbackModal } from "./FeedbackModal";
import {
  sendFeedbackEmail,
  FeedbackData,
  CooldownError,
} from "@/services/emailService";
import Swal from "sweetalert2";
import { LocationSetupModal } from "./LocationSetupModal";
import { AlertButton } from "./AlertButton";
import { saveFeedbackToSupabase } from "@/services/supabaseService";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { MapPin, Newspaper } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export function CustomerSurvey() {
  const [selectedRating, setSelectedRating] = useState<RatingOption | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<string>("");
  const [isLocationSetupOpen, setIsLocationSetupOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);
  const [isDeleteLocationOpen, setIsDeleteLocationOpen] = useState(false);

  const correctPassword = atob("UHIwdGV4Y2xlYW5pbmc=");
  const navigate = useNavigate();

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

  const handleDeleteLocation = () => {
    localStorage.removeItem("kioskLocation");
    setLocation("");
    setIsDeleteLocationOpen(false);
    setIsLocationSetupOpen(true);
  };

  const handleRatingSelect = (rating: RatingOption) => {
    setSelectedRating(rating);
    setIsModalOpen(true);
  };

  const handleConfirmFeedback = async () => {
    if (!selectedRating) return;
    setIsSubmitting(true);

    try {
      const feedbackData: FeedbackData = {
        rating: selectedRating.value,
        emoji: selectedRating.emoji,
        rating_label: selectedRating.label,
        timestamp: new Date().toISOString(),
        location: navigator.userAgent,
      };

      setTimeout(() => {
        setIsModalOpen(false);
      }, 2000);
      await sendFeedbackEmail(location, feedbackData);

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

      if (error instanceof CooldownError) {
        const initialSeconds = Math.ceil(error.remainingMs / 1000);

        await Swal.fire({
          title: "Please hold on",
          html: `You already sent a feedback recently.<br/>You can send another one in <b id="cooldown-timer">${initialSeconds}</b>s.`,
          icon: "info",
          confirmButtonText: "Got it",
          confirmButtonColor: "hsl(var(--primary))",
          background: "hsl(var(--card))",
          color: "hsl(var(--card-foreground))",
          customClass: {
            popup: "rounded-2xl shadow-2xl",
            confirmButton: "rounded-xl px-8 py-3 text-lg font-semibold",
          },
          timer: error.remainingMs,
          timerProgressBar: true,
          didOpen: () => {
            const timerEl = document.getElementById("cooldown-timer");
            const interval = setInterval(() => {
              const secondsLeft = Math.ceil((Swal.getTimerLeft() ?? 0) / 1000);
              if (timerEl) {
                timerEl.textContent = String(Math.max(secondsLeft, 0));
              }
            }, 200);
            Swal.getPopup()?.addEventListener("swal-close", () =>
              clearInterval(interval),
            );
          },
        });
      } else {
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
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRating(null);
  };

  const handlePasswordCheck = async () => {
    setIsCheckingPassword(true);
    setTimeout(() => {
      if (passwordInput === correctPassword) {
        setIsPasswordModalOpen(false);
        setPasswordInput("");
        navigate("/report");
      } else {
        setIsPasswordModalOpen(false);
        Swal.fire({
          title: "Access Denied",
          text: "Incorrect password. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "hsl(var(--destructive))",
          background: "hsl(var(--card))",
          color: "hsl(var(--card-foreground))",
          customClass: {
            popup: "rounded-2xl shadow-2xl",
            confirmButton: "rounded-xl px-8 py-3 text-lg font-semibold",
          },
        });
      }
      setIsCheckingPassword(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center px-8 py-24">
      <div className="w-full max-w-7xl">
        <Button
          className="bg-slate-800 text-lg rounded-full text-white hover:scale-105 transition-all hover:bg-slate-800/90 absolute top-6 left-6"
          onClick={() => setIsPasswordModalOpen(true)}
        >
          <Newspaper />
          Feedback Report
        </Button>

        <span
          onClick={() => setIsDeleteLocationOpen(true)}
          className="flex gap-1 text-lg text-foreground rounded-full absolute top-6 right-6 cursor-pointer hover:underline"
        >
          <MapPin className="w-5" />
          {location}
        </span>

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

        <Dialog
          open={isDeleteLocationOpen}
          onOpenChange={setIsDeleteLocationOpen}
        >
          <DialogContent className="rounded-2xl shadow-lg border-2">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                Are you sure?
              </DialogTitle>
              <DialogDescription className="text-center text-xl pt-4 text-muted-foreground">
                Do you really want to delete this location?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-4 pt-4">
              <Button
                variant="cancel"
                size="kiosk"
                onClick={() => setIsDeleteLocationOpen(false)}
                className="flex-1 bg-orange-100 text-gray-600 hover:bg-orange-50"
              >
                No
              </Button>
              <Button
                variant="confirm"
                size="kiosk"
                onClick={handleDeleteLocation}
                className="flex-1 bg-red-600 text-white hover:bg-red-500"
              >
                Yes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {location && <AlertButton location={location} />}
      </div>
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="rounded-2xl shadow-[var(--shadow-modal)] border-2">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Enter Access Password
            </DialogTitle>
            <DialogDescription className="text-lg text-center text-muted-foreground">
              Only authorized users can view the reports.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter password"
              className="border rounded-lg px-4 py-3 text-lg w-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <DialogFooter className="gap-4 pt-4">
            <DialogClose asChild>
              <Button className="flex-1 bg-orange-100 text-gray-600 hover:bg-orange-50 border-2 border-border min-h-12 text-base">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handlePasswordCheck}
              disabled={isCheckingPassword || !passwordInput}
              className="flex-1 bg-green-600 hover:bg-green-500 min-h-12 text-base"
            >
              {isCheckingPassword ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Checking...
                </>
              ) : (
                "Enter"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
