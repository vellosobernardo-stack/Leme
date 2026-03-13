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
    database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        echo=settings.DEBUG
    )
elif database_url.startswith("sqlite"):
    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG
    )
else:
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        echo=settings.DEBUG
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

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
    Adiciona colunas/tabelas que podem estar faltando no banco de produção.
    """

    # ── Migrações de colunas simples ──────────────────────────────────────────
    colunas = [
        # Fase 1 — Stripe/paywall
        ("analises", "stripe_session_id", "VARCHAR(200)"),
        ("analises", "pago",              "BOOLEAN DEFAULT FALSE"),
        ("analises", "pago_em",           "TIMESTAMP"),

        # Fase 2 — vínculo análise → usuário
        ("analises", "usuario_id",        "VARCHAR(36)"),
    ]

    with engine.connect() as conn:
        for table, column, col_type in colunas:
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}"))
                conn.commit()
                print(f"[Migration] ✅ Coluna {column} adicionada em {table}")
            except Exception as e:
                conn.rollback()
                if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                    print(f"[Migration] ⏭️  Coluna {column} já existe em {table}")
                else:
                    print(f"[Migration] ⚠️  Erro ao adicionar {column}: {e}")

        # ── Fase 2 — criar tabela plano_acao_progresso se não existir ─────────
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS plano_acao_progresso (
                    id          VARCHAR(36) PRIMARY KEY,
                    analise_id  VARCHAR(36) NOT NULL REFERENCES analises(id) ON DELETE CASCADE,
                    usuario_id  VARCHAR(36) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
                    periodo     VARCHAR(2)  NOT NULL,
                    indice_acao INTEGER     NOT NULL,
                    marcado     BOOLEAN     NOT NULL DEFAULT TRUE,
                    updated_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE (analise_id, usuario_id, periodo, indice_acao)
                )
            """))
            conn.commit()
            print("[Migration] ✅ Tabela plano_acao_progresso verificada/criada")
        except Exception as e:
            conn.rollback()
            print(f"[Migration] ⚠️  Erro ao criar plano_acao_progresso: {e}")