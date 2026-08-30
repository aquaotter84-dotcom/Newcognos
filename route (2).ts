import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages, sessions, memories } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { runCouncil } from "@/lib/council";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  try {
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(asc(messages.createdAt));
    return NextResponse.json(msgs);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, content, showTrace } = body;

    if (!sessionId || !content) {
      return NextResponse.json(
        { error: "sessionId and content required" },
        { status: 400 }
      );
    }

    // Save user message
    const [userMsg] = await db
      .insert(messages)
      .values({ sessionId, role: "user", content })
      .returning();

    // Fetch conversation history
    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(asc(messages.createdAt))
      .limit(20);

    const conversationHistory = history
      .filter((m) => m.id !== userMsg.id)
      .map((m) => ({ role: m.role, content: m.content }));

    // Fetch relevant memories
    const activeMemories = await db
      .select()
      .from(memories)
      .orderBy(desc(memories.relevanceScore), desc(memories.updatedAt))
      .limit(10);

    const memoryContext =
      activeMemories.length > 0
        ? activeMemories
            .map((m) => `[${m.tier}/${m.key}]: ${m.value}`)
            .join("\n")
        : "";

    // Run the council
    const trace = await runCouncil(
      content,
      memoryContext,
      conversationHistory
    );

    // Save governor's memory recommendations
    const govOutput = trace.governor as Record<string, unknown>;
    const memRecs = govOutput?.memoryRecommendation as Array<{
      tier: string;
      key: string;
      value: string;
    }> | undefined;

    if (Array.isArray(memRecs) && memRecs.length > 0) {
      for (const rec of memRecs.slice(0, 3)) {
        if (rec.key && rec.value) {
          const tier = (["short", "medium", "long", "mythic"].includes(rec.tier)
            ? rec.tier
            : "medium") as "short" | "medium" | "long" | "mythic";

          await db
            .insert(memories)
            .values({
              sessionId,
              tier,
              operator: "governor",
              key: rec.key,
              value: rec.value,
              relevanceScore: tier === "mythic" ? 90 : tier === "long" ? 70 : 50,
            })
            .onConflictDoNothing();
        }
      }
    }

    // Save assistant message
    const [assistantMsg] = await db
      .insert(messages)
      .values({
        sessionId,
        role: "assistant",
        content: trace.finalResponse,
        councilTrace: showTrace ? (trace as unknown as Record<string, unknown>) : null,
      })
      .returning();

    // Update session timestamp and potentially title
    const sessionMsgs = await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(asc(messages.createdAt))
      .limit(2);

    if (sessionMsgs.length === 2) {
      // Auto-title from first user message
      const firstUserMsg = sessionMsgs.find((m) => m.role === "user");
      if (firstUserMsg) {
        const title =
          firstUserMsg.content.slice(0, 60) +
          (firstUserMsg.content.length > 60 ? "…" : "");
        await db
          .update(sessions)
          .set({ title, updatedAt: new Date() })
          .where(eq(sessions.id, sessionId));
      }
    } else {
      await db
        .update(sessions)
        .set({ updatedAt: new Date() })
        .where(eq(sessions.id, sessionId));
    }

    return NextResponse.json({
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      trace: showTrace ? trace : null,
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
