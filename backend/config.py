"""
Configurações da aplicação Leme

Variáveis de ambiente carregadas do .env
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """Configurações gerais da aplicação"""
    
    # === API ===
    API_TITLE: str = "🌱 Leme API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "Análise financeira inteligente para micro e pequenas empresas"
    
    # === Banco de Dados ===
    DATABASE_URL: str = "sqlite:///./leme.db"
    
    # === IA (Anthropic) ===
    ANTHROPIC_API_KEY: Optional[str] = None
    
    # === Stripe ===
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    
    # === URLs ===
    FRONTEND_URL: str = "https://leme.app.br"
    
    # === E-mail (Brevo) ===
    BREVO_API_KEY: Optional[str] = None
    
    # === Admin ===
    ADMIN_EMAIL: str = "bavstecnologia@gmail.com"
    
    # === Debug ===
    DEBUG: bool = False
    
    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings():
    return Settings()