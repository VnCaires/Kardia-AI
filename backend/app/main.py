import base64
import hashlib
import hmac
import json
import os
from datetime import datetime, timedelta, timezone
from typing import Generator, List, Optional

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine
from .models import UserORM, DeckORM

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kardia AI API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserCreate(UserLogin):
    name: str
    is_admin: bool = False


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    is_admin: bool


class DeckPayload(BaseModel):
    id: str
    name: str
    description: str
    category: str
    cardsCount: int
    masteredPercent: int
    cards: List[dict]
    isCommunity: Optional[bool] = False
    author: Optional[str] = None
    isOfficial: Optional[bool] = False


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


TOKEN_SECRET = os.getenv("KARDIA_TOKEN_SECRET", "kardia-dev-secret-change-me")
ADMIN_EMAIL = os.getenv("KARDIA_ADMIN_EMAIL", "admin@admin.com")
ADMIN_PASSWORD = os.getenv("KARDIA_ADMIN_PASSWORD", "change-me-now")
ADMIN_NAME = os.getenv("KARDIA_ADMIN_NAME", "Administrador")


def _iso_now(offset_days: int = 0) -> str:
    return (datetime.now(timezone.utc) + timedelta(days=offset_days)).isoformat()


def _build_sample_decks() -> List[dict]:
    today = _iso_now()
    tomorrow = _iso_now(1)
    yesterday = _iso_now(-1)
    return [
        {
            "id": "biologia-celular",
            "name": "Biologia Celular",
            "description": "Estudo detalhado das organelas, membrana celular, divisao celular e metabolismo citoplasmatico.",
            "category": "Ciencias Biologicas",
            "cardsCount": 6,
            "masteredPercent": 74,
            "author": "Kardia Community",
            "cards": [
                {
                    "id": "bc-1",
                    "deckId": "biologia-celular",
                    "front": "Qual e a principal funcao dos ribossomos na celula humana?",
                    "back": "A sintese de proteinas, traduzindo o RNA mensageiro em cadeias de aminoacidos.",
                    "type": "qa",
                    "tag": "Organelas",
                    "difficulty": "easy",
                    "interval": 3,
                    "repetition": 2,
                    "easeFactor": 2.6,
                    "nextReviewDate": today,
                },
                {
                    "id": "bc-2",
                    "deckId": "biologia-celular",
                    "front": "Onde ocorre a maior parte da producao de ATP na respiracao celular aerobica?",
                    "back": "Principalmente nas mitocondrias, durante o ciclo de Krebs e a cadeia transportadora de eletrons.",
                    "type": "qa",
                    "tag": "Metabolismo",
                    "difficulty": "medium",
                    "interval": 1,
                    "repetition": 0,
                    "easeFactor": 2.4,
                    "nextReviewDate": today,
                },
                {
                    "id": "bc-3",
                    "deckId": "biologia-celular",
                    "front": "Durante qual fase da mitose os cromossomos se alinham na placa metafasica?",
                    "back": "Metafase. E quando os fusos mitoticos se conectam aos centromeros dos cromossomos duplicados.",
                    "type": "mcq",
                    "options": ["Profase", "Metafase", "Anafase", "Telofase"],
                    "tag": "Fases da Mitose",
                    "difficulty": "medium",
                    "interval": 10,
                    "repetition": 4,
                    "easeFactor": 2.5,
                    "nextReviewDate": tomorrow,
                },
                {
                    "id": "bc-4",
                    "deckId": "biologia-celular",
                    "front": "A difusao facilitada consome ATP para atravessar ions pela membrana.",
                    "back": "Falso. A difusao facilitada e transporte passivo e nao consome ATP.",
                    "type": "tf",
                    "tag": "Transporte Celular",
                    "difficulty": "easy",
                    "interval": 1,
                    "repetition": 0,
                    "easeFactor": 2.5,
                    "nextReviewDate": today,
                },
                {
                    "id": "bc-5",
                    "deckId": "biologia-celular",
                    "front": "Quais organelas digerem particulas e organelas velhas por meio de enzimas hidroliticas?",
                    "back": "Lisossomos. Eles atuam em pH acido e participam da digestao intracelular.",
                    "type": "qa",
                    "tag": "Fagocitose",
                    "difficulty": "medium",
                    "interval": 2,
                    "repetition": 1,
                    "easeFactor": 2.3,
                    "nextReviewDate": yesterday,
                },
                {
                    "id": "bc-6",
                    "deckId": "biologia-celular",
                    "front": "A carioteca desaparece completamente na anafase do ciclo mitotico.",
                    "back": "Falso. O envelope nuclear se desintegra na prometafase e se reorganiza na telofase.",
                    "type": "tf",
                    "tag": "Ciclo Celular",
                    "difficulty": "hard",
                    "interval": 1,
                    "repetition": 0,
                    "easeFactor": 2.1,
                    "nextReviewDate": today,
                },
            ],
        },
        {
            "id": "direito-civil",
            "name": "Direito Civil",
            "description": "Teoria geral dos negocios juridicos, contratos bilaterais, vicios do consentimento e direitos reais patrimoniais.",
            "category": "Ciencias Juridicas",
            "cardsCount": 4,
            "masteredPercent": 42,
            "author": "Prof. Alberto Santos",
            "cards": [
                {
                    "id": "dc-1",
                    "deckId": "direito-civil",
                    "front": "Qual e o prazo geral de prescricao previsto no Codigo Civil quando a lei nao fixa prazo menor?",
                    "back": "10 anos, conforme o artigo 205 do Codigo Civil.",
                    "type": "qa",
                    "tag": "Prazos Prescricionais",
                    "difficulty": "medium",
                    "interval": 1,
                    "repetition": 0,
                    "easeFactor": 2.5,
                    "nextReviewDate": today,
                },
                {
                    "id": "dc-2",
                    "deckId": "direito-civil",
                    "front": "O vicio de consentimento causado por ameaca fisica ou psicologica que obriga alguem a contratar denomina-se:",
                    "back": "Coacao. E vicio de vontade capaz de anular o negocio juridico.",
                    "type": "mcq",
                    "options": ["Erro ou ignorancia", "Dolo", "Coacao", "Lesao culposa"],
                    "tag": "Vicios de Vontade",
                    "difficulty": "hard",
                    "interval": 1,
                    "repetition": 0,
                    "easeFactor": 2.2,
                    "nextReviewDate": today,
                },
                {
                    "id": "dc-3",
                    "deckId": "direito-civil",
                    "front": "O menor relativamente incapaz, de 16 a 18 anos, pratica atos da vida civil sob representacao.",
                    "back": "Falso. Ele e assistido. A representacao vale para absolutamente incapazes.",
                    "type": "tf",
                    "tag": "Capacidade Civil",
                    "difficulty": "easy",
                    "interval": 15,
                    "repetition": 5,
                    "easeFactor": 2.7,
                    "nextReviewDate": tomorrow,
                },
                {
                    "id": "dc-4",
                    "deckId": "direito-civil",
                    "front": "Quais sao os tres requisitos de validade de qualquer negocio juridico segundo o art. 104 do Codigo Civil?",
                    "back": "Agente capaz, objeto licito e forma prescrita ou nao proibida em lei.",
                    "type": "qa",
                    "tag": "Validade do Negocio",
                    "difficulty": "easy",
                    "interval": 1,
                    "repetition": 0,
                    "easeFactor": 2.4,
                    "nextReviewDate": today,
                },
            ],
        },
        {
            "id": "ingles-avancado",
            "name": "Ingles Avancado",
            "description": "Expressoes idiomaticas, vocabulario academico e phrasal verbs corporativos.",
            "category": "Idiomas",
            "cardsCount": 5,
            "masteredPercent": 12,
            "author": "Monica Geller",
            "cards": [
                {
                    "id": "eng-1",
                    "deckId": "ingles-avancado",
                    "front": "What does the English idiom 'to bite the bullet' mean?",
                    "back": "To face something difficult or unpleasant with courage.",
                    "type": "qa",
                    "tag": "Idioms",
                    "difficulty": "easy",
                    "interval": 1,
                    "repetition": 0,
                    "easeFactor": 2.5,
                    "nextReviewDate": today,
                },
                {
                    "id": "eng-2",
                    "deckId": "ingles-avancado",
                    "front": "Choose the correct spelling of the word meaning a subtle distinction or variation:",
                    "back": "Nuance. It refers to a subtle difference in meaning, opinion, color or tone.",
                    "type": "mcq",
                    "options": ["Newance", "Nuance", "Nuwance", "Neuance"],
                    "tag": "Vocabulary",
                    "difficulty": "medium",
                    "interval": 1,
                    "repetition": 0,
                    "easeFactor": 2.3,
                    "nextReviewDate": today,
                },
                {
                    "id": "eng-3",
                    "deckId": "ingles-avancado",
                    "front": "The phrasal verb 'to touch base' means to briefly check in with someone.",
                    "back": "Verdadeiro. E comum em contextos profissionais para retomar contato rapidamente.",
                    "type": "tf",
                    "tag": "Business English",
                    "difficulty": "easy",
                    "interval": 1,
                    "repetition": 0,
                    "easeFactor": 2.5,
                    "nextReviewDate": today,
                },
                {
                    "id": "eng-4",
                    "deckId": "ingles-avancado",
                    "front": "What is a sophisticated synonym for 'ordinary' or 'everyday'?",
                    "back": "Mundane. It describes something common, routine or lacking excitement.",
                    "type": "qa",
                    "tag": "Lexico",
                    "difficulty": "hard",
                    "interval": 1,
                    "repetition": 0,
                    "easeFactor": 2.0,
                    "nextReviewDate": today,
                },
                {
                    "id": "eng-5",
                    "deckId": "ingles-avancado",
                    "front": "Complete the sentence with the right idiom: 'He had a rough start, but he finally...'",
                    "back": "got his feet wet. It means beginning to get experience with something new.",
                    "type": "mcq",
                    "options": ["beat around the bush", "got his feet wet", "hit the sack", "let the cat out"],
                    "tag": "Idioms",
                    "difficulty": "hard",
                    "interval": 1,
                    "repetition": 0,
                    "easeFactor": 2.1,
                    "nextReviewDate": today,
                },
            ],
        },
    ]


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _b64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _b64url_decode(raw: str) -> bytes:
    padding = "=" * (-len(raw) % 4)
    return base64.urlsafe_b64decode(raw + padding)


