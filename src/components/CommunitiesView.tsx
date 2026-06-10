import React, { useState } from "react";
import { Community, Deck } from "../types";
import { Users, Megaphone, Calendar, Award, Sparkles, TrendingUp, AlertTriangle, Inbox, Check, ArrowRight, ArrowDownToLine, Globe, Layers } from "lucide-react";

interface CommunitiesViewProps {
  communities: Community[];
  onImportDeck: (deck: Deck) => void;
}

export function CommunitiesView({ communities, onImportDeck }: CommunitiesViewProps) {
  const [selectedCommId, setSelectedCommId] = useState<string>(communities[0]?.id || "");
  const [importedDecks, setImportedDecks] = useState<Record<string, boolean>>({});

  const activeComm = communities.find((c) => c.id === selectedCommId) || communities[0];

  const handleImport = (deck: Deck) => {
    onImportDeck(deck);
    setImportedDecks((prev) => ({ ...prev, [deck.id]: true }));
    setTimeout(() => {
      // Clear badge after 3 seconds
      setImportedDecks((prev) => ({ ...prev, [deck.id]: false }));
    }, 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="kardia-communities">
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Comunidades Acadêmicas</h2>
          <p className="text-xs text-slate-500">Acesse e compartilhe baralhos com turmas oficiais de universidades e grupos de estudo.</p>
        </div>

        {/* Community switcher pills - styled with elegant slate elements */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-xs">
          {communities.map((comm) => (
            <button
              key={comm.id}
              onClick={() => setSelectedCommId(comm.id)}
              className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                selectedCommId === comm.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {comm.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {activeComm ? (
        <div className="space-y-8">
          {/* Main Community Header banner card matching slate logo header */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 relative overflow-hidden shadow-xs border border-slate-800">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1 bg-indigo-500/25 border border-indigo-400/30 text-indigo-300 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase">
                <Globe className="w-3 h-3" />
                Colegiado Oficial
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{activeComm.name}</h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-xl font-normal">
                {activeComm.tagline}
              </p>
            </div>

            <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl p-4">
              <Users className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="text-xs text-slate-400 block font-mono">ESTUDANTES</span>
                <span className="font-extrabold text-sm">{activeComm.members} integrados</span>
              </div>
            </div>
          </div>

          {/* Core content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Column Left: Notice Mural (Col span 4) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-250 pb-3">
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Mural de Avisos</h3>
              </div>

              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                {activeComm.noticeBoard.map((notice) => (
                  <div key={notice.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-left hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                        {notice.date}
                      </span>
                      {notice.badge && (
                        <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded leading-none">
                          {notice.badge}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{notice.title}</h4>
                    <p className="text-xs text-slate-500 font-sans leading-relaxed">{notice.content}</p>
                    <div className="text-[10px] font-semibold text-slate-600 border-t border-slate-200/50 pt-2 font-mono">
                      Por: {notice.author}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column Center: Shared Decks & Teacher dashboard (Col span 8) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Official Decks display card */}
              <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-250 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Baralhos Oficiais da Turma</h3>
                    <p className="text-xs text-slate-500">Compartilhados e verificados pelo corpo acadêmico</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {activeComm.officialDecks.map((deck) => {
                    const isImported = importedDecks[deck.id];
                    return (
                      <div
                        key={deck.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-slate-50/30 hover:bg-white hover:shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded bg-slate-900 text-white font-mono">
                              {deck.category}
                            </span>
                            <span className="text-[10px] font-extrabold text-slate-500 font-mono text-xs">
                              {deck.cards.length} cards
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm sm:text-base">{deck.name}</h4>
                          <p className="text-xs text-slate-500 font-sans max-w-md leading-relaxed">{deck.description}</p>
                          <div className="text-[10px] text-slate-400 font-medium font-sans">
                            Autor: {deck.author}
                          </div>
                        </div>

                        <button
                          onClick={() => handleImport(deck)}
                          disabled={isImported}
                          className={`w-full sm:w-auto text-xs font-bold py-2.5 px-4 rounded-xl inline-flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer ${
                            isImported
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-indigo-500 hover:bg-indigo-600 text-white"
                          }`}
                        >
                          {isImported ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                              Adicionado!
                            </>
                          ) : (
                            <>
                              <ArrowDownToLine className="w-3.5 h-3.5" />
                              Estudar Deck
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Teacher Dashboard Pulse area */}
              <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-250 pb-3 gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base inline-flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      Dashboard do Professor (Cohort Pulse)
                    </h3>
                    <p className="text-xs text-slate-500">Desempenho agregado da turma e acompanhamento preditivo</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 font-mono">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded">
                      Frequência: {activeComm.teacherPulse.completionRate}%
                    </span>
                  </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wide font-sans">
                      Presença Hoje
                    </span>
                    <span className="text-xl font-extrabold text-slate-800">
                      {activeComm.teacherPulse.activeToday} alunos
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wide font-sans">
                      Acurácia Geral
                    </span>
                    <span className="text-xl font-extrabold text-slate-800">
                      {activeComm.teacherPulse.avgScore}% média
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl text-center col-span-2 sm:col-span-1 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wide font-sans">
                      Status do Bloco
                    </span>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full inline-block mt-1">
                      Em Progresso
                    </span>
                  </div>
                </div>

                {/* Attention flags */}
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-bold text-red-500 flex items-center gap-1 uppercase tracking-wide">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                    Estudantes que Recomendam Atenção Técnica (Preditivo)
                  </span>

                  <div className="space-y-3">
                    {activeComm.teacherPulse.attentionNeeded.map((student, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-red-50/30 border border-red-100/60 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-red-50/50"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-10 h-10 rounded-full object-cover shrink-0 border border-red-100"
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-left space-y-0.5">
                            <span className="font-bold text-slate-800 text-sm block">{student.name}</span>
                            <span className="text-[11px] text-slate-500 leading-normal block">
                              Motivo: {student.reason}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400 block">
                              Módulo: {student.deckName}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-red-600 bg-red-100/60 px-2.5 py-1 rounded-full font-sans">
                            Acurácia: {student.accuracy}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Scholar Leaderboard Row */}
              <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-4">
                <div className="border-b border-slate-250 pb-3 text-left">
                  <h3 className="font-bold text-slate-900 text-base inline-flex items-center gap-1.5">
                    <Award className="w-4.5 h-4.5 text-amber-500 fill-amber-100" />
                    Top Scholars (Leaderboard de XP)
                  </h3>
                  <p className="text-xs text-slate-500">Os estudantes com maior consistência cognitiva na rede semanal</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeComm.topScholars.map((scholar) => (
                    <div
                      key={scholar.rank}
                      className="bg-slate-50 hover:bg-slate-100/50 border border-slate-100 p-4 rounded-2xl text-center relative flex flex-col items-center justify-center space-y-2 h-44 transition-all"
                    >
                      <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-[10px]">
                        #{scholar.rank}
                      </div>

                      <img
                        src={scholar.avatar}
                        alt={scholar.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white ring-2 ring-indigo-100"
                        referrerPolicy="no-referrer"
                      />

                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 text-xs block truncate max-w-[130px]">
                          {scholar.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {scholar.xp.toLocaleString()} XP
                        </span>
                      </div>

                      <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-sans">
                        🔥 Streak: {scholar.streak} d
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-12 text-slate-400">
          Nenhuma comunidade disponível no momento.
        </div>
      )}
    </div>
  );
}
