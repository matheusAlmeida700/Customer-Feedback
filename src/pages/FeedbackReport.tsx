import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeedbackData } from "@/services/emailService";
import { fetchFeedbacks } from "@/services/supabaseService";
import { Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadFeedbacks() {
      try {
        const data = await fetchFeedbacks();
        setFeedbacks(data);
      } catch (error) {
        console.error("Failed to fetch feedbacks:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFeedbacks();
  }, []);
  console.log(feedbacks);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex justify-center px-8 pt-24 pb-8">
      <div className="w-full max-w-7xl">
        <Button
          className="bg-slate-800 text-lg rounded-full text-white hover:scale-105 transition-all hover:bg-slate-800/90 fixed top-6 left-6 z-50"
          onClick={() => navigate("/")}
        >
          <Home />
          Home
        </Button>
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            User Feedbacks
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Real experiences from real users
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedbacks.map((fb) => (
            <Card
              key={fb.timestamp}
              className="bg-card/90 border border-border shadow-xl backdrop-blur-md transition-transform hover:scale-[1.02] duration-200"
            >
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between text-2xl">
                  <span>{fb.emoji}</span>
                  <span className="text-base text-muted-foreground">
                    {new Date(fb.timestamp).toLocaleString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Rating: {fb.rating} – {fb.rating_label}
                  </h3>
                </div>

                <div className="text-base text-foreground/90">
                  {fb.comment ? (
                    <p className="italic">"{fb.comment}"</p>
                  ) : (
                    <p className="italic text-muted-foreground">
                      No comment provided.
                    </p>
                  )}
                </div>

                <div className="text-base text-foreground/90 pt-2 border-t border-border">
                  Location: <span className="font-semibold">{fb.location}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {feedbacks.length === 0 && (
          <p className="text-center text-muted-foreground mt-12 text-lg">
            No feedbacks yet.
          </p>
        )}
      </div>
    </div>
  );
}
