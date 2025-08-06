import { createClient } from "@supabase/supabase-js";
import { FeedbackData } from "./emailService";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function saveFeedbackToSupabase(
  feedback: FeedbackData
): Promise<void> {
  const { error } = await supabase.from("feedbacks").insert([
    {
      rating: feedback.rating,
      emoji: feedback.emoji,
      rating_label: feedback.ratingLabel,
      comment: feedback.comment,
      timestamp: feedback.timestamp,
      location: localStorage.getItem("kioskLocation") || "Unknown",
    },
  ]);

  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error("Failed to save feedback to Supabase.");
  }
}

export async function fetchFeedbacks(): Promise<FeedbackData[]> {
  const { data, error } = await supabase
    .from("feedbacks")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error);
    throw new Error("Failed to fetch feedbacks from Supabase.");
  }

  return data as FeedbackData[];
}
