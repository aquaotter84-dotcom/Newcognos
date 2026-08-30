"use client";

const STAGES = [
  { key: "observer", label: "Observer", icon: "◎", color: "#38bdf8" },
  { key: "strategist", label: "Strategist", icon: "◈", color: "#a78bfa" },
  { key: "critic", label: "Critic", icon: "◉", color: "#f59e0b" },
  { key: "governor", label: "Governor", icon: "◆", color: "#34d399" },
  { key: "orchestrator", label: "Synthesizing", icon: "⬡", color: "#4f7aff" },
];

type Props = {
  stage?: number; // 0-4
};

export default function ThinkingIndicator({ stage = 0 }: Props) {
  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold council-active"
        style={{
          background: "linear-gradient(135deg, #0c0f1e, #1a1f3a)",
          border: "1px solid #4f7aff44",
          color: "#4f7aff",
        }}
      >
        C
      </div>

      <div
        className="flex-1 rounded-2xl rounded-tl-sm px-4 py-3"
        style={{ background: "#0c0f1e", border: "1px solid #1a1f3a", maxWidth: "360px" }}
      >
        {/* Council pipeline */}
        <div className="flex items-center gap-1.5 mb-3">
          {STAGES.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <div
                className="flex items-center gap-1 text-xs transition-all duration-500"
                style={{
                  color: i <= stage ? s.color : "#1e293b",
                  opacity: i === stage ? 1 : i < stage ? 0.6 : 0.3,
                }}
              >
                <span>{s.icon}</span>
                {i === stage && (
                  <span className="text-xs font-medium" style={{ color: s.color }}>
                    {s.label}
                  </span>
                )}
              </div>
              {i < STAGES.length - 1 && (
                <span className="text-xs" style={{ color: i < stage ? "#1e3a5f" : "#0f172a" }}>
                  →
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex gap-1.5 items-center">
          <div
            className="thinking-dot w-1.5 h-1.5 rounded-full"
            style={{ background: STAGES[Math.min(stage, STAGES.length - 1)].color }}
          />
          <div
            className="thinking-dot w-1.5 h-1.5 rounded-full"
            style={{ background: STAGES[Math.min(stage, STAGES.length - 1)].color }}
          />
          <div
            className="thinking-dot w-1.5 h-1.5 rounded-full"
            style={{ background: STAGES[Math.min(stage, STAGES.length - 1)].color }}
          />
          <span className="text-xs ml-1" style={{ color: "#475569" }}>
            {STAGES[Math.min(stage, STAGES.length - 1)].label === "Synthesizing"
              ? "Forming unified response…"
              : `${STAGES[Math.min(stage, STAGES.length - 1)].label} processing…`}
          </span>
        </div>
      </div>
    </div>
  );
}
