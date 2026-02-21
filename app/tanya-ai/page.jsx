'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles, StopCircle } from 'lucide-react';
import MainNavigation from '../Components/MainNavigation';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_QUESTIONS = [
  'Apa keutamaan shalat Tahajud?',
  'Bacaan doa setelah shalat fardhu?',
  'Bagaimana cara mempersingkat shalat saat perjalanan mudik?',
  'Apa amalan terbaik di bulan Ramadhan?',
];

function ChatBubble({ role, content, isStreaming }) {
  const isUser = role === 'user';
  return (
    <div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}
    >
      {!isUser && (
        <div className='w-8 h-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#5b2d8b] flex items-center justify-center flex-shrink-0 shadow'>
          <Sparkles size={14} className='text-white' />
        </div>
      )}
      <div
        className={`
          max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${
            isUser
              ? 'bg-[var(--color-royal)] text-white rounded-br-sm'
              : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
          }
        `}
      >
        {isUser ? (
          <span className='whitespace-pre-wrap'>{content}</span>
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className='mb-2 last:mb-0'>{children}</p>,
              ul: ({ children }) => (
                <ul className='list-disc pl-4 mb-2 space-y-1'>{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className='list-decimal pl-4 mb-2 space-y-1'>{children}</ol>
              ),
              li: ({ children }) => (
                <li className='leading-relaxed'>{children}</li>
              ),
              strong: ({ children }) => (
                <strong className='font-semibold'>{children}</strong>
              ),
              em: ({ children }) => <em className='italic'>{children}</em>,
              hr: () => <hr className='my-2 border-purple-100' />,
              blockquote: ({ children }) => (
                <blockquote className='border-l-2 border-purple-300 pl-3 italic text-gray-600 my-2'>
                  {children}
                </blockquote>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        )}
        {isStreaming && (
          <span className='inline-block ml-1 w-1.5 h-4 bg-purple-400 rounded-sm animate-pulse align-middle' />
        )}
      </div>
    </div>
  );
}

export default function TanyaAIPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto resize textarea
  const handleInput = e => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  // Voice input
  const toggleVoice = () => {
    if (
      !('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    ) {
      setError('Browser kamu tidak mendukung input suara.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      setError('Gagal menangkap suara. Coba lagi.');
    };
    recognition.onresult = e => {
      const transcript = e.results[0][0].transcript;
      setInput(prev => (prev ? prev + ' ' + transcript : transcript));
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height =
          Math.min(textareaRef.current.scrollHeight, 120) + 'px';
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const sendMessage = async text => {
    const trimmed = (text || input).trim();
    if (!trimmed || isLoading) return;

    setError(null);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const newMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setIsLoading(true);

    // Add empty AI message placeholder
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: '', isStreaming: true },
    ]);

    // Strip UI-only fields (isStreaming) before sending to API
    const cleanMessages = newMessages.map(({ role, content }) => ({
      role,
      content,
    }));

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: cleanMessages }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || `Server error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        // Update the last message with streamed content
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: accumulated,
            isStreaming: true,
          };
          return updated;
        });
      }

      // Mark streaming done
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: accumulated,
          isStreaming: false,
        };
        return updated;
      });
    } catch (err) {
      console.error(err);
      setError(
        'Terjadi kesalahan. Pastikan GROQ_API_KEY sudah diisi di .env dan coba lagi.'
      );
      // Remove the empty AI message
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className='flex flex-col min-h-screen bg-zinc-50'>
      {/* Page Header */}
      <div className=' w-full bg-white border-b border-gray-100 shadow-sm'>
        <div className='max-w-3xl mx-auto px-4 py-3 flex items-center gap-3'>
          <div className='w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#5b2d8b] flex items-center justify-center shadow'>
            <Sparkles size={18} className='text-white' />
          </div>
          <div>
            <h1 className='text-base font-bold text-gray-900'>Tanya AI</h1>
            <p className='text-xs text-gray-500'>Ushalli AI · Didukung Groq</p>
          </div>
          <div className='ml-auto flex items-center gap-1.5'>
            <span className='w-2 h-2 rounded-full bg-green-400 animate-pulse' />
            <span className='text-xs text-green-600 font-medium'>Online</span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <main className='flex-1 w-full max-w-3xl mx-auto px-4 pt-4 pb-52 flex flex-col gap-4'>
        {/* Empty state */}
        {messages.length === 0 && (
          <div className='flex flex-col items-center justify-center pt-10 gap-6'>
            <div className='w-20 h-20 rounded-3xl bg-gradient-to-br from-[#7c3aed] to-[#5b2d8b] flex items-center justify-center shadow-xl shadow-purple-200'>
              <Sparkles size={36} className='text-white' />
            </div>
            <div className='text-center'>
              <h2 className='text-lg font-bold text-gray-800'>
                Assalamu'alaikum!
              </h2>
              <p className='text-sm text-gray-500 mt-1 max-w-xs'>
                Tanyakan apa saja seputar Islam kepada saya. Saya siap membantu!
                🤲
              </p>
            </div>

            {/* Suggested questions */}
            <div className='w-full grid grid-cols-1 gap-2'>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className='text-left px-4 py-3 bg-white rounded-xl border border-purple-100 text-sm text-gray-700 hover:border-purple-400 hover:bg-purple-50 transition-all duration-150 shadow-sm'
                >
                  💬 {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            role={msg.role}
            content={msg.content}
            isStreaming={msg.isStreaming}
          />
        ))}

        {/* Error */}
        {error && (
          <div className='text-xs text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-100 text-center'>
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input bar — fixed above MainNavigation */}
      <div className='fixed bottom-[76px] left-0 right-0 z-50 px-4 pb-2'>
        <div className='max-w-3xl mx-auto'>
          <div className='bg-white rounded-2xl shadow-lg border border-gray-200 flex items-end gap-2 px-3 py-2'>
            {/* Voice button */}
            <button
              onClick={toggleVoice}
              className={`
                flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
                ${
                  isListening
                    ? 'bg-red-500 text-white shadow shadow-red-200 animate-pulse'
                    : 'text-purple-500 hover:bg-purple-50'
                }
              `}
              aria-label={isListening ? 'Stop recording' : 'Voice input'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening ? '🎙️ Mendengarkan...' : 'Tanyakan sesuatu...'
              }
              disabled={isLoading}
              className='flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none py-1.5 max-h-[120px] leading-relaxed'
            />

            {/* Send button */}
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className={`
                flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
                ${
                  input.trim() && !isLoading
                    ? 'bg-[var(--color-royal)] text-white shadow shadow-purple-200 hover:bg-[var(--color-royal-hover)] hover:scale-105'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
              aria-label='Kirim pesan'
            >
              {isLoading ? (
                <StopCircle size={18} className='animate-spin' />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
          {isListening && (
            <p className='text-center text-xs text-red-500 mt-1 animate-pulse'>
              🔴 Sedang merekam... klik mic untuk berhenti
            </p>
          )}
        </div>
      </div>

      <MainNavigation />
    </div>
  );
}
