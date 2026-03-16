"""
Serviço de IA — Fase 5
Centraliza todas as chamadas à Claude API do Leme.

Funções:
- gerar_resumo_executivo: 4-5 linhas de diagnóstico textual
- gerar_comparativo_setorial: benchmarks setoriais em JSON
- montar_system_prompt_chat: system prompt contextualizado do ChatConsultor

Princípio central: Features 1 e 2 são geradas UMA VEZ na criação da análise
e salvas no banco. Não regerar a cada acesso.
"""

import json
import logging
from typing import Optional
import anthropic

logger = logging.getLogger(__name__)

# Modelo definido no handoff — custo/qualidade ideal para texto estruturado
MODELO_IA = "claude-sonnet-4-5"

# Cliente Anthropic — lê ANTHROPIC_API_KEY do ambiente automaticamente
_client = anthropic.Anthropic()


# ========== HELPERS INTERNOS ==========

def _status_por_score(score: int) -> str:
    """Converte score numérico em label textual para os prompts."""
    if score >= 75:
        return "saudável"
    elif score >= 50:
        return "atenção"
    else:
        return "crítico"


# ========== FEATURE 1: RESUMO EXECUTIVO ==========

async def gerar_resumo_executivo(
    score: int,
    indicadores: dict,
    pontos_atencao: list[str],
    plano_prioridade: str,
    setor: str,
    score_anterior: Optional[int] = None,
) -> Optional[str]:
    """
    Gera o resumo executivo via IA em 4-5 linhas estruturadas.

    Retorna o texto gerado ou None em caso de falha
    (o frontend usa buildLinhas() como fallback quando None).

    Args:
        score: Score atual da empresa (0-100)
        indicadores: Dict com os indicadores calculados (folego_caixa, etc.)
        pontos_atencao: Lista de strings com os pontos de atenção do diagnóstico
        plano_prioridade: Primeiro item do plano de 30 dias (prioridade do mês)
        setor: Setor da empresa (ex: "comercio_varejo")
        score_anterior: Score da análise anterior, None se for a primeira
    """
    status = _status_por_score(score)
    folego = indicadores.get("folego_caixa", 0)
    atencao_formatado = "; ".join(pontos_atencao[:3]) if pontos_atencao else "nenhum identificado"
    num_linhas = "5 linhas" if score_anterior is not None else "4 linhas"

    system_prompt = (
        "Você é um consultor financeiro direto e empático especializado em "
        "micro e pequenas empresas brasileiras. Gere um resumo executivo da "
        "situação financeira da empresa em exatamente 4 ou 5 linhas, usando "
        "linguagem simples e acessível — sem jargão técnico. Cada linha "
        "começa com um label em maiúsculas seguido de dois pontos. "
        "Responda APENAS com as linhas, sem introdução, sem conclusão, "
        "sem formatação adicional."
    )

    user_prompt = (
        f"Empresa do setor: {setor}. "
        f"Score: {score}/100 ({status}). "
        f"Fôlego de caixa: {folego} dias. "
        f"Pontos de atenção: {atencao_formatado}. "
        f"Prioridade do mês: {plano_prioridade}. "
        f"Score anterior: {score_anterior if score_anterior is not None else 'primeira análise'}. "
        f"Gere o resumo executivo em {num_linhas}."
    )

    try:
        resposta = _client.messages.create(
            model=MODELO_IA,
            max_tokens=300,
            messages=[{"role": "user", "content": user_prompt}],
            system=system_prompt,
        )

        texto = resposta.content[0].text.strip()

        # Validação básica: rejeitar se veio mais de 5 linhas
        linhas = [l for l in texto.split("\n") if l.strip()]
        if len(linhas) > 5:
            logger.warning(
                "Resumo executivo retornou %d linhas (máx 5). Usando fallback.",
                len(linhas),
            )
            return None

        return texto

    except Exception as e:
        logger.error("Erro ao gerar resumo executivo via IA: %s", e)
        return None


# ========== FEATURE 2: COMPARATIVO SETORIAL ==========

async def gerar_comparativo_setorial(
    indicadores: dict,
    setor: str,
) -> Optional[str]:
    """
    Gera benchmarks setoriais para os indicadores da empresa via IA.

    Retorna uma string JSON válida ou None em caso de falha ou JSON inválido.
    O frontend faz o parse — nunca exibir dado corrompido ao usuário.

    Estrutura esperada do JSON retornado:
    {
        "margem_bruta": {
            "faixa_setor": "X% a Y%",
            "posicao": "abaixo|dentro|acima",
            "interpretacao": "frase curta em linguagem leiga"
        },
        ...
    }
    """
    margem = indicadores.get("margem_bruta")
    folego = indicadores.get("folego_caixa")
    ciclo = indicadores.get("ciclo_financeiro")
    peso_divida = indicadores.get("peso_divida")
    resultado = indicadores.get("resultado_mes")
    receita = indicadores.get("receita_funcionario")

    # Montar apenas os indicadores disponíveis
    indicadores_txt_partes = []
    if margem is not None:
        indicadores_txt_partes.append(f"margem_bruta: {margem}%")
    if folego is not None:
        indicadores_txt_partes.append(f"folego_caixa: {folego} dias")
    if ciclo is not None:
        indicadores_txt_partes.append(f"ciclo_financeiro: {ciclo} dias")
    if peso_divida is not None:
        indicadores_txt_partes.append(f"peso_divida: {peso_divida}%")
    if resultado is not None:
        indicadores_txt_partes.append(f"margem_liquida: {resultado}")

    indicadores_txt = ", ".join(indicadores_txt_partes)

    system_prompt = (
        "Você é um especialista em benchmarks financeiros para micro e "
        "pequenas empresas brasileiras. Use dados públicos do Sebrae, IBGE "
        "e Banco Central. Responda APENAS com um objeto JSON válido, sem "
        "markdown, sem explicação. O JSON deve ter uma chave para cada "
        'indicador com: { "faixa_setor": "X% a Y%", "posicao": '
        '"abaixo|dentro|acima", "interpretacao": "frase curta em linguagem leiga" }'
    )

    user_prompt = (
        f"Setor: {setor}. "
        f"Indicadores da empresa: {indicadores_txt}. "
        "Gere o comparativo setorial para cada indicador disponível."
    )

    try:
        resposta = _client.messages.create(
            model=MODELO_IA,
            max_tokens=600,
            messages=[{"role": "user", "content": user_prompt}],
            system=system_prompt,
        )

        texto = resposta.content[0].text.strip()

        # Validar que é JSON antes de salvar
        json.loads(texto)  # levanta ValueError se inválido

        return texto

    except json.JSONDecodeError:
        logger.error("Comparativo setorial retornou JSON inválido. Salvando null.")
        return None
    except Exception as e:
        logger.error("Erro ao gerar comparativo setorial via IA: %s", e)
        return None


