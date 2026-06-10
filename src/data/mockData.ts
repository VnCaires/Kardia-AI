import { Deck, Community, Card, StudyActivity } from "../types";

// Dynamic dates
const today = new Date().toISOString();
const tomorrow = new Date(Date.now() + 86400000).toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();

export const DEFAULT_DECKS: Deck[] = [
  {
    id: "biologia-celular",
    name: "Biologia Celular",
    description: "Estudo detalhado das organelas, membrana celular, divisão celular (mitose/meiose) e metabolismo citoplasmático.",
    category: "Ciências Biológicas",
    cardsCount: 6,
    masteredPercent: 74,
    author: "Kardia Community",
    cards: [
      {
        id: "bc-1",
        deckId: "biologia-celular",
        front: "Qual é a principal função dos ribossomos na célula humana?",
        back: "A síntese de proteínas (tradução do RNA mensageiro em cadeias de aminoácidos).",
        type: "qa",
        tag: "Organelas",
        difficulty: "easy",
        interval: 3,
        repetition: 2,
        easeFactor: 2.6,
        nextReviewDate: today
      },
      {
        id: "bc-2",
        deckId: "biologia-celular",
        front: "Onde ocorre a maior parte da produção de ATP durante a respiração celular aeróbica?",
        back: "Nas cristas mitocondriais e na matriz mitocondrial (através do Ciclo de Krebs e da Cadeia Transportadora de Elétrons).",
        type: "qa",
        tag: "Metabolismo",
        difficulty: "medium",
        interval: 1,
        repetition: 0,
        easeFactor: 2.4,
        nextReviewDate: today
      },
      {
        id: "bc-3",
        deckId: "biologia-celular",
        front: "Durante qual fase da mitose os cromossomos se alinham na placa metafásica celular?",
        back: "Metáfase. É a etapa onde os fusos mitóticos se conectam aos centrômeros dos cromossomos duplicados.",
        type: "mcq",
        options: ["Prófase", "Metáfase", "Anáfase", "Telófase"],
        tag: "Fases da Mitose",
        difficulty: "medium",
        interval: 10,
        repetition: 4,
        easeFactor: 2.5,
        nextReviewDate: tomorrow
      },
      {
        id: "bc-4",
        deckId: "biologia-celular",
        front: "A difusão facilitadora consome diretamente moléculas de energia celular (ATP) para atravessar íons pela membrana.",
        back: "Falso. A difusão facilitada é um tipo de transporte passivo, movendo substâncias a favor de seu gradiente de concentração, sem consumir ATP.",
        type: "tf",
        tag: "Transporte Celular",
        difficulty: "easy",
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        nextReviewDate: today
      },
      {
        id: "bc-5",
        deckId: "biologia-celular",
        front: "Quais organelas são responsáveis por digerir partículas e organelas velhas através de enzimas hidrolíticas?",
        back: "Lisossomos. Eles contêm endonucleases estritas e lipases ativas em pH ácido (cerca de 4.8 a 5.0).",
        type: "qa",
        tag: "Fagocitose",
        difficulty: "medium",
        interval: 2,
        repetition: 1,
        easeFactor: 2.3,
        nextReviewDate: yesterday
      },
      {
        id: "bc-6",
        deckId: "biologia-celular",
        front: "A carioteca (envoltório nuclear) desaparece completamente na Anáfase da ciclo mitótico.",
        back: "Falso. O envelope nuclear se desintegra no início da prófase/prometáfase e se reorganiza no final da telófase.",
        type: "tf",
        tag: "Ciclo Celular",
        difficulty: "hard",
        interval: 1,
        repetition: 0,
        easeFactor: 2.1,
        nextReviewDate: today
      }
    ]
  },
  {
    id: "direito-civil",
    name: "Direito Civil",
    description: "Teoria geral dos negócios jurídicos, contratos bilaterais, vícios do consentimento e direitos reais patrimoniais.",
    category: "Ciências Jurídicas",
    cardsCount: 4,
    masteredPercent: 42,
    author: "Prof. Alberto Santos",
    cards: [
      {
        id: "dc-1",
        deckId: "direito-civil",
        front: "Qual é o prazo geral de prescrição previsto no Código Civil quando a lei não houver fixado prazo menor?",
        back: "10 anos (Artigo 205 do Código Civil Brasileiro).",
        type: "qa",
        tag: "Prazos Prescricionais",
        difficulty: "medium",
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        nextReviewDate: today
      },
      {
        id: "dc-2",
        deckId: "direito-civil",
        front: "O vício de consentimento que ocorre quando há uma ameaça física ou psicológica que obriga o sujeito a celebrar o negócio jurídico denomina-se:",
        back: "Coação. É um vício de vontade capaz de anular o negócio jurídico no prazo decadencial de 4 anos.",
        type: "mcq",
        options: ["Erro ou ignorância", "Dolo", "Coação", "Lesão culposa"],
        tag: "Vícios de Vontade",
        difficulty: "hard",
        interval: 1,
        repetition: 0,
        easeFactor: 2.2,
        nextReviewDate: today
      },
      {
        id: "dc-3",
        deckId: "direito-civil",
        front: "O menor relativamente incapaz (de 16 a 18 anos) celebra atos da vida civil sob o regime jurídico de representação.",
        back: "Falso. Eles são assistidos (Art. 4º, CC). Os absolutamente incapazes (menores de 16 anos) é que são representados por seus responsáveis legítimos.",
        type: "tf",
        tag: "Capacidade Civil",
        difficulty: "easy",
        interval: 15,
        repetition: 5,
        easeFactor: 2.7,
        nextReviewDate: tomorrow
      },
      {
        id: "dc-4",
        deckId: "direito-civil",
        front: "Quais são os três requisitos de validade essenciais a qualquer negócio jurídico segundo o Art. 104 do CC?",
        back: "I) Agente capaz; II) Objeto lícito, possível, determinado ou determinável; III) Forma prescrita ou não defesa em lei.",
        type: "qa",
        tag: "Validade do Negócio",
        difficulty: "easy",
        interval: 1,
        repetition: 0,
        easeFactor: 2.4,
        nextReviewDate: today
      }
    ]
  },
  {
    id: "ingles-avancado",
    name: "Inglês Avançado",
    description: "Expressões idiomáticas raras, vocabulário acadêmico de alta frequência e phrasal verbs corporativos.",
    category: "Idiomas",
    cardsCount: 5,
    masteredPercent: 12,
    author: "Monica Geller",
    cards: [
      {
        id: "eng-1",
        deckId: "ingles-avancado",
        front: "What does the english idiom 'to bite the bullet' fundamentally mean?",
        back: "To force yourself to do something difficult or unpleasant that you have been avoiding, facing it with courage.",
        type: "qa",
        tag: "Idioms",
        difficulty: "easy",
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        nextReviewDate: today
      },
      {
        id: "eng-2",
        deckId: "ingles-avancado",
        front: "Choose the correct spelling of the word defined as 'a subtle distinction, option, or variation':",
        back: "Nuance. Pronounced /ˈnjuː.ɑːns/, meaning a subtle difference in flavor, color, meaning, or opinion.",
        type: "mcq",
        options: ["Newance", "Nuance", "Nuwance", "Neuance"],
        tag: "Vocabulary",
        difficulty: "medium",
        interval: 1,
        repetition: 0,
        easeFactor: 2.3,
        nextReviewDate: today
      },
      {
        id: "eng-3",
        deckId: "ingles-avancado",
        front: "The phrasal verb 'to touch base' means to establish a contact or briefly check in with someone.",
        back: "Verdadeiro. It's highly used in formal business contexts to check in on progress, agreements, or feedback.",
        type: "tf",
        tag: "Business English",
        difficulty: "easy",
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        nextReviewDate: today
      },
      {
        id: "eng-4",
        deckId: "ingles-avancado",
        front: "What is the sophisticated synonym for 'everyday', 'ordinary' or 'lacking excitement'?",
        back: "Mundane (or 'banal'). Ex: 'His mundane routines left him feeling isolated in the corporate setting.'",
        type: "qa",
        tag: "Lexico",
        difficulty: "hard",
        interval: 1,
        repetition: 0,
        easeFactor: 2.0,
        nextReviewDate: today
      },
      {
        id: "eng-5",
        deckId: "ingles-avancado",
        front: "Complete the sentence with the appropriate idiom: 'He had a rough start, but he finally...'",
        back: "got his feet wet. Meaning starting to experience something new, or getting adjusted to the environment.",
        type: "mcq",
        options: ["beat around the bush", "got his feet wet", "hit the sack", "let the cat out"],
        tag: "Idioms",
        difficulty: "hard",
        interval: 1,
        repetition: 0,
        easeFactor: 2.1,
        nextReviewDate: today
      }
    ]
  }
];

