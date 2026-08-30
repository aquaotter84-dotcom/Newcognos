"use client";

import type { Session } from "@/types/cognos";

type Props = {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onOpenMemory: () => void;
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onOpenMemory,
  isOpen,
  onClose,
}: Props) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative top-0 left-0 h-full z-40 flex flex-col
          transition-transform duration-300 lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          width: "240px",
          background: "#080b18",
          borderRight: "1px solid #1a1f3a",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div className="p-5 pb-4" style={{ borderBottom: "1px solid #1a1f3a" }}>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm council-active"
              style={{ background: "linear-gradient(135deg, #1e3a8a, #4f7aff22)", border: "1px solid #4f7aff44" }}
            >
              ⬡
            </div>
            <div>
              <div className="font-bold text-sm tracking-widest" style={{ color: "#c7d2fe", letterSpacing: "0.15em" }}>
                COGNOS
              </div>
              <div className="text-xs" style={{ color: "#334155" }}>
                Cognitive Architecture
              </div>
            </div>
          </div>
        </div>

        {/* New session button */}
        <div className="p-3">
          <button
            onClick={onNewSession}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: "linear-gradient(135deg, #1e3a8a22, #4f7aff22)",
              border: "1px solid #4f7aff33",
              color: "#7cb9ff",
            }}
          >
            <span>+</span>
            <span>New Session</span>
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          <div className="text-xs px-2 py-1 mb-1" style={{ color: "#334155" }}>
            SESSIONS
          </div>
          {sessions.length === 0 ? (
            <div className="text-xs px-3 py-2" style={{ color: "#334155" }}>
              No sessions yet
            </div>
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="group relative">
                <button
                  onClick={() => onSelectSession(s.id)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    background:
                      activeSessionId === s.id ? "#1a1f3a" : "transparent",
                    color:
                      activeSessionId === s.id ? "#c7d2fe" : "#64748b",
                  }}
                >
                  <div className="truncate pr-5">{s.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#334155" }}>
                    {new Date(s.updatedAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(s.id);
                  }}
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 rounded transition-all text-xs"
                  style={{ color: "#475569" }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLButtonElement).style.color = "#ef4444")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLButtonElement).style.color = "#475569")
                  }
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Memory button */}
        <div className="p-3" style={{ borderTop: "1px solid #1a1f3a" }}>
          <button
            onClick={onOpenMemory}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
            style={{
              background: "#0c0f1e",
              border: "1px solid #1a1f3a",
              color: "#64748b",
            }}
          >
            <span style={{ color: "#a78bfa" }}>⬡</span>
            <span>Continuity Memory</span>
          </button>

          {/* Architecture legend */}
          <div className="mt-3 px-1 space-y-1">
            {[
              { icon: "◎", label: "Observer", sub: "Guidance", color: "#38bdf8" },
              { icon: "◈", label: "Strategist", sub: "Navigation", color: "#a78bfa" },
              { icon: "◉", label: "Critic", sub: "Oversight", color: "#f59e0b" },
              { icon: "◆", label: "Governor", sub: "Sovereignty", color: "#34d399" },
            ].map((op) => (
              <div key={op.label} className="flex items-center gap-2 py-0.5">
                <span className="text-xs" style={{ color: op.color }}>{op.icon}</span>
                <span className="text-xs" style={{ color: "#475569" }}>
                  {op.label}
                </span>
                <span className="text-xs ml-auto" style={{ color: "#1e293b" }}>
                  {op.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
