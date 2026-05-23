import { useState } from "react";
import { Button } from "@/components/ui/button";
import { sendAlertEmail } from "@/services/emailService";
import Swal from "sweetalert2";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Card } from "./ui/card";
import { LOCATION_PASSWORDS } from "@/lib/locationPasswords";

interface AlertButtonProps {
  location: string;
}

const urgencyLevels = [
  {
    id: "emergency",
    label: "🚨 Emergency - Immediate",
    color: "border-red-500 bg-red-50 hover:bg-red-100",
  },
  {
    id: "non-immediate",
    label: "⚠️ Non-immediate Emergency",
    color: "border-orange-500 bg-orange-50 hover:bg-orange-100",
  },
  {
    id: "dayporter",
    label: "🧹 Dayporter Service - Non-urgent",
    color: "border-yellow-500 bg-yellow-50 hover:bg-yellow-100",
  },
];

const validateLocationPassword = (
  location: string,
  inputPassword: string,
): boolean => {
  const encoded = LOCATION_PASSWORDS[location];
  if (!encoded) return false;

  const decodedPassword = atob(encoded);
  return inputPassword === decodedPassword;
};

export function AlertButton({ location }: AlertButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUrgency, setSelectedUrgency] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const handleAlert = async () => {
    if (!selectedUrgency) return;

    const isValid = validateLocationPassword(
      location
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, ""),
      password,
    );

    if (!isValid) {
      setPasswordError(true);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => setIsOpen(false), 1500);

    try {
      const urgencyLabel =
        urgencyLevels.find((u) => u.id === selectedUrgency)?.label || "";
      await sendAlertEmail(location, urgencyLabel);

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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="lg"
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-2xl hover:scale-105 transition-all duration-200 text-xl"
          onClick={() => setIsOpen(true)}
          disabled={isSubmitting}
        >
          🚨 Press Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl shadow-[var(--shadow-modal)] border-2">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Send Alert
          </DialogTitle>
          <DialogDescription className="text-lg text-center text-muted-foreground">
            Select urgency level for &quot;{location}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {urgencyLevels.map((urgency) => (
            <Card
              key={urgency.id}
              className={`p-4 cursor-pointer border-2 transition-all ${
                selectedUrgency === urgency.id
                  ? `${urgency.color} border-opacity-100`
                  : "border-border hover:border-gray-300"
              }`}
              onClick={() => setSelectedUrgency(urgency.id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-lg">{urgency.label}</span>
                <div
                  className={`w-5 h-5 rounded-full border-2 ${
                    selectedUrgency === urgency.id
                      ? "bg-primary border-primary"
                      : "border-gray-300"
                  }`}
                />
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-2">
          <label className="font-medium">Authorization Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(false);
            }}
            placeholder="Enter location password"
            className={`w-full rounded-lg border-2 px-3 py-2 text-base outline-none transition ${
              passwordError
                ? "border-red-500 focus:ring-red-500"
                : "border-border focus:ring-primary"
            }`}
          />

          {passwordError && (
            <p className="text-sm text-red-500">
              Invalid password for this location.
            </p>
          )}
        </div>

        <DialogFooter className="gap-4">
          <DialogClose asChild>
            <Button className="flex-1 bg-orange-100 text-gray-600 hover:bg-orange-50 border-2 border-border min-h-12 text-base">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleAlert}
            disabled={isSubmitting || !selectedUrgency || !password}
            className="flex-1 bg-red-600 hover:bg-red-500 min-h-12 text-base disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Sending...
              </>
            ) : (
              "Send Alert"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
