"""
Configurações do Leme Backend
Carrega variáveis de ambiente do arquivo .env
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """
    Configurações da aplicação.
    Valores são lidos do arquivo .env automaticamente.
    """
    
    # Banco de Dados
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/leme"
    
    # API
    API_TITLE: str = "Leme API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "API de análise financeira para micro e pequenas empresas"
    
    # CORS - URLs do frontend que podem acessar a API
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",      # Frontend local
        "https://leme.vercel.app",    # Frontend em produção (ajustar depois)
    ]
    
    # Ambiente
    ENVIRONMENT: str = "development"  # development, staging, production
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """
    Retorna as configurações (com cache para não recarregar toda vez).
    Use: from config import get_settings
         settings = get_settings()
    """
    return Settings()
