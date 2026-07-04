import React, { useEffect, useState } from "react";
import { Deck, Card, CardType, DifficultyLevel } from "../types";
import { Sparkles, ArrowLeft, ArrowRight, Save, Trash, Plus, Command, Eye, Cpu, BookOpen, AlertCircle, Loader2, Wand2 } from "lucide-react";

interface CardEditorViewProps {
  deck: Deck;
  onClose: () => void;
  onUpdateDeckCards: (
    deckId: string,
    cards: Card[],
    metadata?: Partial<Pick<Deck, "name" | "description" | "category">>
  ) => void;
}

export function CardEditorView({ deck, onClose, onUpdateDeckCards }: CardEditorViewProps) {
  const [cardsList, setCardsList] = useState<Card[]>([...deck.cards]);
  const [deckName, setDeckName] = useState(deck.name);
  const [deckDescription, setDeckDescription] = useState(deck.description);
  const [deckCategory, setDeckCategory] = useState(deck.category);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  
  useEffect(() => {
    setCardsList([...deck.cards]);
    setDeckName(deck.name);
    setDeckDescription(deck.description);
    setDeckCategory(deck.category);
    setSelectedIndex(0);
  }, [deck]);

  // Active editing card references
  const activeCard = cardsList[selectedIndex] || null;

  // AI assistant states
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Form states matching active card
  const handleCardChange = (field: keyof Card, value: any) => {
    if (!activeCard) return;
    const copied = [...cardsList];
    copied[selectedIndex] = { ...copied[selectedIndex], [field]: value };
    setCardsList(copied);
  };

  const handleAddNewCard = () => {
    const newCard: Card = {
      id: `m-card-${Date.now()}`,
      deckId: deck.id,
      front: "Nova pergunta ou termo para revisar",
      back: "Explicação ou resposta correspondente",
      type: "qa",
      tag: "Geral",
      difficulty: "medium",
      interval: 1,
      repetition: 0,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString()
    };
    
    const updated = [...cardsList, newCard];
    setCardsList(updated);
    setSelectedIndex(updated.length - 1);
  };

  const handleDeleteCard = (idx: number) => {
    const updated = cardsList.filter((_, i) => i !== idx);
    setCardsList(updated);
    // Adjust active selected index safely
    if (idx >= updated.length && updated.length > 0) {
      setSelectedIndex(updated.length - 1);
    } else if (updated.length === 0) {
      setSelectedIndex(0);
    } else {
      setSelectedIndex(Math.max(0, idx - 1));
    }
  };

  const handleSaveDeck = () => {
    onUpdateDeckCards(deck.id, cardsList, {
      name: deckName.trim(),
      description: deckDescription,
      category: deckCategory,
    });
    onClose();
  };

  // AI Assistant Callers
  const handleAiAssist = async (action: "improve-question" | "simplify-answer" | "create-mcq") => {
    if (!activeCard) return;
    setIsAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          front: activeCard.front,
          back: activeCard.back,
          type: activeCard.type,
          options: activeCard.options || []
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Ocorreu um erro ao processar seu pedido na IA.");
      }

      // Merge back
      const updatedCard = data.card;
      const copied = [...cardsList];
      copied[selectedIndex] = {
        ...copied[selectedIndex],
        front: updatedCard.front ?? copied[selectedIndex].front,
        back: updatedCard.back ?? copied[selectedIndex].back,
        type: (updatedCard.type as CardType) ?? copied[selectedIndex].type,
        options: updatedCard.options ?? copied[selectedIndex].options
      };
      
      setCardsList(copied);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Não foi possível contactar o assistente de IA. Certifique-se de configurar a API key da OpenAI.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="kardia-card-editor">
      {/* Upper header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Editor de Flashcards</h2>
            <p className="text-xs text-slate-500 font-mono">
              Baralho: {deck.name} • {cardsList.length} cards
            </p>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveDeck}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Salvar Baralho
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Informações do baralho</h3>
            <p className="text-xs text-slate-500">Atualize nome, descrição e categoria junto com os cartões.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Nome do baralho</label>
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Categoria</label>
            <select
              value={deckCategory}
              onChange={(e) => setDeckCategory(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500 bg-white"
            >
              <option value="Medicina">Medicina</option>
              <option value="Ciências Biológicas">Ciências Biológicas</option>
              <option value="Ciências Jurídicas">Ciências Jurídicas</option>
              <option value="Idiomas">Idiomas</option>
              <option value="Administração">Administração</option>
              <option value="Engenharia e Exatas">Engenharia e Exatas</option>
              <option value="Geral">Geral</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">Descrição</label>
          <textarea
            rows={3}
            value={deckDescription}
            onChange={(e) => setDeckDescription(e.target.value)}
            placeholder="Descreva o foco do baralho e o que ele cobre"
            className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tri-panel Layout (from mockup) */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Panel 1: Decks Cards list (Standard Sidebar, Col span 3) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col justify-between md:col-span-1 lg:col-span-3 min-h-[500px] max-h-[640px]">
          <div className="space-y-3 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between pb-2 border-b border-slate-50">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">
                Cartões {cardsList.length > 0 ? `(${cardsList.length})` : "(0)"}
              </span>
              <button
                onClick={handleAddNewCard}
                className="text-indigo-600 hover:text-indigo-700 font-bold text-xs inline-flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar
              </button>
            </div>

            {cardsList.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-slate-400 gap-2">
                <BookOpen className="w-8 h-8 opacity-40 text-slate-400" />
                <span className="text-xs opacity-80 block font-semibold">Sem cartões ativos</span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {cardsList.map((card, idx) => {
                  const isActive = idx === selectedIndex;
                  return (
                    <div
                      key={card.id}
                      onClick={() => {
                        setSelectedIndex(idx);
                        setAiError(null);
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all relative group ${
                        isActive
                          ? "bg-indigo-50/50 border-indigo-200 shadow-xs"
                          : "bg-white border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <span className="text-[9px] font-bold font-mono text-slate-400 block mb-1">
                        CARD {idx + 1} • {card.tag || "Sem Tag"}
                      </span>
                      <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed">
                        {card.front || "Vazio"}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(idx);
                        }}
                        className="absolute right-2 top-2 p-1 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remover card"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Detailed Inputs Editor (Col span 5) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 md:col-span-2 lg:col-span-6 space-y-6 max-h-[640px] overflow-y-auto">
          {activeCard ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm">
                  Editando Cartão {selectedIndex + 1} de {cardsList.length}
                </h3>
                <span className="text-xs font-semibold text-slate-400 font-mono">
                  {activeCard.type.toUpperCase()} Mode
                </span>
              </div>

              {/* Front side editor */}
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">
                  Frente do Cartão (Pergunta / Termo)
                </label>
                <textarea
                  rows={4}
                  value={activeCard.front}
                  onChange={(e) => handleCardChange("front", e.target.value)}
                  placeholder="Escreva a pergunta acadêmica ou termo a ser lembrado..."
                  className="w-full border border-slate-200 rounded-xl p-3.5 text-sm focus:outline-hidden focus:border-indigo-500 placeholder-slate-400 font-semibold text-slate-800 leading-relaxed bg-slate-50/20"
                />
              </div>

              {/* Back side editor */}
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">
                  Verso do Cartão (Resposta / Explicação)
                </label>
                <textarea
                  rows={4}
                  value={activeCard.back}
                  onChange={(e) => handleCardChange("back", e.target.value)}
                  placeholder="Escreva a resposta consolidada, definições importantes ou bullets de memorização..."
                  className="w-full border border-slate-200 rounded-xl p-3.5 text-sm focus:outline-hidden focus:border-indigo-500 placeholder-slate-400 text-slate-600 leading-relaxed bg-slate-50/20 font-sans"
                />
              </div>

              {/* Horizontal categorization inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Etiqueta (Tag)</label>
                  <input
                    type="text"
                    value={activeCard.tag || ""}
                    onChange={(e) => handleCardChange("tag", e.target.value)}
                    placeholder="Ex: Mitocôndria"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Dificuldade Estimada</label>
                  <select
                    value={activeCard.difficulty}
                    onChange={(e) => handleCardChange("difficulty", e.target.value as DifficultyLevel)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-hidden focus:border-indigo-500 bg-white font-medium"
                  >
                    <option value="easy">Fácil (Básico)</option>
                    <option value="medium">Médio (Intermediário)</option>
                    <option value="hard">Difícil (Complexo)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic option edits if card type is converted into MCQ */}
              {activeCard.type === "mcq" && (
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-slate-600 block">Alternativas de Múltipla Escolha</span>
                  <div className="space-y-2">
                    {activeCard.options?.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 shadow-xs">
                        <span className="text-[10px] bg-slate-100 font-bold px-2 py-1 select-none text-slate-500 rounded font-mono">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...(activeCard.options || [])];
                            newOptions[oIdx] = e.target.value;
                            handleCardChange("options", newOptions);
                          }}
                          className="w-full text-xs font-semibold px-2 border-0 bg-transparent focus:outline-hidden focus:ring-0 text-slate-700"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 min-h-[400px]">
              <Cpu className="w-12 h-12 stroke-1 text-slate-300" />
              <div className="space-y-1 mt-2">
                <span className="font-semibold text-slate-600 block text-sm">Nenhum cartão selecionado</span>
                <p className="text-xs text-slate-400">Clique em "Adicionar" para configurar um novo flashcard.</p>
              </div>
            </div>
          )}
        </div>

        {/* Panel 3: AI Assistant Sidebar (Col span 3) */}
        <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 md:col-span-1 lg:col-span-3 space-y-5 max-h-[640px] overflow-y-auto">
          <div className="text-center space-y-1.5 pb-2 border-b border-slate-200">
            <Sparkles className="w-6 h-6 text-indigo-600 mx-auto fill-indigo-200" />
            <h3 className="font-bold text-slate-900 text-sm">Copiloto de IA Kardia</h3>
            <p className="text-[10px] text-slate-400">Refine e mude formatos dinamicamente usando a inteligência da OpenAI.</p>
          </div>

          {!activeCard ? (
            <div className="text-center p-4 text-xs text-slate-400">
              Selecione um cartão para liberar os poderes do Copiloto.
            </div>
          ) : (
            <div className="space-y-4">
              {isAiLoading ? (
                <div className="bg-white border border-slate-150 p-6 rounded-xl text-center space-y-4 flex flex-col items-center justify-center min-h-[160px]">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 text-xs block">Processando dados...</span>
                    <span className="text-[10px] text-slate-400">Reescrevendo estrutura científica...</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => handleAiAssist("improve-question")}
                    className="w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-200 text-slate-700 text-xs font-bold py-3 px-3 rounded-xl inline-flex items-center gap-2 transition-all text-left group cursor-pointer"
                  >
                    <Wand2 className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="block text-xs font-semibold">Melhorar Pergunta</span>
                      <span className="text-[9px] text-slate-400 font-normal">Torna linguajar instigante</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAiAssist("simplify-answer")}
                    className="w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-200 text-slate-700 text-xs font-bold py-3 px-3 rounded-xl inline-flex items-center gap-2 transition-all text-left group cursor-pointer"
                  >
                    <Command className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="block text-xs font-semibold">Simplificar Resposta</span>
                      <span className="text-[9px] text-slate-400 font-normal">Foca em bullets diretos</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAiAssist("create-mcq")}
                    className="w-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-200 text-slate-700 text-xs font-bold py-3 px-3 rounded-xl inline-flex items-center gap-2 transition-all text-left group cursor-pointer"
                  >
                    <Cpu className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="block text-xs font-semibold">Gerar Múltipla Escolha</span>
                      <span className="text-[9px] text-slate-400 font-normal">Cria alternativas plausíveis</span>
                    </div>
                  </button>
                </div>
              )}

              {aiError && (
                <div className="bg-red-50 text-red-700 text-[10px] p-3 rounded-xl border border-red-100 flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{aiError}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
