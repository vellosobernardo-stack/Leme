"""
Configuração do banco de dados
Suporta SQLite (local) e PostgreSQL (produção)
"""

from sqlalchemy import create_engine, text
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


def run_migrations():
    """
    Executa migrações simples no startup.
    Adiciona colunas que podem estar faltando no banco de produção.
    """
    migrations = [
        # Coluna para Stripe (paywall)
        ("analises", "stripe_session_id", "VARCHAR(200)"),
        # Coluna de pagamento
        ("analises", "pago", "BOOLEAN DEFAULT FALSE"),
        ("analises", "pago_em", "TIMESTAMP"),
    ]
    
    with engine.connect() as conn:
        for table, column, col_type in migrations:
            try:
                # Tenta adicionar a coluna - se já existir, ignora o erro
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}"))
                conn.commit()
                print(f"[Migration] ✅ Coluna {column} adicionada em {table}")
            except Exception as e:
                # Coluna já existe ou outro erro - segue em frente
                conn.rollback()
                if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                    print(f"[Migration] ⏭️ Coluna {column} já existe em {table}")
                else:
                    print(f"[Migration] ⚠️ Erro ao adicionar {column}: {e}")