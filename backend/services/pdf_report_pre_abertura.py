# services/pdf_pre_abertura.py
# PDF de Análise Pré-Abertura - Versão 1 página institucional

import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white

# Dimensões
PAGE_WIDTH, PAGE_HEIGHT = A4

# Cores Leme
LEME_BLUE = HexColor("#112D4E")
LEME_ORANGE = HexColor("#F5793B")
LEME_DARK = HexColor("#081524")
LEME_GRAY = HexColor("#6B7280")
LEME_LIGHT_GRAY = HexColor("#E5E7EB")
LEME_BG = HexColor("#F7FAFD")

COLOR_SUCCESS = HexColor("#10B981")
COLOR_WARNING = HexColor("#F59E0B")
COLOR_DANGER = HexColor("#EF4444")

# Margens
ML = 15 * mm  # Margem esquerda
MR = 15 * mm  # Margem direita
CONTENT_W = PAGE_WIDTH - ML - MR


def draw_rounded_rect(c, x, y, w, h, r, fill=None, stroke=None):
    """Retângulo com cantos arredondados"""
    c.saveState()
    if fill:
        c.setFillColor(fill)
    if stroke:
        c.setStrokeColor(stroke)
        c.setLineWidth(0.5)
    
    p = c.beginPath()
    p.moveTo(x + r, y)
    p.lineTo(x + w - r, y)
    p.arcTo(x + w - r, y, x + w, y + r, 90)
    p.lineTo(x + w, y + h - r)
    p.arcTo(x + w, y + h - r, x + w - r, y + h, 0)
    p.lineTo(x + r, y + h)
    p.arcTo(x + r, y + h, x, y + h - r, 270)
    p.lineTo(x, y + r)
    p.arcTo(x, y + r, x + r, y, 180)
    p.close()
    
    c.drawPath(p, fill=1 if fill else 0, stroke=1 if stroke else 0)
    c.restoreState()