def create_access_token(user: UserORM) -> str:
    payload = {
        "sub": user.id,
        "email": user.email,
        "exp": int((datetime.now(timezone.utc) + timedelta(hours=12)).timestamp()),
    }
    payload_raw = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    payload_encoded = _b64url_encode(payload_raw)
    signature = hmac.new(TOKEN_SECRET.encode("utf-8"), payload_encoded.encode("utf-8"), hashlib.sha256).digest()
    return f"{payload_encoded}.{_b64url_encode(signature)}"


def decode_access_token(token: str) -> dict:
    try:
        payload_encoded, signature_encoded = token.split(".", 1)
        expected_signature = hmac.new(
            TOKEN_SECRET.encode("utf-8"),
            payload_encoded.encode("utf-8"),
            hashlib.sha256,
        ).digest()
        provided_signature = _b64url_decode(signature_encoded)
        if not hmac.compare_digest(expected_signature, provided_signature):
            raise ValueError("invalid signature")

        payload = json.loads(_b64url_decode(payload_encoded).decode("utf-8"))
        if int(payload["exp"]) < int(datetime.now(timezone.utc).timestamp()):
            raise ValueError("expired")
        return payload
    except (ValueError, KeyError, json.JSONDecodeError):
        raise HTTPException(status_code=401, detail="Token inválido")


