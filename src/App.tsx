import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Deck, Card, Community, StudyActivity } from "./types";
import { loadCommunities, getCardsForReviewToday } from "./data/mockData";
import { DashboardView } from "./components/DashboardView";
import { DecksLibraryView } from "./components/DecksLibraryView";
import { AiCreatorView } from "./components/AiCreatorView";
import { StudyModeView } from "./components/StudyModeView";
import { CardEditorView } from "./components/CardEditorView";
import { CommunitiesView } from "./components/CommunitiesView";
import { LoginScreen } from "./components/LoginScreen";
import { BrainCircuit, BookOpen, Sparkles, Users, Heart, BarChart2 } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

interface AuthPayload {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    is_admin: boolean;
  };
}

function getStoredAuth(): AuthPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem("kardia-auth");
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthPayload;
  } catch {
    return null;
  }
}

function mapDeckPayload(payload: any): Deck {
  return {
    id: payload.id,
    name: payload.name,
    description: payload.description,
    category: payload.category,
    cardsCount: payload.cardsCount ?? payload.cards?.length ?? 0,
    masteredPercent: payload.masteredPercent ?? 0,
    cards: (payload.cards || []).map((card: any) => ({
      ...card,
      id: card.id,
      deckId: card.deckId ?? payload.id,
      nextReviewDate: card.nextReviewDate ?? new Date().toISOString(),
    })),
    isCommunity: payload.isCommunity ?? false,
    author: payload.author,
    isOfficial: payload.isOfficial ?? false,
  };
}

