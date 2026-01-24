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
from database import engine, Base
from routers.analise import router as analise_router
from routers.dashboard import router as dashboard_router
from routers.report import router as report_router
from routers.pre_abertura import router as pre_abertura_router
from routers.sessao import router as sessao_router
from routers.email import router as email_router  # NOVO - E-mails de abandono

# Carrega configurações
settings = get_settings()

# Cria as tabelas no banco (em produção, use migrations com Alembic)
Base.metadata.create_all(bind=engine)

# Inicializa a aplicação
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description=settings.API_DESCRIPTION,
    docs_url="/docs",      # Swagger UI
    redoc_url="/redoc"     # ReDoc
)

# Configura CORS para o frontend acessar
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas origens em desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra os routers
app.include_router(analise_router)
app.include_router(dashboard_router)
app.include_router(report_router)
app.include_router(pre_abertura_router)
app.include_router(sessao_router)
app.include_router(email_router)  # NOVO - E-mails de abandono


@app.get("/")
def root():
    """Endpoint de status - confirma que a API está rodando."""
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