"""
Serviço de envio de e-mails via Brevo (ex-Sendinblue)
Feature: E-mail de abandono
"""

import httpx
from typing import Optional

from config import get_settings


# Configurações
settings = get_settings()
BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"

# Remetente padrão
DEFAULT_SENDER_EMAIL = "contato@leme.app.br"
DEFAULT_SENDER_NAME = "Leme"

# Logo
LOGO_URL = "https://leme.app.br/images/logo-icon.png"


async def enviar_email(
    para_email: str,
    para_nome: str,
    assunto: str,
    html_content: str,
    texto_content: Optional[str] = None,
) -> bool:
    """
    Envia um e-mail usando a API do Brevo.
    
    Args:
        para_email: E-mail do destinatário
        para_nome: Nome do destinatário
        assunto: Assunto do e-mail
        html_content: Conteúdo HTML do e-mail
        texto_content: Conteúdo texto puro (fallback)
    
    Returns:
        True se enviou com sucesso, False caso contrário
    """
    
    if not settings.BREVO_API_KEY:
        print("ERRO: BREVO_API_KEY não configurada")
        return False
    
    payload = {
        "sender": {
            "name": DEFAULT_SENDER_NAME,
            "email": DEFAULT_SENDER_EMAIL,
        },
        "to": [
            {
                "email": para_email,
                "name": para_nome,
            }
        ],
        "subject": assunto,
        "htmlContent": html_content,
    }
    
    if texto_content:
        payload["textContent"] = texto_content
    
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": settings.BREVO_API_KEY,
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                BREVO_API_URL,
                json=payload,
                headers=headers,
                timeout=30.0,
            )
            
            if response.status_code in [200, 201]:
                print(f"E-mail enviado com sucesso para {para_email}")
                return True
            else:
                print(f"Erro ao enviar e-mail: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        print(f"Exceção ao enviar e-mail: {e}")
        return False


async def enviar_email_abandono_1(nome_empresa: str, email: str) -> bool:
    """
    Envia o primeiro e-mail de abandono (3-6h após início).
    Tom: amigável, direto.
    """
    
    assunto = f"Você já começou a análise da {nome_empresa} — falta pouco para concluir"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                
                <!-- Header com Logo -->
                <div style="text-align: center; margin-bottom: 32px;">
                    <img src="{LOGO_URL}" alt="Leme" width="48" height="48" style="display: inline-block; vertical-align: middle; margin-right: 12px;">
                    <span style="font-size: 28px; font-weight: bold; color: #112D4E; vertical-align: middle;">Leme</span>
                </div>
                
                <!-- Conteúdo -->
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
                    Você iniciou a análise financeira da <strong>{nome_empresa}</strong>, mas ela não foi concluída.
                </p>
                
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    Sem problema — seus dados estão salvos e você pode continuar exatamente de onde parou.
                </p>
                
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
                    A análise leva menos de <strong>5 minutos</strong> e ao concluir você terá acesso a:
                </p>
                
                <ul style="color: #4a5568; font-size: 16px; line-height: 1.8; margin-bottom: 32px; padding-left: 20px;">
                    <li>Quanto a sua empresa vale hoje</li>
                    <li>A saúde financeira da empresa</li>
                    <li>Pontos fortes e pontos de atenção do negócio</li>
                    <li>Um plano de ação prático para os próximos 90 dias</li>
                </ul>
                
                <!-- CTA -->
                <div style="text-align: center; margin-bottom: 32px;">
                    <a href="https://leme.app.br/analise" 
                       style="display: inline-block; background-color: #112D4E; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        Continuar minha análise
                    </a>
                </div>
                
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 24px;">
                <p style="color: #a0aec0; font-size: 12px;">
                    Leme - Análise financeira para micro e pequenas empresas
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await enviar_email(
        para_email=email,
        para_nome=nome_empresa,
        assunto=assunto,
        html_content=html_content,
    )


async def enviar_email_abandono_2(nome_empresa: str, email: str) -> bool:
    """
    Envia o segundo e-mail de abandono (48h após início).
    Tom: último lembrete, sem pressão.
    """
    
    assunto = f"Sua análise financeira da {nome_empresa} ainda está disponível"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                
                <!-- Header com Logo -->
                <div style="text-align: center; margin-bottom: 32px;">
                    <img src="{LOGO_URL}" alt="Leme" width="48" height="48" style="display: inline-block; vertical-align: middle; margin-right: 12px;">
                    <span style="font-size: 28px; font-weight: bold; color: #112D4E; vertical-align: middle;">Leme</span>
                </div>
                
                <!-- Conteúdo -->
                <h2 style="color: #112D4E; font-size: 20px; margin-bottom: 16px;">
                    Sobre a análise financeira da {nome_empresa}
                </h2>
                
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
                    Você iniciou a análise, mas ela não foi concluída.
                </p>
                
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    Entendo que o dia a dia de empreendedor é corrido. Mas conhecer a saúde financeira do seu negócio é o primeiro passo pra tomar decisões melhores.
                </p>
                
                <!-- Destaque -->
                <div style="background-color: #f0f7ff; border-left: 4px solid #112D4E; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                    <p style="color: #112D4E; font-size: 16px; margin: 0;">
                        Empresas que monitoram seus indicadores financeiros têm 30% mais chance de crescer no ano seguinte.
                    </p>
                </div>
                
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                    A análise leva menos de <strong>5 minutos</strong> e pode ser concluída agora mesmo, inclusive pelo celular.
                </p>
                
                <!-- CTA -->
                <div style="text-align: center; margin-bottom: 32px;">
                    <a href="https://leme.app.br/analise" 
                       style="display: inline-block; background-color: #F5793B; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        Finalizar minha análise
                    </a>
                </div>
                
                <p style="color: #718096; font-size: 14px; line-height: 1.6; text-align: center;">
                    Se não fizer sentido agora, sem problemas.<br>
                    Quando quiser, é só retomar de onde parou.
                </p>
                
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 24px;">
                <p style="color: #a0aec0; font-size: 12px;">
                    Leme - Análise financeira para micro e pequenas empresas
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await enviar_email(
        para_email=email,
        para_nome=nome_empresa,
        assunto=assunto,
        html_content=html_content,
    )