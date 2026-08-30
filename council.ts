import OpenAI from "openai";
import { OPERATOR_PROMPTS, COUNCIL_ORDER } from "./cognos-prompts";

export type OperatorOutput = {
  operator: (typeof COUNCIL_ORDER)[number];
  output: Record<string, unknown>;
  raw: string;
};

export type CouncilTrace = {
  observer: Record<string, unknown>;
  strategist: Record<string, unknown>;
  critic: Record<string, unknown>;
  governor: Record<string, unknown>;
  finalResponse: string;
};

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey });
}

async function runOperator(
  client: OpenAI,
  operator: (typeof COUNCIL_ORDER)[number],
  systemContext: string,
  userMessage: string,
  model: string = "gpt-4o-mini"
): Promise<OperatorOutput> {
  const systemPrompt = OPERATOR_PROMPTS[operator];

  const completion = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: systemPrompt + "\n\n" + systemContext,
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
    max_tokens: 400,
    temperature: 0.4,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = { raw };
  }

  return { operator, output: parsed, raw };
}

export async function runCouncil(
  userMessage: string,
  memoryContext: string,
  conversationHistory: Array<{ role: string; content: string }>,
  model: string = "gpt-4o-mini"
): Promise<CouncilTrace> {
  const client = getClient();

  const historyText =
    conversationHistory.length > 0
      ? "Recent conversation:\n" +
        conversationHistory
          .slice(-6)
          .map((m) => `${m.role === "user" ? "User" : "COGNOS"}: ${m.content}`)
          .join("\n")
      : "";

  const baseContext = [
    memoryContext ? `Active memory context:\n${memoryContext}` : "",
    historyText,
  ]
    .filter(Boolean)
    .join("\n\n");

  // Observer
  const observerResult = await runOperator(
    client,
    "observer",
    baseContext,
    userMessage,
    model
  );

  // Strategist
  const strategistResult = await runOperator(
    client,
    "strategist",
    baseContext +
      `\n\nObserver output:\n${JSON.stringify(observerResult.output, null, 2)}`,
    userMessage,
    model
  );

  // Critic
  const criticResult = await runOperator(
    client,
    "critic",
    baseContext +
      `\n\nObserver output:\n${JSON.stringify(observerResult.output, null, 2)}\n\nStrategist output:\n${JSON.stringify(strategistResult.output, null, 2)}`,
    userMessage,
    model
  );

  // Governor
  const governorResult = await runOperator(
    client,
    "governor",
    baseContext +
      `\n\nObserver:\n${JSON.stringify(observerResult.output, null, 2)}\n\nStrategist:\n${JSON.stringify(strategistResult.output, null, 2)}\n\nCritic:\n${JSON.stringify(criticResult.output, null, 2)}`,
    userMessage,
    model
  );

  // Orchestrator — final unified response
  const orchestratorContext = `Council trace:

Observer (Guidance):
${JSON.stringify(observerResult.output, null, 2)}

Strategist (Navigation):
${JSON.stringify(strategistResult.output, null, 2)}

Critic (Oversight):
${JSON.stringify(criticResult.output, null, 2)}

Governor (Sovereignty):
${JSON.stringify(governorResult.output, null, 2)}

${baseContext}`;

  const finalCompletion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: OPERATOR_PROMPTS.orchestrator + "\n\n" + orchestratorContext,
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
    max_tokens: 800,
    temperature: 0.7,
  });

  const finalResponse =
    finalCompletion.choices[0]?.message?.content ?? "I was unable to respond.";

  return {
    observer: observerResult.output,
    strategist: strategistResult.output,
    critic: criticResult.output,
    governor: governorResult.output,
    finalResponse,
  };
}