function getCardMasteryScore(card: Card): number {
  const intervalScore = Math.min(card.interval / 7, 1);
  const repetitionScore = Math.min(card.repetition / 3, 1);
  const easeScore = Math.min((card.easeFactor - 1.3) / 1.5, 1);
  const reviewScore = new Date(card.nextReviewDate) <= new Date() ? 0.8 : 0.6;
  return Math.max(0, Math.min(1, 0.45 * intervalScore + 0.3 * repetitionScore + 0.15 * easeScore + 0.1 * reviewScore));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [decks, setDecks] = useState<Deck[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(getStoredAuth()));
  const [authToken, setAuthToken] = useState<string | null>(() => getStoredAuth()?.access_token ?? null);
  const [userName, setUserName] = useState<string>("Usuário");
  const [studyDeck, setStudyDeck] = useState<Deck | null>(null);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

  useEffect(() => {
    const loadedComms = loadCommunities();
    setCommunities(loadedComms);
  }, []);

  const recalculateDeckStats = useCallback((deck: Deck): Deck => {
    const cards = deck.cards;
    if (cards.length === 0) {
      return { ...deck, cardsCount: 0, masteredPercent: 0 };
    }

    const masteryScore = cards.reduce((sum, card) => sum + getCardMasteryScore(card), 0) / cards.length;
    return {
      ...deck,
      cardsCount: cards.length,
      masteredPercent: Math.round(masteryScore * 100),
    };
  }, []);

  const syncDeckToServer = useCallback(async (deck: Deck) => {
    if (!authToken) {
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/decks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          ...deck,
          cardsCount: deck.cards.length,
          masteredPercent: deck.masteredPercent,
        }),
      });
    } catch (error) {
      console.error("Failed to sync deck", error);
    }
  }, [authToken]);

  const refreshDecks = useCallback(async () => {
    if (!authToken) {
      setDecks([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/decks`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load decks");
      }

      const payload = await response.json();
      setDecks(payload.map(mapDeckPayload));
    } catch (error) {
      console.error("Failed to load decks", error);
      setDecks([]);
    }
  }, [authToken]);

  useEffect(() => {
    const storedAuth = getStoredAuth();
    if (storedAuth) {
      setUserName(storedAuth.user?.name || "Usuário");
      setAuthToken(storedAuth.access_token);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    void refreshDecks();
  }, [refreshDecks]);

  const handleLogin = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return false;
    }

    const payload = await response.json();
    window.localStorage.setItem("kardia-auth", JSON.stringify(payload));
    setUserName(payload.user?.name || "Usuário");
    setAuthToken(payload.access_token);
    setIsAuthenticated(true);
    return true;
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, is_admin: false }),
    });

    if (!response.ok) {
      return false;
    }

    return handleLogin(email, password);
  };

  const handleLogout = () => {
    window.localStorage.removeItem("kardia-auth");
    setAuthToken(null);
    setIsAuthenticated(false);
    setDecks([]);
    setUserName("Usuário");
  };

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

      const affectedDeck = updated.find((deck) => deck.id === deckId);
      if (affectedDeck) {
        void syncDeckToServer(affectedDeck);
      }
      return updated;
    });
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (!authToken) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/decks/${deckId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        setDecks((prev) => prev.filter((deck) => deck.id !== deckId));
      }
    } catch (error) {
      console.error("Failed to delete deck", error);
    }
  };

  const handleCreateDeck = async (name: string, description: string, category: string) => {
    if (!authToken) {
      return;
    }

    const newDeck: Deck = {
      id: `deck-${Date.now()}`,
      name,
      description,
      category,
      cardsCount: 0,
      masteredPercent: 0,
      cards: [],
    };

    try {
      const response = await fetch(`${API_BASE_URL}/decks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ ...newDeck, cardsCount: 0, masteredPercent: 0 }),
      });

      if (response.ok) {
        const payload = await response.json();
        setDecks((prev) => [...prev, mapDeckPayload(payload)]);
      }
    } catch (error) {
      console.error("Failed to create deck", error);
    }
  };

  const handleUpdateDeckCards = async (
    deckId: string,
    updatedCards: Card[],
    metadata?: Partial<Pick<Deck, "name" | "description" | "category">>
  ) => {
    if (!authToken) {
      return;
    }

    const deck = decks.find((item) => item.id === deckId);
    if (!deck) {
      return;
    }

    const updatedDeck = recalculateDeckStats({
      ...deck,
      ...metadata,
      cards: updatedCards,
    });

    setDecks((prevDecks) => prevDecks.map((item) => (item.id === deckId ? updatedDeck : item)));
    await syncDeckToServer(updatedDeck);
  };

  const handleSaveGeneratedCards = async (
    deckId: string,
    stagedCards: Omit<Card, "id" | "deckId" | "interval" | "repetition" | "easeFactor" | "nextReviewDate">[]
  ) => {
    if (!authToken) {
      return;
    }

    const deck = decks.find((item) => item.id === deckId);
    if (!deck) {
      return;
    }

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

    const combinedDeck = recalculateDeckStats({ ...deck, cards: [...deck.cards, ...newCards] });
    setDecks((prevDecks) => prevDecks.map((item) => (item.id === deckId ? combinedDeck : item)));
    await syncDeckToServer(combinedDeck);
  };

  const handleImportDeck = async (communityDeck: Deck) => {
    if (!authToken) {
      return;
    }

    const localizedId = `imported-${communityDeck.id}-${Date.now()}`;
    const localizedCards: Card[] = communityDeck.cards.map((card, index) => ({
      ...card,
      id: `imported-c-${Date.now()}-${index}`,
      deckId: localizedId,
      nextReviewDate: new Date().toISOString(),
    }));

    const localizedDeck: Deck = {
      ...communityDeck,
      id: localizedId,
      name: `[USP] ${communityDeck.name}`,
      cards: localizedCards,
      isCommunity: false,
    };

    const normalizedDeck = recalculateDeckStats(localizedDeck);
    setDecks((prev) => {
      if (prev.some((deck) => deck.name === normalizedDeck.name)) {
        return prev;
      }
      return [...prev, normalizedDeck];
    });
    await syncDeckToServer(normalizedDeck);
  };

  const activity = useMemo<StudyActivity[]>(() => {
    const labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    return labels.map((day, index) => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - (6 - index));
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      const cardsCount = decks.reduce((sum, deck) => {
        return sum + deck.cards.filter((card) => {
          const reviewDate = new Date(card.nextReviewDate);
          return reviewDate >= start && reviewDate <= end;
        }).length;
      }, 0);

      return { day, cardsCount };
    });
  }, [decks]);

  const reviewQueue = useMemo(() => getCardsForReviewToday(decks), [decks]);

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

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
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
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs uppercase flex items-center justify-center">
                {userName.slice(0, 2).toUpperCase()}
              </div>
              <span className="max-w-[120px] truncate">{userName}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {studyDeck ? (
          <StudyModeView
            deck={studyDeck}
            onFinishStudy={() => setStudyDeck(null)}
            onUpdateCardMetrics={handleUpdateCardMetrics}
          />
        ) : editingDeck ? (
          <CardEditorView
            deck={editingDeck}
            onClose={() => setEditingDeck(null)}
            onUpdateDeckCards={handleUpdateDeckCards}
          />
        ) : (
          renderActiveTabContent()
        )}
      </main>

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
