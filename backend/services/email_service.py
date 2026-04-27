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
                <div style="text-align: center; margin-bottom: 32px;">
                    <img src="{LOGO_URL}" alt="Leme" width="48" height="48" style="display: inline-block; vertical-align: middle; margin-right: 12px;">
                    <span style="font-size: 28px; font-weight: bold; color: #112D4E; vertical-align: middle;">Leme</span>
                </div>
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
                <div style="text-align: center; margin-bottom: 32px;">
                    <a href="{link_continuar}" style="display: inline-block; background-color: #112D4E; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        Continuar minha análise
                    </a>
                </div>
            </div>
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
                <div style="text-align: center; margin-bottom: 32px;">
                    <img src="{LOGO_URL}" alt="Leme" width="48" height="48" style="display: inline-block; vertical-align: middle; margin-right: 12px;">
                    <span style="font-size: 28px; font-weight: bold; color: #112D4E; vertical-align: middle;">Leme</span>
                </div>
                <h2 style="color: #112D4E; font-size: 20px; margin-bottom: 16px;">
                    Sobre a análise financeira da {nome_empresa}
                </h2>
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
                    Você iniciou a análise, mas ela não foi concluída.
                </p>
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    Entendo que o dia a dia de empreendedor é corrido. Mas conhecer a saúde financeira do seu negócio é o primeiro passo pra tomar decisões melhores.
                </p>
                <div style="background-color: #f0f7ff; border-left: 4px solid #112D4E; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                    <p style="color: #112D4E; font-size: 16px; margin: 0;">
                        Empresas que monitoram seus indicadores financeiros têm 30% mais chance de crescer no ano seguinte.
                    </p>
                </div>
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                    A análise leva menos de <strong>5 minutos</strong> e pode ser concluída agora mesmo, inclusive pelo celular.
                </p>
                <div style="text-align: center; margin-bottom: 32px;">
                    <a href="{link_continuar}" style="display: inline-block; background-color: #F5793B; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        Finalizar minha análise
                    </a>
                </div>
                <p style="color: #718096; font-size: 14px; line-height: 1.6; text-align: center;">
                    Se não fizer sentido agora, sem problemas.<br>
                    Quando quiser, é só retomar de onde parou.
                </p>
            </div>
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
    """

    assunto = "Sua análise financeira em 1 nota"
    aid_encoded = quote(str(analise_id))

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
        <div style="display: none; max-height: 0; overflow: hidden;">
            Leva menos de 30 segundos e ajuda a melhorar o Leme.
        </div>
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 32px;">
                    <img src="{LOGO_URL}" alt="Leme" width="48" height="48" style="display: inline-block; vertical-align: middle; margin-right: 12px;">
                    <span style="font-size: 28px; font-weight: bold; color: #112D4E; vertical-align: middle;">Leme</span>
                </div>
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
                    Obrigado por concluir a análise financeira da <strong>{nome_empresa}</strong>.
                </p>
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    Antes de seguir, queria ouvir você — leva menos de 30 segundos e ajuda bastante a melhorar o Leme.
                </p>
                <p style="color: #112D4E; font-size: 16px; line-height: 1.6; margin-bottom: 16px; font-weight: 600;">
                    O quanto essa análise te ajudou a entender a situação financeira do seu negócio?
                </p>
                <p style="color: #718096; font-size: 14px; margin-bottom: 20px;">
                    1 = não ajudou &nbsp;&nbsp;|&nbsp;&nbsp; 5 = ajudou muito
                </p>
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
        <div style="display: none; max-height: 0; overflow: hidden;">
            Uma nova análise leva menos de 5 minutos e permite comparar a evolução.
        </div>
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 32px;">
                    <img src="{LOGO_URL}" alt="Leme" width="48" height="48" style="display: inline-block; vertical-align: middle; margin-right: 12px;">
                    <span style="font-size: 28px; font-weight: bold; color: #112D4E; vertical-align: middle;">Leme</span>
                </div>
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
                <div style="text-align: center; margin-bottom: 32px;">
                    <a href="https://leme.app.br/analise" style="display: inline-block; background-color: #112D4E; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        Atualizar minha análise
                    </a>
                </div>
                <div style="background-color: #f0f7ff; border-left: 4px solid #112D4E; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                    <p style="color: #112D4E; font-size: 14px; margin: 0;">
                        <strong>Dica:</strong> Use o mesmo e-mail da análise anterior para acompanhar a evolução ao longo do tempo.
                    </p>
                </div>
                <p style="color: #718096; font-size: 14px; line-height: 1.6; text-align: center;">
                    Você pode repetir a análise sempre que quiser — o valor está na comparação ao longo do tempo.
                </p>
            </div>
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
        <div style="display: none; max-height: 0; overflow: hidden;">
            Veja o resumo da saúde financeira da {nome_empresa} este mês.
        </div>
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="height: 4px; background: linear-gradient(to right, #003054, #E07B2A, #003054); border-radius: 4px 4px 0 0;"></div>
            <div style="background-color: #ffffff; border-radius: 0 0 12px 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 32px;">
                    <img src="{LOGO_URL}" alt="Leme" width="40" height="40" style="display: inline-block; vertical-align: middle; margin-right: 10px;">
                    <span style="font-size: 24px; font-weight: bold; color: #003054; vertical-align: middle;">Leme</span>
                </div>
                <p style="color: #003054; font-size: 18px; font-weight: 600; margin-bottom: 8px;">
                    Olá, {nome_empresa}
                </p>
                <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                    Sua análise de <strong>{mes_nome}/{ano_referencia}</strong> está pronta. Aqui está o resumo:
                </p>
                <div style="background-color: #F8F7F5; border-left: 4px solid #E07B2A; padding: 16px 20px; margin-bottom: 28px; border-radius: 0 8px 8px 0;">
                    <p style="color: #003054; font-size: 14px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Score de Saúde</p>
                    <p style="color: #E07B2A; font-size: 32px; font-weight: bold; margin: 0;">{score}<span style="font-size: 16px; color: #718096;">/100</span></p>
                </div>
                <div style="margin-bottom: 32px;">
                    {resumo_html}
                </div>
                <div style="text-align: center; margin-bottom: 16px;">
                    <a href="{link_dashboard}" style="display: inline-block; background-color: #003054; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        Ver análise completa →
                    </a>
                </div>
                <div style="text-align: center; margin-bottom: 32px;">
                    <a href="{link_simulador}" style="color: #E07B2A; font-size: 14px; text-decoration: underline;">
                        Simular cenários para o próximo mês
                    </a>
                </div>
            </div>
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
        <div style="display: none; max-height: 0; overflow: hidden;">
            {corpo_texto}
        </div>
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="height: 4px; background: linear-gradient(to right, #003054, #E07B2A, #003054); border-radius: 4px 4px 0 0;"></div>
            <div style="background-color: #ffffff; border-radius: 0 0 12px 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
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
                <div style="background-color: #F8F7F5; border-radius: 8px; padding: 20px 24px; margin-bottom: 32px;">
                    <p style="color: #003054; font-size: 14px; font-weight: 600; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                        {destaque_titulo}
                    </p>
                    <ul style="margin: 0; padding-left: 20px;">
                        {itens_html}
                    </ul>
                </div>
                <div style="text-align: center; margin-bottom: 16px;">
                    <a href="https://leme.app.br/analise" style="display: inline-block; background-color: {cta_cor}; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        {cta_texto}
                    </a>
                </div>
            </div>
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
    E3 — Lembrete mensal para usuários Pro no aniversário mensal da 1ª análise.
    Disparado pelo cron job diário em /api/v1/cron/lembrete-mensal.
    Paleta da ID Visual oficial: #112d4e, #f5793b, #f4f4f4.
    """

    assunto = f"Como está {nome_empresa} este mês?"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
        <div style="display: none; max-height: 0; overflow: hidden;">
            Atualize seus números e veja o que mudou desde {mes_ultima_analise}.
        </div>
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="height: 4px; background: linear-gradient(to right, #112d4e, #f5793b, #112d4e); border-radius: 4px 4px 0 0;"></div>
            <div style="background-color: #ffffff; border-radius: 0 0 12px 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 32px;">
                    <img src="{LOGO_URL}" alt="Leme" width="40" height="40" style="display: inline-block; vertical-align: middle; margin-right: 10px;">
                    <span style="font-size: 24px; font-weight: bold; color: #112d4e; vertical-align: middle;">Leme</span>
                </div>
                <p style="color: #112d4e; font-size: 18px; font-weight: 600; margin-bottom: 8px;">
                    Olá, {nome_empresa}
                </p>
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    Já faz <strong>{dias_desde_analise} dias</strong> desde sua última análise.
                    Atualizar os números leva menos de 3 minutos e você recebe o novo plano de ação direto aqui.
                </p>
                <div style="background-color: #f4f4f4; border-left: 4px solid #112d4e; padding: 16px 20px; margin-bottom: 32px; border-radius: 0 8px 8px 0;">
                    <p style="color: #112d4e; font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                        Na última análise ({mes_ultima_analise})
                    </p>
                    <p style="color: #4a5568; font-size: 15px; margin: 0;">
                        Score <strong style="color: #112d4e;">{score_anterior}/100</strong>
                        &nbsp;·&nbsp;
                        Fôlego de <strong style="color: #112d4e;">{folego_anterior} dias</strong>
                        &nbsp;— o que mudou?
                    </p>
                </div>
                <div style="text-align: center; margin-bottom: 16px;">
                    <a href="https://leme.app.br/analise" style="display: inline-block; background-color: #f5793b; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                        Atualizar minha análise →
                    </a>
                </div>
            </div>
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


