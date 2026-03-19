"""
Serviço de envio de e-mails via Brevo (ex-Sendinblue)
Features: E-mail de abandono, E-mail pós-conclusão
"""

import httpx
from typing import Optional
from urllib.parse import quote

from config import get_settings


# Configurações
settings = get_settings()
BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"

# Remetente padrão
DEFAULT_SENDER_EMAIL = "contato@leme.app.br"
DEFAULT_SENDER_NAME = "Leme"

# Logo
LOGO_URL = "https://leme.app.br/images/logo-icon.png"

# Tally
TALLY_FORM_URL = "https://tally.so/r/44KEvd"


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


async def enviar_email_abandono_1(nome_empresa: str, email: str, sessao_id: str = None) -> bool:
    """
    Envia o primeiro e-mail de abandono (3-6h após início).
    Tom: amigável, direto.
    """
    
    # Link com sessão para continuar de onde parou
    if sessao_id:
        link_continuar = f"https://leme.app.br/analise?sessao={sessao_id}"
    else:
        link_continuar = "https://leme.app.br/analise"
    
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
                    <a href="{link_continuar}" 
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


async def enviar_email_abandono_2(nome_empresa: str, email: str, sessao_id: str = None) -> bool:
    """
    Envia o segundo e-mail de abandono (48h após início).
    Tom: último lembrete, sem pressão.
    """
    
    # Link com sessão para continuar de onde parou
    if sessao_id:
        link_continuar = f"https://leme.app.br/analise?sessao={sessao_id}"
    else:
        link_continuar = "https://leme.app.br/analise"
    
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
                    <a href="{link_continuar}" 
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


async def enviar_email_pos_conclusao(nome_empresa: str, email: str, analise_id: str) -> bool:
    """
    Envia e-mail de feedback após conclusão da análise.
    Tom: agradecimento + pedido simples.
    """
    
    assunto = "Sua análise financeira em 1 nota"
    
    # Encode para URL
    aid_encoded = quote(str(analise_id))
    
    # Links para cada nota (1-5)
    def link_nota(nota: int) -> str:
        return f"{TALLY_FORM_URL}?nota={nota}&aid={aid_encoded}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <!-- Preheader (texto invisível que aparece na caixa de entrada) -->
        <div style="display: none; max-height: 0; overflow: hidden;">
            Leva menos de 30 segundos e ajuda a melhorar o Leme.
        </div>
        
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                
                <!-- Header com Logo -->
                <div style="text-align: center; margin-bottom: 32px;">
                    <img src="{LOGO_URL}" alt="Leme" width="48" height="48" style="display: inline-block; vertical-align: middle; margin-right: 12px;">
                    <span style="font-size: 28px; font-weight: bold; color: #112D4E; vertical-align: middle;">Leme</span>
                </div>
                
                <!-- Conteúdo -->
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
                    Obrigado por concluir a análise financeira da <strong>{nome_empresa}</strong>.
                </p>
                
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    Antes de seguir, queria ouvir você — leva menos de 30 segundos e ajuda bastante a melhorar o Leme.
                </p>
                
                <!-- Pergunta -->
                <p style="color: #112D4E; font-size: 16px; line-height: 1.6; margin-bottom: 16px; font-weight: 600;">
                    O quanto essa análise te ajudou a entender a situação financeira do seu negócio?
                </p>
                
                <p style="color: #718096; font-size: 14px; margin-bottom: 20px;">
                    1 = não ajudou &nbsp;&nbsp;|&nbsp;&nbsp; 5 = ajudou muito
                </p>
                
                <!-- Botões de nota (todos com mesma cor) -->
                <div style="text-align: center; margin-bottom: 32px;">
                    <a href="{link_nota(1)}" style="display: inline-block; width: 48px; height: 48px; line-height: 48px; text-align: center; background-color: #f0f0f0; color: #4a5568; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px; margin: 0 4px;">1</a>
                    <a href="{link_nota(2)}" style="display: inline-block; width: 48px; height: 48px; line-height: 48px; text-align: center; background-color: #f0f0f0; color: #4a5568; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px; margin: 0 4px;">2</a>
                    <a href="{link_nota(3)}" style="display: inline-block; width: 48px; height: 48px; line-height: 48px; text-align: center; background-color: #f0f0f0; color: #4a5568; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px; margin: 0 4px;">3</a>
                    <a href="{link_nota(4)}" style="display: inline-block; width: 48px; height: 48px; line-height: 48px; text-align: center; background-color: #f0f0f0; color: #4a5568; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px; margin: 0 4px;">4</a>
                    <a href="{link_nota(5)}" style="display: inline-block; width: 48px; height: 48px; line-height: 48px; text-align: center; background-color: #f0f0f0; color: #4a5568; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px; margin: 0 4px;">5</a>
                </div>
                
                <p style="color: #a0aec0; font-size: 13px; line-height: 1.6; text-align: center;">
                    Sua resposta é anônima e usada apenas para aprimorar a experiência.
                </p>
                
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 24px;">
                <p style="color: #a0aec0; font-size: 12px;">
                    Obrigado pelo tempo. — Equipe Leme
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


