import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { sendAlertEmail } from "@/services/emailService";
import Swal from "sweetalert2";

interface AlertButtonProps {
  location: string;
}

export function AlertButton({ location }: AlertButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAlert = async () => {
    setIsSubmitting(true);

    try {
      await sendAlertEmail(location);

      await Swal.fire({
        title: "Alert Sent!",
        text: "The alert has been sent successfully.",
        icon: "success",
        confirmButtonText: "OK",
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
      console.error("Error sending alert:", error);

      await Swal.fire({
        title: "Oops!",
        text: "There was an error sending the alert. Please try again.",
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

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="lg"
          className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200 text-2xl"
          disabled={isSubmitting}
        >
          🚨
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl shadow-[var(--shadow-modal)] border-2">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-center">
            Send Alert
          </AlertDialogTitle>
          <AlertDialogDescription className="text-lg text-center text-muted-foreground">
            Are you sure you want to send an alert for "{location}"?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-4">
          <AlertDialogCancel className="flex-1 bg-orange-100 text-gray-600 hover:bg-orange-50 min-h-12 text-base">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAlert}
            disabled={isSubmitting}
            className="flex-1 bg-red-600 hover:bg-red-500 min-h-12 text-base"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Sending...
              </>
            ) : (
              "Send Alert"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}