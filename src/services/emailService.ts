import emailjs from "@emailjs/browser";

export class CooldownError extends Error {
  remainingMs: number;

  constructor(remainingMs: number) {
    super(
      `Please wait ${Math.ceil(remainingMs / 1000)}s before sending again.`,
    );
    this.name = "CooldownError";
    this.remainingMs = remainingMs;
  }
}

export interface FeedbackData {
  rating: number;
  emoji?: string;
  rating_label: string;
  timestamp: string;
  location: string;
}

const FEEDBACK_COOLDOWN_MS = 30 * 1000;
const ALERT_COOLDOWN_MS = 30 * 1000;

const getFeedbackEmail = (rating: number): string => {
  return rating === 1
    ? import.meta.env.VITE_EMAILJS_BAD_FEEDBACK_EMAIL
    : import.meta.env.VITE_EMAILJS_REGULAR_FEEDBACK_EMAIL;
};

export async function sendFeedbackEmail(
  location: string,
  feedbackData: FeedbackData,
): Promise<void> {
  const lastSent = Number(localStorage.getItem("lastFeedbackSent") || "0");
  const now = Date.now();

  if (now - lastSent < FEEDBACK_COOLDOWN_MS) {
    throw new CooldownError(FEEDBACK_COOLDOWN_MS - (now - lastSent));
  }

  try {
    const emoji = feedbackData.emoji || getRatingEmoji(feedbackData.rating);

    const message = `
📊 New Customer Satisfaction Feedback

- Rating: ${emoji} ${feedbackData.rating_label} (${feedbackData.rating}/3)
- Location: ${location}
- Timestamp: ${formatTimestamp(feedbackData.timestamp)}
- Device Info: ${feedbackData.location}

✅ This feedback was submitted via the satisfaction kiosk.
    `;

    const templateParams = {
      to_email: getFeedbackEmail(feedbackData.rating),
      name: `Alert ${feedbackData.rating_label} (${feedbackData.rating}/3) - ${location}`,
      message: message,
    };

    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    );

    if (response.status !== 200) {
      throw new Error(`EmailJS error: ${response.text}`);
    }

    localStorage.setItem("lastFeedbackSent", now.toString());
    console.log("Feedback email sent successfully:", response);
  } catch (error) {
    console.error("Failed to send feedback email:", error);
    throw error;
  }
}

export async function sendAlertEmail(
  location: string,
  urgencyLevel: string,
): Promise<void> {
  const lastSent = Number(localStorage.getItem("lastAlertSent") || "0");
  const now = Date.now();

  if (now - lastSent < ALERT_COOLDOWN_MS) {
    throw new CooldownError(ALERT_COOLDOWN_MS - (now - lastSent));
  }

  try {
    const message = `
🚨 ALERT TRIGGERED

- Urgency Level: ${urgencyLevel}
- Location: ${location}
- Timestamp: ${formatTimestamp(new Date().toISOString())}
- Device Info: ${navigator.userAgent}

⚠️ This alert was triggered from the satisfaction kiosk at the specified location.
    `;

    const templateParams = {
      to_email: import.meta.env.VITE_EMAILJS_ALERTS_EMAIL,
      name: "Critical Alert Notification",
      message: message,
    };

    const response = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    );

    if (response.status !== 200) {
      throw new Error(`EmailJS error: ${response.text}`);
    }

    localStorage.setItem("lastAlertSent", now.toString());
    console.log("Alert email sent successfully:", response);
  } catch (error) {
    console.error("Failed to send alert email:", error);
    throw error;
  }
}

const getRatingEmoji = (rating: number): string => {
  const emojiMap: { [key: number]: string } = {
    1: "😞",
    2: "😐",
    3: "😄",
  };
  return emojiMap[rating] || "❓";
};

const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