def get_current_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> UserORM:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token ausente")

    token = authorization.split(" ", 1)[1]
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    user = db.query(UserORM).filter(UserORM.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    return user


def _ensure_schema(db: Session) -> None:
    inspector = inspect(engine)
    columns = {column["name"] for column in inspector.get_columns("decks")}
    if "owner_id" not in columns:
        db.execute(text("ALTER TABLE decks ADD COLUMN owner_id VARCHAR"))
        db.execute(text("UPDATE decks SET owner_id = '' WHERE owner_id IS NULL"))
        db.commit()


def _seed_admin_user(db: Session) -> None:
    existing = db.query(UserORM).filter(UserORM.email == ADMIN_EMAIL).first()
    if existing:
        return

    admin = UserORM(
        id="user-admin",
        name=ADMIN_NAME,
        email=ADMIN_EMAIL,
        password=ADMIN_PASSWORD,
        is_admin=True,
    )
    db.add(admin)
    db.commit()


def _seed_default_decks_for_user(db: Session, user: UserORM) -> None:
    existing = db.query(DeckORM).filter(DeckORM.owner_id == user.id).count()
    if existing > 0:
        return

    for deck_payload in _build_sample_decks():
        db.add(
            DeckORM(
                id=f"{user.id}-{deck_payload['id']}",
                owner_id=user.id,
                name=deck_payload["name"],
                description=deck_payload["description"],
                category=deck_payload["category"],
                cards_count=deck_payload["cardsCount"],
                mastered_percent=deck_payload["masteredPercent"],
                payload={
                    **deck_payload,
                    "id": f"{user.id}-{deck_payload['id']}",
                    "cards": [
                        {
                            **card,
                            "id": f"{user.id}-{card['id']}",
                            "deckId": f"{user.id}-{deck_payload['id']}",
                        }
                        for card in deck_payload["cards"]
                    ],
                },
            )
        )

    db.commit()


@app.on_event("startup")
def startup_event() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _ensure_schema(db)
        _seed_admin_user(db)
        admin = db.query(UserORM).filter(UserORM.email == ADMIN_EMAIL).first()
        if admin:
            _seed_default_decks_for_user(db, admin)
    finally:
        db.close()


@app.get("/health")
def healthcheck() -> dict:
    return {"status": "ok"}


@app.post("/auth/login", response_model=LoginResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> LoginResponse:
    user = db.query(UserORM).filter(UserORM.email == payload.email.lower()).first()
    if not user or user.password != payload.password:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    token = create_access_token(user)
    return LoginResponse(
        access_token=token,
        user=UserOut(
            id=user.id,
            name=user.name,
            email=user.email,
            is_admin=user.is_admin,
        ),
    )


@app.post("/auth/register", response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> UserOut:
    if db.query(UserORM).filter(UserORM.email == payload.email.lower()).first():
        raise HTTPException(status_code=400, detail="Usuário já existe")

    new_user = UserORM(
        id=f"user-{db.query(UserORM).count() + 1}",
        name=payload.name,
        email=payload.email.lower(),
        password=payload.password,
        is_admin=payload.is_admin,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    _seed_default_decks_for_user(db, new_user)
    return UserOut(id=new_user.id, name=new_user.name, email=new_user.email, is_admin=new_user.is_admin)


@app.get("/users/me", response_model=UserOut)
def me(user: UserORM = Depends(get_current_user)) -> UserOut:
    return UserOut(id=user.id, name=user.name, email=user.email, is_admin=user.is_admin)


@app.get("/decks", response_model=List[DeckPayload])
def list_decks(user: UserORM = Depends(get_current_user), db: Session = Depends(get_db)) -> List[DeckPayload]:
    decks = db.query(DeckORM).filter(DeckORM.owner_id == user.id).all()
    return [DeckPayload(**deck.payload) for deck in decks]


@app.post("/decks", response_model=DeckPayload)
def save_deck(
    payload: DeckPayload,
    user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DeckPayload:
    deck_payload = payload.model_dump()
    existing = db.query(DeckORM).filter(DeckORM.id == payload.id).first()
    if existing:
        if existing.owner_id != user.id:
            raise HTTPException(status_code=403, detail="Deck não pertence ao usuário")
        existing.name = deck_payload["name"]
        existing.description = deck_payload["description"]
        existing.category = deck_payload["category"]
        existing.cards_count = deck_payload["cardsCount"]
        existing.mastered_percent = deck_payload["masteredPercent"]
        existing.payload = deck_payload
        db.commit()
        db.refresh(existing)
    else:
        item = DeckORM(
            id=payload.id,
            owner_id=user.id,
            name=deck_payload["name"],
            description=deck_payload["description"],
            category=deck_payload["category"],
            cards_count=deck_payload["cardsCount"],
            mastered_percent=deck_payload["masteredPercent"],
            payload=deck_payload,
        )
        db.add(item)
        db.commit()
        db.refresh(item)

    return payload


@app.delete("/decks/{deck_id}")
def delete_deck(
    deck_id: str,
    user: UserORM = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    record = db.query(DeckORM).filter(DeckORM.id == deck_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Deck não encontrado")
    if record.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Deck não pertence ao usuário")
    db.delete(record)
    db.commit()
    return {"status": "deleted"}
