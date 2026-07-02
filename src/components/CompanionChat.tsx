import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Sparkles, 
  RotateCcw, 
  MessageSquare, 
  Bot,
  User as UserIcon,
  HelpCircle,
  Brain,
  Coffee,
  Calendar
} from 'lucide-react';
import { CompanionMascot } from '../types';
import InteractiveCompanion from './InteractiveCompanion';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface CompanionChatProps {
  activeCompanion: CompanionMascot;
  companionXp?: number;
  userProfilePic?: string | null;
}

export default function CompanionChat({ 
  activeCompanion, 
  companionXp = 250,
  userProfilePic = null
}: CompanionChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'model',
      text: `Hello! I am ${activeCompanion.name}. I'm glad to be here to help you study, manage your tasks, and stay relaxed today. What is on your mind?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mood, setMood] = useState<'idle' | 'happy' | 'thinking' | 'chatting' | 'sleepy'>('idle');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the message feed
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // When the active companion changes, greet the user
  useEffect(() => {
    setMessages([
      {
        id: `greet-${Date.now()}`,
        role: 'model',
        text: `Hi there! I am ${activeCompanion.name}, your ${activeCompanion.species}. ${activeCompanion.description || "Let's work together to conquer our goals today!"}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [activeCompanion]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    if (!textToSend) {
      setInputValue('');
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setMood('thinking');

    try {
      // Map the messages to a conversation history
      const history = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          companionName: activeCompanion.name,
          companionSpecies: activeCompanion.species
        })
      });

      const data = await response.json();
      setMood('chatting');

      const companionMsg: Message = {
        id: `msg-${Date.now()}-companion`,
        role: 'model',
        text: data.reply || "I'm listening and support you!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, companionMsg]);
      
      // Let companion be happy after replying
      setTimeout(() => setMood('happy'), 500);
      setTimeout(() => setMood('idle'), 2500);

    } catch (error) {
      console.error('Chatbot API error:', error);
      const errorMsg: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'model',
        text: "I had a small hiccup connecting to the focus matrix. But I'm still right here beside you to keep you motivated! Let's keep working.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
      setMood('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPromptClick = (prompt: string) => {
    handleSend(prompt);
  };

  const resetChat = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'model',
        text: `Starting fresh! I'm ready to keep you company. What should we tackle next?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const quickPrompts = [
    { 
      label: "📅 Plan my afternoon", 
      prompt: "I have 3 hours this afternoon. Help me plan a structured study session with breaks.",
      icon: <Calendar className="w-3 h-3 text-emerald-600" />
    },
    { 
      label: "🍵 Help me decompress", 
      prompt: "I am feeling a bit overwhelmed and stressed. Can you guide me through a 2-minute decompression exercise?",
      icon: <Coffee className="w-3 h-3 text-amber-600" />
    },
    { 
      label: "🎯 Stay focused tip", 
      prompt: "Give me your single best scientific tip to maintain focus and avoid checking my phone.",
      icon: <Brain className="w-3 h-3 text-sky-600" />
    },
  ];

  return (
    <div id="companion-chat-view" className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch h-full w-full overflow-hidden">
      
      {/* LEFT COLUMN: Chat Console (col-span-8) */}
      <div className="lg:col-span-8 flex flex-col h-full min-h-0 overflow-hidden bg-[#FFFDF9] border border-[#E9E4DB] rounded-3xl shadow-xs">
        
        {/* Chat Header */}
        <div className="bg-[#FAF8F5] border-b border-[#E9E4DB]/60 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#E8EFE5] flex items-center justify-center border border-[#DFD6C4]">
              {activeCompanion.svgMarkup ? (
                <div 
                  className="w-full h-full p-1 [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: activeCompanion.svgMarkup }}
                />
              ) : (
                <img 
                  src={activeCompanion.imageUrl} 
                  alt={activeCompanion.name} 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div>
              <h3 className="text-sm font-black text-[#2C2A29] flex items-center gap-1.5 leading-none">
                {activeCompanion.name} Study Companion
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <span className="text-[10px] font-bold text-[#8C867E] uppercase tracking-wide mt-0.5 block">
                Comfortable, calm & intellectual companion
              </span>
            </div>
          </div>

          <button
            onClick={resetChat}
            title="Reset conversation"
            className="p-2 hover:bg-[#EBE7DF]/50 rounded-xl text-[#5D5750] hover:text-[#2C2A29] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-[#E2DCCE]/50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Chat
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAF9F5] scrollbar-thin scrollbar-thumb-gray-200">
          
          {/* Welcome Info Box */}
          <div className="flex justify-center mb-4">
            <div className="bg-white border border-[#E9E4DB] rounded-2xl p-4 text-center text-xs text-[#5D5750] max-w-lg font-medium shadow-2xs space-y-1">
              <Sparkles className="w-5 h-5 text-[#8C9A86] mx-auto mb-1 animate-pulse" />
              <p>
                You are conversing with <span className="font-extrabold text-[#2C2A29]">{activeCompanion.name}</span>, an AI-powered study buddy.
              </p>
              <p className="text-[10px] text-[#8C867E]">
                Tone is cozy, clear, and professional with fewer emojis. Let's discuss planning, breaks, or focus strategies.
              </p>
            </div>
          </div>

          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border text-xs font-bold overflow-hidden ${
                  isUser 
                    ? 'bg-[#E8EFE5] border-[#8C9A86]/30 text-[#8C9A86]' 
                    : 'bg-white border-[#E9E4DB] text-[#5D5750]'
                }`}>
                  {isUser ? (
                    userProfilePic ? (
                      <img src={userProfilePic} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )
                  ) : activeCompanion.svgMarkup ? (
                    <div 
                      className="w-full h-full p-1 [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: activeCompanion.svgMarkup }}
                    />
                  ) : (
                    <img 
                      src={activeCompanion.imageUrl} 
                      alt={activeCompanion.name} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs font-medium shadow-2xs leading-relaxed ${
                  isUser
                    ? 'bg-[#8C9A86] text-white rounded-tr-none'
                    : 'bg-white border border-[#E9E4DB] text-[#2C2A29] rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-line">{m.text}</p>
                  <span className={`text-[8px] mt-2 block text-right font-bold ${
                    isUser ? 'text-white/60' : 'text-[#8C867E]'
                  }`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border bg-white border-[#E9E4DB] text-[#5D5750] overflow-hidden">
                {activeCompanion.svgMarkup ? (
                  <div 
                    className="w-full h-full p-1 [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: activeCompanion.svgMarkup }}
                  />
                ) : (
                  <img 
                    src={activeCompanion.imageUrl} 
                    alt={activeCompanion.name} 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="bg-white border border-[#E9E4DB] rounded-2xl rounded-tl-none px-4 py-3 shadow-2xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8C9A86] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#8C9A86] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#8C9A86] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts Drawer */}
        <div className="px-5 py-3 bg-[#FAF8F5] border-t border-[#E9E4DB]/60 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPromptClick(qp.prompt)}
              disabled={isLoading}
              className="bg-white hover:bg-[#E8EFE5] border border-[#E2DCCE] hover:border-[#8C9A86] text-xs font-bold text-[#5D5750] px-3.5 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-all disabled:opacity-50 shrink-0 flex items-center gap-1.5 shadow-2xs"
            >
              {qp.icon}
              {qp.label}
            </button>
          ))}
        </div>

        {/* Chat Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-white border-t border-[#E9E4DB]/60 flex gap-3 items-center shrink-0"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask ${activeCompanion.name} anything to structure your study flow...`}
            disabled={isLoading}
            className="flex-1 bg-[#FAF9F6] border border-[#E2DCCE] rounded-2xl px-4 py-3 text-xs text-[#2C2A29] font-bold focus:outline-none focus:border-[#8C9A86] disabled:opacity-50 shadow-2xs"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="bg-[#8C9A86] hover:bg-[#778671] disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-2xl p-3 cursor-pointer transition-all shrink-0 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

      {/* RIGHT COLUMN: Companion Details (col-span-4) */}
      <div className="hidden lg:flex lg:col-span-4 h-full flex-col overflow-y-auto space-y-4 pr-1 pb-4 scrollbar-thin">
        
        {/* Main Companion Bio Card */}
        <div className="bg-[#FFFDF9] border border-[#E9E4DB] rounded-3xl p-5 shadow-xs text-center space-y-4">
          <h3 className="text-[11px] font-extrabold text-[#8C867E] uppercase tracking-wider text-left border-b border-[#FAF8F5] pb-2">
            Active Study Buddy
          </h3>

          <InteractiveCompanion companion={activeCompanion} mood={mood} size="lg" />

          <div className="space-y-1">
            <p className="text-base font-black text-[#2C2A29]">
              {activeCompanion.name}
            </p>
            <p className="text-xs font-semibold text-[#8C867E] bg-[#EBE7DF]/45 px-2.5 py-0.5 rounded-full inline-block">
              {activeCompanion.species}
            </p>
          </div>

          <p className="text-xs font-bold text-[#5D5750] leading-relaxed italic px-2">
            "{activeCompanion.description || 'Ready to support your cognitive focus today!'}"
          </p>

          {/* XP Progress Bar */}
          <div className="space-y-1 text-left bg-white border border-[#E9E4DB] p-3 rounded-2xl shadow-2xs">
            <div className="flex justify-between items-center text-[10px] font-extrabold text-[#5D5750]">
              <span className="uppercase tracking-wider">Mascot Bond Level</span>
              <span className="text-[#8C9A86]">Lv. 3 • {companionXp}/500 XP</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#8C9A86] h-full transition-all duration-500 rounded-full"
                style={{ width: `${(companionXp / 500) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Focus Companion Strategy Guide Card */}
        <div className="bg-[#FFFDF9] border border-[#E9E4DB] rounded-3xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-black text-[#2C2A29] flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-[#8C9A86]" />
            Buddy Strategy Tips
          </h3>
          <ul className="space-y-2 text-[11px] font-medium text-[#5D5750]">
            <li className="flex items-start gap-1.5">
              <span className="text-[#8C9A86] font-bold">•</span>
              <span>Ask for an afternoon schedule tailored for high focus.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#8C9A86] font-bold">•</span>
              <span>Ask for a progressive muscle relaxation or breathing step.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#8C9A86] font-bold">•</span>
              <span>Discuss tasks in the calendar to decompose them.</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
}
