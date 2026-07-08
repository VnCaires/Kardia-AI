import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import OpenAI from "openai";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = 3000;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-nano";
const OPENAI_TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS) || 45_000;
const MAX_SOURCE_CHARS = 6000;

app.use(express.json({ limit: "1mb" }));

let aiClient: OpenAI | null = null;
function getOpenAI() {
  if (!aiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is missing. Configure it in .env.local.");
    }
    aiClient = new OpenAI({
      apiKey,
      timeout: OPENAI_TIMEOUT_MS,
      maxRetries: 1,
    });
  }
  return aiClient;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.round(parsed)));
}

function compactText(value: string, maxChars = MAX_SOURCE_CHARS) {
  return value.replace(/\s+/g, " ").trim().slice(0, maxChars);
}

function parseJsonOutput<T>(outputText: string | undefined, fallback: T): T {
  if (!outputText) return fallback;
  return JSON.parse(outputText.trim()) as T;
}

function getDifficultyGuidance(difficulty: "easy" | "medium" | "hard") {
  if (difficulty === "easy") {
    return "Foque em fundamentos, definicoes diretas, reconhecimento de termos e respostas explicitas no proprio material.";
  }

  if (difficulty === "hard") {
    return (
      "Torne os cards realmente dificeis. Priorize inferencia, aplicacao, comparacao entre conceitos proximos, " +
      "excecoes, armadilhas conceituais e cenarios de prova. Evite perguntas literais, obvias ou puramente definicionais. " +
      "Em mcq, use 4 alternativas plausiveis e proximas entre si, com apenas uma claramente correta apos raciocinio. " +
      "Em qa, exija discriminacao fina ou justificativa curta. Em tf, prefira afirmacoes sutis e potencialmente enganosas."
    );
  }

  return "Equilibre reconhecimento e raciocinio. Misture definicoes importantes com aplicacoes curtas e comparacoes simples.";
}

function getAiErrorMessage(error: any) {
  const isTimeout =
    error?.name === "APIConnectionTimeoutError" ||
    error?.constructor?.name === "APIConnectionTimeoutError";

  if (isTimeout) {
    return {
      status: 504,
      message:
        "A OpenAI demorou para responder. Tente novamente em alguns segundos ou use um modelo mais rapido em OPENAI_MODEL.",
    };
  }

  return {
    status: 500,
    message: error?.message || "Erro desconhecido ao chamar a IA.",
  };
}

const cardSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    front: { type: "string" },
    back: { type: "string" },
    type: { type: "string", enum: ["qa", "mcq", "tf"] },
    options: { type: "array", items: { type: "string" } },
    tag: { type: "string" },
    difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
  },
  required: ["front", "back", "type", "options", "tag", "difficulty"],
} as const;

// 1. API: Smart Flashcard Generation
app.post("/api/generate-cards", async (req, res) => {
  try {
    const { prompt, quantity = 5, level = "medium", format = "mixed" } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "O campo 'prompt' e obrigatorio e deve ser uma string." });
    }

    const ai = getOpenAI();
    const cardCount = clampNumber(quantity, 1, 20, 5);
    const difficulty = ["easy", "medium", "hard"].includes(level) ? level : "medium";
    const cardFormat = ["mixed", "qa", "mcq", "tf"].includes(format) ? format : "mixed";
    const source = compactText(prompt);
    const difficultyGuidance = getDifficultyGuidance(difficulty);

    const response = await ai.responses.create(
      {
        model: OPENAI_MODEL,
        instructions:
          "Crie flashcards de estudo. Seja fiel ao material, direto e sem floreios. Responda no idioma do usuario. " +
          "Nao invente fatos fora do material, mas pode exigir raciocinio quando a dificuldade pedir.",
        input:
          `Gere ${cardCount} cards. dificuldade=${difficulty}; formato=${cardFormat}. ` +
          "qa: pergunta curta e resposta objetiva. mcq: 4 opcoes em options e resposta correta no back. tf: afirmacao e correcao breve. " +
          `Guia de dificuldade: ${difficultyGuidance} ` +
          `Material: ${source}`,
        max_output_tokens: Math.min(2600, 260 + cardCount * 130),
        text: {
          format: {
            type: "json_schema",
            name: "flashcard_batch",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                cards: {
                  type: "array",
                  items: cardSchema,
                },
              },
              required: ["cards"],
            },
          },
        },
      },
      {
        timeout: Math.max(OPENAI_TIMEOUT_MS, 60_000),
        maxRetries: 1,
      }
    );

    const { cards } = parseJsonOutput<{ cards: unknown[] }>(response.output_text, { cards: [] });
    return res.json({ success: true, cards });
  } catch (error: any) {
    console.error("Erro na rota de geracao:", error);
    const apiError = getAiErrorMessage(error);
    return res.status(apiError.status).json({
      error: apiError.message,
      details: error.stack,
    });
  }
});

// 2. API: Dynamic AI Editing Assistant
app.post("/api/assistant", async (req, res) => {
  try {
    const { action, front = "", back = "", type = "qa", options = [] } = req.body;

    if (!action) {
      return res.status(400).json({ error: "O campo 'action' e obrigatorio." });
    }

    const ai = getOpenAI();

    let task = "";
    if (action === "improve-question") {
      task = "Melhore apenas a frente: mais clara, testavel e especifica. Preserve o sentido.";
    } else if (action === "simplify-answer") {
      task = "Simplifique apenas o verso em 2-4 bullets curtos. Preserve fatos.";
    } else if (action === "create-mcq") {
      task = "Converta para mcq com 4 alternativas plausiveis. Coloque a correta e justificativa curta no verso.";
    } else {
      return res.status(400).json({ error: "Acao de assistente desconhecida." });
    }

    const response = await ai.responses.create(
      {
        model: OPENAI_MODEL,
        instructions: "Edite um flashcard. Seja economico, mantenha idioma e retorne somente campos finais.",
        input: JSON.stringify({
          task,
          card: {
            front: compactText(String(front), 700),
            back: compactText(String(back), 700),
            type,
            options: Array.isArray(options) ? options.slice(0, 4) : [],
          },
        }),
        max_output_tokens: 360,
        text: {
          format: {
            type: "json_schema",
            name: "flashcard_edit",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                front: { type: "string" },
                back: { type: "string" },
                type: { type: "string", enum: ["qa", "mcq", "tf"] },
                options: { type: "array", items: { type: "string" } },
              },
              required: ["front", "back", "type", "options"],
            },
          },
        },
      },
      {
        timeout: Math.min(OPENAI_TIMEOUT_MS, 30_000),
        maxRetries: 1,
      }
    );

    const result = parseJsonOutput(response.output_text, {
      front,
      back,
      type,
      options,
    });
    return res.json({ success: true, card: result });
  } catch (error: any) {
    console.error("Erro no assistente de IA:", error);
    const apiError = getAiErrorMessage(error);
    return res.status(apiError.status).json({
      error: apiError.message,
      details: error.stack,
    });
  }
});

// Serve Frontend using Vite or static files depending on NODE_ENV.
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      configFile: false,
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          "@": path.resolve(process.cwd(), "."),
        },
      },
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[KARDIA AI SERVER] Running on target port ${PORT}`);
  });
}

startServer();