async def enviar_email_30_dias(nome_empresa: str, email: str) -> bool:
    """
    Envia e-mail de reengajamento 30 dias após conclusão.
    Tom: lembrete de valor, convite para nova análise.
    """
    
    assunto = f"Como está a {nome_empresa} depois de 30 dias?"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <!-- Preheader -->
        <div style="display: none; max-height: 0; overflow: hidden;">
            Uma nova análise leva menos de 5 minutos e permite comparar a evolução.
        </div>
        
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                
                <!-- Header com Logo -->
                <div style="text-align: center; margin-bottom: 32px;">
                    <img src="{LOGO_URL}" alt="Leme" width="48" height="48" style="display: inline-block; vertical-align: middle; margin-right: 12px;">
                    <span style="font-size: 28px; font-weight: bold; color: #112D4E; vertical-align: middle;">Leme</span>
                </div>
                
                <!-- Conteúdo -->
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
                    Há cerca de 30 dias você concluiu a análise financeira da <strong>{nome_empresa}</strong> no Leme.
                </p>
                
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    Nesse período, decisões foram tomadas, números mudaram e o negócio seguiu em movimento.
                </p>
                
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
                    Uma nova análise leva menos de <strong>5 minutos</strong> e permite comparar:
                </p>
                
                <ul style="color: #4a5568; font-size: 16px; line-height: 1.8; margin-bottom: 32px; padding-left: 20px;">
                    <li>Como evoluiu a saúde financeira do negócio</li>
                    <li>O que melhorou desde a última análise</li>
                    <li>Quais pontos ainda merecem atenção</li>
                    <li>Se o plano de ação segue coerente com a realidade atual</li>
                </ul>
                
                <!-- CTA -->
                <div style="text-align: center; margin-bottom: 32px;">
                    <a href="https://leme.app.br/analise" 
                       style="display: inline-block; background-color: #112D4E; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        Atualizar minha análise
                    </a>
                </div>
                
                <!-- Destaque -->
                <div style="background-color: #f0f7ff; border-left: 4px solid #112D4E; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                    <p style="color: #112D4E; font-size: 14px; margin: 0;">
                        <strong>Dica:</strong> Use o mesmo e-mail da análise anterior para acompanhar a evolução ao longo do tempo.
                    </p>
                </div>
                
                <p style="color: #718096; font-size: 14px; line-height: 1.6; text-align: center;">
                    Você pode repetir a análise sempre que quiser — o valor está na comparação ao longo do tempo.
                </p>
                
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 24px;">
                <p style="color: #a0aec0; font-size: 12px;">
                    Qualquer dúvida, é só responder este e-mail. — Equipe Leme
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

# =============================================================================
# FASE 6 — NOVAS FUNÇÕES
# Adicionar ao final do email_service.py existente
# =============================================================================


