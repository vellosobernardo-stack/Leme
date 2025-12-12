"""
Configuração do banco de dados
Suporta SQLite (local) e PostgreSQL (produção)
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import get_settings

settings = get_settings()

database_url = settings.DATABASE_URL

# Ajusta a URL conforme o banco
if database_url.startswith("postgresql://"):
    # PostgreSQL com psycopg3
    database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        echo=settings.DEBUG
    )
elif database_url.startswith("sqlite"):
    # SQLite - precisa de check_same_thread=False para FastAPI
    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG
    )
else:
    # Outros bancos (MySQL, etc)
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        echo=settings.DEBUG
    )

# Fábrica de sessões
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base para os modelos
Base = declarative_base()


def get_db():
    """Dependency do FastAPI para injetar sessão do banco."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()