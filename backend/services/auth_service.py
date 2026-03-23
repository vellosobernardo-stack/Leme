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

import bcrypt
from jose import JWTError, jwt
from fastapi import HTTPException, status

# ========== CONFIGURAÇÕES ==========

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30


# ========== SENHA ==========

def hash_senha(senha: str) -> str:
    """
    Converte a senha em texto puro para um hash seguro.
    Usa bcrypt diretamente (sem passlib) para evitar bug de compatibilidade.
    """
    senha_bytes = senha.encode("utf-8")[:72]  # bcrypt aceita no máximo 72 bytes
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(senha_bytes, salt).decode("utf-8")


def verificar_senha(senha: str, senha_hash: str) -> bool:
    """
    Compara a senha digitada com o hash salvo no banco.
    Retorna True se bater, False se não bater.
    """
    senha_bytes = senha.encode("utf-8")[:72]
    hash_bytes = senha_hash.encode("utf-8")
    return bcrypt.checkpw(senha_bytes, hash_bytes)


# ========== JWT ==========

def criar_token(dados: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Gera um token JWT com os dados fornecidos.
    O token carrega o e-mail do usuário e tem prazo de validade.
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