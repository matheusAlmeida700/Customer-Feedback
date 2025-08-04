import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LocationSetupModalProps {
  isOpen: boolean;
  onLocationSet: (location: string) => void;
}

export function LocationSetupModal({
  isOpen,
  onLocationSet,
}: LocationSetupModalProps) {
  const [location, setLocation] = useState("");

  const handleSubmit = () => {
    const trimmedLocation = location.trim();
    if (trimmedLocation) {
      onLocationSet(trimmedLocation);
      setLocation("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md md:max-w-lg p-6 md:p-8 rounded-2xl shadow-[var(--shadow-modal)] border-2"
        style={{ boxShadow: "var(--shadow-modal)" }}
      >
        <DialogHeader className="text-center space-y-4">
          <DialogTitle className="text-2xl md:text-3xl font-bold">
            Setup Location
          </DialogTitle>
          <p className="text-lg md:text-xl text-muted-foreground">
            Please enter where this tablet is located
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div>
            <label className="text-base md:text-lg font-medium text-foreground mb-3 block">
              Location (required):
            </label>
            <Input
              placeholder="e.g., Bathroom 2, Kitchen, Reception..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-base md:text-lg p-4 rounded-xl border-2"
              autoFocus
            />
          </div>

          <Button
            variant="confirm"
            size="kiosk"
            onClick={handleSubmit}
            disabled={!location.trim()}
            className="w-full bg-green-600 hover:bg-green-500"
          >
            Save Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
