# routers/report.py
# Endpoint para geração do relatório PDF

import io
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from schemas.report import ReportPayload
from services.pdf_report import build_pdf_report

router = APIRouter(
    prefix="/report",
    tags=["Relatório PDF"]
)


@router.post("", response_class=StreamingResponse)
def generate_report(payload: ReportPayload):
    """
    Gera o relatório PDF da análise.
    
    Recebe os dados do dashboard e retorna um PDF de 2 páginas
    com a visão executiva, indicadores, diagnóstico e plano de ação.
    """
    # Gera o PDF
    pdf_bytes = build_pdf_report(payload)
    
    # Monta o nome do arquivo
    nome_empresa = payload.empresa_nome.replace(" ", "_")
    filename = f"Leme_{nome_empresa}.pdf"
    
    # Retorna como download
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
