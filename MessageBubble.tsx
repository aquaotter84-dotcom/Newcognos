"use client";

import { useState } from "react";
import type { Message } from "@/types/cognos";
import CouncilTrace from "./CouncilTrace";
import type { CouncilTrace as CouncilTraceType } from "@/types/cognos";

type Props = {
  message: Message;
};

function formatContent(content: string) {
  // Basic markdown-ish formatting
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
}

export default function MessageBubble({ message }: Props) {
  const [showTrace, setShowTrace] = useState(false);
  const isUser = message.role === "user";
  const hasTrace = message.councilTrace && Object.keys(message.councilTrace).length > 0;

  const timeStr = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex gap-3 animate-slide-up ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
        style={{
          background: isUser
            ? "linear-gradient(135deg, #4f7aff, #2a3f80)"
            : "linear-gradient(135deg, #0c0f1e, #1a1f3a)",
          border: isUser ? "none" : "1px solid #4f7aff44",
          color: isUser ? "white" : "#4f7aff",
        }}
      >
        {isUser ? "U" : "C"}
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-3 ${isUser ? "rounded-tr-sm" : "rounded-tl-sm"}`}
          style={{
            background: isUser ? "linear-gradient(135deg, #1e3a8a22, #4f7aff22)" : "#0c0f1e",
            border: `1px solid ${isUser ? "#4f7aff33" : "#1a1f3a"}`,
            maxWidth: "100%",
          }}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed" style={{ color: "#c7d2fe" }}>
              {message.content}
            </p>
          ) : (
            <div
              className="text-sm leading-relaxed cognos-prose"
              style={{ color: "#e2e8f0" }}
              dangerouslySetInnerHTML={{
                __html: `<p>${formatContent(message.content)}</p>`,
              }}
            />
          )}
        </div>

        {/* Meta row */}
        <div className={`flex items-center gap-2 mt-1 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-xs" style={{ color: "#334155" }}>
            {timeStr}
          </span>
          {!isUser && hasTrace && (
            <button
              onClick={() => setShowTrace(!showTrace)}
              className="text-xs px-2 py-0.5 rounded-full transition-colors"
              style={{
                color: showTrace ? "#4f7aff" : "#475569",
                background: showTrace ? "#4f7aff18" : "transparent",
                border: "1px solid",
                borderColor: showTrace ? "#4f7aff44" : "#1e293b",
              }}
            >
              {showTrace ? "hide trace" : "council trace"}
            </button>
          )}
        </div>

        {/* Council trace */}
        {showTrace && hasTrace && (
          <div className="w-full mt-1">
            <CouncilTrace trace={message.councilTrace as CouncilTraceType} />
          </div>
        )}
      </div>
    </div>
  );
}
