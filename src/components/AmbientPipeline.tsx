import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InboundMessage } from '../types';
import { 
  Sparkles, 
  Slack, 
  Mail, 
  MessageSquare, 
  Loader2, 
  Trash, 
  ArrowRight,
  Clock,
  Send,
  AlertCircle
} from 'lucide-react';

interface AmbientPipelineProps {
  inboundMessages: InboundMessage[];
  onIngestMessage: (msgId: string) => void;
  onDismissMessage: (msgId: string) => void;
  onParseBrainDump: (text: string) => Promise<void>;
  parseLoading: boolean;
}

export default function AmbientPipeline({
  inboundMessages,
  onIngestMessage,
  onDismissMessage,
  onParseBrainDump,
  parseLoading
}: AmbientPipelineProps) {
  const [brainDumpText, setBrainDumpText] = useState('');
  const [activeTab, setActiveTab] = useState<'vent' | 'radar'>('vent');

  const handleBrainDumpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!brainDumpText.trim()) return;
    await onParseBrainDump(brainDumpText);
    setBrainDumpText('');
  };

  const loadExampleVent = (vent: string) => {
    setBrainDumpText(vent);
  };

  const sampleVents = [
    {
      label: "💼 Work & Study Overwhelm",
      text: "I am so stressed! I have to write the checkout page component spec for our mobile app by Thursday, buy groceries for dinner tonight, and also email my algebra professor Collins for an extension before tomorrow."
    },
    {
      label: "📝 Math Quiz Panic",
      text: "OMG I need to study for Linear Algebra problem set 4. It is coming up tomorrow afternoon! Also need to clean up my messy room because my friend is visiting."
    }
  ];

  return (
    <div className="bg-white border border-[#E9E4DB] rounded-3xl p-6 shadow-sm space-y-6">
      {/* Tab Selectors */}
      <div className="flex border-b border-[#E9E4DB] p-0.5 bg-[#FAF8F5] rounded-xl">
        <button
          onClick={() => setActiveTab('vent')}
          className={`flex-1 text-xs font-bold py-2.5 px-4 rounded-lg transition-all cursor-pointer ${
            activeTab === 'vent' 
              ? 'bg-white text-[#2C2A29] shadow-xs' 
              : 'text-[#8C867E] hover:text-[#2C2A29]'
          }`}
        >
          🌋 Raw Brain-Dump Venter
        </button>
        <button
          onClick={() => setActiveTab('radar')}
          className={`flex-1 text-xs font-bold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'radar' 
              ? 'bg-white text-[#2C2A29] shadow-xs' 
              : 'text-[#8C867E] hover:text-[#2C2A29]'
          }`}
        >
          📡 Silent Radar Hub
          {inboundMessages.filter(m => m.status === 'pending').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>
      </div>

      {activeTab === 'vent' ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#2C2A29] flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
              Emotional Vent Intake Pipeline
            </h3>
            <p className="text-xs text-[#5D5750] mt-0.5 leading-relaxed">
              Vomit your thoughts, anxiety, and stressors. Catalyst AI will absorb the cognitive load, aggressively filter the emotional filler, isolate actionable metadata, and map them onto your desk timeline.
            </p>
          </div>

          <form onSubmit={handleBrainDumpSubmit} className="space-y-3">
            <div className="relative">
              <textarea
                value={brainDumpText}
                onChange={e => setBrainDumpText(e.target.value)}
                placeholder="Vomit your chaotic thoughts here... (e.g. 'I'm so stressed about homework due tomorrow and cleaning my room...')"
                rows={4}
                className="w-full bg-[#FAF9F5] border border-[#E2DCCE] rounded-2xl p-4 text-xs font-medium text-[#2C2A29] focus:outline-none focus:border-[#8C9A86] placeholder-[#ACAA9F] leading-relaxed resize-none"
              />
              <div className="absolute bottom-3 right-3 text-[10px] text-[#ACAA9F]">
                Processed by Gemini-3.5-Flash
              </div>
            </div>

            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex gap-1.5 flex-wrap">
                {sampleVents.map((v, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => loadExampleVent(v.text)}
                    className="text-[11px] font-bold bg-[#FAF8F5] border border-[#E9E4DB] hover:border-[#DFD6C4] px-2.5 py-1.5 rounded-full text-[#5D5750] transition-colors cursor-pointer"
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={parseLoading || !brainDumpText.trim()}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {parseLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Absorbing Stress...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Parse & Map Tasks
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#2C2A29] flex items-center gap-1.5">
              <AlertCircle className="w-4.5 h-4.5 text-amber-500" />
              Inbound Radar triage (Zero-Admin Intake)
            </h3>
            <p className="text-xs text-[#5D5750] mt-0.5 leading-relaxed">
              No need to manually schedule! Biscuit is monitoring your simulated workspace professional channels (Slack, Discord, Emails) to surface implicit deadlines and task proposals. Ingest them into your schedule with a single tap.
            </p>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {inboundMessages.filter(m => m.status === 'pending').length === 0 ? (
              <div className="text-center py-8 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#DFD6C4]">
                <p className="text-xs font-semibold text-[#8C867E]">Radar channels are fully clear! 🐾</p>
                <p className="text-[10px] text-[#ACAA9F] mt-0.5">Biscuit is keeping watch for incoming items.</p>
              </div>
            ) : (
              inboundMessages.filter(m => m.status === 'pending').map(msg => (
                <div 
                  key={msg.id}
                  className="bg-[#FAF9F6] border border-[#E9E4DB] hover:border-[#DFD6C4] rounded-2xl p-4 space-y-3 transition-colors relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {msg.source === 'Slack' && <Slack className="w-4.5 h-4.5 text-[#E01E5A]" />}
                      {msg.source === 'Email' && <Mail className="w-4.5 h-4.5 text-blue-500" />}
                      {msg.source === 'Discord' && <MessageSquare className="w-4.5 h-4.5 text-indigo-500" />}
                      <span className="text-[11px] font-bold text-[#5D5750]">{msg.sender} via {msg.source}</span>
                    </div>
                    <span className="text-[9px] font-bold text-[#8C867E] uppercase">{msg.timestamp}</span>
                  </div>

                  <p className="text-xs font-semibold text-[#2C2A29] leading-relaxed bg-white border border-[#EBE7DF] p-2 rounded-xl italic">
                    "{msg.content}"
                  </p>

                  <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-2.5 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Biscuit's Extraction AI</span>
                    </div>
                    {msg.detectedTaskTitle && (
                      <p className="text-xs text-[#2C2A29]">
                        <strong>Proposed Task:</strong> {msg.detectedTaskTitle}
                      </p>
                    )}
                    {msg.detectedDeadline && (
                      <p className="text-[11px] text-[#5D5750] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <strong>Deadline detected:</strong> {msg.detectedDeadline}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => onDismissMessage(msg.id)}
                      className="p-1.5 text-[#C88478] hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" />
                      Ignore
                    </button>
                    <button
                      onClick={() => onIngestMessage(msg.id)}
                      className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      Instant Ingest
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