async def enviar_email_pos_analise_pro(
    nome_empresa: str,
    email: str,
    score: int,
    mes_referencia: int,
    ano_referencia: int,
    resumo_executivo: str,
    analise_id: str,
) -> bool:
    """
    E1 — Envia e-mail pós-análise Pro com o resumo executivo gerado pela IA.
    Disparado de forma assíncrona após salvar a análise no banco.
    O resumo_executivo já está salvo — nenhuma geração adicional de texto.
    """

    import calendar
    MESES_PT = {
        1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril",
        5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
        9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro",
    }
    mes_nome = MESES_PT.get(mes_referencia, str(mes_referencia))

    assunto = f"Sua análise de {mes_nome}/{ano_referencia} está pronta — Score {score}/100"

    link_dashboard = f"https://leme.app.br/dashboard/pro/{analise_id}"
    link_simulador = f"https://leme.app.br/dashboard/pro/{analise_id}?view=simulador"

    # Converte o resumo_executivo em linhas HTML
    linhas = [l.strip() for l in resumo_executivo.strip().split("\n") if l.strip()]
    resumo_html = "".join(
        f'<p style="color: #4a5568; font-size: 16px; line-height: 1.7; margin-bottom: 12px;">{linha}</p>'
        for linha in linhas
    )

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8F7F5;">

        <!-- Preheader invisível -->
        <div style="display: none; max-height: 0; overflow: hidden;">
            Veja o resumo da saúde financeira da {nome_empresa} este mês.
        </div>

        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

            <!-- Faixa de topo: gradiente azul → laranja → azul -->
            <div style="height: 4px; background: linear-gradient(to right, #003054, #E07B2A, #003054); border-radius: 4px 4px 0 0;"></div>

            <div style="background-color: #ffffff; border-radius: 0 0 12px 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

                <!-- Header com Logo -->
                <div style="text-align: center; margin-bottom: 32px;">
                    <img src="{LOGO_URL}" alt="Leme" width="40" height="40" style="display: inline-block; vertical-align: middle; margin-right: 10px;">
                    <span style="font-size: 24px; font-weight: bold; color: #003054; vertical-align: middle;">Leme</span>
                </div>

                <!-- Saudação -->
                <p style="color: #003054; font-size: 18px; font-weight: 600; margin-bottom: 8px;">
                    Olá, {nome_empresa}
                </p>

                <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                    Sua análise de <strong>{mes_nome}/{ano_referencia}</strong> está pronta. Aqui está o resumo:
                </p>

                <!-- Score destaque -->
                <div style="background-color: #F8F7F5; border-left: 4px solid #E07B2A; padding: 16px 20px; margin-bottom: 28px; border-radius: 0 8px 8px 0;">
                    <p style="color: #003054; font-size: 14px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Score de Saúde</p>
                    <p style="color: #E07B2A; font-size: 32px; font-weight: bold; margin: 0;">{score}<span style="font-size: 16px; color: #718096;">/100</span></p>
                </div>

                <!-- Resumo executivo (gerado pela IA) -->
                <div style="margin-bottom: 32px;">
                    {resumo_html}
                </div>

                <!-- CTA principal -->
                <div style="text-align: center; margin-bottom: 16px;">
                    <a href="{link_dashboard}"
                       style="display: inline-block; background-color: #003054; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        Ver análise completa →
                    </a>
                </div>

                <!-- CTA secundário -->
                <div style="text-align: center; margin-bottom: 32px;">
                    <a href="{link_simulador}"
                       style="color: #E07B2A; font-size: 14px; text-decoration: underline;">
                        Simular cenários para o próximo mês
                    </a>
                </div>

            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 24px;">
                <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                    Leme · <a href="https://leme.app.br" style="color: #a0aec0;">leme.app.br</a>
                </p>
                <p style="color: #a0aec0; font-size: 12px; margin-top: 4px;">
                    <a href="https://leme.app.br/cancelar-assinatura" style="color: #a0aec0;">Cancelar assinatura</a>
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


async def enviar_email_boas_vindas(
    nome_empresa: str,
    email: str,
    is_pro: bool = False,
) -> bool:
    """
    E2 — Envia e-mail de boas-vindas após cadastro.
    Versão Free ou Pro dependendo do status do usuário.
    Disparado de forma síncrona em /auth/register (é rápido, não bloqueia).
    """

    if is_pro:
        assunto = f"Bem-vindo ao Leme Pro, {nome_empresa}"
        corpo_texto = "Sua conta Pro está ativa. Faça sua primeira análise e receba o resumo direto no seu e-mail."
        destaque_titulo = "O que você tem:"
        destaque_itens = [
            "Score de saúde financeira (0–100)",
            "8 indicadores financeiros detalhados",
            "Resumo executivo gerado por IA",
            "Chat com consultor financeiro IA",
            "Histórico e comparativo de evolução",
            "Simulador de cenários",
        ]
        cta_texto = "Fazer minha primeira análise →"
        cta_cor = "#E07B2A"
    else:
        assunto = f"Bem-vindo ao Leme, {nome_empresa}"
        corpo_texto = "Sua conta está criada. Em menos de 3 minutos você tem o diagnóstico completo da sua empresa."
        destaque_titulo = "O que você vai receber:"
        destaque_itens = [
            "Score de saúde financeira (0–100)",
            "Simulador de sobrevivência",
            "Diagnóstico com pontos fortes e de atenção",
            "Plano de ação para os próximos 90 dias",
        ]
        cta_texto = "Fazer minha análise →"
        cta_cor = "#003054"

    itens_html = "".join(
        f'<li style="color: #4a5568; font-size: 15px; line-height: 1.9;">{item}</li>'
        for item in destaque_itens
    )

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8F7F5;">

        <!-- Preheader invisível -->
        <div style="display: none; max-height: 0; overflow: hidden;">
            {corpo_texto}
        </div>

        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

            <!-- Faixa de topo -->
            <div style="height: 4px; background: linear-gradient(to right, #003054, #E07B2A, #003054); border-radius: 4px 4px 0 0;"></div>

            <div style="background-color: #ffffff; border-radius: 0 0 12px 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

                <!-- Header -->
                <div style="text-align: center; margin-bottom: 32px;">
                    <img src="{LOGO_URL}" alt="Leme" width="40" height="40" style="display: inline-block; vertical-align: middle; margin-right: 10px;">
                    <span style="font-size: 24px; font-weight: bold; color: #003054; vertical-align: middle;">Leme</span>
                </div>

                <p style="color: #003054; font-size: 18px; font-weight: 600; margin-bottom: 8px;">
                    Olá, {nome_empresa}
                </p>

                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 28px;">
                    {corpo_texto}
                </p>

                <!-- Destaque do que o usuário vai receber -->
                <div style="background-color: #F8F7F5; border-radius: 8px; padding: 20px 24px; margin-bottom: 32px;">
                    <p style="color: #003054; font-size: 14px; font-weight: 600; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                        {destaque_titulo}
                    </p>
                    <ul style="margin: 0; padding-left: 20px;">
                        {itens_html}
                    </ul>
                </div>

                <!-- CTA -->
                <div style="text-align: center; margin-bottom: 16px;">
                    <a href="https://leme.app.br/analise"
                       style="display: inline-block; background-color: {cta_cor}; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        {cta_texto}
                    </a>
                </div>

            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 24px;">
                <p style="color: #a0aec0; font-size: 12px;">
                    Leme · <a href="https://leme.app.br" style="color: #a0aec0;">leme.app.br</a>
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