def gerar_pdf_pre_abertura(data: dict) -> bytes:
    """Gera PDF de 1 página para análise pré-abertura"""
    
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    
    # ========================================
    # HEADER - Faixa azul com branding
    # ========================================
    header_h = 22 * mm
    c.setFillColor(LEME_BLUE)
    c.rect(0, PAGE_HEIGHT - header_h, PAGE_WIDTH, header_h, stroke=0, fill=1)
    
    # Logo LEME
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(ML, PAGE_HEIGHT - 14 * mm, "LEME")
    
    c.setFont("Helvetica", 8)
    c.drawString(ML, PAGE_HEIGHT - 19 * mm, "Análise Financeira Inteligente")
    
    # URL direita
    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(PAGE_WIDTH - MR, PAGE_HEIGHT - 14 * mm, "leme.app.br")
    
    # ========================================
    # TÍTULO E INFO DO PROJETO
    # ========================================
    y = PAGE_HEIGHT - header_h - 12 * mm
    
    c.setFillColor(LEME_DARK)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(ML, y, "Análise Pré-Abertura")
    
    y -= 7 * mm
    c.setFont("Helvetica", 10)
    c.setFillColor(LEME_GRAY)
    
    setor = data.get("setor_label", data.get("setor", ""))
    tipo = data.get("tipo_negocio", "").replace("_", " ").title()
    previsao = data.get("previsao_abertura", "")
    
    c.drawString(ML, y, f"{setor} • {tipo}")
    c.drawRightString(PAGE_WIDTH - MR, y, f"Previsão: {previsao}")
    
    # Linha separadora
    y -= 5 * mm
    c.setStrokeColor(LEME_LIGHT_GRAY)
    c.setLineWidth(0.5)
    c.line(ML, y, PAGE_WIDTH - MR, y)
    
    # ========================================
    # COMPARATIVOS (lado a lado)
    # ========================================
    y -= 10 * mm
    
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(LEME_BLUE)
    c.drawString(ML, y, "Comparativo com referência do setor")
    
    y -= 8 * mm
    card_h = 32 * mm
    card_w = (CONTENT_W - 8 * mm) / 2
    
    # --- Card Capital ---
    comp_capital = data.get("comparativo_capital", {})
    status_cap = comp_capital.get("status", "")
    pct_cap = comp_capital.get("percentual_diferenca", 0)
    
    if "acima" in status_cap.lower():
        status_color = COLOR_SUCCESS
    elif abs(pct_cap) > 30:
        status_color = COLOR_DANGER
    else:
        status_color = COLOR_WARNING
    
    draw_rounded_rect(c, ML, y - card_h, card_w, card_h, 3*mm, fill=white, stroke=LEME_LIGHT_GRAY)
    
    cx = ML + 6 * mm
    cy = y - 7 * mm
    
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(LEME_DARK)
    c.drawString(cx, cy, "Capital")
    
    c.setFillColor(status_color)
    c.drawRightString(ML + card_w - 6*mm, cy, status_cap)
    
    cy -= 8 * mm
    c.setFont("Helvetica", 8)
    c.setFillColor(LEME_GRAY)
    c.drawString(cx, cy, "Seu capital")
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(LEME_DARK)
    c.drawRightString(ML + card_w - 6*mm, cy, comp_capital.get("capital_usuario_fmt", "R$ 0"))
    
    cy -= 7 * mm
    c.setFont("Helvetica", 8)
    c.setFillColor(LEME_GRAY)
    c.drawString(cx, cy, "Referência do setor")
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(LEME_DARK)
    c.drawRightString(ML + card_w - 6*mm, cy, comp_capital.get("capital_referencia_fmt", "R$ 0"))
    
    # --- Card Faturamento ---
    comp_fat = data.get("comparativo_faturamento", {})
    status_fat = comp_fat.get("status", "")
    
    if "acima" in status_fat.lower():
        status_color_fat = COLOR_SUCCESS
    else:
        status_color_fat = COLOR_WARNING
    
    card2_x = ML + card_w + 8 * mm
    draw_rounded_rect(c, card2_x, y - card_h, card_w, card_h, 3*mm, fill=white, stroke=LEME_LIGHT_GRAY)
    
    cx2 = card2_x + 6 * mm
    cy = y - 7 * mm
    
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(LEME_DARK)
    c.drawString(cx2, cy, "Faturamento mensal esperado")
    
    c.setFillColor(status_color_fat)
    c.drawRightString(card2_x + card_w - 6*mm, cy, status_fat)
    
    cy -= 8 * mm
    c.setFont("Helvetica", 8)
    c.setFillColor(LEME_GRAY)
    c.drawString(cx2, cy, "Sua estimativa")
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(LEME_DARK)
    c.drawRightString(card2_x + card_w - 6*mm, cy, comp_fat.get("faturamento_usuario_fmt", "R$ 0"))
    
    cy -= 7 * mm
    c.setFont("Helvetica", 8)
    c.setFillColor(LEME_GRAY)
    c.drawString(cx2, cy, "Média do setor (1º ano)")
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(LEME_DARK)
    c.drawRightString(card2_x + card_w - 6*mm, cy, comp_fat.get("faturamento_referencia_fmt", "R$ 0"))
    
    # ========================================
    # PONTOS DE ATENÇÃO
    # ========================================
    y = y - card_h - 10 * mm
    
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(LEME_BLUE)
    c.drawString(ML, y, "Pontos de atenção")
    
    y -= 6 * mm
    alertas = data.get("alertas", [])
    
    for alerta in alertas[:3]:
        categoria = alerta.get("categoria", "")
        titulo = alerta.get("titulo", "")
        descricao = alerta.get("descricao", "")
        
        if categoria == "positivo":
            icon, icon_color, bg = "✓", COLOR_SUCCESS, HexColor("#F0FDF4")
        elif categoria == "risco":
            icon, icon_color, bg = "!", COLOR_DANGER, HexColor("#FEF2F2")
        else:
            icon, icon_color, bg = "!", COLOR_WARNING, HexColor("#FFFBEB")
        
        alert_h = 18 * mm
        draw_rounded_rect(c, ML, y - alert_h, CONTENT_W, alert_h, 2*mm, fill=bg)
        
        # Ícone
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(icon_color)
        c.drawString(ML + 5*mm, y - 7*mm, icon)
        
        # Título
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(LEME_DARK)
        c.drawString(ML + 14*mm, y - 6*mm, titulo)
        
        # Descrição (truncada)
        c.setFont("Helvetica", 8)
        c.setFillColor(LEME_GRAY)
        desc = descricao[:100] + "..." if len(descricao) > 100 else descricao
        c.drawString(ML + 14*mm, y - 13*mm, desc)
        
        y -= alert_h + 3 * mm
    
    # ========================================
    # CHECKLIST
    # ========================================
    y -= 5 * mm
    
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(LEME_BLUE)
    c.drawString(ML, y, "Checklist: primeiros 30 dias")
    
    y -= 6 * mm
    checklist = data.get("checklist_30_dias", [])
    
    # Duas colunas para economizar espaço
    col_w = CONTENT_W / 2
    items_col1 = checklist[:len(checklist)//2 + len(checklist)%2]
    items_col2 = checklist[len(checklist)//2 + len(checklist)%2:]
    
    start_y = y
    for item in items_col1:
        titulo = item.get("titulo", "") if isinstance(item, dict) else str(item)
        
        c.setStrokeColor(LEME_GRAY)
        c.setLineWidth(0.8)
        c.rect(ML, y - 2.5*mm, 3*mm, 3*mm, stroke=1, fill=0)
        
        c.setFont("Helvetica", 8)
        c.setFillColor(LEME_DARK)
        c.drawString(ML + 5*mm, y - 1*mm, titulo[:45])
        
        y -= 6 * mm
    
    y = start_y
    for item in items_col2:
        titulo = item.get("titulo", "") if isinstance(item, dict) else str(item)
        
        c.setStrokeColor(LEME_GRAY)
        c.setLineWidth(0.8)
        c.rect(ML + col_w, y - 2.5*mm, 3*mm, 3*mm, stroke=1, fill=0)
        
        c.setFont("Helvetica", 8)
        c.setFillColor(LEME_DARK)
        c.drawString(ML + col_w + 5*mm, y - 1*mm, titulo[:45])
        
        y -= 6 * mm
    
    # ========================================
    # FOOTER - Faixa azul com CTA
    # ========================================
    footer_h = 14 * mm
    c.setFillColor(LEME_BLUE)
    c.rect(0, 0, PAGE_WIDTH, footer_h, stroke=0, fill=1)
    
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(ML, 5*mm, "LEME — ANÁLISE PRÉ-ABERTURA")
    
    c.setFont("Helvetica", 8)
    c.drawCentredString(PAGE_WIDTH/2, 5*mm, "Faça sua análise completa gratuita")
    
    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(PAGE_WIDTH - MR, 5*mm, "leme.app.br")
    
    # Finalizar
    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer.getvalue()


# Teste
if __name__ == "__main__":
    dados_teste = {
        "setor_label": "Comércio Varejista",
        "tipo_negocio": "produto",
        "previsao_abertura": "Setembro/2026",
        "comparativo_capital": {
            "capital_usuario_fmt": "R$ 25.000",
            "capital_referencia_fmt": "R$ 30.000",
            "status": "17% abaixo",
            "percentual_diferenca": -17
        },
        "comparativo_faturamento": {
            "faturamento_usuario_fmt": "R$ 50",
            "faturamento_referencia_fmt": "R$ 15.000",
            "status": "Abaixo da média"
        },
        "alertas": [
            {"categoria": "atencao", "titulo": "Expectativa de faturamento conservadora", "descricao": "Sua estimativa está bem abaixo da média do setor. Isso pode ser realista para o início, mas considere revisar suas projeções de crescimento."},
            {"categoria": "atencao", "titulo": "Estoque em setor de margem apertada", "descricao": "Setores como Comércio Varejista tendem a operar com margens brutas menores. É essencial negociar bem com fornecedores."},
            {"categoria": "positivo", "titulo": "Bom sinal: demanda pré-validada", "descricao": "Ter clientes ou contratos antes de abrir reduz significativamente o risco. Foque em manter esse relacionamento."}
        ],
        "checklist_30_dias": [
            {"titulo": "Definir estrutura jurídica (MEI, ME, LTDA)"},
            {"titulo": "Pesquisar exigências da prefeitura local"},
            {"titulo": "Abrir conta bancária PJ"},
            {"titulo": "Contratar contador ou empresa de contabilidade"},
            {"titulo": "Pesquisar fornecedores e negociar prazos"},
            {"titulo": "Definir precificação inicial"}
        ]
    }
    
    pdf = gerar_pdf_pre_abertura(dados_teste)
    with open("pre_abertura_v2.pdf", "wb") as f:
        f.write(pdf)
    print("PDF gerado: pre_abertura_v2.pdf")