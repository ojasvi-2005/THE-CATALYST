import { useState } from 'react';
import { motion } from 'motion/react';
import { EnergyDataPoint } from '../types';
import { 
  Shield, 
  Activity, 
  Coffee, 
  Sun, 
  Moon, 
  Sparkles, 
  PlusCircle, 
  Zap,
  Info
} from 'lucide-react';

interface EnergyWaveProps {
  energyWave: EnergyDataPoint[];
  fatigueLevel: 'low' | 'moderate' | 'critical';
  onInjectBuffer: () => void;
  bufferActive: boolean;
  onRescheduleTasks: () => void;
}

export default function EnergyWave({
  energyWave,
  fatigueLevel,
  onInjectBuffer,
  bufferActive,
  onRescheduleTasks
}: EnergyWaveProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  // SVG dimensions
  const width = 500;
  const height = 150;
  const padding = 25;

  // Build SVG path for biological energy wave
  const points = energyWave.map((pt) => {
    const x = padding + (pt.hour / 23) * (width - padding * 2);
    const y = height - padding - (pt.score / 100) * (height - padding * 2);
    return `${x},${y}`;
  });
  const pathData = `M ${points.join(' L ')}`;

  // Find peak performance window
  const peakPoint = [...energyWave].sort((a, b) => b.score - a.score)[0];
  const peakHour = peakPoint ? `${peakPoint.hour}:00` : '15:00';

  // Current hour marker (mocking current time index)
  const currentHour = 14; // e.g., 2:00 PM
  const currentEnergyScore = energyWave.find(p => p.hour === currentHour)?.score || 60;
  const currentX = padding + (currentHour / 23) * (width - padding * 2);
  const currentY = height - padding - (currentEnergyScore / 100) * (height - padding * 2);

  return (
    <div className="bg-[#FFFDF9] border border-[#E9E4DB] rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-xl font-bold text-[#2C2A29] tracking-tight">Circadian Energy Wave</h2>
            <button 
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-[#8C867E] hover:text-[#2C2A29] cursor-pointer"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[#5D5750]">Biological tracking against cognitive capacity & fatigue</p>
        </div>

        {/* Empathy Shield status flag */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
            fatigueLevel === 'critical' 
              ? 'bg-rose-100 text-rose-800 border border-rose-200' 
              : fatigueLevel === 'moderate'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
          }`}>
            <Shield className="w-3.5 h-3.5" />
            {fatigueLevel} Fatigue
          </span>
        </div>
      </div>

      {showExplanation && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-xs bg-[#FAF8F5] border border-[#E9E4DB] p-4 rounded-2xl leading-relaxed text-[#5D5750] space-y-2"
        >
          <p>
            <strong>The Empathy Shield Protocol:</strong> Rather than viewing your day as a flat machine timeline, Catalyst AI models your cognitive performance as a continuous wave. 
          </p>
          <p>
            When we detect high stress or back-to-back blocks, Biscuit injects a <strong>Decompression Buffer</strong>, shifting complex tasks to your peak performance window (currently around <strong className="text-indigo-700">{peakHour}</strong>).
          </p>
        </motion.div>
      )}

      {/* SVG Energy wave visualizer */}
      <div className="relative bg-[#FAF9F5] border border-[#E9E4DB] rounded-2xl p-4 overflow-hidden">
        <div className="absolute top-2 left-3 flex items-center gap-1 text-[10px] text-[#8C867E] font-semibold">
          <Activity className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          Predicted Battery Status
        </div>
        
        <div className="absolute top-2 right-3 flex items-center gap-1.5 text-[10px] text-[#8C867E]">
          <span className="flex items-center gap-1"><Sun className="w-3 h-3 text-amber-500" /> Morning Peak</span>
          <span className="flex items-center gap-1"><Moon className="w-3 h-3 text-indigo-500" /> Night Valley</span>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto mt-4 overflow-visible">
          {/* Grid lines */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E2DCCE" strokeDasharray="3 3" />
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#E2DCCE" strokeDasharray="3 3" />

          {/* Area fill under curve */}
          <path
            d={`${pathData} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`}
            fill="url(#energyGradient)"
            opacity="0.12"
          />

          {/* Core Sine Path */}
          <path
            d={pathData}
            fill="none"
            stroke="#8C9A86"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8C9A86" />
              <stop offset="100%" stopColor="#FAF9F5" />
            </linearGradient>
          </defs>

          {/* Current location marker */}
          <circle cx={currentX} cy={currentY} r="7" fill="#E8A99A" stroke="white" strokeWidth="2" className="animate-bounce" />
          <text x={currentX + 10} y={currentY - 10} className="text-[10px] font-bold fill-[#2C2A29]">
            You (14:00 - {currentEnergyScore}%)
          </text>
        </svg>

        {/* X-Axis hours labels */}
        <div className="flex justify-between px-3 text-[9px] text-[#8C867E] font-bold tracking-wider mt-1">
          <span>00:00 (Rest)</span>
          <span>08:00 (Ascent)</span>
          <span>14:00 (Peak)</span>
          <span>20:00 (Descent)</span>
        </div>
      </div>

      {/* Control Actions / Decompression Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onInjectBuffer}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
            bufferActive 
              ? 'bg-[#E8A99A] hover:bg-[#DFA091] text-white' 
              : 'bg-[#FAF8F5] border border-[#E9E4DB] hover:bg-[#FAF0E6] text-[#2C2A29] hover:border-[#DFD6C4]'
          }`}
        >
          <Coffee className={`w-4 h-4 ${bufferActive ? 'animate-bounce text-white' : 'text-[#8C9A86]'}`} />
          {bufferActive ? '[🌸 Decompression Active (15m)]' : 'Inject 15m Buffer'}
        </button>

        <button
          onClick={onRescheduleTasks}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-[#F2ECE1] hover:bg-[#EBE3D3] text-[#2C2A29] rounded-2xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
        >
          <Zap className="w-4 h-4 text-amber-500" />
          Align Schedule ({peakHour})
        </button>
      </div>
    </div>
  );
}
