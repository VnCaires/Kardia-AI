from sqlalchemy import Boolean, Column, Integer, String, JSON
from .database import Base


class UserORM(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)


class DeckORM(Base):
    __tablename__ = "decks"

    id = Column(String, primary_key=True, index=True)
    owner_id = Column(String, nullable=False, index=True, default="")
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False)
    cards_count = Column(Integer, default=0)
    mastered_percent = Column(Integer, default=0)
    payload = Column(JSON, nullable=False)