export const MOCK_STUDY_ACTIVITY: StudyActivity[] = [
  { day: "Seg", cardsCount: 18 },
  { day: "Ter", cardsCount: 24 },
  { day: "Qua", cardsCount: 32 },
  { day: "Qui", cardsCount: 15 },
  { day: "Sex", cardsCount: 42 },
  { day: "Sáb", cardsCount: 10 },
  { day: "Dom", cardsCount: 8 }
];

export const MOCK_COMMUNITIES: Community[] = [
  {
    id: "med-usp-2024",
    name: "Medicina USP 2024",
    tagline: "Turma Oficial de Medicina da USP - Coorte de Internato Integrado",
    members: 142,
    noticeBoard: [
      {
        id: "n-1",
        title: "Estrutura de Formatação da Prova de Prática Cardiovascular",
        author: "Prof. Dr. Ricardo Vasconcellos (Coordenador)",
        date: "Há 2 horas",
        content: "Estimados alunos, o bloco teórico e prático de Cardiologia Clínica seguirá o modelo de OSCE em 6 estações sequenciais. Recomendo revisão intensiva sobre auscultas cardíacas valvulares e interpretação de eletrocardiograma agudo.",
        badge: "Importante"
      },
      {
        id: "n-2",
        title: "Plantão Extra: Cirurgia Geral e Trauma",
        author: "Dra. Renata Albuquerque",
        date: "Há 1 dia",
        content: "Plantão prático opcional de suturas e drenagem nesta quinta-feira às 14h00 no laboratório de habilidades cirúrgicas do bloco central.",
        badge: "Plantão"
      }
    ],
    officialDecks: [
      {
        id: "comm-cardio",
        name: "Sistema Cardiovascular: Anatomia e Fisiopatologia Básica",
        description: "Ciclos de ejeção valvular, pressões cardíacas, sopros e eletrofisiologia sinusal.",
        category: "Cardiologia",
        cardsCount: 4,
        masteredPercent: 40,
        author: "Prof. Dr. Ricardo Vasconcellos",
        isOfficial: true,
        cards: [
          {
            id: "cardio-1",
            deckId: "comm-cardio",
            front: "O que caracteriza o sopro na estenose aórtica em relação ao ciclo cardíaco?",
            back: "Um sopro sistólico em crescendo-decrescendo (em diamante), audível principalmente no foco aórtico, que irradia para as carótidas.",
            type: "qa",
            tag: "Sopros",
            difficulty: "hard",
            interval: 1,
            repetition: 0,
            easeFactor: 2.5,
            nextReviewDate: today
          },
          {
            id: "cardio-2",
            deckId: "comm-cardio",
            front: "Qual é o principal marcapasso fisiológico do tecido de condução do coração?",
            back: "Nó Sinoatrial (conhecido pelas células P autodespolarizáveis no teto do átrio direito).",
            type: "qa",
            tag: "Eletrofisiologia",
            difficulty: "easy",
            interval: 1,
            repetition: 0,
            easeFactor: 2.5,
            nextReviewDate: today
          },
          {
            id: "cardio-3",
            deckId: "comm-cardio",
            front: "O fechamento de quais valvas cardíacas corresponde ao primeiro ruído cardíaco (TUM ou B1)?",
            back: "Valvas Mitral e Tricúspide (valvas atrioventriculares bilaterais), logo no início da sístole ventricular isométrica.",
            type: "mcq",
            options: ["Valvas Mitral e Tricúspide", "Valvas Aórtica e Pulmonar", "Valvas Atriais", "Seios Coronários"],
            tag: "Sons Cardíacos",
            difficulty: "easy",
            interval: 1,
            repetition: 0,
            easeFactor: 2.5,
            nextReviewDate: today
          },
          {
            id: "cardio-4",
            deckId: "comm-cardio",
            front: "A estimulação vagal simpática promove o efeito inotrópico positivo e elevação da frequência de disparos sinusais.",
            back: "Falso. O nervo vago secreta acetilcolina causando efeito parassimpático inibitório (cronotrópico e dromotrópico negativos).",
            type: "tf",
            tag: "Sistema Autônomo",
            difficulty: "medium",
            interval: 1,
            repetition: 0,
            easeFactor: 2.5,
            nextReviewDate: today
          }
        ]
      },
      {
        id: "comm-neuro",
        name: "Neuroanatomia Avançada",
        description: "Vias espinhais, pares cranianos de emergência periférica e vascularização encefálica.",
        category: "Neurologia",
        cardsCount: 3,
        masteredPercent: 15,
        author: "Laboratório de Neurociências USP",
        isOfficial: true,
        cards: [
          {
            id: "neuro-1",
            deckId: "comm-neuro",
            front: "Qual par de nervo craniano é responsável pelo reflexo pupilar consensual ao receber luz incidente?",
            back: "O Nervo Oculomotor (III par craniano) transporta as fibras eferentes parassimpáticas derivadas do núcleo de Edinger-Westphal.",
            type: "qa",
            tag: "Pares Cranianos",
            difficulty: "hard",
            interval: 1,
            repetition: 0,
            easeFactor: 2.4,
            nextReviewDate: today
          },
          {
            id: "neuro-2",
            deckId: "comm-neuro",
            front: "Qual via trato-espinhal é a via de descida voluntária responsável pelo controle motor fino distal dos membros?",
            back: "O Trato Corticoespinhal Lateral (que decussa em cerca de 85% a 90% ao nível das pirâmides bulbares).",
            type: "mcq",
            options: ["Trato Corticoespinhal Anterior", "Trato Corticoespinhal Lateral", "Trato Vestibuloespinhal", "Vias Cerebelares"],
            tag: "Vias Motoras",
            difficulty: "medium",
            interval: 1,
            repetition: 0,
            easeFactor: 2.5,
            nextReviewDate: today
          },
          {
            id: "neuro-3",
            deckId: "comm-neuro",
            front: "A artéria cerebral anterior supre predominantemente as áreas do córtex motor e sensorial de membros superiores e face.",
            back: "Falso. A artéria cerebral média supre as áreas motoras de face e membros superiores. A cerebral anterior supre os membros inferiores (homúnculo cortical medial).",
            type: "tf",
            tag: "Vascularização",
            difficulty: "hard",
            interval: 1,
            repetition: 0,
            easeFactor: 2.3,
            nextReviewDate: today
          }
        ]
      }
    ],
    teacherPulse: {
      activeToday: 118,
      avgScore: 82,
      completionRate: 91,
      attentionNeeded: [
        {
          name: "Amanda Costa",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
          reason: "Taxa de erro de 64% em Fisiopatologia Renal no ciclo semanal.",
          deckName: "Sistema Renal & Equilíbrio Ácido-Básico",
          accuracy: 36
        },
        {
          name: "Lucas Mendonça",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
          reason: "Sem interações com o baralho ativo há 5 dias seguidos.",
          deckName: "Farmacologia Clínica Geral",
          accuracy: 55
        }
      ]
    },
    topScholars: [
      { rank: 1, name: "Dr. Gabriel Ramos", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80", xp: 14200, streak: 28 },
      { rank: 2, name: "Beatriz Nogueira", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80", xp: 11500, streak: 17 },
      { rank: 3, name: "Marcus Albuquerque", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80", xp: 9800, streak: 14 }
    ]
  },
  {
    id: "direito-puc",
    name: "Direito de Negócios PUC",
    tagline: "Turma Oficial de Direito societário e fusões empresariais",
    members: 86,
    noticeBoard: [
      {
        id: "n-law-1",
        title: "Edital Resolutivo: Voto Plural nas S.A.",
        author: "Profª Drª Clarice M. Penna",
        date: "Há 4 dias",
        content: "Material explicativo de diretrizes e limites da Lei 14.195/21 sobre a estipulação do voto plural de classes de ações ordinárias nas companhias mercantis brasileiras.",
        badge: "Doutrina"
      }
    ],
    officialDecks: [
      {
        id: "comm-sa",
        name: "Direito Societário e Fusões (M&A)",
        description: "Contratos de parceria, exclusão de sócios e emissão de bônus patrimoniais secundários.",
        category: "Societário",
        cardsCount: 2,
        masteredPercent: 28,
        author: "Profª Clarice",
        isOfficial: true,
        cards: [
          {
            id: "sa-1",
            deckId: "comm-sa",
            front: "O que é um acordo de 'Tag Along' de proteção societária minoritária?",
            back: "É a prerrogativa que garante aos acionistas minoritários o direito de vender suas ações nas mesmas condições oferecidas ao controlador principal.",
            type: "qa",
            tag: "M&A",
            difficulty: "medium",
            interval: 1,
            repetition: 0,
            easeFactor: 2.5,
            nextReviewDate: today
          },
          {
            id: "sa-2",
            deckId: "comm-sa",
            front: "Sociedades limitadas (Ltda.) nunca podem emitir debêntures no ordenamento jurídico pátrio.",
            back: "Falso. Conforme a regulação atual da CVM e do DREI, as Sociedades Limitadas preenchidos certos pressupostos formais podem celebrar a emissão pública de debêntures.",
            type: "tf",
            tag: "Debêntures",
            difficulty: "hard",
            interval: 1,
            repetition: 0,
            easeFactor: 2.4,
            nextReviewDate: today
          }
        ]
      }
    ],
    teacherPulse: {
      activeToday: 54,
      avgScore: 78,
      completionRate: 84,
      attentionNeeded: [
        {
          name: "Clara Gurgel",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
          reason: "Insuficiente progresso em debêntures e regimes de fusão.",
          deckName: "Regimes Societários Ordinários",
          accuracy: 42
        }
      ]
    },
    topScholars: [
      { rank: 1, name: "Thales Ramos", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80", xp: 8200, streak: 21 },
      { rank: 2, name: "Mariana Penna", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80", xp: 6400, streak: 9 }
    ]
  }
];

const LOCAL_STORAGE_KEY = "kardia_ai_state_decks";
const LOCAL_STORAGE_COMMUNITIES_KEY = "kardia_ai_state_communities";

export function loadDecks(): Deck[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load decks from local storage", e);
  }
  
  // Default fallback
  saveDecks(DEFAULT_DECKS);
  return DEFAULT_DECKS;
}

export function saveDecks(decks: Deck[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(decks));
  } catch (e) {
    console.error("Failed to save decks into local storage", e);
  }
}

export function loadCommunities(): Community[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_COMMUNITIES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load communities from local storage", e);
  }
  
  saveCommunities(MOCK_COMMUNITIES);
  return MOCK_COMMUNITIES;
}

export function saveCommunities(communities: Community[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_COMMUNITIES_KEY, JSON.stringify(communities));
  } catch (e) {
    console.error("Failed to save communities into local storage", e);
  }
}

export function getCardsForReviewToday(decks: Deck[]): Card[] {
  const now = new Date();
  const allCards: Card[] = [];
  decks.forEach(deck => {
    deck.cards.forEach(card => {
      const reviewDate = new Date(card.nextReviewDate);
      if (reviewDate <= now) {
        allCards.push(card);
      }
    });
  });
  return allCards;
}
