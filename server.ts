import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini SDK key securely on request, preventing boot crashes if key is omitted initially
let aiClient: GoogleGenAI | null = null;
function getGemini() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. API: Smart Flashcard Generation
app.post("/api/generate-cards", async (req, res) => {
  try {
    const { prompt, quantity = 5, level = "medium", format = "mixed" } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "O campo 'prompt' é obrigatório e deve ser uma string." });
    }

    const ai = getGemini();

    const systemInstruction = 
      "Você é uma inteligência de elite especializada em educação e metodologia científica de repetição espaçada. " +
      "Seu objetivo é extrair conceitos-chave de livros, anotações ou textos inseridos e transformá-los em flashcards acadêmicos de altíssimo valor " +
      "pedagógico, claros, concisos e fáceis de memorizar. Cada cartão deve conter termos desafiadores mas explicados de maneira direta. " +
      "Responda no mesmo idioma do prompt do usuário (geralmente português ou inglês).";

    const difficultyPrompt = `A dificuldade recomendada para os cards é: ${level}. `;
    const formatPrompt = 
      format === "mixed"
        ? "Gere uma mistura saudável de perguntas e respostas diretas ('qa'), múltiplas escolhas ('mcq') e verdadeiro ou falso ('tf')."
        : format === "mcq"
        ? "Todos os flashcards devem ser de múltipla escolha ('mcq') com 4 alternativas plausíveis, sinalizando a resposta correta de forma clara no verso."
        : format === "tf"
        ? "Todos devem ser do estilo Verdadeiro ou Falso ('tf'), onde a frente propõe uma afirmação e o verso diz se é Verdadeiro ou Falso junto de uma breve retificação."
        : "Todos os flashcards devem ser do tipo pergunta e resposta direta ('qa').";

    const promptText = 
      `Gere exatamente ${quantity} flashcards úteis baseados no material ou tópico abaixo:\n\n` +
      `TÓPICO/MATERIAL: "${prompt}"\n\n` +
      `REQUISITOS:\n` +
      `- ${difficultyPrompt}\n` +
      `- ${formatPrompt}\n` +
      `- Siga restritamente o formato JSON de resposta requerido. `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "Lista de flashcards pedagógicos gerados.",
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING, description: "Frente do flashcard (pergunta ou afirmação instigante)." },
              back: { type: Type.STRING, description: "Verso do flashcard (resposta correta, justificativa ou explicação sintética)." },
              type: { type: Type.STRING, description: "Tipo de card: 'qa', 'mcq' ou 'tf'." },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Se o tipo for 'mcq', envie de 3 a 4 alternativas para o usuário escolher. Para qa ou tf, envie vazio ou omita."
              },
              tag: { type: Type.STRING, description: "Uma única tag curta (ex: 'Citologia', 'Gramática', 'Trigonometria') relacionada ao assunto específico." },
              difficulty: { type: Type.STRING, description: "Dificuldade do card: 'easy', 'medium' ou 'hard'." }
            },
            required: ["front", "back", "type", "tag", "difficulty"]
          }
        }
      }
    });

    const outputText = response.text || "[]";
    const cards = JSON.parse(outputText.trim());
    return res.json({ success: true, cards });
  } catch (error: any) {
    console.error("Erro na rota de geração:", error);
    return res.status(500).json({ 
      error: error.message || "Erro desconhecido ao gerar flashcards.", 
      details: error.stack 
    });
  }
});

// 2. API: Dynamic AI Editing Assistant
app.post("/api/assistant", async (req, res) => {
  try {
    const { action, front = "", back = "", type = "qa", options = [] } = req.body;

    if (!action) {
      return res.status(400).json({ error: "O campo 'action' é obrigatório." });
    }

    const ai = getGemini();

    let assistantPrompt = "";
    if (action === "improve-question") {
      assistantPrompt = 
        `Melhore esta pergunta/afirmação para torná-la mais propícia para repetição espaçada (explicitação de termos, contexto cognitivo mais detalhado e instigante, mantendo a resposta aproximada).\n` +
        `Frente Atual: "${front}"\n` +
        `Verso Atual: "${back}"`;
    } else if (action === "simplify-answer") {
      assistantPrompt = 
        `Deixe a resposta no verso muito mais sintetizada, fatiada em bullets claros e rápidos de ler durante uma revisão sob pressão temporal.\n` +
        `Verso Atual: "${back}"`;
    } else if (action === "create-mcq") {
      assistantPrompt = 
        `Transforme esta questão em múltipla escolha ('mcq'). Sugira 4 alternativas e coloque no verso a correta acompanhada de uma explicação simples.\n` +
        `Frente: "${front}"\n` +
        `Verso: "${back}"`;
    } else {
      return res.status(400).json({ error: "Ação de assistente desconhecida." });
    }

    const systemInstruction = 
      "Você é um copiloto de edição do Kardia AI. Modifique os campos do flashcard de acordo com a solicitação " +
      "e retorne sempre a estrutura refinada correspondente nas chaves fornecidas de resposta.";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: assistantPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            front: { type: Type.STRING, description: "Novo valor para a frente do cartão." },
            back: { type: Type.STRING, description: "Novo valor para o verso do cartão." },
            type: { type: Type.STRING, description: "Tipo do cartão: 'qa', 'mcq' ou 'tf'." },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "Vetor de alternativas caso o tipo seja 'mcq'. Caso contrário, retorne vazio." 
            }
          },
          required: ["front", "back", "type"]
        }
      }
    });

    const outputText = response.text || "{}";
    const result = JSON.parse(outputText.trim());
    return res.json({ success: true, card: result });
  } catch (error: any) {
    console.error("Erro no assistente de IA:", error);
    return res.status(500).json({ 
      error: error.message || "Erro no copiloto de IA.",
      details: error.stack
    });
  }
});

// Serve Frontend using Vite or Static files depending on NODE_ENV
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[KARDIA AI SERVER] Running on target port ${PORT}`);
  });
}

startServer();
