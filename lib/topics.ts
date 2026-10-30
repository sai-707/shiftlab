import type { Topic } from "@/lib/types";

/** One colour per topic, used for dots, charts and bars so a topic looks the same everywhere. */
export const TOPIC_COLOR: Record<Topic, string> = {
  Phishing: "#22d3ee",
  "Brute force": "#a78bfa",
  Network: "#f472b6",
  Malware: "#fbbf24",
  "Web attack": "#34d399",
  Cloud: "#60a5fa",
  Insider: "#a3e635",
  AI: "#e879f9",
};
