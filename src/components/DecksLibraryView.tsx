import React, { useState } from "react";
import { Deck } from "../types";
import { Plus, BookOpen, GraduationCap, Edit, Trash2, ChevronRight, Play, Eye } from "lucide-react";

interface DecksLibraryViewProps {
  decks: Deck[];
  onStartReview: (deck: Deck) => void;
  onEditDeck: (deck: Deck) => void;
  onDeleteDeck: (deckId: string) => void;
  onCreateDeck: (name: string, description: string, category: string) => void;
}

export function DecksLibraryView({
  decks,
  onStartReview,
  onEditDeck,
  onDeleteDeck,
  onCreateDeck,
}: DecksLibraryViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckDesc, setNewDeckDesc] = useState("");
  const [newDeckCategory, setNewDeckCategory] = useState("Geral");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    onCreateDeck(newDeckName, newDeckDesc, newDeckCategory);
    setNewDeckName("");
    setNewDeckDesc("");
    setNewDeckCategory("Geral");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="kardia-decks-library">
      {/* Upper header action area */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Meus Baralhos</h2>
          <p className="text-xs text-slate-500">Selecione um baralho para revisar por repetição espaçada ou gerenciar seus cartões.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-4.5 py-2.5 rounded-lg inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border border-slate-800"
        >
          <Plus className="w-4 h-4" />
          Novo Baralho
        </button>
      </div>

      {/* Grid displays */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dynamic Cards */}
        {decks.map((deck) => {
          // Identify cards due for review
          const now = new Date();
          const cardsDue = deck.cards.filter(c => new Date(c.nextReviewDate) <= now).length;

          return (
            <div
              key={deck.id}
              className="bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md rounded-2xl p-6 transition-all duration-350 flex flex-col justify-between group h-64"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded bg-slate-900 text-white font-mono">
                    {deck.category}
                  </span>
                  {cardsDue > 0 ? (
                    <span className="text-[10px] font-bold text-white bg-indigo-500 px-2 py-0.5 rounded-full font-sans shadow-xs">
                      {cardsDue} pendentes
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-sans">
                      Em dia
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {deck.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 h-8 font-sans leading-relaxed">
                    {deck.description || "Sem descrição disponível."}
                  </p>
                </div>
              </div>

              {/* Progress and Action items */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="font-bold text-slate-500">{deck.cards.length} cartões</span>
                    <span className="font-extrabold text-slate-700">{deck.masteredPercent}% dominado</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${deck.masteredPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {deck.cards.length > 0 ? (
                    <button
                      onClick={() => onStartReview(deck)}
                      className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs py-2 rounded-lg inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      Praticar
                    </button>
                  ) : (
                    <button
                      onClick={() => onEditDeck(deck)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 rounded-lg inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      Adicionar Cards
                    </button>
                  )}
                  <button
                    onClick={() => onEditDeck(deck)}
                    title="Editar baralho"
                    className="p-2 border border-slate-250 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteDeck(deck.id)}
                    title="Excluir baralho"
                    className="p-2 border border-slate-250 hover:bg-red-50 hover:border-red-100 rounded-lg text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty Dashed Create Card */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="border border-dashed border-slate-300 hover:border-slate-500 hover:bg-slate-50/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 transition-all group h-64 bg-white/50 cursor-pointer"
        >
          <div className="rounded-full bg-slate-100 p-3 text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="font-extrabold text-slate-700 text-sm block">Criar Novo Baralho</span>
            <span className="text-xs text-slate-400 max-w-[200px] block">Crie um baralho manual ou com inteligência artificial.</span>
          </div>
        </button>
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Novo Baralho de Estudos</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Nome do Baralho</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Anatomia Clinica III"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Descrição</label>
                <textarea
                  rows={3}
                  placeholder="Do que se trata esse baralho?"
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Área / Categoria</label>
                <select
                  value={newDeckCategory}
                  onChange={(e) => setNewDeckCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-hidden focus:border-indigo-500 bg-white"
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

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm py-2.5 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 rounded-xl shadow-xs cursor-pointer"
                >
                  Criar Baralho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
