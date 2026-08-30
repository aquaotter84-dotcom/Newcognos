import { NextResponse } from "next/server";
import { db } from "@/db";
import { memories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const all = await db
      .select()
      .from(memories)
      .orderBy(desc(memories.relevanceScore), desc(memories.updatedAt))
      .limit(100);
    return NextResponse.json(all);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tier, key, value, relevanceScore } = body;

    const [mem] = await db
      .insert(memories)
      .values({
        tier: tier ?? "medium",
        operator: "orchestrator",
        key,
        value,
        relevanceScore: relevanceScore ?? 50,
      })
      .returning();
    return NextResponse.json(mem, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create memory" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await db.delete(memories).where(eq(memories.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete memory" }, { status: 500 });
  }
}
