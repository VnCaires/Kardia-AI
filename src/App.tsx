import React, { useState, useEffect } from "react";
import { Deck, Card, Community, StudyActivity } from "./types";
import { loadDecks, saveDecks, loadCommunities, saveCommunities, MOCK_STUDY_ACTIVITY, getCardsForReviewToday } from "./data/mockData";
import { DashboardView } from "./components/DashboardView";
import { DecksLibraryView } from "./components/DecksLibraryView";
import { AiCreatorView } from "./components/AiCreatorView";
import { StudyModeView } from "./components/StudyModeView";
import { CardEditorView } from "./components/CardEditorView";
import { CommunitiesView } from "./components/CommunitiesView";
import { BrainCircuit, BookOpen, Sparkles, Users, Award, AlertCircle, Heart, BarChart2 } from "lucide-react";

export default function App() {
  // 1. Navigation & Core State
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [decks, setDecks] = useState<Deck[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [activity, setActivity] = useState<StudyActivity[]>(MOCK_STUDY_ACTIVITY);

  // Active sub-views (overlaying the tabs when triggered)
  const [studyDeck, setStudyDeck] = useState<Deck | null>(null);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

  // 2. Hydration of local storage
  useEffect(() => {
    const loadedDecks = loadDecks();
    const loadedComms = loadCommunities();
    setDecks(loadedDecks);
    setCommunities(loadedComms);
  }, []);

  // Recalculate and update master status factor inside a deck
  const recalculateDeckStats = (deck: Deck): Deck => {
    const cards = deck.cards;
    if (cards.length === 0) {
      return { ...deck, cardsCount: 0, masteredPercent: 0 };
    }
    // Consider card "mastered" for active deck metrics if interval > 3 or repetition > 1
    const masteredCount = cards.filter((c) => c.interval > 3 || c.repetition > 1).length;
    const masteredPercent = Math.round((masteredCount / cards.length) * 100);
    return {
      ...deck,
      cardsCount: cards.length,
      masteredPercent,
    };
  };

  // 3. Central Event Handlers
  const handleUpdateCardMetrics = (deckId: string, cardId: string, updatedMetrics: Partial<Card>) => {
    setDecks((prevDecks) => {
      const updated = prevDecks.map((deck) => {
        if (deck.id !== deckId) return deck;
        const updatedCards = deck.cards.map((card) => {
          if (card.id !== cardId) return card;
          return { ...card, ...updatedMetrics };
        });
        const intermediateDeck = { ...deck, cards: updatedCards };
        return recalculateDeckStats(intermediateDeck);
      });
      saveDecks(updated);
      return updated;
    });

    // Update daily activity counts for gamification visuals
    setActivity((prev) => {
      const copy = [...prev];
      if (copy.length > 0) {
        copy[0] = { ...copy[0], cardsCount: copy[0].cardsCount + 1 };
      }
      return copy;
    });
  };

  const handleDeleteDeck = (deckId: string) => {
    setDecks((prev) => {
      const filtered = prev.filter((d) => d.id !== deckId);
      saveDecks(filtered);
      return filtered;
    });
  };

  const handleCreateDeck = (name: string, description: string, category: string) => {
    const newDeck: Deck = {
      id: `deck-${Date.now()}`,
      name,
      description,
      category,
      cardsCount: 0,
      masteredPercent: 0,
      cards: [],
    };
    setDecks((prev) => {
      const updated = [...prev, newDeck];
      saveDecks(updated);
      return updated;
    });
  };

  const handleUpdateDeckCards = (deckId: string, updatedCards: Card[]) => {
    setDecks((prevDecks) => {
      const updated = prevDecks.map((deck) => {
        if (deck.id !== deckId) return deck;
        const intermediateDeck = { ...deck, cards: updatedCards };
        return recalculateDeckStats(intermediateDeck);
      });
      saveDecks(updated);
      return updated;
    });
  };

  const handleSaveGeneratedCards = (
    deckId: string,
    stagedCards: Omit<Card, "id" | "deckId" | "interval" | "repetition" | "easeFactor" | "nextReviewDate">[]
  ) => {
    setDecks((prevDecks) => {
      const updated = prevDecks.map((deck) => {
        if (deck.id !== deckId) return deck;
        
        const newCards: Card[] = stagedCards.map((sc, index) => ({
          id: `ai-card-${Date.now()}-${index}`,
          deckId,
          front: sc.front,
          back: sc.back,
          type: sc.type,
          options: sc.options,
          tag: sc.tag,
          difficulty: sc.difficulty,
          interval: 1,
          repetition: 0,
          easeFactor: 2.5,
          nextReviewDate: new Date().toISOString(),
        }));

        const combinedCards = [...deck.cards, ...newCards];
        const intermediateDeck = { ...deck, cards: combinedCards };
        return recalculateDeckStats(intermediateDeck);
      });
      saveDecks(updated);
      return updated;
    });
  };

  const handleImportDeck = (communityDeck: Deck) => {
    const localizedId = `imported-${communityDeck.id}-${Date.now()}`;
    const localizedCards: Card[] = communityDeck.cards.map((c, index) => ({
      ...c,
      id: `imported-c-${Date.now()}-${index}`,
      deckId: localizedId,
      nextReviewDate: new Date().toISOString(), // resets schedule to study today
    }));

    const localizedDeck: Deck = {
      ...communityDeck,
      id: localizedId,
      name: `[USP] ${communityDeck.name}`,
      cards: localizedCards,
      isCommunity: false,
    };

    setDecks((prev) => {
      // Avoid duplicated imports
      if (prev.some((d) => d.name === localizedDeck.name)) return prev;
      const updated = [...prev, recalculateDeckStats(localizedDeck)];
      saveDecks(updated);
      return updated;
    });
  };

  // Compile general review queue across all baralhos
  const reviewQueue = getCardsForReviewToday(decks);

  // 4. Router Rendering Logic
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView
            decks={decks}
            reviewQueue={reviewQueue}
            activity={activity}
            onNavigate={setActiveTab}
            onStartReview={(deck) => setStudyDeck(deck)}
          />
        );
      case "decks":
        return (
          <DecksLibraryView
            decks={decks}
            onStartReview={(deck) => setStudyDeck(deck)}
            onEditDeck={(deck) => setEditingDeck(deck)}
            onDeleteDeck={handleDeleteDeck}
            onCreateDeck={handleCreateDeck}
          />
        );
      case "creator":
        return (
          <AiCreatorView
            decks={decks}
            onSaveGeneratedCards={handleSaveGeneratedCards}
            onNavigate={setActiveTab}
          />
        );
      case "communities":
        return (
          <CommunitiesView
            communities={communities}
            onImportDeck={handleImportDeck}
          />
        );
      default:
        return <div>Não encontrado.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* 1. Global Navigation Scaffolding Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            onClick={() => {
              setStudyDeck(null);
              setEditingDeck(null);
              setActiveTab("dashboard");
            }}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 select-none group"
          >
            <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-xs flex items-center justify-center border border-slate-800">
              <BrainCircuit className="w-5.5 h-5.5 text-indigo-400" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg uppercase tracking-wider block leading-none font-sans">
                Kardia<span className="text-indigo-600">.AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold block mt-0.5 tracking-wide uppercase font-mono">
                Cognitive Flow Engine
              </span>
            </div>
          </div>

          {/* Normal tab switchers - styled precisely like Geometric Balance nav buttons */}
          {!studyDeck && !editingDeck && (
            <nav className="hidden md:flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/60"
                }`}
              >
                Painel Geral
              </button>
              <button
                onClick={() => setActiveTab("decks")}
                className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === "decks"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/60"
                }`}
              >
                Projetos & Baralhos
              </button>
              <button
                onClick={() => setActiveTab("creator")}
                className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === "creator"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/60"
                }`}
              >
                Criador Inteligente
              </button>
              <button
                onClick={() => setActiveTab("communities")}
                className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === "communities"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/60"
                }`}
              >
                Redes & Fóruns
              </button>
            </nav>
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-50 rounded-full px-3.5 py-1.5 border border-amber-150/40">
              <span className="text-xs font-black text-amber-700 font-sans">🔥 5 dias</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 overflow-hidden relative">
              <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-xs uppercase">
                USP
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
            </div>
          </div>
        </div>
      </header>

      {/* 2. Primary Layout Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Overlay Study View */}
        {studyDeck ? (
          <StudyModeView
            deck={studyDeck}
            onFinishStudy={() => setStudyDeck(null)}
            onUpdateCardMetrics={handleUpdateCardMetrics}
          />
        ) : editingDeck ? (
          /* Overlay Editor View */
          <CardEditorView
            deck={editingDeck}
            onClose={() => setEditingDeck(null)}
            onUpdateDeckCards={handleUpdateDeckCards}
          />
        ) : (
          /* Normal Tab Router */
          renderActiveTabContent()
        )}
      </main>

      {/* Mobile Tab bar - absolute bottom targeting mobile devices */}
      {!studyDeck && !editingDeck && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3 px-4 flex justify-around items-center z-40 shadow-sm">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center gap-1.5 text-[10px] font-bold cursor-pointer transition-colors ${activeTab === "dashboard" ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
          >
            <BarChart2 className="w-4.5 h-4.5" />
            Painel Geral
          </button>
          <button
            onClick={() => setActiveTab("decks")}
            className={`flex flex-col items-center gap-1.5 text-[10px] font-bold cursor-pointer transition-colors ${activeTab === "decks" ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
          >
            <BookOpen className="w-4.5 h-4.5" />
            Baralhos
          </button>
          <button
            onClick={() => setActiveTab("creator")}
            className={`flex flex-col items-center gap-1.5 text-[10px] font-bold cursor-pointer transition-colors ${activeTab === "creator" ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Sparkles className="w-4.5 h-4.5" />
            Criador IA
          </button>
          <button
            onClick={() => setActiveTab("communities")}
            className={`flex flex-col items-center gap-1.5 text-[10px] font-bold cursor-pointer transition-colors ${activeTab === "communities" ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Users className="w-4.5 h-4.5" />
            Comunidades
          </button>
        </div>
      )}

      {/* 3. Humble human credits footer */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 mt-12 pb-20 md:pb-6 font-sans">
        <p className="flex items-center justify-center gap-1 font-medium text-slate-500">
          Kardia AI • Cognitive Spaced Repetition built with
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          for students worldwide.
        </p>
      </footer>
    </div>
  );
}
