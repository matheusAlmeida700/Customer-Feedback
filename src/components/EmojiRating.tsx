import { Button } from "@/components/ui/button";

export interface RatingOption {
  id: string;
  label: string;
  image: string;
  emoji: string;
  value: number;
  color: string;
}

export const ratingOptions: RatingOption[] = [
  {
    id: "very-bad",
    label: "Very Bad",
    image: "/verybad.jpg",
    emoji: "😞",
    value: 1,
    color: "very-bad",
  },
  {
    id: "bad",
    label: "Bad",
    image: "/bad.jpg",
    emoji: "🙁",
    value: 2,
    color: "bad",
  },
  {
    id: "regular",
    label: "Regular",
    image: "/regular.jpg",
    emoji: "😐",
    value: 3,
    color: "regular",
  },
  {
    id: "good",
    label: "Good",
    image: "/good.jpg",
    emoji: "😐",
    value: 4,
    color: "good",
  },
  {
    id: "excellent",
    label: "Excellent",
    image: "/excellent.jpg",
    emoji: "😄",
    value: 5,
    color: "excellent",
  },
];

interface EmojiRatingProps {
  onSelect: (rating: RatingOption) => void;
}

export function EmojiRating({ onSelect }: EmojiRatingProps) {
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
          How was your experience?
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground">
          Tap an emoji to rate your experience
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 md:gap-8 w-full">
        {ratingOptions.map((option) => (
          <Button
            key={option.id}
            variant="kiosk"
            size="emoji"
            onClick={() => onSelect(option)}
            className={`
              flex flex-col items-center justify-center
              hover:scale-105 active:scale-95
              transition-all duration-300
              shadow-[var(--shadow-emoji)]
              hover:shadow-[var(--shadow-soft)]
              border-2 border-transparent
              hover:border-${option.color}/20
              bg-gradient-to-br from-card to-card/80
              backdrop-blur-sm
            `}
            style={{
              boxShadow: "var(--shadow-emoji)",
            }}
          >
            <img
              src={option.image}
              alt={option.label}
              className="w-36 h-36 mb-2 rounded-full object-cover"
            />
            <span className="text-base font-medium text-foreground/80">
              {option.label}
            </span>
          </Button>
        ))}
      </div>

      <div className="w-full max-w-2xl mx-auto mt-8 mb-8">
        <div className="h-4 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-400 to-green-500 rounded-full shadow-inner"></div>
        <div className="flex justify-between mt-2 text-md text-muted-foreground">
          <span>Very Bad</span>
          <span>Excellent</span>
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-base md:text-lg text-muted-foreground">
          Your feedback helps us improve our service
        </p>
      </div>
    </div>
  );
}
