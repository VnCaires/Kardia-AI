import React, { useState } from "react";
import { Deck, Card, CardType, DifficultyLevel } from "../types";
import { Sparkles, BrainCircuit, Check, CheckSquare, Plus, Loader2, ArrowRight, Edit, AlertCircle, Save } from "lucide-react";

interface AiCreatorViewProps {
  decks: Deck[];
  onSaveGeneratedCards: (deckId: string, cards: Omit<Card, "id" | "deckId" | "interval" | "repetition" | "easeFactor" | "nextReviewDate">[]) => void;
  onNavigate: (tab: string) => void;
}

interface StagedCard {
  front: string;
  back: string;
  type: CardType;
  options?: string[];
  tag: string;
  difficulty: DifficultyLevel;
  approved: boolean;
}

export function AiCreatorView({ decks, onSaveGeneratedCards, onNavigate }: AiCreatorViewProps) {
  const [prompt, setPrompt] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [level, setLevel] = useState<DifficultyLevel>("medium");
  const [format, setFormat] = useState<CardType | "mixed">("mixed");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stagedCards, setStagedCards] = useState<StagedCard[]>([]);
  const [targetDeckId, setTargetDeckId] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Por favor, digite ou cole algum assunto, texto ou link no campo de material.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStagedCards([]);

    try {
      const response = await fetch("/api/generate-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, quantity, level, format }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Ocorreu um erro desconhecido na geração por IA.");
      }

      const generated: StagedCard[] = data.cards.map((card: any) => ({
        front: card.front || "",
        back: card.back || "",
        type: card.type || "qa",
        options: card.options || [],
        tag: card.tag || "IA Geral",
        difficulty: card.difficulty || "medium",
        approved: true, // Approved by default for easy additions
      }));

      setStagedCards(generated);
      if (decks.length > 0) {
        setTargetDeckId(decks[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Não foi possível se conectar ao serviço Kardia AI. Verifique se a chave OPENAI_API_KEY está configurada.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToDeck = () => {
    if (!targetDeckId) {
      setError("Por favor, selecione ou crie um Baralho de destino antes de salvar.");
      return;
    }

    const approvedOnly = stagedCards.filter(c => c.approved);
    if (approvedOnly.length === 0) {
      setError("Nenhum cartão aprovado para salvar. Ative a aprovação em pelo menos um cartão.");
      return;
    }

    onSaveGeneratedCards(targetDeckId, approvedOnly);
    // Success redirect
    onNavigate("decks");
  };

  const toggleApprove = (index: number) => {
    setStagedCards(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], approved: !copy[index].approved };
      return copy;
    });
  };

  const handleFieldChange = (index: number, field: keyof StagedCard, value: any) => {
    setStagedCards(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  return (
    <div className="space-y-8 animate-fade-in" id="kardia-ai-creator">
      {/* Visual top bar banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-5 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight inline-flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-indigo-600 animate-pulse" />
            Kardia AI Creator
          </h2>
          <p className="text-xs text-slate-500">Gere baralhos perfeitos e questionários integrados inserindo tópicos de aula ou artigos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Parameters input form */}
        <div className="bg-white border border-slate-100 shadow-xs rounded-2xl p-6 h-fit space-y-6">
          <h3 className="font-bold text-slate-900 text-base">Prompt Inteligente de Criação</h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Estímulo ou Material de Apoio</label>
              <textarea
                rows={6}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Exemplo: Digite um tema como 'Fotossíntese Fase Clara' ou cole anotações, capítulos, termos acadêmicos para que o Kardia AI crie os cartões de fixação."
                className="w-full border border-slate-200 rounded-xl p-3.5 text-sm focus:outline-hidden focus:border-indigo-500 placeholder-slate-400 leading-relaxed font-sans"
              />
            </div>

            {/* Quick configurations */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Quantidade</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-indigo-500 bg-white font-medium text-slate-700"
                >
                  <option value={5}>5 Cartões</option>
                  <option value={10}>10 Cartões</option>
                  <option value={15}>15 Cartões</option>
                  <option value={20}>20 Cartões</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Nível de Dificuldade</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as DifficultyLevel)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-indigo-500 bg-white font-medium text-slate-700"
                >
                  <option value="easy">Fácil (Básico)</option>
                  <option value="medium">Médio (Intermediário)</option>
                  <option value="hard">Difícil (Concursos/Provas)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Formato Predominante</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as CardType | "mixed")}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-indigo-500 bg-white font-medium text-slate-700"
              >
                <option value="mixed">Misto (Q&A, Múltipla Escolha e V/F)</option>
                <option value="qa">Padrão Pergunta e Resposta (Q&A)</option>
                <option value="mcq">Múltipla Escolha (Alternativas)</option>
                <option value="tf">Verdadeiro ou Falso</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-100 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold py-2.5 rounded-xl text-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Sintonizando Kardia AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white fill-white" />
                  Gerar Cartões com IA
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Staging dock of generated cards */}
        <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6 lg:col-span-2 flex flex-col justify-between min-h-[500px]">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 pb-4 gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Revisão dos Cards Gerados</h3>
                <p className="text-xs text-slate-500">
                  {stagedCards.length > 0 ? `${stagedCards.length} cards prontos. ` : "Insira uma nota de estudo à esquerda."}
                </p>
              </div>

              {stagedCards.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500 whitespace-nowrap">Baralho Destino:</span>
                    <select
                      value={targetDeckId}
                      onChange={(e) => setTargetDeckId(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg text-xs font-semibold px-2.5 py-1.5 focus:outline-hidden text-slate-700"
                    >
                      <option value="">Selecione...</option>
                      {decks.map(df => (
                        <option key={df.id} value={df.id}>{df.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Empty view status */}
            {stagedCards.length === 0 && !isLoading && (
              <div className="h-96 flex flex-col items-center justify-center text-center gap-4 text-slate-400">
                <BrainCircuit className="w-12 h-12 stroke-1 text-slate-300" />
                <div className="space-y-1">
                  <span className="font-semibold text-slate-600 block text-sm">Nenhum cartão preparado</span>
                  <p className="text-xs text-slate-400 max-w-[320px]">Digite um tópico de estudo à esquerda e assista o Kardia AI criar seus flashcards em segundos.</p>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="h-96 flex flex-col items-center justify-center text-center gap-4 text-indigo-600">
                <div className="relative">
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                  <Sparkles className="w-5 h-5 text-amber-500 absolute -top-1 -right-1 fill-amber-500" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 text-sm block">A IA está formulando o material...</span>
                  <p className="text-xs text-slate-400 max-w-[320px]">Estruturando perguntas concisas, alternativas para múltiplos formatos e revisando dados de veracidade cognitiva.</p>
                </div>
              </div>
            )}

            {/* Generated Staged Cards list */}
            {stagedCards.length > 0 && (
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 scrollbar-thin">
                {stagedCards.map((card, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-xl p-4 bg-white transition-all duration-150 relative group ${
                      card.approved ? "border-indigo-100 shadow-sm ring-1 ring-indigo-50" : "border-slate-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                          Card {idx + 1} • {card.type.toUpperCase()}
                        </span>
                        <input
                          type="text"
                          value={card.tag}
                          onChange={(e) => handleFieldChange(idx, "tag", e.target.value)}
                          placeholder="Tag"
                          className="text-[10px] font-bold font-mono text-indigo-600 border-none bg-indigo-50 hover:bg-indigo-100 rounded px-2 py-0.5 focus:outline-hidden max-w-[100px]"
                        />
                      </div>

                      <button
                        onClick={() => toggleApprove(idx)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                          card.approved
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {card.approved ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Aprovado
                          </>
                        ) : (
                          "Pular"
                        )}
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase mb-0.5">Frente (Pergunta)</span>
                        <input
                          type="text"
                          value={card.front}
                          onChange={(e) => handleFieldChange(idx, "front", e.target.value)}
                          className="w-full text-slate-800 text-sm font-semibold border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-hidden py-0.5 bg-transparent"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase mb-0.5">Verso (Explicação)</span>
                        <textarea
                          rows={2}
                          value={card.back}
                          onChange={(e) => handleFieldChange(idx, "back", e.target.value)}
                          className="w-full text-slate-600 text-xs border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-hidden py-1 bg-transparent resize-none leading-relaxed"
                        />
                      </div>

                      {card.options && card.options.length > 0 && (
                        <div className="bg-slate-50 p-2.5 rounded-lg space-y-1.5 border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold block">Alternativas de Múltipla Escolha</span>
                          <div className="grid grid-cols-2 gap-2">
                            {card.options.map((opt, oIdx) => (
                              <input
                                key={oIdx}
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const newOptions = [...(card.options || [])];
                                  newOptions[oIdx] = e.target.value;
                                  handleFieldChange(idx, "options", newOptions);
                                }}
                                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {stagedCards.length > 0 && !isLoading && (
            <div className="border-t border-slate-200 pt-5 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
              <span className="text-xs text-slate-500 font-sans">
                Adicionando {stagedCards.filter(c => c.approved).length} de {stagedCards.length} cartões ao seu acervo.
              </span>
              <button
                onClick={handleSaveToDeck}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-6 rounded-xl inline-flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-4 h-4 text-white" />
                Adicionar Cards Aprovados
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
