import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeedbackData } from "@/services/emailService";
import { fetchFeedbacks } from "@/services/supabaseService";
import { Home, Sheet } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ date: "", rating: "" });
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchFeedbacks();
        console.log(data);

        setFeedbacks(data);
      } catch (error) {
        console.error("Failed to fetch feedbacks:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesDate = filters.date
      ? new Date(fb.timestamp).toISOString().slice(0, 10) === filters.date
      : true;

    const matchesRating = filters.rating
      ? fb.rating === Number(filters.rating)
      : true;

    return matchesDate && matchesRating;
  });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredFeedbacks.map((fb) => ({
        Date: new Date(fb.timestamp).toLocaleString(),
        Emoji: fb.emoji,
        Rating: fb.rating,
        "Rating Label": fb.rating_label,
        Comment: fb.comment || "No comments",
        Location: fb.location,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Feedbacks");
    XLSX.writeFile(workbook, "feedbacks.xlsx");
  };

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

        <div className="flex flex-wrap gap-4 mb-8">
          <input
            type="date"
            value={filters.date}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, date: e.target.value }))
            }
            className="border border-border rounded-full px-3 py-2 bg-background"
          />

          <select
            value={filters.rating}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, rating: e.target.value }))
            }
            className="border border-border rounded-full px-3 py-2 bg-background"
          >
            <option value="">All</option>
            {[1, 2, 3].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <Button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full text-md"
          >
            <Sheet />
            Export Excel
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeedbacks.map((fb) => (
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

                <h3 className="text-lg font-semibold text-foreground">
                  Rating: {fb.rating} – {fb.rating_label}
                </h3>

                <p className="text-base text-foreground/90 italic">
                  {fb.comment || "No comment provided."}
                </p>

                <div className="text-base text-foreground/90 pt-2 border-t border-border">
                  Location: <span className="font-semibold">{fb.location}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!loading && filteredFeedbacks.length === 0 && (
          <p className="text-center text-muted-foreground mt-12 text-lg">
            No feedbacks found for this filter.
          </p>
        )}
      </div>
    </div>
  );
}
