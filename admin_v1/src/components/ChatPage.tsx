import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, CreditCard, Loader2, Package, CheckCircle, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { ChatChart } from './chat/ChatChart';
import { OrderApprovalCard } from './chat/OrderApprovalCard';
import { ProductFormCard } from './chat/ProductFormCard';
import { Message } from '../types/chat';
import { chatService } from '../services/api';

interface ChatPageProps {
  isDark: boolean;
}

export function ChatPage({ isDark }: ChatPageProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, [messages, isTyping]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const addAiMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), text, sender: 'ai', timestamp: new Date() }]);
  };

  const sendUserMessage = async () => {
    const content = inputValue.trim();
    if (!content || isTyping) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), text: content, sender: 'user', timestamp: new Date() }]);
    setInputValue('');
    setIsTyping(true);

    try {
      const chatHistory = messages
        .filter((message) => !message.type || message.type === 'chat')
        .slice(-20)
        .map((message) => ({ role: message.sender === 'user' ? 'user' : 'assistant', content: message.text } as const));

      const data = await chatService.sendMessage(content, 'admin', chatHistory);

      if (data.action === 'show_order_approval') {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), text: data.answer || 'Kiem tra danh sach don hang ben duoi.', sender: 'ai', timestamp: new Date() },
          { id: crypto.randomUUID(), text: '', sender: 'ai', timestamp: new Date(), type: 'order_approval', orderApprovalData: data.orders },
        ]);
      } else if (data.action === 'show_product_form') {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), text: data.answer || 'Day la form san pham de ban bo sung thong tin nuoc hoa chi tiet.', sender: 'ai', timestamp: new Date() },
          { id: crypto.randomUUID(), text: '', sender: 'ai', timestamp: new Date(), type: 'product_form', formPrefill: data.prefill },
        ]);
      } else if (data.action === 'draw_chart') {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), text: data.answer || 'Duoi day la bieu do thong ke.', sender: 'ai', timestamp: new Date() },
          {
            id: crypto.randomUUID(),
            text: '',
            sender: 'ai',
            timestamp: new Date(),
            type: 'chart',
            chartData: {
              title: data.title || '',
              type: (data.type as any) || 'line',
              data: data.data || [],
              xAxisKey: data.xAxisKey || '',
              dataKeys: data.dataKeys || [],
            },
          },
        ]);
      } else if (data.action === 'navigate' && data.payload?.path) {
        addAiMessage(data.message || `Dang chuyen huong den ${data.payload.path}...`);
        setTimeout(() => navigate(data.payload!.path), 900);
      } else if (data.success) {
        addAiMessage(data.answer || data.message || `Da thuc thi ${data.action} thanh cong.`);
      } else {
        addAiMessage(data.error || 'Khong the xu ly yeu cau nay ngay luc nay.');
      }
    } catch {
      addAiMessage('Khong the ket noi den may chu. Vui long thu lai.');
    } finally {
      setIsTyping(false);
    }
  };

  const MarkdownComponents = {
    code({ inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <div className="relative">
          <div className="flex items-center justify-between rounded-t-2xl bg-gray-800 px-4 py-2 font-mono text-sm text-gray-200">
            <span>{match[1]}</span>
            <button onClick={() => copyToClipboard(String(children).replace(/\n$/, ''), 'code-block')} className="flex items-center gap-1 text-xs hover:text-white">
              {copiedId === 'code-block' ? <Check size={14} /> : <Copy size={14} />}
              {copiedId === 'code-block' ? 'Da sao chep' : 'Sao chep'}
            </button>
          </div>
          <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" className="rounded-b-2xl" {...props}>
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="rounded bg-gray-100 px-1 py-0.5 text-sm font-mono" {...props}>{children}</code>
      );
    },
  };

  const renderComposer = (centered: boolean) => (
    <div className={`group/chat relative rounded-full ${centered ? 'mx-auto max-w-4xl' : ''}`}>
      <div
        className="pointer-events-none absolute -inset-[2px] rounded-full opacity-0 blur-[2px] transition-opacity duration-300 group-focus-within/chat:opacity-100"
        style={{ background: isDark ? 'linear-gradient(120deg,#22d3ee,#38bdf8,#6366f1,#a78bfa,#f472b6)' : 'linear-gradient(120deg,#60a5fa,#2dd4bf,#818cf8,#c084fc,#fb7185)' }}
      />
      <div className={`relative overflow-hidden rounded-full border px-6 py-4 shadow-sm transition-all duration-300 focus-within:shadow-lg ${isDark ? 'border-slate-700 bg-slate-900 shadow-slate-950/40 focus-within:border-cyan-500/50' : 'border-slate-200 bg-white shadow-slate-200/70 focus-within:border-blue-400'}`}>
        <div className="flex items-center gap-3">
          <textarea
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendUserMessage();
              }
            }}
            placeholder="Nhap tin nhan de quan ly san pham, don hang hoac yeu cau thong ke..."
            rows={1}
            className={`w-full resize-none bg-transparent py-1 text-xl font-light outline-none ${isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-950 placeholder:text-gray-400'}`}
            style={{ minHeight: '32px', maxHeight: '200px', border: 'none', boxShadow: 'none' }}
          />
          <button
            onClick={sendUserMessage}
            disabled={isTyping || !inputValue.trim()}
            className={`flex-shrink-0 rounded-full p-2.5 shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-40 ${isDark ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-slate-950 text-white hover:bg-slate-900'}`}
          >
            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`relative flex h-[calc(100vh-4rem)] flex-col transition-colors duration-500 ${isDark ? 'bg-[#020617]' : 'bg-gradient-to-b from-slate-100 via-slate-100 to-blue-50'}`}>
      {isDark && <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1)_0%,rgba(2,6,23,1)_100%)]" />}
      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        {hasMessages ? (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-4xl px-6 py-8">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mb-8 ${message.sender === 'user' ? 'flex justify-end' : 'w-full'}`}>
                      {message.type === 'order_approval' && message.orderApprovalData ? (
                        <div className="w-full max-w-2xl">
                          <OrderApprovalCard isDark={isDark} orders={message.orderApprovalData} onSuccess={(count) => addAiMessage(`Da duyet thanh cong ${count} don hang.`)} />
                        </div>
                      ) : message.type === 'product_form' ? (
                        <div className="w-full max-w-2xl">
                          <ProductFormCard isDark={isDark} prefill={message.formPrefill} onSuccess={(name) => addAiMessage(`San pham "${name}" da duoc luu thanh cong.`)} />
                        </div>
                      ) : message.type === 'chart' && message.chartData ? (
                        <div className="w-full max-w-3xl">
                          <ChatChart data={message.chartData} isDark={isDark} />
                          {message.text && <div className={`mt-3 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-700'}`}><ReactMarkdown components={MarkdownComponents}>{message.text}</ReactMarkdown></div>}
                        </div>
                      ) : message.sender === 'user' ? (
                        <div className={`max-w-[70%] rounded-3xl px-6 py-4 text-base font-light leading-relaxed ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-950'}`}>{message.text}</div>
                      ) : (
                        <div className="group/msg relative w-full">
                          <div className={`prose prose-base max-w-none font-light leading-relaxed ${isDark ? 'prose-invert text-slate-100' : 'text-slate-950'}`}>
                            <ReactMarkdown components={MarkdownComponents}>{message.text}</ReactMarkdown>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                            <button onClick={() => copyToClipboard(message.text, message.id)} className={`rounded-lg p-1 opacity-0 transition-opacity group-hover/msg:opacity-100 ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-gray-400 hover:bg-slate-100'}`}>
                              {copiedId === message.id ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 w-full">
                    <div className="flex items-center gap-1.5 py-2">
                      {[0, 0.18, 0.36].map((delay, index) => (
                        <motion.div
                          key={index}
                          animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 0.9, delay, ease: 'easeInOut' }}
                          className="h-2 w-2 rounded-full bg-indigo-400"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="mx-auto max-w-4xl">{renderComposer(false)}</div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="w-full max-w-3xl">
              <div className="mb-12 text-center">
                <h1 className={`mb-4 text-6xl font-light tracking-tight md:text-7xl ${isDark ? 'text-white' : 'text-slate-950'}`}>Xin chao Quan</h1>
                <p className={`text-xl font-light md:text-2xl ${isDark ? 'text-white' : 'text-slate-950'}`}>Minh co the giup ban quan ly shop nuoc hoa chiết nhu the nao?</p>
              </div>

              <div className="mb-8">{renderComposer(true)}</div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap justify-center gap-3">
                {[
                  { icon: <Package size={16} />, label: 'Them san pham', prompt: 'Toi muon them san pham nuoc hoa chiet moi' },
                  { icon: <CheckCircle size={16} />, label: 'Duyet don hang', prompt: 'Duyet cac don hang da thanh toan moi nhat' },
                  { icon: <CreditCard size={16} />, label: 'Bao cao doanh thu', prompt: 'Ve bieu do doanh thu va payment status tuan nay' },
                  { icon: <Package size={16} />, label: 'Sua thong tin san pham', prompt: 'Toi muon cap nhat thong tin mot san pham nuoc hoa' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setInputValue(item.prompt)}
                    className={`flex items-center gap-2 rounded-full border px-5 py-3 text-base font-light shadow-sm transition-all ${isDark ? 'border-slate-800 bg-slate-900/40 text-slate-200 hover:border-slate-700 hover:bg-slate-800/60 hover:text-white' : 'border-slate-200 bg-white text-gray-700 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    <span className={isDark ? 'text-slate-400' : 'text-slate-400'}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
