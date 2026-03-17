"""
Router de autenticação — endpoints públicos e protegidos

Endpoints:
- POST /auth/register  — cria novo usuário
- POST /auth/login     — autentica e retorna JWT
- GET  /auth/me        — retorna dados do usuário logado (requer token)
"""

from fastapi import APIRouter, Depends, HTTPException, status, Cookie
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

from database import get_db
from models.usuario import Usuario
from services.auth_service import hash_senha, verificar_senha, criar_token, decodificar_token

router = APIRouter(
    prefix="/auth",
    tags=["Autenticação"]
)


# ========== SCHEMAS ==========

class RegisterRequest(BaseModel):
    nome: Optional[str] = None
    email: EmailStr
    senha: str


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


class UsuarioResponse(BaseModel):
    id: str
    nome: Optional[str]
    email: str
    plano: str
    pro_ativo: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ========== DEPENDÊNCIA: USUÁRIO AUTENTICADO ==========

def get_usuario_atual(
    leme_token: Optional[str] = Cookie(default=None),
    db: Session = Depends(get_db)
) -> Usuario:
    """
    Dependência reutilizável que lê o token do cookie httpOnly,
    decodifica e retorna o usuário do banco.

    Uso nas rotas: usuario = Depends(get_usuario_atual)
    """
    if not leme_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não autenticado"
        )

    payload = decodificar_token(leme_token)
    email = payload.get("sub")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

    usuario = db.query(Usuario).filter(Usuario.email == email).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado"
        )

    return usuario


def get_usuario_pro(usuario: Usuario = Depends(get_usuario_atual)) -> Usuario:
    """
    Dependência que garante que o usuário tem Pro ativo.
    Use nas rotas exclusivas do Pro.
    """
    if not usuario.pro_ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso exclusivo para assinantes Pro"
        )
    return usuario


# ========== ENDPOINTS ==========

@router.post("/register", response_model=UsuarioResponse)
def register(dados: RegisterRequest, db: Session = Depends(get_db)):
    """
    Cria um novo usuário.

    - Verifica se o e-mail já está cadastrado
    - Faz hash da senha antes de salvar (nunca armazena a senha real)
    - Retorna os dados do usuário criado (sem a senha)
    """
    # Verifica se e-mail já existe
    existente = db.query(Usuario).filter(Usuario.email == dados.email.lower()).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-mail já cadastrado"
        )

    usuario = Usuario(
        nome=dados.nome,
        email=dados.email.lower().strip(),
        senha_hash=hash_senha(dados.senha),
        plano="free",
        pro_ativo=False,
    )

    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    return UsuarioResponse(
        id=str(usuario.id),
        nome=usuario.nome,
        email=usuario.email,
        plano=usuario.plano,
        pro_ativo=usuario.pro_ativo,
        created_at=usuario.created_at,
    )


@router.post("/login")
def login(dados: LoginRequest, db: Session = Depends(get_db)):
    """
    Autentica o usuário e seta o token em um cookie httpOnly.

    Cookie httpOnly = o JavaScript do browser não consegue ler o token,
    o que protege contra ataques XSS.
    """
    usuario = db.query(Usuario).filter(Usuario.email == dados.email.lower()).first()

    if not usuario or not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos"
        )

    token = criar_token({"sub": usuario.email})

    response = JSONResponse(content={
        "mensagem": "Login realizado com sucesso",
        "usuario": {
            "id": str(usuario.id),
            "nome": usuario.nome,
            "email": usuario.email,
            "plano": usuario.plano,
            "pro_ativo": usuario.pro_ativo,
        }
    })

    # Cookie httpOnly: seguro, dura 30 dias, apenas HTTPS em produção
    response.set_cookie(
        key="leme_token",
        value=token,
        httponly=True,
        max_age=60 * 60 * 24 * 30,  # 30 dias em segundos
        samesite="none",
        secure=True,  # HTTPS em produção (Railway/Vercel)
    )

    return response


@router.post("/logout")
def logout():
    """
    Remove o cookie de autenticação — efetivamente desloga o usuário.
    """
    response = JSONResponse(content={"mensagem": "Logout realizado"})
    response.delete_cookie("leme_token")
    return response


@router.get("/me", response_model=UsuarioResponse)
def me(usuario: Usuario = Depends(get_usuario_atual)):
    """
    Retorna os dados do usuário autenticado.
    Usado pelo frontend para saber se está logado e qual o plano.
    """
    return UsuarioResponse(
        id=str(usuario.id),
        nome=usuario.nome,
        email=usuario.email,
        plano=usuario.plano,
        pro_ativo=usuario.pro_ativo,
        created_at=usuario.created_at,
    )
