"use client";

import { useState, useRef, useEffect } from "react";

type Props = {
  onSend: (content: string, showTrace: boolean) => void;
  disabled: boolean;
};

export default function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");
  const [showTrace, setShowTrace] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, showTrace);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="px-4 py-3"
      style={{ borderTop: "1px solid #1a1f3a", background: "#05070f" }}
    >
      {/* Input row */}
      <div
        className="flex items-end gap-2 rounded-2xl px-4 py-3 transition-all"
        style={{
          background: "#0c0f1e",
          border: "1px solid #1a1f3a",
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#4f7aff44";
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#1a1f3a";
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Speak to COGNOS…"
          disabled={disabled}
          rows={1}
          className="flex-1 text-sm outline-none resize-none bg-transparent leading-relaxed"
          style={{
            color: "#e2e8f0",
            minHeight: "24px",
            maxHeight: "160px",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{
            background:
              value.trim() && !disabled
                ? "linear-gradient(135deg, #4f7aff, #7c3aed)"
                : "#1a1f3a",
            color: value.trim() && !disabled ? "white" : "#334155",
          }}
        >
          ↑
        </button>
      </div>

      {/* Options row */}
      <div className="flex items-center gap-3 mt-2 px-1">
        <button
          onClick={() => setShowTrace(!showTrace)}
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: showTrace ? "#4f7aff" : "#334155" }}
        >
          <span
            className="w-3 h-3 rounded-sm border flex items-center justify-center"
            style={{
              borderColor: showTrace ? "#4f7aff" : "#1e293b",
              background: showTrace ? "#4f7aff" : "transparent",
            }}
          >
            {showTrace && <span className="text-white text-xs leading-none">✓</span>}
          </span>
          Council trace
        </button>
        <span className="text-xs" style={{ color: "#1e293b" }}>•</span>
        <span className="text-xs" style={{ color: "#1e293b" }}>
          Shift+Enter for newline
        </span>
        <span className="ml-auto text-xs" style={{ color: "#1e293b" }}>
          One Voice. Many Minds.
        </span>
      </div>
    </div>
  );
}
