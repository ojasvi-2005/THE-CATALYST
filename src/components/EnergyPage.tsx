import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EnergyDataPoint, ChronotypeStats } from '../types';
import { 
  Shield, 
  Activity, 
  Coffee, 
  Sun, 
  Moon, 
  Zap, 
  Clock, 
  Battery, 
  TrendingUp, 
  CheckCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface EnergyPageProps {
  energyWave: EnergyDataPoint[];
  fatigueLevel: 'low' | 'moderate' | 'critical';
  onInjectBuffer: () => void;
  bufferActive: boolean;
  onRescheduleTasks: () => void;
  stats: ChronotypeStats;
}

export default function EnergyPage({
  energyWave,
  fatigueLevel,
  onInjectBuffer,
  bufferActive,
  onRescheduleTasks,
  stats
}: EnergyPageProps) {
  const [showFaq, setShowFaq] = useState(false);

  // SVG dimensions for compact render
  const width = 600;
  const height = 140;
  const padding = 20;

  // Build SVG path for biological energy wave
  const points = energyWave.map((pt) => {
    const x = padding + (pt.hour / 23) * (width - padding * 2);
    const y = height - padding - (pt.score / 100) * (height - padding * 2);
    return `${x},${y}`;
  });
  const pathData = `M ${points.join(' L ')}`;

  // Find peak hour
  const peakPoint = [...energyWave].sort((a, b) => b.score - a.score)[0];
  const peakHour = peakPoint ? `${peakPoint.hour}:00` : '14:00';

  // Current hour marker (mocking 14:00 PM)
  const currentHour = 14;
  const currentEnergyScore = energyWave.find(p => p.hour === currentHour)?.score || 72;
  const currentX = padding + (currentHour / 23) * (width - padding * 2);
  const currentY = height - padding - (currentEnergyScore / 100) * (height - padding * 2);

  // Biological logs
  const biologicalLogs = [
    { time: "08:00 AM", event: "Circadian Ascent initiated", status: "Waking Battery: 90%", type: "asc" },
    { time: "10:30 AM", event: "Completed 60m focus study block", status: "Battery -20%", type: "dec" },
    { time: "12:00 PM", event: "Circadian trough dip", status: "Fatigue level: moderate", type: "trough" },
    { time: "01:15 PM", event: "Decompression Buffer injected", status: "Battery +15%", type: "inc" },
    { time: "02:00 PM", event: "Peak Window entered", status: "Battery: 72% (Optimal)", type: "peak" }
  ];

  return (
    <div id="energy-dashboard" className="h-full flex flex-col gap-4 text-[#2C2A29] overflow-hidden">
      
      {/* Top Banner & Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <span className="text-[10px] font-bold text-[#8C9A86] uppercase tracking-widest bg-[#EFECE6] px-2.5 py-1 rounded-full">
            Circadian Biology
          </span>
          <h1 className="text-xl md:text-2xl font-black text-[#2C2A29] tracking-tight mt-1">
            Cognitive Battery & Energy Wave
          </h1>
        </div>

        <button
          onClick={() => setShowFaq(!showFaq)}
          className="flex items-center gap-1.5 text-xs text-[#5D5750] bg-white border border-[#E9E4DB] px-3.5 py-1.5 rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer shadow-xs"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#8C9A86]" />
          About Circadian Scheduling
        </button>
      </div>

      {/* Main Grid: Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
        
        {/* Left Column: Wave Chart & Controls (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0 overflow-hidden">
          
          {/* Circadian Wave Visual Card */}
          <div className="bg-[#FFFDF9] border border-[#E9E4DB] rounded-3xl p-5 shadow-xs flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#F2ECE1] rounded-lg">
                  <Activity className="w-4 h-4 text-[#8C9A86]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#2C2A29]">Live Energy Wave Tracer</h2>
                  <p className="text-[10px] text-[#8C867E]">Tracks your daily focus capacity in real time</p>
                </div>
              </div>

              {/* Fatigue Status Indicator */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                  fatigueLevel === 'critical'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : fatigueLevel === 'moderate'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                }`}>
                  <Shield className="w-3 h-3" />
                  {fatigueLevel} fatigue level
                </span>
              </div>
            </div>

            {/* SVG Plot Wrapper - Flex Grow & Auto Scaled */}
            <div className="relative bg-[#FAF9F5] border border-[#E9E4DB] rounded-2xl p-4 flex-1 flex flex-col justify-center overflow-hidden min-h-0">
              <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] text-[#8C867E] font-bold">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Biological Cognitive Load Model
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-3 text-[10px] text-[#8C867E] font-medium">
                <span className="flex items-center gap-1"><Sun className="w-3 h-3 text-amber-500" /> Peak Morning Lark</span>
                <span className="flex items-center gap-1"><Moon className="w-3 h-3 text-indigo-500" /> Rest Valley</span>
              </div>

              <div className="flex-1 flex items-center justify-center min-h-0 mt-3">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[160px] overflow-visible">
                  {/* Grid Lines */}
                  <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E2DCCE" strokeDasharray="3 3" />
                  <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#E2DCCE" strokeDasharray="3 3" />

                  {/* Shading Area fill under curve */}
                  <path
                    d={`${pathData} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`}
                    fill="url(#biologicalGradient)"
                    opacity="0.1"
                  />

                  {/* Sine Path */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#8C9A86"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="biologicalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8C9A86" />
                      <stop offset="100%" stopColor="#FAF9F5" />
                    </linearGradient>
                  </defs>

                  {/* Pulse Indicator on Peak Hour */}
                  <circle cx={padding + (14 / 23) * (width - padding * 2)} cy={height - padding - (80 / 100) * (height - padding * 2)} r="12" fill="#8C9A86" opacity="0.15" className="animate-ping" />

                  {/* Active hour cursor */}
                  <circle cx={currentX} cy={currentY} r="7" fill="#E8A99A" stroke="white" strokeWidth="2.5" className="shadow-md animate-bounce" />
                  <text x={currentX + 10} y={currentY - 10} className="text-[10px] font-black fill-[#2C2A29]">
                    Current Battery: {currentEnergyScore}%
                  </text>
                </svg>
              </div>

              {/* Hour X-Axis Labels */}
              <div className="flex justify-between px-2 text-[9px] text-[#8C867E] font-bold tracking-wider mt-2 border-t border-[#EFECE6] pt-2">
                <span>00:00 (Sleep Wave)</span>
                <span>08:00 (Ascending Peak)</span>
                <span>14:00 (Maximum Focus)</span>
                <span>20:00 (Winding Down)</span>
              </div>
            </div>

            {/* Action Buttons underneath */}
            <div className="grid grid-cols-2 gap-3 mt-4 flex-shrink-0">
              <button
                onClick={onInjectBuffer}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black transition-all shadow-xs cursor-pointer ${
                  bufferActive
                    ? 'bg-[#E8A99A] hover:bg-[#DFA091] text-white animate-pulse'
                    : 'bg-[#FAF8F5] border border-[#E9E4DB] hover:bg-[#FAF2EC] text-[#2C2A29]'
                }`}
              >
                <Coffee className={`w-4 h-4 ${bufferActive ? 'text-white' : 'text-[#8C9A86]'}`} />
                {bufferActive ? '🌸 Active Decompression Injected (15m)' : 'Inject 15m Coffee Buffer'}
              </button>

              <button
                onClick={onRescheduleTasks}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-[#F2ECE1] hover:bg-[#EBE3D3] text-[#2C2A29] rounded-2xl text-xs font-black transition-colors shadow-xs cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-500 animate-bounce" />
                Align All Tasks to Peak ({peakHour})
              </button>
            </div>

          </div>

          {/* Dynamic FAQ Context Panel */}
          <AnimatePresence>
            {showFaq && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-[#FAF8F5] border border-[#E9E4DB] p-4 rounded-2xl flex-shrink-0 text-xs leading-relaxed text-[#5D5750] space-y-2.5"
              >
                <h4 className="font-bold text-[#2C2A29] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#8C9A86]" />
                  What is the Empathy Shield biological framework?
                </h4>
                <p>
                  Most calendars treat you like a factory machine, distributing tasks in flat, consecutive chunks of equal value. <strong>Catalyst AI</strong> models your cognitive capability as an energy wave that ebbs and flows according to your personal biological chronotype.
                </p>
                <p>
                  By evaluating current focus length, message latency, and fatigue, we identify periods of cognitive strain. Injecting a <strong>Buffer</strong> introduces quiet time blocks, and aligning the schedule automatically reschedules complex, high-energy assignments to your optimal hour.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Column: Bio-Stats & Battery logs (col-span-4) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col gap-4 min-h-0 overflow-hidden pr-1">
          
          {/* Bio Statistics Bento Card */}
          <div className="bg-[#FFFDF9] border border-[#E9E4DB] rounded-3xl p-5 shadow-xs flex-shrink-0">
            <h3 className="text-sm font-bold text-[#2C2A29] flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-4 h-4 text-[#8C9A86]" />
              Cognitive Performance Stats
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#FAF9F5] border border-[#EFECE6] p-3 rounded-2xl text-center">
                <span className="text-[10px] text-[#8C867E] font-bold block mb-1">Peak Capacity</span>
                <span className="text-xl font-black text-[#2C2A29]">85%</span>
                <span className="text-[9px] text-[#8C9A86] font-medium block mt-1">at {peakHour}</span>
              </div>

              <div className="bg-[#FAF9F5] border border-[#EFECE6] p-3 rounded-2xl text-center">
                <span className="text-[10px] text-[#8C867E] font-bold block mb-1">Focus Endurance</span>
                <span className="text-xl font-black text-[#2C2A29]">{stats.averageFocusDuration}m</span>
                <span className="text-[9px] text-[#8C9A86] font-medium block mt-1">Avg Session</span>
              </div>

              <div className="bg-[#FAF9F5] border border-[#EFECE6] p-3 rounded-2xl text-center">
                <span className="text-[10px] text-[#8C867E] font-bold block mb-1">Tasks Completed</span>
                <span className="text-xl font-black text-[#2C2A29]">{Math.round(stats.historicalCompletionRate)}%</span>
                <span className="text-[9px] text-emerald-700 font-bold block mt-1">Excellent Flow</span>
              </div>

              <div className="bg-[#FAF9F5] border border-[#EFECE6] p-3 rounded-2xl text-center">
                <span className="text-[10px] text-[#8C867E] font-bold block mb-1">Buffer Triggers</span>
                <span className="text-xl font-black text-amber-700">{stats.fatigueCount}</span>
                <span className="text-[9px] text-[#8C867E] font-medium block mt-1">Rescued Today</span>
              </div>
            </div>
          </div>

          {/* Real-time Battery Log Card */}
          <div className="bg-[#FFFDF9] border border-[#E9E4DB] rounded-3xl p-5 shadow-xs flex-1 flex flex-col min-h-0">
            <h3 className="text-sm font-bold text-[#2C2A29] flex items-center gap-1.5 mb-3 flex-shrink-0">
              <Battery className="w-4 h-4 text-emerald-600" />
              Circadian Battery Log
            </h3>

            {/* List scroll container locked */}
            <div className="flex-1 overflow-hidden space-y-2.5 pr-1 min-h-0">
              {biologicalLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-2.5 p-2 bg-[#FAF9F5] border border-[#EFECE6] rounded-xl text-xs transition-colors hover:bg-white hover:shadow-xs">
                  <div className="flex-shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-[#8C867E]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2C2A29] truncate">{log.event}</span>
                      <span className="text-[9px] text-[#8C867E] font-mono whitespace-nowrap ml-1">{log.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-[#5D5750] truncate">{log.status}</span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm ${
                        log.type === "peak" || log.type === "inc"
                          ? "bg-emerald-100 text-emerald-800"
                          : log.type === "trough"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-[#EFECE6] text-[#2C2A29]"
                      }`}>
                        {log.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Micro Biological Proactive Check-In Advice */}
            <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-2xl text-[11px] text-emerald-900 leading-relaxed mt-4 flex-shrink-0">
              <div className="font-bold flex items-center gap-1 mb-1 text-emerald-800">
                <CheckCircle className="w-3.5 h-3.5" />
                Buddy’s Bio-hacking Tip:
              </div>
              "You are approaching your 14:00 peak! Perfect time to tackle your high-energy study block. Drink water and let's lock in!"
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
