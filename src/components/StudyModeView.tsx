import React, { useState } from "react";
import { Deck, Card } from "../types";
import { Flame, ArrowLeft, Eye, HelpCircle, Check, X, ShieldAlert, BadgeCheck, RotateCcw, Home } from "lucide-react";
import { calculateSM2 } from "../utils/spacedRepetition";

interface StudyModeViewProps {
  deck: Deck;
  onFinishStudy: () => void;
  onUpdateCardMetrics: (deckId: string, cardId: string, updatedMetrics: Partial<Card>) => void;
}

export function StudyModeView({ deck, onFinishStudy, onUpdateCardMetrics }: StudyModeViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
  const [isFinished, setIsFinished] = useState(false);

  // Filter cards to review (for high-fidelity simulation, we let them review all cards in the deck during a practice session, prioritized by pending dates first)
  const cards = deck.cards;
  const activeCard = cards[currentIndex];

  const handleReveal = () => {
    setShowAnswer(true);
  };

  const handleScoreResponse = (quality: number) => {
    if (!activeCard) return;

    // Track statistics
    const isCorrect = quality >= 2;
    setSessionScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    // Calculate SuperMemo (SM-2) values
    const { repetition, interval, easeFactor, nextReviewDate } = calculateSM2(
      quality,
      activeCard.repetition,
      activeCard.interval,
      activeCard.easeFactor
    );

    // Save metrics
    onUpdateCardMetrics(deck.id, activeCard.id, {
      repetition,
      interval,
      easeFactor,
      nextReviewDate,
    });

    // Advance
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setSelectedOption(null);
    setSessionScore({ correct: 0, total: 0 });
    setIsFinished(false);
  };

  // If empty
  if (cards.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-8 max-w-lg mx-auto text-center space-y-6 animate-fade-in">
        <div className="p-4 bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <HelpCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Nenhum cartão neste baralho</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Este baralho está vazio no momento. Adicione cartões manuais ou use a inteligência artificial para começar.
          </p>
        </div>
        <button
          onClick={onFinishStudy}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer"
        >
          Voltar aos Baralhos
        </button>
      </div>
    );
  }

  // If Finished
  if (isFinished) {
    const accuracy = sessionScore.total > 0 ? Math.round((sessionScore.correct / sessionScore.total) * 100) : 0;
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-8 max-w-xl mx-auto text-center space-y-8 animate-slide-up shadow-sm">
        <div className="space-y-3">
          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            Sessão Concluída!
          </span>
          <h2 className="text-3xl font-black text-slate-900 leading-tight">Bom trabalho no baralho {deck.name}!</h2>
          <p className="text-xs text-slate-500">Seus dados de fixação de memória já foram processados estruturalmente pela IA.</p>
        </div>

        {/* Accuracy and score circle */}
        <div className="flex justify-around items-center bg-slate-50 p-6 rounded-2xl divide-x divide-slate-200/60">
          <div className="space-y-1 text-center flex-1">
            <span className="text-xs text-slate-500 font-mono font-medium block">Respostas Certas</span>
            <span className="text-3xl font-extrabold text-indigo-600">{sessionScore.correct}/{sessionScore.total}</span>
          </div>

          <div className="space-y-1 text-center flex-1">
            <span className="text-xs text-slate-500 font-mono font-medium block">Acurácia Geral</span>
            <span className={`text-3xl font-extrabold ${accuracy >= 70 ? "text-emerald-600" : accuracy >= 40 ? "text-amber-500" : "text-red-500"}`}>
              {accuracy}%
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleRestart}
            className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl text-sm transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Revisar Novamente
          </button>
          <button
            onClick={onFinishStudy}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition-all inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Finalizar Estudo
          </button>
        </div>
      </div>
    );
  }

  // Active review UI
  const progressRatio = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in" id="kardia-focused-study">
      {/* Upper sub-header bar (from mockup) */}
      <div className="flex items-center justify-between">
        <button
          onClick={onFinishStudy}
          className="text-slate-500 hover:text-slate-800 text-sm font-semibold inline-flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos Baralhos
        </button>

        <span className="text-xs text-slate-500 font-mono font-bold">
          {deck.name} • Card {currentIndex + 1} de {cards.length}
        </span>
      </div>

      {/* Progress slider bar header */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressRatio}%` }}
        />
      </div>

      {/* The Central Flashcard container */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-3xl min-h-[340px] p-8 flex flex-col justify-between relative overflow-hidden group">
        
        {/* Decorative corner tag matching mockup style */}
        <div className="flex items-center justify-between border-b border-slate-100/70 pb-4 mb-4">
          <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 font-mono px-3 py-1 rounded-full">
            {activeCard.tag || "Sem Tag"}
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
            {activeCard.difficulty}
          </span>
        </div>

        {/* Dynamic front question content */}
        <div className="flex-1 flex flex-col justify-center space-y-6 py-4">
          <p className="text-lg md:text-xl font-bold text-slate-800 text-center leading-relaxed">
            {activeCard.front}
          </p>

          {/* MCQ Option selector interactive elements if card type is complex MCQ */}
          {activeCard.type === "mcq" && activeCard.options && activeCard.options.length > 0 && (
            <div className="space-y-2.5 max-w-sm mx-auto w-full pt-4">
              {activeCard.options.map((opt, oIdx) => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={oIdx}
                    disabled={showAnswer}
                    onClick={() => {
                      setSelectedOption(opt);
                      setShowAnswer(true);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                      showAnswer
                        ? opt === activeCard.back || activeCard.back.toLowerCase().includes(opt.toLowerCase())
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : isSelected
                          ? "bg-red-50 border-red-200 text-red-800"
                          : "bg-slate-50 border-slate-100 text-slate-400"
                        : isSelected
                        ? "bg-indigo-50 border-indigo-400 text-indigo-900"
                        : "bg-white border-slate-200/80 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt}</span>
                      {showAnswer && (opt === activeCard.back || activeCard.back.toLowerCase().includes(opt.toLowerCase())) && (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                      {showAnswer && isSelected && !(opt === activeCard.back || activeCard.back.toLowerCase().includes(opt.toLowerCase())) && (
                        <X className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Revealed answer logic */}
        {showAnswer && (
          <div className="border-t border-slate-100 pt-6 mt-4 space-y-3 animate-fade-in text-center bg-indigo-50/20 p-5 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wide">
              Resposta do Kardia AI
            </span>
            <p className="text-slate-700 text-sm md:text-base font-medium leading-relaxed max-w-lg mx-auto whitespace-pre-line">
              {activeCard.back}
            </p>
          </div>
        )}

        {/* Actions bar */}
        <div className="pt-6 border-t border-slate-100 mt-6 flex justify-center">
          {!showAnswer ? (
            <button
              id="kardia-btn-reveal"
              onClick={handleReveal}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-8 rounded-xl inline-flex items-center gap-1.5 shadow-sm transition-all text-center cursor-pointer"
            >
              <Eye className="w-4 h-4 text-white" />
              Mostrar resposta
            </button>
          ) : (
            <div className="space-y-4 w-full">
              {/* Spaced repetition memory selectors */}
              <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                Qual foi a dificuldade de recordar este item?
              </div>
              <div className="grid grid-cols-4 gap-2 w-full">
                <button
                  onClick={() => handleScoreResponse(0)}
                  className="bg-red-50 hover:bg-red-100/80 text-red-700 border border-red-200/60 font-bold text-xs py-3 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1"
                >
                  <span className="font-extrabold text-sm">Errei</span>
                  <span className="text-[9px] font-normal opacity-75">Refazer amanhã</span>
                </button>

                <button
                  onClick={() => handleScoreResponse(1)}
                  className="bg-amber-50 hover:bg-amber-100/80 text-amber-700 border border-amber-200/60 font-bold text-xs py-3 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1"
                >
                  <span className="font-extrabold text-sm">Difícil</span>
                  <span className="text-[9px] font-normal opacity-75">Volta em breve</span>
                </button>

                <button
                  onClick={() => handleScoreResponse(2)}
                  className="bg-blue-50 hover:bg-blue-100/80 text-blue-700 border border-blue-200/60 font-bold text-xs py-3 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1"
                >
                  <span className="font-extrabold text-sm">Bom</span>
                  <span className="text-[9px] font-normal opacity-75">Agendar SM-2</span>
                </button>

                <button
                  onClick={() => handleScoreResponse(3)}
                  className="bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200/60 font-bold text-xs py-3 px-1 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1"
                >
                  <span className="font-extrabold text-sm">Fácil</span>
                  <span className="text-[9px] font-normal opacity-75">Espaçar muito</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