# =============================================================================
# FRENTE B — Boas-vindas Pro (disparado via webhook do Stripe)
# =============================================================================


async def enviar_email_boas_vindas_pro(
    nome_empresa: str,
    email: str,
) -> bool:
    """
    Email de Boas-vindas Pro — disparado uma única vez quando o cliente
    confirma o pagamento e o webhook do Stripe ativa o pro_ativo.

    Tom: humano, pessoal, direto. É um email DO Bernardo, não da empresa.
    Reforça que o cliente pode falar diretamente com o fundador.

    Paleta da ID Visual oficial:
      Azul Petróleo: #112d4e
      Laranja:       #f5793b
      Cinza Claro:   #f4f4f4
      Azul Médio:    #21609e (tags de seção)
    """

    assunto = f"Bem-vindo ao Leme Pro, {nome_empresa}"
    link_dashboard = "https://leme.app.br/dashboard"

    html_content = f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt-BR">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Bem-vindo ao Leme Pro</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
    body, table, td, a {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
    table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
    img {{ -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }}
    body {{ margin: 0 !important; padding: 0 !important; width: 100% !important; }}
    @media screen and (max-width: 600px) {{
      .container {{ width: 100% !important; }}
      .px-mobile {{ padding-left: 24px !important; padding-right: 24px !important; }}
      .h1-mobile {{ font-size: 24px !important; line-height: 30px !important; }}
      .cta-mobile {{ width: 100% !important; box-sizing: border-box !important; }}
    }}
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Montserrat', Helvetica, Arial, sans-serif;">

  <div style="display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #f4f4f4;">
    Obrigado por assinar o Leme Pro. Estou à disposição pra o que precisar. — Bernardo
  </div>

  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <table role="presentation" class="container" width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">

          <tr>
            <td style="background-color: #112d4e; padding: 36px 40px;" class="px-mobile">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="middle">
                    <span style="color: #ffffff; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Leme</span>
                  </td>
                  <td valign="middle" align="right">
                    <span style="display: inline-block; background-color: #f5793b; color: #ffffff; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 6px 14px; border-radius: 4px;">Pro</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 48px 40px 16px 40px;" class="px-mobile">

              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="background-color: #21609e; width: 3px; line-height: 0; font-size: 0;">&nbsp;</td>
                  <td style="padding-left: 10px; color: #21609e; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">
                    Bem-vindo
                  </td>
                </tr>
              </table>

              <h1 class="h1-mobile" style="margin: 0 0 20px 0; color: #112d4e; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 28px; line-height: 36px; font-weight: 700;">
                Olá, empresário(a).
              </h1>

              <p style="margin: 0 0 24px 0; color: #1a1a1a; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 26px; font-weight: 400;">
                Vemos que o primeiro passo para a evolução da <strong style="color: #112d4e;">{nome_empresa}</strong> já foi dado. Muito obrigado pela confiança no Leme Pro.
              </p>

              <p style="margin: 0 0 32px 0; color: #1a1a1a; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 26px;">
                Criei o Leme justamente pra que empresários como você tenham acesso ao tipo de análise financeira que antes custava caro e vinha embrulhada em linguagem difícil. Espero que faça diferença no seu dia a dia.
              </p>

              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="border-top: 1px solid #e5e7eb; line-height: 0; font-size: 0;">&nbsp;</td>
                </tr>
              </table>

              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #21609e; width: 3px; line-height: 0; font-size: 0;">&nbsp;</td>
                  <td style="padding-left: 10px; color: #21609e; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">
                    O que você tem agora
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 40px;">
                <tr>
                  <td style="padding-bottom: 18px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td valign="top" style="width: 28px; padding-top: 8px;">
                          <span style="display: inline-block; width: 8px; height: 8px; background-color: #f5793b; border-radius: 50%;"></span>
                        </td>
                        <td style="color: #1a1a1a; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px;">
                          <strong style="color: #112d4e; font-weight: 700;">Dashboard completo</strong> com todos os indicadores, simulador de cenários e histórico de score.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 18px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td valign="top" style="width: 28px; padding-top: 8px;">
                          <span style="display: inline-block; width: 8px; height: 8px; background-color: #f5793b; border-radius: 50%;"></span>
                        </td>
                        <td style="color: #1a1a1a; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px;">
                          <strong style="color: #112d4e; font-weight: 700;">Resumo executivo</strong> gerado por IA a cada análise, com comparativo setorial.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 18px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td valign="top" style="width: 28px; padding-top: 8px;">
                          <span style="display: inline-block; width: 8px; height: 8px; background-color: #f5793b; border-radius: 50%;"></span>
                        </td>
                        <td style="color: #1a1a1a; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px;">
                          <strong style="color: #112d4e; font-weight: 700;">Plano de ação</strong> prático pra já começar hoje, com passos claros pra colocar em prática.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td valign="top" style="width: 28px; padding-top: 8px;">
                          <span style="display: inline-block; width: 8px; height: 8px; background-color: #f5793b; border-radius: 50%;"></span>
                        </td>
                        <td style="color: #1a1a1a; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px;">
                          <strong style="color: #112d4e; font-weight: 700;">ChatConsultor</strong> disponível 24h pra tirar qualquer dúvida sobre os números da sua empresa.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 40px;">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{link_dashboard}" style="height:54px;v-text-anchor:middle;width:280px;" arcsize="12%" stroke="f" fillcolor="#f5793b">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">Ir para o dashboard</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-- -->
                    <a href="{link_dashboard}" class="cta-mobile" style="display: inline-block; background-color: #f5793b; color: #ffffff; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 700; line-height: 54px; text-align: center; text-decoration: none; padding: 0 42px; border-radius: 6px; -webkit-text-size-adjust: none;">
                      Ir para o dashboard
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="border-top: 1px solid #e5e7eb; line-height: 0; font-size: 0;">&nbsp;</td>
                </tr>
              </table>

              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="background-color: #21609e; width: 3px; line-height: 0; font-size: 0;">&nbsp;</td>
                  <td style="padding-left: 10px; color: #21609e; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">
                    Estou à sua disposição
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; color: #1a1a1a; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px;">
                Como o Leme é feito por mim, você pode me chamar direto. Se tiver dúvida sobre um indicador, quiser entender melhor um resultado, ou só dar um feedback — me escreve. Eu respondo pessoalmente.
              </p>

              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; border-radius: 8px;">
                <tr>
                  <td style="padding: 22px 24px;">
                    <p style="margin: 0 0 6px 0; color: #5a6b7d; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 11px; line-height: 18px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
                      E-mail
                    </p>
                    <p style="margin: 0 0 18px 0; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 22px;">
                      <a href="mailto:bernardo@leme.app.br" style="color: #112d4e; text-decoration: none; font-weight: 700;">bernardo@leme.app.br</a>
                    </p>
                    <p style="margin: 0 0 6px 0; color: #5a6b7d; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 11px; line-height: 18px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
                      WhatsApp
                    </p>
                    <p style="margin: 0; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 22px;">
                      <a href="https://wa.me/5521975191866" style="color: #112d4e; text-decoration: none; font-weight: 700;">+55 (21) 97519-1866</a>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 40px 0 0 0; color: #1a1a1a; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px;">
                Obrigado de novo, e bons números.
              </p>
              <p style="margin: 16px 0 0 0; color: #112d4e; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 22px; font-weight: 700;">
                Bernardo
              </p>
              <p style="margin: 2px 0 0 0; color: #5a6b7d; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 13px; line-height: 20px;">
                Fundador do Leme
              </p>

            </td>
          </tr>

          <tr>
            <td style="background-color: #f4f4f4; padding: 24px 40px; border-top: 1px solid #e5e7eb;" class="px-mobile">
              <p style="margin: 0 0 8px 0; color: #5a6b7d; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 12px; line-height: 18px; text-align: center;">
                <a href="https://leme.app.br" style="color: #5a6b7d; text-decoration: none; font-weight: 600;">leme.app.br</a>
                &nbsp;·&nbsp;
                Análise financeira inteligente para pequenas empresas
              </p>
              <p style="margin: 0; color: #9ca3af; font-family: 'Montserrat', Helvetica, Arial, sans-serif; font-size: 11px; line-height: 16px; text-align: center;">
                Você está recebendo este e-mail porque assinou o Leme Pro.
                <br />
                <a href="https://leme.app.br/cancelar-assinatura" style="color: #9ca3af; text-decoration: underline;">Gerenciar assinatura</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
"""

    return await enviar_email(
        para_email=email,
        para_nome=nome_empresa,
        assunto=assunto,
        html_content=html_content,
    )