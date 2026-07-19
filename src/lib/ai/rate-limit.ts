const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS = 5;
const ACTIVE_LOCK_TTL_MS = 30 * 1000;

type RateEntry = { timestamps: number[]; activeSince: number | null };
export type AiRequestDecision = "acquired" | "active" | "rate_limited";
const store = new Map<string, RateEntry>();

export function beginAiRequest(userId: string): AiRequestDecision {
  const now = Date.now();
  const entry = store.get(userId) ?? { timestamps: [], activeSince: null };
  entry.timestamps = entry.timestamps.filter((timestamp) => now - timestamp < WINDOW_MS);
  if (entry.activeSince && now - entry.activeSince >= ACTIVE_LOCK_TTL_MS) entry.activeSince = null;

  if (entry.activeSince) {
    store.set(userId, entry);
    return "active";
  }
  if (entry.timestamps.length >= MAX_REQUESTS) {
    store.set(userId, entry);
    return "rate_limited";
  }

  entry.activeSince = now;
  entry.timestamps.push(now);
  store.set(userId, entry);
  return "acquired";
}

export function finishAiRequest(userId: string) {
  const entry = store.get(userId);
  if (entry) entry.activeSince = null;
}
