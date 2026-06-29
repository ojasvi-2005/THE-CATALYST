import React, { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CompanionMascot } from '../types';
import MascotDrawing from './MascotDrawing';
import InteractiveCompanion from './InteractiveCompanion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Settings,
  Heart,
  ChevronRight,
  Sliders,
  Coffee
} from 'lucide-react';

interface FocusPageProps {
  activeCompanion: CompanionMascot;
  onNavigateToProfile: () => void;
  onRewardXp: (amount: number) => void;
  userName: string;
  activeTheme?: string;
}

export default function FocusPage({
  activeCompanion,
  onNavigateToProfile,
  onRewardXp,
  userName,
  activeTheme = 'minimal'
}: FocusPageProps) {
  // Timer States
  const [isFocusMode, setIsFocusMode] = useState(true);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [isRunning, setIsRunning] = useState(false);
  const [totalDuration, setTotalDuration] = useState(25 * 60);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  // Custom durations state
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [restMinutes, setRestMinutes] = useState(5);

  // Goal & Streak stats
  const [completedSessions, setCompletedSessions] = useState(2);
  const [goalSessions, setGoalSessions] = useState(4);
  const [streakDays, setStreakDays] = useState([
    { label: 'M', completed: true },
    { label: 'T', completed: true },
    { label: 'W', completed: true },
    { label: 'T', completed: true },
    { label: 'F', completed: true },
    { label: 'S', completed: false },
    { label: 'S', completed: false }
  ]);

  // Audio / Completion state
  const [showCelebration, setShowCelebration] = useState(false);

  // Countdown clock effect
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setShowCelebration(true);
      onRewardXp(150); // Reward 150 XP for a finished focus session!
      setCompletedSessions(prev => Math.min(prev + 1, goalSessions));
      
      // Update streak day
      setStreakDays(prev => 
        prev.map((day, idx) => {
          if (idx === 5) { // mock check Saturday / active day
            return { ...day, completed: true };
          }
          return day;
        })
      );
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isRunning, timeLeft]);

  // Switch modes
  const handleModeChange = (focus: boolean) => {
    setIsFocusMode(focus);
    setIsRunning(false);
    const mins = focus ? focusMinutes : restMinutes;
    setTimeLeft(mins * 60);
    setTotalDuration(mins * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    const mins = isFocusMode ? focusMinutes : restMinutes;
    setTimeLeft(mins * 60);
  };

  const handleApplyCustomTimes = (e: React.FormEvent) => {
    e.preventDefault();
    handleReset();
    const mins = isFocusMode ? focusMinutes : restMinutes;
    setTimeLeft(mins * 60);
    setTotalDuration(mins * 60);
    setShowConfigDrawer(false);
  };

  // Convert seconds to format
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Calculate circular stroke offset
  const progressPercent = (timeLeft / totalDuration) * 100;
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const isSketch = activeTheme === 'sketch';

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
      ? "border-2 border-[#111111] rounded-2xl bg-white p-4 shadow-[3px_3px_0px_0px_rgba(17,17,17,1)]"
      : activeTheme === 'night'
      ? "border border-slate-800 rounded-3xl bg-[#1B1E2E] p-5 shadow-sm text-[#ECEEF5]"
      : activeTheme === 'forest'
      ? "border border-emerald-950/20 rounded-3xl bg-[#233029] p-5 shadow-sm text-[#ECF2EF]"
      : activeTheme === 'lavender'
      ? "border border-[#E9E4EB] rounded-3xl bg-white p-5 shadow-sm text-[#3D3A45]"
      : "border border-[#E9E4DB] rounded-3xl bg-white p-5 shadow-xs text-[#2C2A29]", // minimal
    button: isSketch
      ? "border-2 border-[#111111] rounded-xl bg-white shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] text-[#111111]"
      : activeTheme === 'night'
      ? "border border-slate-800 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white shadow-xs"
      : activeTheme === 'forest'
      ? "border border-emerald-950/40 rounded-2xl bg-[#314339] hover:bg-[#3a5043] text-white shadow-xs"
      : activeTheme === 'lavender'
      ? "border border-[#E9E4EB] rounded-2xl bg-[#F3EEFA] hover:bg-[#eadef7] text-[#635B8F] shadow-xs"
      : "border border-[#E9E4DB] rounded-2xl bg-white hover:bg-[#FAF8F5] text-[#5D5750] shadow-xs", // minimal
    buttonActive: isSketch
      ? "border-2 border-[#111111] rounded-xl bg-[#111111] text-white shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]"
      : activeTheme === 'night'
      ? "rounded-2xl bg-sky-500 text-white shadow-md hover:bg-sky-400"
      : activeTheme === 'forest'
      ? "rounded-2xl bg-emerald-600 text-white shadow-md hover:bg-emerald-500"
      : activeTheme === 'lavender'
      ? "rounded-2xl bg-[#8B7EC2] text-white shadow-md hover:bg-[#7b6db5]"
      : "rounded-2xl bg-[#8C9A86] text-white shadow-md hover:bg-[#778671]", // minimal
    badge: isSketch
      ? "border-2 border-[#111111] rounded-xl bg-white text-[#111111]"
      : activeTheme === 'night'
      ? "rounded-xl bg-slate-800 text-slate-300 border border-slate-700"
      : activeTheme === 'forest'
      ? "rounded-xl bg-emerald-950/20 text-emerald-300 border border-emerald-900/30"
      : activeTheme === 'lavender'
      ? "rounded-xl bg-[#F3EEFA] text-[#635B8F] border border-[#E2DAF2]"
      : "rounded-xl bg-[#FAF8F5] text-[#5D5750] border border-[#E9E4DB]", // minimal
    innerCard: isSketch
      ? "bg-white border-2 border-[#111111]"
      : activeTheme === 'night'
      ? "bg-[#242A3E] border border-slate-700 text-white"
      : activeTheme === 'forest'
      ? "bg-[#2D3F35] border border-emerald-900/30 text-[#ECF2EF]"
      : activeTheme === 'lavender'
      ? "bg-white border border-[#E9E4EB] text-[#3D3A45]"
      : "bg-white border border-[#E9E4DB] text-[#2C2A29]",
    innerBg: isSketch
      ? "bg-gray-50"
      : activeTheme === 'night'
      ? "bg-[#181B28]"
      : activeTheme === 'forest'
      ? "bg-[#1C2822]"
      : "bg-[#FAF8F5]",
    iconBg: isSketch
      ? "bg-white text-[#111111]"
      : activeTheme === 'night'
      ? "bg-slate-800 text-white border border-slate-700"
      : activeTheme === 'forest'
      ? "bg-[#314339] text-[#ECF2EF]"
      : "bg-white border border-[#E9E4DB]",
    input: isSketch
      ? "bg-white border-2 border-[#111111] rounded-xl px-2.5 py-1.5 focus:outline-none focus:bg-gray-50"
      : activeTheme === 'night'
      ? "bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-sky-500 text-white"
      : activeTheme === 'forest'
      ? "bg-emerald-950/40 border border-emerald-900/40 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 text-white"
      : activeTheme === 'lavender'
      ? "bg-[#FAF8FC] border border-[#D1BEE3] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#8B7EC2] text-[#3D3A45]"
      : "bg-white border border-[#E2DCCE] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#8C9A86] text-[#2C2A29]" // minimal
  };

  const textPrimary = isSketch ? "text-[#111111]" : "text-current";
  const textSecondary = isSketch ? "text-[#555555]" : "opacity-80";

  return (
    <div id="focus-page-workspace" className={`h-full w-full overflow-y-auto pb-8 pr-1 space-y-5 select-none ${styles.container}`}>
      
      {/* 1. Header with Settings Cog */}
      <div className={`flex items-center justify-between ${isSketch ? 'border-2 border-[#111111] rounded-2xl bg-white p-4 shadow-[3px_3px_0px_0px_rgba(17,17,17,1)]' : styles.card} shrink-0`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${isSketch ? 'border-2 border-[#111111] rounded-xl bg-white shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]' : 'rounded-2xl'} ${styles.iconBg} flex items-center justify-center`}>
            <Clock className="w-5 h-5 text-current" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider">Focus Room</h2>
            <p className="text-xs font-bold opacity-80">Workspace Buddy</p>
          </div>
        </div>

        <button 
          onClick={() => setShowConfigDrawer(!showConfigDrawer)}
          className={`w-10 h-10 ${isSketch ? 'border-2 border-[#111111] rounded-xl bg-white shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] active:translate-y-0.5 active:shadow-none' : 'rounded-2xl'} ${styles.iconBg} flex items-center justify-center cursor-pointer transition-all`}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Adjust Timers Drawer */}
      <AnimatePresence>
        {showConfigDrawer && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleApplyCustomTimes}
            className={`${isSketch ? 'border-2 border-[#111111] rounded-2xl bg-[#FAF8F5] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]' : 'border border-[#E9E4DB] rounded-3xl bg-[#FAF8F5]'} p-5 space-y-3 overflow-hidden`}
          >
            <div className="text-xs font-black uppercase border-b pb-1 border-current">Adjust Session Lengths</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-current opacity-70">Focus Block (Mins)</label>
                <input 
                  type="number" 
                  value={focusMinutes}
                  onChange={e => setFocusMinutes(Math.max(1, Number(e.target.value)))}
                  min={1} 
                  required
                  className={styles.input + " w-full"}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-current opacity-70">Rest Buffer (Mins)</label>
                <input 
                  type="number" 
                  value={restMinutes}
                  onChange={e => setRestMinutes(Math.max(1, Number(e.target.value)))}
                  min={1} 
                  required
                  className={styles.input + " w-full"}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button 
                type="button"
                onClick={() => setShowConfigDrawer(false)}
                className="text-xs font-bold border border-gray-400 px-3 py-1 bg-white hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className={`text-xs font-black px-4 py-1.5 rounded-xl cursor-pointer ${isSketch ? 'border-2 border-[#111111] bg-[#111111] text-white hover:bg-gray-800' : 'bg-[#8C9A86] text-white hover:bg-[#778671]'}`}
              >
                Apply
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Main Grid: Left Side Timer Columns & Right Side Companion Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left column (col-span-7) */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          
          {/* 2. Cozy Sleeping Companion Card */}
          <div className={`${styles.card} flex items-center justify-between gap-4`}>
            <div className="flex items-center gap-3">
              {isSketch ? (
                <MascotDrawing pose="sleeping" size={85} className="shrink-0" />
              ) : (
                <InteractiveCompanion companion={activeCompanion} mood="sleepy" size="sm" className="shrink-0" />
              )}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">
                  Your companion is here
                </h4>
                <p className="text-[10px] opacity-80 font-bold">
                  Snug, warm, and resting softly alongside your workspace.
                </p>
              </div>
            </div>
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse shrink-0" />
          </div>

          {/* 3. Focus / Rest Timer Switch + Majestic Countdown Core */}
          <div className={`${isSketch ? 'border-2 border-[#111111] rounded-3xl p-6 bg-white shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]' : styles.card} flex flex-col items-center justify-center space-y-6 flex-1 min-h-[320px]`}>
            
            {/* Pill mode selector switch */}
            <div className={`flex ${isSketch ? 'border-2 border-[#111111] bg-[#FAF8F5]' : `border ${activeTheme === 'night' ? 'border-slate-700 bg-[#181B28]' : activeTheme === 'forest' ? 'border-emerald-900/30 bg-[#1C2822]' : 'border-[#E9E4DB] bg-[#FAF8F5]'}`} p-1 rounded-full max-w-xs w-full`}>
              <button
                onClick={() => handleModeChange(true)}
                className={`flex-1 text-xs font-black py-2 px-4 rounded-full transition-all cursor-pointer ${
                  isFocusMode 
                    ? isSketch 
                      ? 'bg-[#111111] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]'
                      : styles.buttonActive
                    : 'text-current opacity-70 hover:opacity-100'
                }`}
              >
                Focus Block
              </button>
              <button
                onClick={() => handleModeChange(false)}
                className={`flex-1 text-xs font-black py-2 px-4 rounded-full transition-all cursor-pointer ${
                  !isFocusMode 
                    ? isSketch
                      ? 'bg-[#111111] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]'
                      : styles.buttonActive
                    : 'text-current opacity-70 hover:opacity-100'
                }`}
              >
                Rest Buffer
              </button>
            </div>

            {/* Countdown timer circle display */}
            <div className="relative w-48 h-48 md:w-52 md:h-52 flex items-center justify-center">
              {/* Thick solid outline circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  className="stroke-[#EBE7DF]"
                  strokeWidth="6"
                  fill="transparent"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  className={isSketch ? "stroke-[#111111]" : "stroke-[#8C9A86]"}
                  strokeWidth="6.5"
                  fill="transparent"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  strokeLinecap="round"
                />
              </svg>

              {/* Central text details */}
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
                <span className="text-4xl md:text-5xl font-black tracking-tighter">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-80">
                  {isFocusMode ? 'Focus Time' : 'Resting'}
                </span>

                {/* Tiny circular play overlay button inside timer circle */}
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`mt-2 w-8 h-8 rounded-full ${isSketch ? 'border-2 border-[#111111] bg-white shadow-[1px_1px_0px_0px_rgba(17,17,17,1)] active:translate-y-0.5 active:shadow-none' : activeTheme === 'night' ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-white' : activeTheme === 'forest' ? 'border-emerald-950/20 bg-[#314339] hover:bg-[#3a5043] text-white' : 'border-[#E9E4DB] bg-white hover:bg-[#FAF8F5] text-slate-700'} flex items-center justify-center cursor-pointer`}
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                </button>
              </div>
            </div>

            {/* Action buttons list */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleReset}
                title="Reset session"
                className={`p-3 ${isSketch ? 'border-2 border-[#111111] bg-white shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] active:translate-y-0.5 active:shadow-none' : activeTheme === 'night' ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-white rounded-full' : activeTheme === 'forest' ? 'border-emerald-950/20 bg-[#314339] hover:bg-[#3a5043] text-white rounded-full' : 'border-[#E9E4DB] bg-white hover:bg-[#FAF8F5] text-slate-700 rounded-full'} cursor-pointer`}
              >
                <RotateCcw className="w-4.5 h-4.5" />
              </button>

              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center gap-2 text-xs font-black py-3 px-8 rounded-full cursor-pointer transition-all ${
                  isSketch 
                    ? 'border-2 border-[#111111] bg-[#111111] text-white shadow-[3px_3px_0px_0px_rgba(85,85,85,0.4)] active:translate-y-0.5 active:shadow-none' 
                    : styles.buttonActive
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 text-white fill-white" /> Pause session
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-white fill-white" /> Resume focus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (col-span-5) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          
          {/* 4. Active Studying Companion Bubble */}
          <div className="flex items-center gap-3">
            <div className={`flex-1 border-2 p-4 relative shadow-sm ${
              isSketch 
                ? 'border-[#111111] bg-white rounded-2xl' 
                : activeTheme === 'night'
                ? 'border-slate-700 bg-[#242A3E] rounded-3xl text-slate-200'
                : activeTheme === 'forest'
                ? 'border-emerald-900/30 bg-[#2D3F35] rounded-3xl text-[#ECF2EF]'
                : 'border-[#E9E4DB] bg-white rounded-3xl text-[#2C2A29]'
            }`}>
              {/* Dialogue Bubble Tail */}
              {isSketch ? (
                <>
                  <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-l-[10px] border-l-[#111111] border-b-[8px] border-b-transparent" />
                  <div className="absolute right-[-7px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[7px] border-t-transparent border-l-[9px] border-l-white border-b-[7px] border-b-transparent" />
                </>
              ) : (
                <div className={`absolute right-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] ${
                  activeTheme === 'night' 
                    ? 'border-l-[#242A3E] filter drop-shadow-[1px_0_0_#334155]' 
                    : activeTheme === 'forest' 
                    ? 'border-l-[#2D3F35] filter drop-shadow-[1px_0_0_#064e3b]' 
                    : 'border-l-white filter drop-shadow-[1px_0_0_#E9E4DB]'
                }`} />
              )}
              
              <div className="space-y-0.5 text-left">
                <span className="text-[9px] font-black uppercase tracking-wider opacity-75">
                  Companion {activeCompanion.name}
                </span>
                <p className={`text-xs font-bold leading-normal italic ${
                  isSketch 
                    ? 'text-[#111111]' 
                    : activeTheme === 'night' 
                    ? 'text-white' 
                    : activeTheme === 'forest' 
                    ? 'text-[#ECF2EF]' 
                    : 'text-[#111111]'
                }`}>
                  "You've got this! I'm right here with you."
                </p>
              </div>
            </div>

            <div className="w-24 h-24 shrink-0 flex items-center justify-center">
              {isSketch ? (
                <MascotDrawing pose="studying" size={100} />
              ) : (
                <InteractiveCompanion companion={activeCompanion} mood={isRunning ? 'chatting' : 'idle'} size="sm" />
              )}
            </div>
          </div>

          {/* 5. Today's Focus Goal */}
          <div className={`${isSketch ? 'border-2 border-[#111111] rounded-3xl shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] bg-white' : styles.card} p-5 flex items-center justify-between gap-4`}>
            <div className="space-y-3 flex-1 text-left">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">
                  Today's Focus Goal
                </h4>
                <p className="text-[10px] opacity-80 font-bold">
                  {completedSessions} / {goalSessions} sessions completed
                </p>
              </div>

              {/* Linear outline progress bar */}
              <div className={`w-full h-3 ${isSketch ? 'bg-white border-2 border-[#111111]' : activeTheme === 'night' ? 'bg-[#181B28] border border-slate-700' : activeTheme === 'forest' ? 'bg-[#1A251F] border border-emerald-950/20' : 'bg-white border border-[#E9E4DB]'} rounded-full overflow-hidden p-0.5`}>
                <div 
                  className={`h-full ${isSketch ? 'bg-[#111111]' : 'bg-[#8C9A86]'} rounded-full transition-all duration-500`} 
                  style={{ width: `${(completedSessions / goalSessions) * 100}%` }}
                />
              </div>
            </div>

            {isSketch && <MascotDrawing pose="flag" size={70} className="shrink-0" />}
          </div>

          {/* 6. Focus Streak Tracker */}
          <div className={`${isSketch ? 'border-2 border-[#111111] rounded-3xl bg-white shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]' : styles.card} p-5 flex items-center justify-between gap-4 flex-1`}>
            <div className="space-y-3 flex-1 text-left">
              <div className="flex items-center justify-between pr-2">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider">
                    Focus Streak
                  </h4>
                  <p className="text-[10px] opacity-80 font-bold">
                    Consistency beats intensity
                  </p>
                </div>
                <span className="text-xs font-black text-amber-600 flex items-center gap-1">
                  <Flame className="w-4 h-4 fill-amber-500 stroke-amber-500 animate-bounce" /> 7 days
                </span>
              </div>

              {/* Day dots checklist row */}
              <div className="flex gap-1.5 justify-start">
                {streakDays.map((day, idx) => (
                  <div key={idx} className="space-y-1 text-center flex-1">
                    <span className="text-[9px] font-black opacity-70 block">{day.label}</span>
                    <div 
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                        day.completed 
                          ? isSketch 
                            ? 'bg-[#111111] border-[#111111] text-white text-[10px] font-black' 
                            : 'bg-[#8C9A86] border-[#8C9A86] text-white text-[10px] font-black'
                          : isSketch 
                          ? 'bg-white border-[#111111] text-transparent'
                          : activeTheme === 'night'
                          ? 'bg-[#181B28] border-slate-700 text-transparent'
                          : activeTheme === 'forest'
                          ? 'bg-[#1C2822] border-emerald-950/20 text-transparent'
                          : 'bg-white border-[#E9E4DB] text-transparent'
                      }`}
                    >
                      ✓
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isSketch && <MascotDrawing pose="dancing" size={70} className="shrink-0" />}
          </div>
        </div>
      </div>

      {/* Completion alert prompt overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`${isSketch ? 'border-3 border-[#111111] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] bg-white text-[#111111]' : activeTheme === 'night' ? 'border border-slate-700 bg-[#1B1E2E] shadow-lg text-white' : activeTheme === 'forest' ? 'border border-emerald-950/20 bg-[#233029] shadow-lg text-white' : 'border border-[#E9E4DB] bg-white shadow-lg text-[#2C2A29]'} rounded-3xl p-6 max-w-sm w-full text-center space-y-4`}
            >
              <div className={`w-20 h-20 mx-auto rounded-full ${isSketch ? 'bg-white border-2 border-[#111111] text-[#111111]' : activeTheme === 'night' ? 'bg-slate-800 border border-slate-700 text-sky-400' : activeTheme === 'forest' ? 'bg-[#2D3F35] border border-emerald-900/30 text-emerald-400' : 'bg-emerald-50 border border-emerald-100 text-emerald-600'} flex items-center justify-center`}>
                <Sparkles className="w-10 h-10 animate-pulse text-current" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black uppercase tracking-wide">Flow completed! 🎉</h3>
                <p className="text-xs opacity-80 font-bold">
                  Beautiful work {userName}! You successfully finished your focus block.
                </p>
              </div>

              <div className={`p-3 rounded-2xl text-xs font-black ${isSketch ? 'bg-[#FAF8F5] border-2 border-dashed border-[#111111] text-[#111111]' : activeTheme === 'night' ? 'bg-slate-800/50 border border-dashed border-slate-700 text-sky-400' : activeTheme === 'forest' ? 'bg-[#2D3F35]/50 border border-dashed border-emerald-900/30 text-emerald-400' : 'bg-[#FAF8EE] border border-dashed border-[#E3DEC9] text-[#8C9A86]'}`}>
                🐾 Buddy rewarded you +150 Companion Bond XP!
              </div>

              <button
                onClick={() => setShowCelebration(false)}
                className={`w-full py-2.5 font-black rounded-2xl text-xs cursor-pointer transition-all ${isSketch ? 'bg-[#111111] text-white border-2 border-[#111111] hover:bg-gray-800' : 'bg-[#8C9A86] text-white hover:bg-[#778671]'}`}
              >
                Close & Energize
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