# ========== FEATURE 3: SYSTEM PROMPT DO CHAT ==========

def montar_system_prompt_chat(analise: dict) -> str:
    """
    Monta o system prompt contextualizado do ChatConsultor com os dados reais
    da análise. Chamado pelo endpoint de chat a cada requisição.

    Args:
        analise: Dict com os campos da análise (score_saude, setor, etc.)

    Returns:
        String do system prompt pronto para enviar à Claude API.
    """
    score = int(analise.get("score_saude", 0))
    status = _status_por_score(score)
    setor = analise.get("setor", "não informado")
    folego = analise.get("folego_caixa", 0)
    resultado = analise.get("resultado_mes", 0)
    pontos_atencao = analise.get("pontos_atencao", [])
    plano_30 = analise.get("plano_30_dias", [])

    ponto_atencao_1 = pontos_atencao[0] if pontos_atencao else "nenhum identificado"
    plano_prioridade = plano_30[0] if plano_30 else "nenhuma definida"

    # Tom adaptativo conforme o score
    if score < 40:
        tom = (
            "Seja direto e urgente. A empresa está em situação crítica. "
            "Priorize ações imediatas e evite rodeios."
        )
    elif score < 70:
        tom = (
            "Seja equilibrado: reconheça os riscos sem alarmar, "
            "mas deixe claro que ações são necessárias agora."
        )
    else:
        tom = (
            "Seja consultivo e estratégico. A empresa está saudável — "
            "foque em oportunidades de crescimento e otimização."
        )

    return (
        "Você é o consultor financeiro do Leme — direto, empático e "
        "especializado em micro e pequenas empresas brasileiras. "
        f"Você conhece os dados reais desta empresa:\n"
        f"Empresa: {setor} | Score: {score}/100 ({status})\n"
        f"Fôlego de caixa: {folego} dias | Resultado mensal: R$ {resultado:,.2f}\n"
        f"Principal risco: {ponto_atencao_1}\n"
        f"Prioridade do mês: {plano_prioridade}\n\n"
        "Regras de resposta:\n"
        "- Linguagem simples, sem jargão técnico\n"
        "- Máximo 3 parágrafos por resposta\n"
        "- Se perguntarem algo fora do contexto financeiro da empresa, "
        "redirecione gentilmente\n"
        f"- Tom: {tom}"
    )


# ========== MENSAGEM DE ABERTURA DO CHAT ==========

async def gerar_mensagem_abertura_chat(analise: dict) -> str:
    """
    Gera a primeira mensagem do ChatConsultor quando o histórico está vazio.
    Contextualizada no score e no principal risco da empresa.

    Retorna mensagem de abertura ou fallback estático em caso de erro.
    """
    score = int(analise.get("score_saude", 0))
    status = _status_por_score(score)
    pontos_atencao = analise.get("pontos_atencao", [])
    plano_30 = analise.get("plano_30_dias", [])

    risco = pontos_atencao[0] if pontos_atencao else "gestão financeira"
    area_melhora = plano_30[0] if plano_30 else "eficiência operacional"

    system_prompt = montar_system_prompt_chat(analise)

    if score < 40:
        abertura_hint = (
            f"Vi que sua empresa está em situação {status} com score {score}. "
            f"O maior risco agora é: {risco}. "
            "Gere uma mensagem de abertura direta e encorajadora — máximo 2 frases."
        )
    else:
        abertura_hint = (
            f"Sua empresa está com score {score} ({status}). "
            f"Ainda há espaço para melhorar em: {area_melhora}. "
            "Gere uma mensagem de abertura consultiva — máximo 2 frases."
        )

    try:
        resposta = _client.messages.create(
            model=MODELO_IA,
            max_tokens=150,
            system=system_prompt,
            messages=[{"role": "user", "content": abertura_hint}],
        )
        return resposta.content[0].text.strip()

    except Exception as e:
        logger.error("Erro ao gerar mensagem de abertura do chat: %s", e)
        # Fallback estático — nunca deixar o chat sem primeira mensagem
        if score < 40:
            return (
                f"Vi que sua empresa está em situação crítica com score {score}/100. "
                "O que você quer resolver primeiro?"
            )
        else:
            return (
                f"Sua empresa está com score {score}/100. "
                "Estou aqui para ajudar a evoluir ainda mais. O que quer explorar?"
            )
