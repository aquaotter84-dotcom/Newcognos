"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import MessageBubble from "@/components/MessageBubble";
import ThinkingIndicator from "@/components/ThinkingIndicator";
import ChatInput from "@/components/ChatInput";
import MemoryPanel from "@/components/MemoryPanel";
import type { Session, Message } from "@/types/cognos";

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [thinkingStage, setThinkingStage] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const thinkingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check API key availability
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(() => setHasApiKey(true))
      .catch(() => setHasApiKey(false));
  }, []);

  // Load sessions on mount
  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      setSessions(data);
      if (data.length > 0 && !activeSessionId) {
        setActiveSessionId(data[0].id);
      }
    } catch {
      console.error("Failed to fetch sessions");
    }
  }, [activeSessionId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Load messages when session changes
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }
    fetch(`/api/messages?sessionId=${activeSessionId}`)
      .then((r) => r.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]));
  }, [activeSessionId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const handleNewSession = async () => {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Session" }),
    });
    const session = await res.json();
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setSidebarOpen(false);
  };

  const handleDeleteSession = async (id: string) => {
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id);
      setActiveSessionId(remaining[0]?.id ?? null);
    }
  };

  const startThinkingAnimation = () => {
    setThinkingStage(0);
    let stage = 0;
    thinkingInterval.current = setInterval(() => {
      stage = Math.min(stage + 1, 4);
      setThinkingStage(stage);
    }, 1800);
  };

  const stopThinkingAnimation = () => {
    if (thinkingInterval.current) {
      clearInterval(thinkingInterval.current);
      thinkingInterval.current = null;
    }
  };

  const handleSend = async (content: string, showTrace: boolean) => {
    if (!activeSessionId) {
      // Auto-create session
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Session" }),
      });
      const session = await res.json();
      setSessions((prev) => [session, ...prev]);
      setActiveSessionId(session.id);

      // Recurse with new session
      setTimeout(() => handleSendWithSession(content, showTrace, session.id), 100);
      return;
    }
    handleSendWithSession(content, showTrace, activeSessionId);
  };

  const handleSendWithSession = async (
    content: string,
    showTrace: boolean,
    sessionId: string
  ) => {
    setError(null);
    setThinking(true);
    startThinkingAnimation();

    // Optimistically add user message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      sessionId,
      role: "user",
      content,
      councilTrace: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, content, showTrace }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      // Replace temp message and add assistant message
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        data.userMessage,
        data.assistantMessage,
      ]);

      // Update session title
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, updatedAt: new Date().toISOString() }
            : s
        )
      );

      // Refresh sessions to get updated titles
      fetchSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      stopThinkingAnimation();
      setThinking(false);
      setThinkingStage(0);
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#05070f" }}>
      {/* Background image */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(/cognos-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.12,
        }}
      />

      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onOpenMemory={() => setMemoryOpen(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid #1a1f3a", background: "#05070f" }}
        >
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg"
            style={{ color: "#64748b" }}
          >
            ☰
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-medium truncate" style={{ color: "#c7d2fe" }}>
              {activeSession?.title ?? "COGNOS"}
            </h1>
            <p className="text-xs" style={{ color: "#334155" }}>
              One Voice Outward. Many Minds Underneath.
            </p>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full"
              style={{
                background: "#0c0f1e",
                border: "1px solid #1a1f3a",
                color: "#475569",
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: thinking ? "#f59e0b" : "#34d399" }}
              />
              <span>{thinking ? "Processing" : "Ready"}</span>
            </div>
            <button
              onClick={() => setMemoryOpen(true)}
              className="text-xs px-2 py-1 rounded-full transition-colors"
              style={{
                background: "#0c0f1e",
                border: "1px solid #1a1f3a",
                color: "#a78bfa",
              }}
            >
              ⬡ Memory
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {messages.length === 0 && !thinking ? (
            /* Welcome screen */
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 council-active"
                style={{
                  background: "linear-gradient(135deg, #0c0f1e, #1a1f3a)",
                  border: "1px solid #4f7aff33",
                }}
              >
                ⬡
              </div>
              <h2
                className="text-2xl font-bold tracking-widest mb-2"
                style={{ color: "#c7d2fe", letterSpacing: "0.2em" }}
              >
                COGNOS
              </h2>
              <p className="text-sm mb-1" style={{ color: "#475569" }}>
                Cognitive Operators for Guidance, Navigation, Oversight & Sovereignty
              </p>
              <p className="text-xs mb-8" style={{ color: "#334155" }}>
                One Voice Outward. Many Minds Underneath.
              </p>

              {/* Council visual */}
              <div className="flex items-center gap-3 mb-8">
                {[
                  { icon: "◎", label: "Observer", color: "#38bdf8" },
                  { icon: "◈", label: "Strategist", color: "#a78bfa" },
                  { icon: "◉", label: "Critic", color: "#f59e0b" },
                  { icon: "◆", label: "Governor", color: "#34d399" },
                ].map((op, i) => (
                  <div key={op.label} className="flex items-center gap-3">
                    <div
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{
                          background: `${op.color}12`,
                          border: `1px solid ${op.color}33`,
                          color: op.color,
                        }}
                      >
                        {op.icon}
                      </div>
                      <span className="text-xs" style={{ color: "#334155" }}>
                        {op.label}
                      </span>
                    </div>
                    {i < 3 && (
                      <span className="text-xs" style={{ color: "#1e293b" }}>→</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Starter prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                {[
                  "Help me think through a difficult decision I'm facing",
                  "What should I consider when starting a new project?",
                  "I need to plan my long-term goals — where do I start?",
                  "Challenge my thinking on a belief I hold strongly",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt, false)}
                    disabled={thinking}
                    className="text-left text-xs px-3 py-2.5 rounded-xl transition-colors"
                    style={{
                      background: "#0c0f1e",
                      border: "1px solid #1a1f3a",
                      color: "#64748b",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#4f7aff33";
                      (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#1a1f3a";
                      (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {hasApiKey === false && (
                <div
                  className="mt-6 px-4 py-3 rounded-xl text-xs max-w-sm"
                  style={{
                    background: "#1a0a00",
                    border: "1px solid #92400e44",
                    color: "#f59e0b",
                  }}
                >
                  <strong>No API key detected.</strong> Add{" "}
                  <code style={{ color: "#fcd34d" }}>OPENAI_API_KEY</code> to your{" "}
                  environment variables to enable the Council.
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {thinking && <ThinkingIndicator stage={thinkingStage} />}
            </>
          )}

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-2 px-4 py-3 rounded-xl text-sm"
              style={{
                background: "#1a0505",
                border: "1px solid #7f1d1d44",
                color: "#fca5a5",
              }}
            >
              <span>⚠</span>
              <div>
                <strong>Error:</strong> {error}
                {error.includes("OPENAI_API_KEY") && (
                  <div className="mt-1 text-xs" style={{ color: "#f87171" }}>
                    Set your OPENAI_API_KEY environment variable.
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} disabled={thinking || !activeSessionId && sessions.length === 0} />
      </div>

      {/* Memory panel */}
      <MemoryPanel isOpen={memoryOpen} onClose={() => setMemoryOpen(false)} />
    </div>
  );
}
