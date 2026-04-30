"""
Serviço de autenticação — lógica de senha, JWT e reset de senha

Responsabilidades:
- Hash de senha com bcrypt
- Verificação de senha
- Geração de token JWT
- Decodificação e validação de token JWT
- Geração e verificação de token de reset de senha
"""

from datetime import datetime, timedelta
from typing import Optional, Tuple
import os
import secrets
import hashlib

import bcrypt
from jose import JWTError, jwt
from fastapi import HTTPException, status

# ========== CONFIGURAÇÕES ==========

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

# Reset de senha: token vale por 1 hora.
# Tempo padrão da indústria — suficiente pro usuário receber o email
# e clicar, curto o suficiente pra limitar janela de ataque caso o email vaze.
RESET_TOKEN_EXPIRE_HOURS = 1


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


# ========== RESET DE SENHA ==========

def gerar_token_reset() -> Tuple[str, str, datetime]:
    """
    Gera um token de reset de senha.

    Retorna uma tupla com 3 valores:
    - token_puro: o token em texto que vai NO EMAIL pro usuário (link)
    - token_hash: o hash do token que vai SALVO NO BANCO
    - expira_em: timestamp de quando o token deixa de valer (agora + 1 hora)

    Por que separar puro e hash?
    Mesma lógica da senha: nunca guardamos o valor original no banco.
    Se alguém invadir o banco, vê só o hash, que é inútil sem o original.
    O token original só existe em dois lugares por 1 hora: no email do usuário
    e na URL que ele clica. Depois disso, é descartado.
    """
    # secrets.token_urlsafe gera string aleatória segura, pronta para URL.
    # 32 bytes = 43 caracteres na string final, entropia suficiente para ser
    # impossível de adivinhar por força bruta.
    token_puro = secrets.token_urlsafe(32)

    # Hash SHA-256 do token. Usamos SHA-256 (e não bcrypt) aqui porque:
    # 1) Tokens de reset têm vida curta (1h), não justificam custo do bcrypt.
    # 2) Verificação precisa ser rápida (cada clique no link gera uma consulta).
    # 3) O token já é aleatório e longo — força bruta é inviável independente do hash.
    token_hash = hashlib.sha256(token_puro.encode("utf-8")).hexdigest()

    expira_em = datetime.utcnow() + timedelta(hours=RESET_TOKEN_EXPIRE_HOURS)

    return token_puro, token_hash, expira_em


def verificar_token_reset(token_puro: str, token_hash_salvo: str, expira_em: Optional[datetime]) -> bool:
    """
    Verifica se um token de reset é válido.

    Recebe:
    - token_puro: o token que veio na URL clicada pelo usuário
    - token_hash_salvo: o hash que está no banco para esse usuário
    - expira_em: o timestamp de expiração que está no banco

    Retorna True se o token bate E não expirou, False caso contrário.

    Importante: esta função apenas VALIDA. Quem deve invalidar o token
    após o uso (setar reset_token_hash = None no banco) é o endpoint
    que chama esta função, depois de trocar a senha com sucesso.
    """
    # Se não tem token salvo ou data de expiração, o usuário nunca pediu reset
    # (ou já usou um token anterior). Token inválido.
    if not token_hash_salvo or not expira_em:
        return False

    # Token expirou. O usuário precisa pedir um novo.
    if datetime.utcnow() > expira_em:
        return False

    # Calcula o hash do token recebido e compara com o hash salvo.
    # secrets.compare_digest é uma comparação que evita "timing attacks":
    # ataques onde alguém mede o tempo de resposta para descobrir o token
    # caractere por caractere. Em comparação normal (==), strings iguais nos
    # primeiros caracteres demoram mais pra retornar False — compare_digest
    # sempre demora o mesmo tempo, eliminando a pista.
    token_hash_recebido = hashlib.sha256(token_puro.encode("utf-8")).hexdigest()
    return secrets.compare_digest(token_hash_recebido, token_hash_salvo)