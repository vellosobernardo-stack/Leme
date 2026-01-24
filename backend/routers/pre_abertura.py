"""
Endpoints da API de Análise Pré-Abertura
Feature: Ainda não tenho empresa
"""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.pre_abertura import AnalisePreAbertura
from schemas.pre_abertura import (
    PreAberturaInput,
    PreAberturaResponse,
    PreAberturaResumo,
    ComparativoCapital,
    ComparativoFaturamento,
    CalculosPreAbertura,
    AlertaPreAbertura,
    ItemChecklist,
    CategoriaAlertaEnum,
    SeveridadeAlertaEnum
)
from services.pre_abertura import (
    processar_analise_pre_abertura,
    SETOR_LABELS
)

router = APIRouter(
    prefix="/api/v1/pre-abertura",
    tags=["Análise Pré-Abertura"]
)


@router.post("/nova", response_model=PreAberturaResponse, status_code=status.HTTP_201_CREATED)
def criar_analise_pre_abertura(
    dados: PreAberturaInput,
    db: Session = Depends(get_db)
):
    """
    Cria uma nova análise pré-abertura.
    
    Recebe os dados do formulário (10-12 perguntas),
    calcula capital recomendado, comparativos e alertas.
    """
    
    # 1. Processar análise (cálculos + alertas)
    resultado = processar_analise_pre_abertura(dados)
    
    # 2. Criar registro no banco
    analise = AnalisePreAbertura(
        # Dados do formulário
        email=dados.email,
        tipo_negocio=dados.tipo_negocio.value,
        tem_estoque=dados.tem_estoque,
        setor=dados.setor.value,
        estado=dados.estado,
        cidade=dados.cidade,
        mes_abertura=dados.mes_abertura,
        ano_abertura=dados.ano_abertura,
        capital_disponivel=dados.capital_disponivel,
        faturamento_esperado=dados.faturamento_esperado,
        prolabore=dados.prolabore.value,
        tem_funcionarios=dados.tem_funcionarios,
        faixa_funcionarios=dados.faixa_funcionarios.value if dados.faixa_funcionarios else None,
        clientes_garantidos=dados.clientes_garantidos.value,
        
        # Resultados calculados - Capital
        capital_recomendado=resultado["comparativo_capital"].capital_recomendado,
        capital_diferenca_percentual=resultado["comparativo_capital"].diferenca_percentual,
        capital_status=resultado["comparativo_capital"].status,
        
        # Resultados calculados - Faturamento
        faturamento_referencia=resultado["comparativo_faturamento"].faturamento_referencia,
        faturamento_diferenca_percentual=resultado["comparativo_faturamento"].diferenca_percentual,
        faturamento_status=resultado["comparativo_faturamento"].status,
        
        # Detalhes do cálculo
        capital_base_setor=resultado["calculos"].capital_base_setor,
        custo_por_funcionario=resultado["calculos"].custo_por_funcionario,
        quantidade_funcionarios=resultado["calculos"].quantidade_funcionarios,
        adicional_funcionarios=resultado["calculos"].adicional_funcionarios,
        adicional_estoque=resultado["calculos"].adicional_estoque,
        adicional_pressa=resultado["calculos"].adicional_pressa,
        adicional_tech_produto=resultado["calculos"].adicional_tech_produto,
        margem_setor=resultado["calculos"].margem_setor,
        
        # Alertas e checklist (JSON)
        alertas=[a.model_dump() for a in resultado["alertas"]],
        checklist=[c.model_dump() for c in resultado["checklist_30_dias"]],
        
        # Mensagem de contexto
        mensagem_contexto=resultado["mensagem_contexto"]
    )
    
    db.add(analise)
    db.commit()
    db.refresh(analise)
    
    # 3. Montar resposta
    return PreAberturaResponse(
        id=analise.id,
        tipo_negocio=resultado["tipo_negocio"],
        setor=resultado["setor"],
        setor_label=resultado["setor_label"],
        estado=resultado["estado"],
        cidade=resultado["cidade"],
        previsao_abertura=resultado["previsao_abertura"],
        comparativo_capital=resultado["comparativo_capital"],
        comparativo_faturamento=resultado["comparativo_faturamento"],
        alertas=resultado["alertas"],
        checklist_30_dias=resultado["checklist_30_dias"],
        mensagem_contexto=resultado["mensagem_contexto"],
        calculos=resultado["calculos"],
        created_at=analise.created_at
    )


