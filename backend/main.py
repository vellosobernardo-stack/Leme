"""
🌱 Leme API - Análise Financeira para Micro e Pequenas Empresas

Ponto de entrada da aplicação.
Execute com: uvicorn main:app --reload
"""

import sys
from pathlib import Path

# Adiciona a pasta backend ao caminho do Python (resolve problema no Windows)
sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from database import engine, Base, run_migrations
from routers.analise import router as analise_router
from routers.dashboard import router as dashboard_router
from routers.report import router as report_router
from routers.pre_abertura import router as pre_abertura_router
from routers.sessao import router as sessao_router
from routers.email import router as email_router
from routers.pagamento import router as pagamento_router
from routers.auth import router as auth_router
from routers.stripe_pro import router as stripe_pro_router  # NOVO — Stripe Pro

# Carrega configurações
settings = get_settings()

# Cria as tabelas no banco (inclui a nova tabela 'usuarios')
Base.metadata.create_all(bind=engine)

# Executa migrações simples (adiciona colunas faltando)
run_migrations()

# Inicializa a aplicação
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description=settings.API_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configura CORS — permite cookie httpOnly funcionar entre domínios
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://leme.app.br",
        "https://www.leme.app.br",
        "http://localhost:3000",  # dev local
    ],
    allow_credentials=True,  # IMPORTANTE: necessário para cookies funcionarem
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra os routers existentes (versão Free — não alterados)
app.include_router(analise_router)
app.include_router(dashboard_router)
app.include_router(report_router)
app.include_router(pre_abertura_router)
app.include_router(sessao_router)
app.include_router(email_router)
app.include_router(pagamento_router)

# NOVO — Fase 1 Pro
app.include_router(auth_router)
app.include_router(stripe_pro_router)


@app.get("/")
def root():
    """Endpoint de status — confirma que a API está rodando."""
    return {
        "status": "online",
        "app": "Leme API",
        "version": settings.API_VERSION,
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check para monitoramento."""
    return {"status": "healthy"}