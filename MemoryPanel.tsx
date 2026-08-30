"use client";

import { useState, useEffect, useCallback } from "react";
import type { Memory } from "@/types/cognos";
import { TIER_META } from "@/types/cognos";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function MemoryPanel({ isOpen, onClose }: Props) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Memory["tier"] | "all">("all");
  const [adding, setAdding] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newTier, setNewTier] = useState<Memory["tier"]>("medium");

  const fetchMemories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/memory");
      const data = await res.json();
      setMemories(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchMemories();
  }, [isOpen, fetchMemories]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/memory?id=${id}`, { method: "DELETE" });
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAdd = async () => {
    if (!newKey.trim() || !newValue.trim()) return;
    const res = await fetch("/api/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier: newTier, key: newKey, value: newValue }),
    });
    const mem = await res.json();
    setMemories((prev) => [mem, ...prev]);
    setNewKey("");
    setNewValue("");
    setAdding(false);
  };

  const filtered =
    filter === "all" ? memories : memories.filter((m) => m.tier === filter);

  const tiers: Array<Memory["tier"] | "all"> = ["all", "mythic", "long", "medium", "short"];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.7)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "#080b18",
          border: "1px solid #1a1f3a",
          maxHeight: "80vh",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid #1a1f3a" }}
        >
          <div>
            <h2 className="font-semibold" style={{ color: "#e2e8f0" }}>
              ⬡ Continuity Memory
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
              {memories.length} stored{" "}
              {memories.length === 1 ? "memory" : "memories"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdding(!adding)}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{
                background: adding ? "#4f7aff" : "#1a1f3a",
                color: adding ? "white" : "#94a3b8",
              }}
            >
              + Add
            </button>
            <button
              onClick={onClose}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ background: "#1a1f3a", color: "#94a3b8" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Add form */}
        {adding && (
          <div className="px-5 py-4" style={{ borderBottom: "1px solid #1a1f3a", background: "#0c0f1e" }}>
            <div className="space-y-3">
              <div className="flex gap-2">
                {(["short", "medium", "long", "mythic"] as Memory["tier"][]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewTier(t)}
                    className="flex-1 text-xs py-1.5 rounded-lg transition-colors capitalize"
                    style={{
                      background: newTier === t ? `${TIER_META[t].color}22` : "#1a1f3a",
                      color: newTier === t ? TIER_META[t].color : "#64748b",
                      border: `1px solid ${newTier === t ? TIER_META[t].color + "44" : "transparent"}`,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                placeholder="Key (e.g. preferred_style)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg outline-none"
                style={{
                  background: "#080b18",
                  border: "1px solid #1a1f3a",
                  color: "#e2e8f0",
                }}
              />
              <textarea
                placeholder="Value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                rows={2}
                className="w-full text-sm px-3 py-2 rounded-lg outline-none resize-none"
                style={{
                  background: "#080b18",
                  border: "1px solid #1a1f3a",
                  color: "#e2e8f0",
                }}
              />
              <button
                onClick={handleAdd}
                className="w-full text-sm py-2 rounded-lg font-medium transition-colors"
                style={{ background: "#4f7aff", color: "white" }}
              >
                Store Memory
              </button>
            </div>
          </div>
        )}

        {/* Tier filter */}
        <div
          className="flex gap-1 px-4 py-2 overflow-x-auto"
          style={{ borderBottom: "1px solid #1a1f3a" }}
        >
          {tiers.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="flex-shrink-0 text-xs px-3 py-1 rounded-full capitalize transition-colors"
              style={{
                background:
                  filter === t
                    ? t === "all"
                      ? "#4f7aff22"
                      : `${TIER_META[t].color}22`
                    : "#1a1f3a",
                color:
                  filter === t
                    ? t === "all"
                      ? "#4f7aff"
                      : TIER_META[t].color
                    : "#64748b",
              }}
            >
              {t === "all" ? "All" : TIER_META[t].label}
            </button>
          ))}
        </div>

        {/* Memory list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="text-center py-8 text-sm" style={{ color: "#475569" }}>
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8" style={{ color: "#475569" }}>
              <div className="text-2xl mb-2">⬡</div>
              <div className="text-sm">No memories stored</div>
              <div className="text-xs mt-1">COGNOS will learn as you converse</div>
            </div>
          ) : (
            filtered.map((mem) => (
              <div
                key={mem.id}
                className="rounded-xl p-3 flex items-start gap-3"
                style={{
                  background: "#0c0f1e",
                  border: "1px solid #1a1f3a",
                }}
              >
                {/* Tier badge */}
                <div
                  className="flex-shrink-0 text-xs px-2 py-1 rounded-full capitalize mt-0.5"
                  style={{
                    background: `${TIER_META[mem.tier].color}18`,
                    color: TIER_META[mem.tier].color,
                    border: `1px solid ${TIER_META[mem.tier].color}33`,
                  }}
                >
                  {mem.tier}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono mb-0.5" style={{ color: "#64748b" }}>
                    {mem.key}
                  </div>
                  <div className="text-sm" style={{ color: "#c7d2fe" }}>
                    {mem.value}
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(mem.id)}
                  className="flex-shrink-0 text-xs p-1 rounded transition-colors"
                  style={{ color: "#334155" }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLButtonElement).style.color = "#ef4444")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLButtonElement).style.color = "#334155")
                  }
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
