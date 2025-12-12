# services/pdf_report.py
# Geração do relatório PDF usando ReportLab

import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors

from schemas.report import ReportPayload

# Dimensões da página
PAGE_WIDTH, PAGE_HEIGHT = A4

# Cores do Leme
LEME_BLUE = colors.HexColor("#112D4E")
LEME_GRAY = colors.HexColor("#6B7280")
LEME_LIGHT_GRAY = colors.HexColor("#E5E7EB")


def _draw_header(c: canvas.Canvas):
    """Desenha o cabeçalho com faixa azul"""
    # Faixa azul no topo
    c.setFillColor(LEME_BLUE)
    c.rect(0, PAGE_HEIGHT - 10 * mm, PAGE_WIDTH, 10 * mm, stroke=0, fill=1)
    
    # Texto do header
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString(PAGE_WIDTH / 2, PAGE_HEIGHT - 6.5 * mm, "LEME – ANÁLISE FINANCEIRA")


def _draw_footer(c: canvas.Canvas):
    """Desenha o rodapé com faixa azul"""
    # Faixa azul no rodapé
    c.setFillColor(LEME_BLUE)
    c.rect(0, 0, PAGE_WIDTH, 10 * mm, stroke=0, fill=1)
    
    # Texto do rodapé
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(15 * mm, 3.5 * mm, "LEME – ANÁLISE FINANCEIRA")
    c.drawRightString(PAGE_WIDTH - 15 * mm, 3.5 * mm, "LEME.APP.BR")


def _draw_company_info(c: canvas.Canvas, data: ReportPayload):
    """Desenha informações da empresa, data e score"""
    y = PAGE_HEIGHT - 28 * mm
    
    # Nome da empresa
    c.setFont("Helvetica-Bold", 16)
    c.setFillColor(colors.black)
    c.drawString(15 * mm, y, data.empresa_nome)
    
    # Setor e região
    y -= 7 * mm
    c.setFont("Helvetica", 10)
    c.setFillColor(LEME_GRAY)
    info_text = data.setor
    if data.estado:
        info_text += f" • {data.estado}"
    c.drawString(15 * mm, y, info_text)
    
    # Data da análise (abaixo do setor)
    y -= 6 * mm
    c.setFont("Helvetica", 9)
    c.setFillColor(LEME_GRAY)
    c.drawString(15 * mm, y, f"Referência: {data.mes_referencia}")
    
    # Score (lado direito) - SEM CÍRCULO
    score_x = PAGE_WIDTH - 35 * mm
    score_y = PAGE_HEIGHT - 32 * mm
    
    # Label "Score" acima
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(LEME_GRAY)
    c.drawCentredString(score_x, score_y + 8 * mm, "Score")
    
    # Número do score - maior e negrito
    c.setFont("Helvetica-Bold", 24)
    c.setFillColor(LEME_BLUE)
    c.drawCentredString(score_x, score_y - 4 * mm, str(data.score))


def _draw_valuation_payback(c: canvas.Canvas, data: ReportPayload):
    """Desenha seção de Valuation e Payback"""
    y = PAGE_HEIGHT - 62 * mm
    
    # Linha separadora
    c.setStrokeColor(LEME_LIGHT_GRAY)
    c.setLineWidth(0.5)
    c.line(15 * mm, y + 8 * mm, PAGE_WIDTH - 15 * mm, y + 8 * mm)
    
    # Coluna 1: Valor da empresa estimado
    col1_x = 15 * mm
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(LEME_BLUE)
    c.drawString(col1_x, y, "Valor da empresa estimado")
    
    c.setFont("Helvetica-Bold", 14)
    c.setFillColor(colors.black)
    c.drawString(col1_x, y - 8 * mm, f"{data.valuation_min} – {data.valuation_max}")
    
    c.setFont("Helvetica", 8)
    c.setFillColor(LEME_GRAY)
    c.drawString(col1_x, y - 15 * mm, "Valor estimado baseado no múltiplo relativo ao setor")
    
    # Coluna 2: Retorno do Investimento
    col2_x = 115 * mm
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(LEME_BLUE)
    c.drawString(col2_x, y, "Retorno do Investimento")
    
    c.setFont("Helvetica-Bold", 14)
    c.setFillColor(colors.black)
    c.drawString(col2_x, y - 8 * mm, data.payback_texto)
    
    c.setFont("Helvetica", 8)
    c.setFillColor(LEME_GRAY)
    c.drawString(col2_x, y - 15 * mm, "Tempo estimado para recuperar o investimento")


