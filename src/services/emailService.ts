import emailjs from "@emailjs/browser";

export interface FeedbackData {
  rating: number;
  emoji?: string;
  ratingLabel: string;
  comment?: string;
  timestamp: string;
  userAgent: string;
}

export async function sendFeedbackEmail(
  feedbackData: FeedbackData
): Promise<void> {
  try {
    const emoji = feedbackData.emoji || getRatingEmoji(feedbackData.rating);

    const message = `
📊 New Customer Satisfaction Feedback

- Rating: ${emoji} ${feedbackData.ratingLabel} (${feedbackData.rating}/5)
- Comment: ${feedbackData.comment || "No comment provided"}
- Timestamp: ${formatTimestamp(feedbackData.timestamp)}
- Device Info: ${feedbackData.userAgent}

✅ This feedback was submitted via the satisfaction kiosk.
    `;

    const templateParams = {
      name: "Customer Satisfaction Alert",
      message: message,
    };

    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    if (response.status !== 200) {
      throw new Error(`EmailJS error: ${response.text}`);
    }

    console.log("Feedback email sent successfully:", response);
  } catch (error) {
    console.error("Failed to send feedback email:", error);
    throw error;
  }
}

function getRatingEmoji(rating: number): string {
  const emojiMap: { [key: number]: string } = {
    1: "😞",
    2: "🙁",
    3: "😐",
    4: "🙂",
    5: "😄",
  };
  return emojiMap[rating] || "❓";
}

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