async def enviar_email_lembrete_mensal(
    nome_empresa: str,
    email: str,
    score_anterior: int,
    folego_anterior: int,
    dias_desde_analise: int,
    mes_ultima_analise: str,
) -> bool:
    """
    E3 — Lembrete mensal para usuários Pro que não fizeram análise em 28+ dias.
    Disparado pelo cron job diário em /api/v1/cron/lembrete-mensal.
    """

    assunto = f"Como está {nome_empresa} este mês?"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8F7F5;">

        <!-- Preheader invisível -->
        <div style="display: none; max-height: 0; overflow: hidden;">
            Atualize seus números e veja o que mudou desde {mes_ultima_analise}.
        </div>

        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

            <!-- Faixa de topo -->
            <div style="height: 4px; background: linear-gradient(to right, #003054, #E07B2A, #003054); border-radius: 4px 4px 0 0;"></div>

            <div style="background-color: #ffffff; border-radius: 0 0 12px 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

                <!-- Header -->
                <div style="text-align: center; margin-bottom: 32px;">
                    <img src="{LOGO_URL}" alt="Leme" width="40" height="40" style="display: inline-block; vertical-align: middle; margin-right: 10px;">
                    <span style="font-size: 24px; font-weight: bold; color: #003054; vertical-align: middle;">Leme</span>
                </div>

                <p style="color: #003054; font-size: 18px; font-weight: 600; margin-bottom: 8px;">
                    Olá, {nome_empresa}
                </p>

                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    Já faz <strong>{dias_desde_analise} dias</strong> desde sua última análise.
                    Atualizar os números leva menos de 3 minutos e você recebe o novo plano de ação direto aqui.
                </p>

                <!-- Destaque da última análise -->
                <div style="background-color: #F8F7F5; border-left: 4px solid #003054; padding: 16px 20px; margin-bottom: 32px; border-radius: 0 8px 8px 0;">
                    <p style="color: #003054; font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                        Na última análise ({mes_ultima_analise})
                    </p>
                    <p style="color: #4a5568; font-size: 15px; margin: 0;">
                        Score <strong style="color: #003054;">{score_anterior}/100</strong>
                        &nbsp;·&nbsp;
                        Fôlego de <strong style="color: #003054;">{folego_anterior} dias</strong>
                        &nbsp;— o que mudou?
                    </p>
                </div>

                <!-- CTA -->
                <div style="text-align: center; margin-bottom: 16px;">
                    <a href="https://leme.app.br/analise"
                       style="display: inline-block; background-color: #003054; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        Atualizar minha análise →
                    </a>
                </div>

            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 24px;">
                <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                    Leme · <a href="https://leme.app.br" style="color: #a0aec0;">leme.app.br</a>
                </p>
                <p style="color: #a0aec0; font-size: 12px; margin-top: 4px;">
                    <a href="https://leme.app.br/cancelar-assinatura" style="color: #a0aec0;">Cancelar assinatura</a>
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