def _draw_indicadores(c: canvas.Canvas, data: ReportPayload):
    """Desenha seção de Indicadores Financeiros"""
    y = PAGE_HEIGHT - 95 * mm
    
    # Título
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(LEME_BLUE)
    c.drawString(15 * mm, y, "Indicadores Financeiros")
    
    # Linha separadora
    c.setStrokeColor(LEME_LIGHT_GRAY)
    c.setLineWidth(0.5)
    c.line(15 * mm, y - 3 * mm, PAGE_WIDTH - 15 * mm, y - 3 * mm)
    
    # Tabela de indicadores
    y_row = y - 14 * mm
    col1_x = 15 * mm       # Nome
    col2_x = 65 * mm       # Valor
    col3_x = 100 * mm      # Descrição
    
    for ind in data.indicadores:
        # Nome do indicador
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(colors.black)
        c.drawString(col1_x, y_row, ind.nome)
        
        # Valor
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(LEME_BLUE)
        c.drawString(col2_x, y_row, ind.valor)
        
        # Descrição (com quebra de linha se necessário)
        c.setFont("Helvetica", 8)
        c.setFillColor(LEME_GRAY)
        
        descricao = ind.descricao
        max_chars = 55
        
        if len(descricao) > max_chars:
            # Quebra em duas linhas
            palavras = descricao.split()
            linha1 = ""
            linha2 = ""
            for palavra in palavras:
                if len(linha1) + len(palavra) + 1 <= max_chars:
                    linha1 += palavra + " "
                else:
                    linha2 += palavra + " "
            c.drawString(col3_x, y_row, linha1.strip())
            if linha2:
                c.drawString(col3_x, y_row - 4 * mm, linha2.strip()[:max_chars])
        else:
            c.drawString(col3_x, y_row, descricao)
        
        y_row -= 16 * mm


def _draw_diagnostico(c: canvas.Canvas, data: ReportPayload):
    """Desenha seção de Diagnóstico"""
    y = PAGE_HEIGHT - 28 * mm
    
    # Título
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(LEME_BLUE)
    c.drawString(15 * mm, y, "Diagnóstico")
    
    # Linha separadora
    c.setStrokeColor(LEME_LIGHT_GRAY)
    c.setLineWidth(0.5)
    c.line(15 * mm, y - 3 * mm, PAGE_WIDTH - 15 * mm, y - 3 * mm)
    
    # Duas colunas
    col1_x = 15 * mm
    col2_x = 110 * mm
    y_content = y - 15 * mm
    
    # Pontos Fortes
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(colors.black)
    c.drawString(col1_x, y_content, "Pontos Fortes")
    
    y_bullet = y_content - 10 * mm
    c.setFont("Helvetica", 9)
    c.setFillColor(LEME_GRAY)
    for ponto in data.diagnostico.pontos_fortes[:4]:
        texto = ponto if len(ponto) <= 45 else ponto[:42] + "..."
        c.drawString(col1_x, y_bullet, f"• {texto}")
        y_bullet -= 10 * mm
    
    # Pontos de Atenção
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(colors.black)
    c.drawString(col2_x, y_content, "Pontos de Atenção")
    
    y_bullet = y_content - 10 * mm
    c.setFont("Helvetica", 9)
    c.setFillColor(LEME_GRAY)
    for ponto in data.diagnostico.pontos_atencao[:4]:
        texto = ponto if len(ponto) <= 45 else ponto[:42] + "..."
        c.drawString(col2_x, y_bullet, f"• {texto}")
        y_bullet -= 10 * mm


def _draw_plano_acao(c: canvas.Canvas, data: ReportPayload):
    """Desenha seção de Plano de Ação"""
    y = PAGE_HEIGHT - 95 * mm
    
    # Título
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(LEME_BLUE)
    c.drawString(15 * mm, y, "Planos de Ação")
    
    # Linha separadora
    c.setStrokeColor(LEME_LIGHT_GRAY)
    c.setLineWidth(0.5)
    c.line(15 * mm, y - 3 * mm, PAGE_WIDTH - 15 * mm, y - 3 * mm)
    
    y_content = y - 15 * mm
    
    # Agrupa ações por período (3 itens por período)
    for periodo in ["30", "60", "90"]:
        acoes_periodo = [a for a in data.acoes if a.periodo == periodo][:3]
        
        # Título do período
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(colors.black)
        c.drawString(15 * mm, y_content, f"{periodo} dias")
        y_content -= 8 * mm
        
        # Bullets (apenas títulos)
        c.setFont("Helvetica", 9)
        c.setFillColor(LEME_GRAY)
        
        if acoes_periodo:
            for acao in acoes_periodo:
                texto = acao.titulo if len(acao.titulo) <= 85 else acao.titulo[:82] + "..."
                c.drawString(20 * mm, y_content, f"• {texto}")
                y_content -= 8 * mm
        else:
            c.drawString(20 * mm, y_content, "• —")
            y_content -= 8 * mm
        
        y_content -= 6 * mm


def _draw_page1(c: canvas.Canvas, data: ReportPayload):
    """Desenha a Página 1 — Visão Executiva + Indicadores"""
    _draw_header(c)
    _draw_company_info(c, data)
    _draw_valuation_payback(c, data)
    _draw_indicadores(c, data)
    _draw_footer(c)


def _draw_page2(c: canvas.Canvas, data: ReportPayload):
    """Desenha a Página 2 — Diagnóstico + Plano de Ação"""
    _draw_header(c)
    _draw_diagnostico(c, data)
    _draw_plano_acao(c, data)
    _draw_footer(c)


def build_pdf_report(payload: ReportPayload) -> bytes:
    """
    Gera o relatório PDF completo.
    
    Args:
        payload: Dados do relatório
        
    Returns:
        bytes: Conteúdo do PDF
    """
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    
    # Página 1
    _draw_page1(c, payload)
    c.showPage()
    
    # Página 2
    _draw_page2(c, payload)
    c.showPage()
    
    # Finaliza
    c.save()
    buffer.seek(0)
    
    return buffer.getvalue()