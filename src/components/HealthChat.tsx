import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { MessageSquare, Send } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface HealthChatProps {
  aqiContext: any;
}

export function HealthChat({ aqiContext }: HealthChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat-health`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          context: {
            aqi: aqiContext?.aqi || 0,
            city: aqiContext?.city || 'Delhi',
            risk_summary: aqiContext?.risk_summary || 'Unknown'
          }
        })
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
    } catch (e) {
      console.error("Health Chat Error:", e);
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I couldn't reach the health expert right now." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="mt-8 pt-6 border-t border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-1.5 bg-secondary/10 rounded-lg">
          <MessageSquare className="w-4 h-4 text-secondary" />
        </div>
        <h4 className="font-bold text-white text-sm uppercase tracking-widest opacity-80">
          AI Health Consultant
        </h4>
      </div>

      <div className="bg-black/20 rounded-2xl border border-white/5 h-[350px] flex flex-col relative overflow-hidden backdrop-blur-sm">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-50">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <p className="text-white text-sm font-medium">Ask about your health safety</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                <span className="px-2 py-1 rounded-md bg-white/5 text-[10px] text-white/50 border border-white/5">"Can I go jogging?"</span>
                <span className="px-2 py-1 rounded-md bg-white/5 text-[10px] text-white/50 border border-white/5">"Risks for asthma?"</span>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-green-600 to-teal-600 text-white rounded-tr-sm'
                  : 'bg-white/10 text-white border border-white/5 rounded-tl-sm'
                  }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3 border border-white/5 flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white/5 border-t border-white/5 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your health question..."
            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="btn-primary w-12 flex items-center justify-center rounded-xl shadow-lg shadow-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
