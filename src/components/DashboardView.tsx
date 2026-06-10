import React from "react";
import { Deck, Card, StudyActivity } from "../types";
import { BookOpen, Flame, Sparkles, Award, ArrowUpRight, Play, CheckCircle2 } from "lucide-react";

interface DashboardViewProps {
  decks: Deck[];
  reviewQueue: Card[];
  activity: StudyActivity[];
  onNavigate: (tab: string) => void;
  onStartReview: (deck: Deck) => void;
}

export function DashboardView({
  decks,
  reviewQueue,
  activity,
  onNavigate,
  onStartReview,
}: DashboardViewProps) {
  const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);
  const totalReviewedToday = 14; // Mock statistic of done reviews today
  const dailyGoal = 32;

  // Find some clever AI insights based on accuracy levels or cards
  const weakestDeck = decks.reduce((prev, curr) => {
    return (prev.masteredPercent < curr.masteredPercent) ? prev : curr;
  }, decks[0] || { name: "Nenhum", masteredPercent: 100 });

  return (
    <div className="space-y-8 animate-fade-in" id="kardia-dashboard">
      {/* 1. Header Greeting Banner */}
      <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-slate-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        {/* Abstract background blobs for high-fidelity visual decoration without margin noise */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/30 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-10 left-20 w-48 h-48 bg-violet-100/20 rounded-full blur-2xl -z-10" />

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Meta Diária: {totalReviewedToday}/{dailyGoal} cartões revisados
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl leading-tight">
            Bom dia, pronto para revisar?
          </h1>
          <p className="text-slate-600 max-w-xl font-sans text-sm md:text-base">
            Você tem <strong className="text-indigo-600 font-bold">{reviewQueue.length} cartões</strong> aguardando revisão hoje. Mantenha o seu streak ativo e domine mais conceitos!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 min-w-[200px]">
          <button
            id="btn-review-now"
            onClick={() => {
              // Find the deck with pending reviews
              const pendingDeck = decks.find(d => d.cards.some(c => new Date(c.nextReviewDate) <= new Date()));
              if (pendingDeck) {
                onStartReview(pendingDeck);
              } else if (decks.length > 0) {
                onStartReview(decks[0]);
              } else {
                onNavigate("decks");
              }
            }}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-3 rounded-xl shadow-sm transition-all text-sm cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            Começar Revisão
          </button>
          <button
            onClick={() => onNavigate("creator")}
            className="flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium px-4 py-3 rounded-xl transition-all text-sm cursor-pointer"
          >
            Criar com IA
          </button>
        </div>
      </div>

      {/* 2. Key Intelligence Metrics Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 transition-all hover:shadow-xs">
          <span className="text-slate-400 text-xs font-bold tracking-wider uppercase font-sans">Estudo Consistente</span>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-3xl font-extrabold text-slate-900 font-sans">5 dias</span>
            <span className="text-emerald-500 text-xs font-semibold bg-emerald-50 px-2.5 py-1 rounded">🔥 Ativo</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 transition-all hover:shadow-xs">
          <span className="text-slate-400 text-xs font-bold tracking-wider uppercase font-sans">Fila de Revisão</span>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-3xl font-extrabold text-slate-900 font-sans">{reviewQueue.length} cards</span>
            <span className={`${reviewQueue.length > 0 ? "text-indigo-600 bg-indigo-50" : "text-emerald-600 bg-emerald-50"} text-xs font-semibold px-2.5 py-1 rounded`}>
              {reviewQueue.length > 0 ? "Revisar hoje" : "Fila limpa"}
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32 transition-all hover:shadow-xs">
          <span className="text-slate-400 text-xs font-bold tracking-wider uppercase font-sans">Domínio Global</span>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {decks.length > 0 
                ? Math.round(decks.reduce((acc, d) => acc + (d.masteredPercent || 0), 0) / decks.length)
                : 0}%
            </span>
            <span className="text-indigo-500 text-xs font-semibold bg-indigo-50 px-2.5 py-1 rounded font-mono uppercase">USP COHORT</span>
          </div>
        </div>
      </div>

      {/* AI Insight Advisory Box (repositioned under metrics as a professional, beautiful alert item) */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6 flex items-start gap-4 transition-all hover:shadow-sm">
        <div className="w-1.5 h-12 bg-indigo-500 rounded-full shrink-0 self-center" />
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-indigo-700 font-bold uppercase tracking-wide inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Kardia AI Insight
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-500 font-sans px-2 py-0.5 rounded font-mono font-bold uppercase">Análise Preditiva</span>
          </div>
          <p className="text-sm font-semibold text-slate-800 leading-normal">
            "Foco de atenção recomendado: <span className="text-indigo-600 font-bold">{weakestDeck.name}</span>"
          </p>
          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            Com base em seu comportamento de aprendizado de ontem, identificamos maior lentidão na área de <strong className="text-slate-700 font-bold">Organelas / Anatomia</strong>. Uma prática curta de 5 minutos hoje reduzirá o declínio de sua curva de esquecimento.
          </p>
        </div>
      </div>

      {/* 3. Study Activity Chart & Recent Decks Split Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Density Activity Vector Map (Custom High-Fidelity Chart styled precisely like Geometric Balance) */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 lg:col-span-2 flex flex-col justify-between min-h-[340px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Atividade de Estudos</h3>
              <p className="text-xs text-slate-400 font-sans">Frequência de flashcards dominados esta semana</p>
            </div>
            <div className="flex space-x-1 border border-slate-100 rounded-lg p-1">
              <button className="px-3 py-1 bg-slate-100 rounded bg-white text-slate-800 text-[10px] font-bold uppercase tracking-wider">Semanal</button>
              <button className="px-3 py-1 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Histórico</button>
            </div>
          </div>

          <div className="flex-1 flex items-end space-x-4 pb-2 pt-6">
            {activity.map((act) => {
              // Find max height ratio (assume max is 50 for layout scaling)
              const percentage = Math.max(8, Math.min(100, (act.cardsCount / 50) * 100));
              return (
                <div key={act.day} className="flex-1 bg-slate-50 rounded-t-lg relative h-40 group">
                  <div
                    style={{ height: `${percentage}%` }}
                    className="absolute bottom-0 w-full bg-indigo-500 rounded-t-lg transition-all duration-500 hover:bg-indigo-600 cursor-pointer"
                  >
                    {/* Tooltip */}
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md transition-transform font-mono font-bold whitespace-nowrap z-20 pointer-events-none shadow-sm shadow-black/10">
                      {act.cardsCount} cards
                    </span>
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-extrabold uppercase font-mono">{act.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Decks Style patterned exactly like "Próximas Tarefas" in Geometric Balance */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 flex flex-col justify-between min-h-[340px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Baralhos Ativos</h3>
                <p className="text-xs text-slate-400">Progresso atual de assimilação</p>
              </div>
              <button 
                onClick={() => onNavigate("decks")} 
                className="text-indigo-600 hover:text-indigo-700 text-xs font-bold inline-flex items-center gap-0.5 cursor-pointer"
              >
                Ver todos
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {decks.slice(0, 3).map((deck, idx) => {
                // Alternating color pills for geometrical structure
                const colors = [
                  "bg-indigo-500",
                  "bg-pink-500",
                  "bg-emerald-500"
                ];
                const activeColor = colors[idx % colors.length];

                return (
                  <div key={deck.id} className="flex items-center p-3 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-slate-100/50">
                    <div className={`w-1.5 h-8 ${activeColor} rounded-full mr-3 shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-bold text-slate-800 truncate">{deck.name}</p>
                        <span className="text-xs font-bold text-slate-700 font-mono shrink-0">{deck.masteredPercent}%</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono uppercase mt-0.5">
                        <span>{deck.cards.length} cards</span>
                        <span className="truncate">{deck.category}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigate("decks")}
            className="w-full mt-4 py-3 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer uppercase tracking-wider"
          >
            Ver Detalhes do Curso
          </button>
        </div>
      </div>
    </div>
  );
}
