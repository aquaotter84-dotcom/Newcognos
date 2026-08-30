export type Session = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  councilTrace: CouncilTrace | null;
  createdAt: string;
};

export type CouncilTrace = {
  observer: Record<string, unknown>;
  strategist: Record<string, unknown>;
  critic: Record<string, unknown>;
  governor: Record<string, unknown>;
  finalResponse: string;
};

export type Memory = {
  id: string;
  sessionId: string | null;
  tier: "short" | "medium" | "long" | "mythic";
  operator: string;
  key: string;
  value: string;
  relevanceScore: number;
  createdAt: string;
  updatedAt: string;
};

export type OperatorKey = "observer" | "strategist" | "critic" | "governor";

export const OPERATOR_META: Record<
  OperatorKey,
  { label: string; layer: string; color: string; icon: string }
> = {
  observer: {
    label: "Observer",
    layer: "Guidance",
    color: "#38bdf8",
    icon: "◎",
  },
  strategist: {
    label: "Strategist",
    layer: "Navigation",
    color: "#a78bfa",
    icon: "◈",
  },
  critic: {
    label: "Critic",
    layer: "Oversight",
    color: "#f59e0b",
    icon: "◉",
  },
  governor: {
    label: "Governor",
    layer: "Sovereignty",
    color: "#34d399",
    icon: "◆",
  },
};

export const TIER_META: Record<
  Memory["tier"],
  { label: string; color: string; description: string }
> = {
  short: {
    label: "Short-term",
    color: "#64748b",
    description: "Current session context",
  },
  medium: {
    label: "Medium-term",
    color: "#4f7aff",
    description: "Active projects & decisions",
  },
  long: {
    label: "Long-term",
    color: "#a78bfa",
    description: "Stable preferences & patterns",
  },
  mythic: {
    label: "Mythic",
    color: "#f59e0b",
    description: "Identity, purpose & direction",
  },
};
