"use client";

import { useState } from "react";
import type { CouncilTrace as CouncilTraceType, OperatorKey } from "@/types/cognos";
import { OPERATOR_META } from "@/types/cognos";

type Props = {
  trace: CouncilTraceType;
};

export default function CouncilTrace({ trace }: Props) {
  const [activeTab, setActiveTab] = useState<OperatorKey>("observer");

  const operators: OperatorKey[] = ["observer", "strategist", "critic", "governor"];
  const activeData = trace[activeTab];

  return (
    <div className="mt-3 rounded-xl border overflow-hidden" style={{ borderColor: "#1a1f3a", background: "#080b18" }}>
      {/* Header */}
      <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: "1px solid #1a1f3a" }}>
        <span className="text-xs font-mono" style={{ color: "#4f7aff" }}>COUNCIL TRACE</span>
        <span className="text-xs" style={{ color: "#334155" }}>— internal reasoning</span>
      </div>

      {/* Operator tabs */}
      <div className="flex" style={{ borderBottom: "1px solid #1a1f3a" }}>
        {operators.map((op) => {
          const meta = OPERATOR_META[op];
          const isActive = activeTab === op;
          return (
            <button
              key={op}
              onClick={() => setActiveTab(op)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors flex-1 justify-center"
              style={{
                color: isActive ? meta.color : "#64748b",
                background: isActive ? `${meta.color}12` : "transparent",
                borderBottom: isActive ? `2px solid ${meta.color}` : "2px solid transparent",
              }}
            >
              <span>{meta.icon}</span>
              <span className="hidden sm:inline">{meta.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span style={{ color: OPERATOR_META[activeTab].color }} className="text-sm font-semibold">
            {OPERATOR_META[activeTab].icon} {OPERATOR_META[activeTab].label}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#1a1f3a", color: "#64748b" }}>
            {OPERATOR_META[activeTab].layer}
          </span>
        </div>
        <div className="space-y-2">
          {Object.entries(activeData).map(([key, val]) => (
            <div key={key} className="rounded-lg p-3" style={{ background: "#0c0f1e" }}>
              <div className="text-xs font-mono mb-1 capitalize" style={{ color: "#64748b" }}>
                {key.replace(/([A-Z])/g, " $1").toLowerCase()}
              </div>
              <div className="text-sm" style={{ color: "#c7d2fe" }}>
                {Array.isArray(val) ? (
                  <ul className="space-y-1">
                    {(val as string[]).map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span style={{ color: OPERATOR_META[activeTab].color }}>›</span>
                        <span>{String(item)}</span>
                      </li>
                    ))}
                  </ul>
                ) : typeof val === "object" && val !== null ? (
                  <pre className="text-xs overflow-auto font-mono" style={{ color: "#a78bfa" }}>
                    {JSON.stringify(val, null, 2)}
                  </pre>
                ) : (
                  <span>{String(val)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
