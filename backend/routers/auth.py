"""
Router de autenticação — endpoints públicos e protegidos

Endpoints:
- POST /auth/register          — cria novo usuário
- POST /auth/login             — autentica e retorna JWT
- POST /auth/logout            — remove cookie de autenticação
- GET  /auth/me                — retorna dados do usuário logado (requer token)
- POST /auth/esqueci-senha     — gera token de reset e envia email
- POST /auth/redefinir-senha   — valida token e troca senha
"""

from fastapi import APIRouter, Depends, HTTPException, status, Cookie
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from database import get_db
from models.usuario import Usuario
from services.auth_service import (
    hash_senha,
    verificar_senha,
    criar_token,
    decodificar_token,
    gerar_token_reset,
    verificar_token_reset,
)
from fastapi import BackgroundTasks
from services.email_service import enviar_email_boas_vindas, enviar_email_reset_senha

router = APIRouter(
    prefix="/auth",
    tags=["Autenticação"]
)


# ========== SCHEMAS ==========

class RegisterRequest(BaseModel):
    nome: Optional[str] = None
    email: EmailStr
    telefone: str
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


class EsqueciSenhaRequest(BaseModel):
    email: EmailStr


class RedefinirSenhaRequest(BaseModel):
    token: str
    nova_senha: str


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
def register(dados: RegisterRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
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
        telefone=dados.telefone.strip(),
        senha_hash=hash_senha(dados.senha),
        plano="free",
        pro_ativo=False,
    )

    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    background_tasks.add_task(
        enviar_email_boas_vindas,
        nome_empresa=usuario.nome or usuario.email,
        email=usuario.email,
        is_pro=usuario.pro_ativo,
    )

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


# ========== RESET DE SENHA ==========

@router.post("/esqueci-senha")
def esqueci_senha(
    dados: EsqueciSenhaRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Inicia o fluxo de reset de senha.

    Comportamento de segurança:
    - SEMPRE retorna a mesma mensagem genérica, exista o email ou não.
      Isso impede que alguém descubra quais emails estão cadastrados
      no Leme tentando vários no formulário.
    - Se o email existir, gera um token de reset, salva o hash no banco,
      e envia o email com o link em background (não bloqueia a resposta).
    - Se já houver um token ativo, sobrescreve. Não vejo razão pra impedir
      o usuário de pedir um novo link se ele perdeu o anterior.
    """
    usuario = db.query(Usuario).filter(Usuario.email == dados.email.lower().strip()).first()

    # Email não existe: retorna sucesso genérico mesmo assim (proteção contra enumeração).
    # Não fazemos nada no banco, não enviamos nada.
    if not usuario:
        return {
            "mensagem": "Se este email existe na nossa base, você vai receber um link em alguns minutos."
        }

    # Email existe: gera token, salva hash + expiração, envia email em background.
    token_puro, token_hash, expira_em = gerar_token_reset()

    usuario.reset_token_hash = token_hash
    usuario.reset_token_expira_em = expira_em
    usuario.updated_at = datetime.utcnow()
    db.commit()

    background_tasks.add_task(
        enviar_email_reset_senha,
        nome_empresa=usuario.nome or "Empresário(a)",
        email=usuario.email,
        token_reset=token_puro,
    )

    return {
        "mensagem": "Se este email existe na nossa base, você vai receber um link em alguns minutos."
    }


@router.post("/redefinir-senha")
def redefinir_senha(
    dados: RedefinirSenhaRequest,
    db: Session = Depends(get_db)
):
    """
    Conclui o fluxo de reset de senha.

    Recebe o token (vindo da URL clicada pelo usuário) e a nova senha.
    Valida o token contra o hash salvo no banco e a data de expiração.
    Se válido: troca a senha, invalida o token (uso único).

    Mensagens de erro são genéricas para não dar pistas a atacantes:
    - "Link inválido ou expirado" cobre TODOS os casos de falha
      (token errado, token expirado, token já usado, etc.).
    """
    import hashlib

    # Valida que a nova senha tem tamanho mínimo razoável.
    # 8 caracteres é o padrão básico — você pode endurecer depois se quiser.
    if len(dados.nova_senha) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A nova senha precisa ter pelo menos 8 caracteres."
        )

    # Calcula o hash do token recebido para procurar no banco.
    # Lembrando: o banco guarda o hash, não o token puro.
    # Então a única forma de achar o usuário é hashear o que o cliente mandou
    # e comparar com o hash salvo.
    token_hash_recebido = hashlib.sha256(dados.token.encode("utf-8")).hexdigest()

    usuario = db.query(Usuario).filter(
        Usuario.reset_token_hash == token_hash_recebido
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Link inválido ou expirado. Peça uma nova redefinição."
        )

    # Validação adicional: confirma que o token bate E não expirou.
    # (Como já filtramos pelo hash, o "token bate" sempre será True aqui,
    # mas a função também checa expiração — é o motivo dela existir.)
    if not verificar_token_reset(
        token_puro=dados.token,
        token_hash_salvo=usuario.reset_token_hash,
        expira_em=usuario.reset_token_expira_em,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Link inválido ou expirado. Peça uma nova redefinição."
        )

    # Tudo válido: troca a senha e invalida o token (uso único).
    usuario.senha_hash = hash_senha(dados.nova_senha)
    usuario.reset_token_hash = None
    usuario.reset_token_expira_em = None
    usuario.updated_at = datetime.utcnow()
    db.commit()

    return {"mensagem": "Senha redefinida com sucesso. Faça login com a nova senha."}