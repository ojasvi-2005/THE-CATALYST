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
  activeTheme?: 'minimal' | 'sketch' | 'night' | 'forest' | 'lavender';
}

export default function EnergyPage({
  energyWave,
  fatigueLevel,
  onInjectBuffer,
  bufferActive,
  onRescheduleTasks,
  stats,
  activeTheme = 'minimal'
}: EnergyPageProps) {
  const isSketch = activeTheme === 'sketch';
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

  // Dynamic theme-based styles
  const styles = {
    container: isSketch 
      ? "text-[#111111]" 
      : activeTheme === 'night' 
      ? "text-[#ECEEF5]" 
      : activeTheme === 'forest' 
      ? "text-[#ECF2EF]" 
      : activeTheme === 'lavender' 
      ? "text-[#3D3A45]" 
      : "text-[#2C2A29]",
    card: isSketch
      ? "border-2 border-[#111111] rounded-3xl bg-white p-5 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]"
      : activeTheme === 'night'
      ? "border border-slate-800 rounded-3xl bg-[#1B1E2E] p-5 shadow-sm text-[#ECEEF5]"
      : activeTheme === 'forest'
      ? "border border-emerald-950/20 rounded-3xl bg-[#233029] p-5 shadow-sm text-[#ECF2EF]"
      : activeTheme === 'lavender'
      ? "border border-[#E9E4EB] rounded-3xl bg-white p-5 shadow-sm text-[#3D3A45]"
      : "border border-[#E9E4DB] rounded-3xl bg-[#FFFDF9] p-5 shadow-xs text-[#2C2A29]", // minimal
    innerCard: isSketch
      ? "bg-white border-2 border-[#111111]"
      : activeTheme === 'night'
      ? "bg-[#242A3E] border border-slate-700 text-white"
      : activeTheme === 'forest'
      ? "bg-[#2D3F35] border border-emerald-900/30 text-[#ECF2EF]"
      : activeTheme === 'lavender'
      ? "bg-[#FAF8FC] border border-[#E2DAF2] text-[#3D3A45]"
      : "bg-[#FAF9F5] border border-[#EFECE6] text-[#2C2A29]", // minimal
    innerBg: isSketch
      ? "bg-gray-50"
      : activeTheme === 'night'
      ? "bg-[#181B28]"
      : activeTheme === 'forest'
      ? "bg-[#1C2822]"
      : "bg-[#FAF8F5]",
    iconBg: isSketch
      ? "bg-white text-[#111111] border-2 border-[#111111]"
      : activeTheme === 'night'
      ? "bg-slate-800 text-white border border-slate-700"
      : activeTheme === 'forest'
      ? "bg-[#314339] text-[#ECF2EF] border border-emerald-950/20"
      : "bg-[#FAF8F5] border border-[#E9E4DB] text-[#8C9A86]",
    badge: isSketch
      ? "border-2 border-[#111111] bg-white text-[#111111]"
      : activeTheme === 'night'
      ? "bg-slate-800 text-slate-300 border border-slate-700"
      : activeTheme === 'forest'
      ? "bg-emerald-950/20 text-emerald-300 border border-emerald-900/30"
      : activeTheme === 'lavender'
      ? "bg-[#F3EEFA] text-[#635B8F] border border-[#E2DAF2]"
      : "bg-[#EFECE6] text-[#5D5750] border border-[#E9E4DB]",
    button: isSketch
      ? "border-2 border-[#111111] rounded-full bg-white shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] text-[#111111] hover:bg-gray-50"
      : activeTheme === 'night'
      ? "border border-slate-800 rounded-full bg-slate-800 hover:bg-slate-700 text-white shadow-xs"
      : activeTheme === 'forest'
      ? "border border-emerald-950/40 rounded-full bg-[#314339] hover:bg-[#3a5043] text-white shadow-xs"
      : activeTheme === 'lavender'
      ? "border border-[#E9E4EB] rounded-full bg-white hover:bg-[#FAF8FC] text-[#635B8F] shadow-xs"
      : "border border-[#E9E4DB] rounded-full bg-white hover:bg-[#FAF8F5] text-[#5D5750] shadow-xs" // minimal
  };

  return (
    <div id="energy-dashboard" className={`h-full flex flex-col gap-4 overflow-hidden ${styles.container}`}>
      
      {/* Top Banner & Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${styles.badge}`}>
            Circadian Biology
          </span>
          <h1 className="text-xl md:text-2xl font-black tracking-tight mt-1">
            Cognitive Battery & Energy Wave
          </h1>
        </div>

        <button
          onClick={() => setShowFaq(!showFaq)}
          className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full transition-colors cursor-pointer shadow-xs ${styles.button}`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-current" />
          About Circadian Scheduling
        </button>
      </div>

      {/* Main Grid: Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
        
        {/* Left Column: Wave Chart & Controls (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0 overflow-hidden">
          
          {/* Circadian Wave Visual Card */}
          <div className={`${styles.card} flex-1 flex flex-col min-h-0`}>
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${styles.iconBg}`}>
                  <Activity className="w-4 h-4 text-current" />
                </div>
                <div>
                  <h2 className="text-base font-bold">Live Energy Wave Tracer</h2>
                  <p className="text-[10px] opacity-70">Tracks your daily focus capacity in real time</p>
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
            <div className={`relative border rounded-2xl p-4 flex-1 flex flex-col justify-center overflow-hidden min-h-0 ${styles.innerCard}`}>
              <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] opacity-75 font-bold">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Biological Cognitive Load Model
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-3 text-[10px] opacity-75 font-medium">
                <span className="flex items-center gap-1"><Sun className="w-3 h-3 text-amber-500" /> Peak Morning Lark</span>
                <span className="flex items-center gap-1"><Moon className="w-3 h-3 text-indigo-500" /> Rest Valley</span>
              </div>

              <div className="flex-1 flex items-center justify-center min-h-0 mt-3">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[160px] overflow-visible">
                  {/* Grid Lines */}
                  <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke={activeTheme === 'night' ? '#334155' : activeTheme === 'forest' ? '#14532d' : '#E2DCCE'} strokeDasharray="3 3" />
                  <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke={activeTheme === 'night' ? '#334155' : activeTheme === 'forest' ? '#14532d' : '#E2DCCE'} strokeDasharray="3 3" />

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
                    stroke={activeTheme === 'night' ? '#38bdf8' : activeTheme === 'forest' ? '#10b981' : '#8C9A86'}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="biologicalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={activeTheme === 'night' ? '#38bdf8' : activeTheme === 'forest' ? '#10b981' : '#8C9A86'} />
                      <stop offset="100%" stopColor={activeTheme === 'night' ? '#1B1E2E' : activeTheme === 'forest' ? '#233029' : '#FAF9F5'} />
                    </linearGradient>
                  </defs>

                  {/* Pulse Indicator on Peak Hour */}
                  <circle cx={padding + (14 / 23) * (width - padding * 2)} cy={height - padding - (80 / 100) * (height - padding * 2)} r="12" fill={activeTheme === 'night' ? '#38bdf8' : activeTheme === 'forest' ? '#10b981' : '#8C9A86'} opacity="0.15" className="animate-ping" />

                  {/* Active hour cursor */}
                  <circle cx={currentX} cy={currentY} r="7" fill="#E8A99A" stroke="white" strokeWidth="2.5" className="shadow-md animate-bounce" />
                  <text x={currentX + 10} y={currentY - 10} className={`text-[10px] font-black ${activeTheme === 'night' || activeTheme === 'forest' ? 'fill-white' : 'fill-[#2C2A29]'}`}>
                    Current Battery: {currentEnergyScore}%
                  </text>
                </svg>
              </div>

              {/* Hour X-Axis Labels */}
              <div className={`flex justify-between px-2 text-[9px] font-bold tracking-wider mt-2 border-t pt-2 ${isSketch ? 'border-[#111111]' : activeTheme === 'night' ? 'border-slate-800' : activeTheme === 'forest' ? 'border-emerald-950/20' : 'border-[#EFECE6]'}`}>
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
                    : isSketch 
                    ? 'bg-white border-2 border-[#111111] hover:bg-gray-50 text-[#111111]'
                    : activeTheme === 'night'
                    ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    : activeTheme === 'forest'
                    ? 'bg-[#314339] hover:bg-[#3a5043] text-white border border-emerald-950/20'
                    : 'bg-[#FAF8F5] border border-[#E9E4DB] hover:bg-[#FAF2EC] text-[#2C2A29]'
                }`}
              >
                <Coffee className={`w-4 h-4 ${bufferActive ? 'text-white' : 'text-current'}`} />
                {bufferActive ? '🌸 Active Decompression Injected (15m)' : 'Inject 15m Coffee Buffer'}
              </button>

              <button
                onClick={onRescheduleTasks}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black transition-all shadow-xs cursor-pointer ${
                  isSketch 
                    ? 'bg-white border-2 border-[#111111] hover:bg-gray-50 text-[#111111]'
                    : activeTheme === 'night'
                    ? 'bg-sky-600 hover:bg-sky-500 text-white'
                    : activeTheme === 'forest'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-[#F2ECE1] hover:bg-[#EBE3D3] text-[#2C2A29]'
                }`}
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
                className={`border p-4 rounded-2xl flex-shrink-0 text-xs leading-relaxed space-y-2.5 ${styles.innerCard}`}
              >
                <h4 className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-current" />
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
          <div className={`${styles.card} flex-shrink-0`}>
            <h3 className="text-sm font-bold flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-4 h-4 text-current" />
              Cognitive Performance Stats
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-2xl text-center ${styles.innerCard}`}>
                <span className="text-[10px] font-bold block mb-1 opacity-70">Peak Capacity</span>
                <span className="text-xl font-black">85%</span>
                <span className="text-[9px] font-medium block mt-1 opacity-80">at {peakHour}</span>
              </div>

              <div className={`p-3 rounded-2xl text-center ${styles.innerCard}`}>
                <span className="text-[10px] font-bold block mb-1 opacity-70">Focus Endurance</span>
                <span className="text-xl font-black">{stats.averageFocusDuration}m</span>
                <span className="text-[9px] font-medium block mt-1 opacity-80">Avg Session</span>
              </div>

              <div className={`p-3 rounded-2xl text-center ${styles.innerCard}`}>
                <span className="text-[10px] font-bold block mb-1 opacity-70">Tasks Completed</span>
                <span className="text-xl font-black">{Math.round(stats.historicalCompletionRate)}%</span>
                <span className="text-[9px] font-bold block mt-1 text-emerald-500">Excellent Flow</span>
              </div>

              <div className={`p-3 rounded-2xl text-center ${styles.innerCard}`}>
                <span className="text-[10px] font-bold block mb-1 opacity-70">Buffer Triggers</span>
                <span className="text-xl font-black text-amber-600">{stats.fatigueCount}</span>
                <span className="text-[9px] font-medium block mt-1 opacity-80">Rescued Today</span>
              </div>
            </div>
          </div>

          {/* Real-time Battery Log Card */}
          <div className={`${styles.card} flex-1 flex flex-col min-h-0`}>
            <h3 className="text-sm font-bold flex items-center gap-1.5 mb-3 flex-shrink-0">
              <Battery className="w-4 h-4 text-emerald-600" />
              Circadian Battery Log
            </h3>

            {/* List scroll container locked */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-0">
              {biologicalLogs.map((log, index) => (
                <div key={index} className={`flex items-start gap-2.5 p-2 rounded-xl text-xs transition-colors hover:shadow-xs border ${styles.innerCard} hover:${activeTheme === 'night' ? 'bg-slate-800/50' : activeTheme === 'forest' ? 'bg-emerald-950/30' : 'bg-white'}`}>
                  <div className="flex-shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5 opacity-60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold truncate">{log.event}</span>
                      <span className="text-[9px] opacity-60 font-mono whitespace-nowrap ml-1">{log.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] opacity-80 truncate">{log.status}</span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm ${
                        log.type === "peak" || log.type === "inc"
                          ? "bg-emerald-100 text-emerald-800"
                          : log.type === "trough"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-800"
                      }`}>
                        {log.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Micro Biological Proactive Check-In Advice */}
            <div className={`p-3 rounded-2xl text-[11px] leading-relaxed mt-4 flex-shrink-0 border ${
              isSketch 
                ? 'bg-[#FAF8F5] border-2 border-dashed border-[#111111] text-[#111111]' 
                : activeTheme === 'night' 
                ? 'bg-slate-800/50 border border-dashed border-slate-700 text-slate-200' 
                : activeTheme === 'forest' 
                ? 'bg-[#2D3F35]/50 border border-dashed border-emerald-900/30 text-emerald-400' 
                : 'bg-[#FAF8EE] border border-dashed border-[#E3DEC9] text-[#8C9A86]'
            }`}>
              <div className="font-bold flex items-center gap-1 mb-1">
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
