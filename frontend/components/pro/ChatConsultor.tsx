'use client';

// components/pro/ChatConsultor.tsx
// Fase 5 — Botão flutuante + painel lateral slide-in do ChatConsultor Pro.
// Renderizado diretamente na page.tsx do dashboard Pro, fora de qualquer view.
// Histórico persiste na sessão via useState — não salvo no banco.
// Contexto da análise injetado automaticamente pelo backend.

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X, Send } from 'lucide-react';
import { enviarMensagemChat, MensagemHistorico } from '@/lib/api';

interface ChatConsultorProps {
  analiseId: string;
}

export default function ChatConsultor({ analiseId }: ChatConsultorProps) {
  const [aberto, setAberto] = useState(false);
  const [historico, setHistorico] = useState<MensagemHistorico[]>([]);
  const [input, setInput] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [jaAbriu, setJaAbriu] = useState(false); // controla badge de notificação
  const [mounted, setMounted] = useState(false);

  const mensagensRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Necessário para createPortal funcionar no Next.js (SSR)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll automático para a última mensagem
  useEffect(() => {
    if (mensagensRef.current) {
      mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight;
    }
  }, [historico, carregando]);

  // Foca no input ao abrir o painel
  useEffect(() => {
    if (aberto && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [aberto]);

  // Ao abrir pela primeira vez: buscar mensagem de abertura contextualizada
  async function abrirChat() {
    setAberto(true);
    setJaAbriu(true);

    if (historico.length === 0) {
      setCarregando(true);
      try {
        const abertura = await enviarMensagemChat(analiseId, '', []);
        setHistorico([{ role: 'assistant', content: abertura }]);
      } catch {
        setHistorico([{
          role: 'assistant',
          content: 'Olá! Estou aqui para ajudar com sua análise financeira. O que você quer explorar?',
        }]);
      } finally {
        setCarregando(false);
      }
    }
  }

  async function enviarMensagem() {
    const texto = input.trim();
    if (!texto || carregando) return;

    // Adicionar mensagem do usuário imediatamente
    const novasMensagens: MensagemHistorico[] = [
      ...historico,
      { role: 'user', content: texto },
    ];
    setHistorico(novasMensagens);
    setInput('');
    setCarregando(true);

    try {
      // Enviar histórico completo — backend não armazena estado
      const resposta = await enviarMensagemChat(analiseId, texto, novasMensagens);
      setHistorico([...novasMensagens, { role: 'assistant', content: resposta }]);
    } catch {
      setHistorico([
        ...novasMensagens,
        {
          role: 'assistant',
          content: 'Desculpe, tive um problema para responder agora. Tente novamente em instantes.',
        },
      ]);
    } finally {
      setCarregando(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sem Shift envia; Shift+Enter quebra linha
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  }

  if (!mounted) return null;

  const conteudo = (
    <>
      <style>{`
        .chat-overlay {
          position: fixed;
          inset: 0;
          z-index: 49;
          background: rgba(0, 0, 0, 0.25);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }
        .chat-overlay.aberto {
          opacity: 1;
          pointer-events: auto;
        }
        .chat-painel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 420px;
          max-width: 100vw;
          z-index: 50;
          background: #fff;
          box-shadow: -4px 0 32px rgba(0,0,0,0.12);
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: 'DM Sans', sans-serif;
        }
        .chat-painel.aberto {
          transform: translateX(0);
        }
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(0, 48, 84, 0.10);
          background: #fff;
          flex-shrink: 0;
        }
        .chat-header-titulo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 700;
          color: #003054;
        }
        .chat-header-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4ECBA4;
        }
        .chat-fechar {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          transition: background 0.15s;
        }
        .chat-fechar:hover {
          background: rgba(0, 48, 84, 0.06);
          color: #003054;
        }
        .chat-mensagens {
          flex: 1;
          overflow-y: auto;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          scroll-behavior: smooth;
        }
        .chat-mensagem {
          max-width: 85%;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.55;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .chat-mensagem.assistente {
          background: rgba(0, 48, 84, 0.05);
          color: #1f2937;
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }
        .chat-mensagem.usuario {
          background: #003054;
          color: #fff;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }
        .chat-digitando {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 10px 14px;
          background: rgba(0, 48, 84, 0.05);
          border-radius: 12px;
          border-bottom-left-radius: 4px;
          align-self: flex-start;
        }
        .chat-digitando span {
          width: 7px;
          height: 7px;
          background: #003054;
          border-radius: 50%;
          opacity: 0.4;
          animation: digitando 1.2s infinite;
        }
        .chat-digitando span:nth-child(2) { animation-delay: 0.2s; }
        .chat-digitando span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes digitando {
          0%, 80%, 100% { opacity: 0.4; transform: scale(1); }
          40% { opacity: 1; transform: scale(1.2); }
        }
        .chat-input-area {
          padding: 12px 16px;
          border-top: 1px solid rgba(0, 48, 84, 0.10);
          background: #fff;
          flex-shrink: 0;
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }
        .chat-textarea {
          flex: 1;
          resize: none;
          border: 1.5px solid rgba(0, 48, 84, 0.18);
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #1f2937;
          background: #fafafa;
          outline: none;
          max-height: 120px;
          min-height: 42px;
          line-height: 1.5;
          transition: border-color 0.15s;
        }
        .chat-textarea:focus {
          border-color: #003054;
          background: #fff;
        }
        .chat-textarea::placeholder { color: #9ca3af; }
        .chat-enviar {
          background: #003054;
          color: #fff;
          border: none;
          border-radius: 10px;
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s, opacity 0.15s;
        }
        .chat-enviar:hover:not(:disabled) { background: #004a7c; }
        .chat-enviar:disabled { opacity: 0.45; cursor: not-allowed; }
        .chat-botao-flutuante {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 48;
          width: 56px;
          height: 56px;
          background: #003054;
          color: #fff;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 48, 84, 0.35);
          transition: background 0.15s, transform 0.15s;
        }
        .chat-botao-flutuante:hover { background: #004a7c; transform: scale(1.06); }
        .chat-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          background: #4ECBA4;
          border-radius: 50%;
          border: 2px solid #fff;
        }
        @media (max-width: 640px) {
          .chat-painel { width: 100vw; }
        }
      `}</style>

      {/* Overlay escurecido — clique fecha o painel */}
      <div
        className={`chat-overlay ${aberto ? 'aberto' : ''}`}
        onClick={() => setAberto(false)}
      />

      {/* Painel lateral */}
      <div className={`chat-painel ${aberto ? 'aberto' : ''}`}>
        <div className="chat-header">
          <div className="chat-header-titulo">
            <div className="chat-header-dot" />
            Consultor Leme
          </div>
          <button className="chat-fechar" onClick={() => setAberto(false)} aria-label="Fechar chat">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="chat-mensagens" ref={mensagensRef}>
          {historico.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-mensagem ${msg.role === 'assistant' ? 'assistente' : 'usuario'}`}
            >
              {msg.content}
            </div>
          ))}

          {/* Indicador de digitação */}
          {carregando && (
            <div className="chat-digitando">
              <span /><span /><span />
            </div>
          )}
        </div>

        <div className="chat-input-area">
          <textarea
            ref={inputRef}
            className="chat-textarea"
            placeholder="Digite sua pergunta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={carregando}
            rows={1}
          />
          <button
            className="chat-enviar"
            onClick={enviarMensagem}
            disabled={carregando || !input.trim()}
            aria-label="Enviar mensagem"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Botão flutuante — só visível quando painel fechado */}
      {!aberto && (
        <button
          className="chat-botao-flutuante"
          onClick={abrirChat}
          aria-label="Abrir consultor financeiro"
        >
          <MessageCircle className="w-6 h-6" />
          {/* Badge verde na primeira vez que ainda não abriu */}
          {!jaAbriu && <div className="chat-badge" />}
        </button>
      )}
    </>
  );

  // createPortal garante que o painel não seja cortado por overflow do container pai
  return createPortal(conteudo, document.body);
}
