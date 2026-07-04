from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session
from typing import List, Optional, Generator

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


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> UserORM:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token ausente")

    token = authorization.split(" ", 1)[1]
    if not token.startswith("token-"):
        raise HTTPException(status_code=401, detail="Token inválido")

    user_id = token.split("token-", 1)[1]
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
    existing = db.query(UserORM).filter(UserORM.email == "pvictor2307@gmail.com").first()
    if existing:
        return

    admin = UserORM(
        id="user-admin",
        name="Administrador",
        email="pvictor2307@gmail.com",
        password="kardia-admin",
        is_admin=True,
    )
    db.add(admin)
    db.commit()


@app.on_event("startup")
def startup_event() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _ensure_schema(db)
        _seed_admin_user(db)
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

    token = f"token-{user.id}"
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
