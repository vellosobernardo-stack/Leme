"""
Serviço de autenticação — lógica de senha e JWT

Responsabilidades:
- Hash de senha com bcrypt
- Verificação de senha
- Geração de token JWT
- Decodificação e validação de token JWT
"""

from datetime import datetime, timedelta
from typing import Optional
import os

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status

# ========== CONFIGURAÇÕES ==========

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "leme-dev-secret-troque-em-producao")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30  # Token válido por 30 dias

# Contexto de hash de senha usando bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ========== SENHA ==========

def hash_senha(senha: str) -> str:
    """
    Converte a senha em texto puro para um hash seguro.
    A senha original nunca é armazenada no banco.
    """
    return pwd_context.hash(senha)


def verificar_senha(senha: str, senha_hash: str) -> bool:
    """
    Compara a senha digitada com o hash salvo no banco.
    Retorna True se bater, False se não bater.
    """
    return pwd_context.verify(senha, senha_hash)


# ========== JWT ==========

def criar_token(dados: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Gera um token JWT com os dados fornecidos.

    O token carrega o e-mail do usuário e tem prazo de validade.
    É assinado com a SECRET_KEY — qualquer alteração invalida o token.
    """
    to_encode = dados.copy()

    expire = datetime.utcnow() + (
        expires_delta if expires_delta else timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    )
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decodificar_token(token: str) -> dict:
    """
    Decodifica e valida um token JWT.
    Lança HTTPException 401 se o token for inválido ou expirado.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