@router.get("/{analise_id}", response_model=PreAberturaResponse)
def buscar_analise_pre_abertura(
    analise_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Busca uma análise pré-abertura pelo ID.
    """
    analise = db.query(AnalisePreAbertura).filter(
        AnalisePreAbertura.id == analise_id
    ).first()
    
    if not analise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Análise não encontrada"
        )
    
    # Reconstruir objetos para resposta
    comparativo_capital = ComparativoCapital(
        capital_informado=float(analise.capital_disponivel),
        capital_recomendado=float(analise.capital_recomendado),
        diferenca_percentual=float(analise.capital_diferenca_percentual),
        status=analise.capital_status
    )
    
    comparativo_faturamento = ComparativoFaturamento(
        faturamento_esperado=float(analise.faturamento_esperado),
        faturamento_referencia=float(analise.faturamento_referencia),
        diferenca_percentual=float(analise.faturamento_diferenca_percentual),
        status=analise.faturamento_status
    )
    
    calculos = CalculosPreAbertura(
        capital_base_setor=float(analise.capital_base_setor),
        custo_por_funcionario=float(analise.custo_por_funcionario),
        quantidade_funcionarios=float(analise.quantidade_funcionarios),
        adicional_funcionarios=float(analise.adicional_funcionarios),
        adicional_estoque=float(analise.adicional_estoque),
        adicional_pressa=float(analise.adicional_pressa),
        adicional_tech_produto=float(analise.adicional_tech_produto),
        margem_setor=analise.margem_setor
    )
    
    # Reconstruir alertas do JSON
    alertas = [
        AlertaPreAbertura(
            id=a["id"],
            categoria=CategoriaAlertaEnum(a["categoria"]),
            severidade=SeveridadeAlertaEnum(a["severidade"]),
            titulo=a["titulo"],
            texto=a["texto"]
        )
        for a in (analise.alertas or [])
    ]
    
    # Reconstruir checklist do JSON
    checklist = [
        ItemChecklist(
            texto=c["texto"],
            condicional=c.get("condicional", False),
            condicao=c.get("condicao")
        )
        for c in (analise.checklist or [])
    ]
    
    # Formatar previsão de abertura
    meses = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
             "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
    previsao_abertura = f"{meses[analise.mes_abertura]}/{analise.ano_abertura}"
    
    return PreAberturaResponse(
        id=analise.id,
        tipo_negocio=analise.tipo_negocio,
        setor=analise.setor,
        setor_label=SETOR_LABELS.get(analise.setor, analise.setor),
        estado=analise.estado,
        cidade=analise.cidade,
        previsao_abertura=previsao_abertura,
        comparativo_capital=comparativo_capital,
        comparativo_faturamento=comparativo_faturamento,
        alertas=alertas,
        checklist_30_dias=checklist,
        mensagem_contexto=analise.mensagem_contexto,
        calculos=calculos,
        created_at=analise.created_at
    )


@router.get("/email/{email}", response_model=list[PreAberturaResumo])
def listar_por_email(
    email: str,
    db: Session = Depends(get_db)
):
    """
    Lista todas as análises pré-abertura de um email.
    """
    analises = db.query(AnalisePreAbertura).filter(
        AnalisePreAbertura.email == email
    ).order_by(
        AnalisePreAbertura.created_at.desc()
    ).all()
    
    meses = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
             "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
    
    return [
        PreAberturaResumo(
            id=a.id,
            setor=a.setor,
            setor_label=SETOR_LABELS.get(a.setor, a.setor),
            previsao_abertura=f"{meses[a.mes_abertura]}/{a.ano_abertura}",
            capital_status=a.capital_status,
            created_at=a.created_at
        )
        for a in analises
    ]