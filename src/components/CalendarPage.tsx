import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, CompanionMascot, CalendarEvent } from '../types';
import MascotDrawing from './MascotDrawing';
import InteractiveCompanion from './InteractiveCompanion';
import { 
  Plus, 
  Menu, 
  Bell, 
  Trash2, 
  Clock, 
  Battery, 
  ChevronRight, 
  ChevronLeft,
  Sparkles, 
  Heart, 
  Gift, 
  Coffee,
  CheckCircle,
  X,
  Workflow,
  Calendar as CalendarIcon
} from 'lucide-react';

interface CalendarPageProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (task: Partial<Task>) => void;
  onDeconstructTask: (taskId: string) => Promise<void>;
  deconstructLoadingId: string | null;
  onRAGLaunch: (task: Task) => void;
  activeCompanion: CompanionMascot;
  companionXp: number;
  userName: string;
  activeTheme?: string;
}

export default function CalendarPage({
  tasks,
  onToggleTask,
  onToggleSubtask,
  onDeleteTask,
  onAddTask,
  onDeconstructTask,
  deconstructLoadingId,
  onRAGLaunch,
  activeCompanion,
  companionXp,
  userName,
  activeTheme = 'minimal'
}: CalendarPageProps) {
  // Dynamic month/year navigation states
  const [currentDate, setCurrentDate] = useState(() => new Date(2025, 4, 12)); // Defaults to May 12, 2025 to align with mock events
  const [selectedDay, setSelectedDay] = useState<number>(12); // Selected day of month
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  // Task Form inputs
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDuration, setTaskDuration] = useState(30);
  const [taskEnergy, setTaskEnergy] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskTime, setTaskTime] = useState('10:00');

  // Event form inputs
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<'birthday' | 'anniversary' | 'reminder'>('reminder');
  const [eventDate, setEventDate] = useState('2025-05-12');

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    { id: 'ev-1', title: `${userName}'s Birthday 🎂`, date: '2025-05-08', type: 'birthday' },
    { id: 'ev-2', title: "Team Anniversary 🎉", date: '2025-05-17', type: 'anniversary' },
    { id: 'ev-3', title: "Project Milestones Check ⚡", date: '2025-05-24', type: 'reminder' },
    { id: 'ev-4', title: "Mom's Birthday 🌸", date: '2025-05-15', type: 'birthday' }
  ]);

  useEffect(() => {
    setCalendarEvents(prev => prev.map(ev => {
      if (ev.id === 'ev-1') {
        return { ...ev, title: `${userName}'s Birthday 🎂` };
      }
      return ev;
    }));
  }, [userName]);

  // Derived Month Info
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = new Date(year, month, 1).getDay(); // Sunday=0, Monday=1...

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthLabel = `${monthNames[month]} ${year}`;

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const year = prev.getFullYear();
      const month = prev.getMonth();
      return new Date(year, month - 1, 1);
    });
    setSelectedDay(1); // Reset selected day to 1st of month
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const year = prev.getFullYear();
      const month = prev.getMonth();
      return new Date(year, month + 1, 1);
    });
    setSelectedDay(1); // Reset selected day to 1st of month
  };

  const handleAddTaskSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    onAddTask({
      title: taskTitle,
      description: taskDesc || 'Desk task',
      duration: taskDuration,
      energyCost: taskEnergy,
      scheduledTime: taskTime || undefined,
      status: 'pending'
    });

    setTaskTitle('');
    setTaskDesc('');
    setTaskDuration(30);
    setTaskEnergy('medium');
    setShowAddForm(false);
  };

  const handleAddEventSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newEv: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title: eventTitle,
      date: eventDate,
      type: eventType
    };

    setCalendarEvents(prev => [...prev, newEv]);
    setEventTitle('');
    setShowEventForm(false);
  };

  const getEventsForDay = (dayNum: number) => {
    const yStr = year.toString();
    const mStr = (month + 1).toString().padStart(2, '0');
    const dStr = dayNum.toString().padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dStr}`;
    return calendarEvents.filter(ev => ev.date === dateStr);
  };

  const toggleExpandTask = (taskId: string) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

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
    input: isSketch
      ? "bg-white border-2 border-[#111111] rounded-xl px-2.5 py-1.5 focus:outline-none focus:bg-gray-50 text-[#111111]"
      : activeTheme === 'night'
      ? "bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-sky-500 text-white"
      : activeTheme === 'forest'
      ? "bg-emerald-950/40 border border-emerald-900/40 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 text-white"
      : activeTheme === 'lavender'
      ? "bg-[#FAF8FC] border border-[#D1BEE3] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#8B7EC2] text-[#3D3A45]"
      : "bg-white border border-[#E2DCCE] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#8C9A86] text-[#2C2A29]" // minimal
  };

  const dayOfWeekNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayOfWeek = dayOfWeekNames[new Date(year, month, selectedDay).getDay()];

  return (
    <div id="calendar-page-workspace" className={`h-full w-full overflow-y-auto pb-8 pr-1 space-y-5 select-none ${styles.container}`}>
      
      {/* Dynamic Header */}
      <div className={`${isSketch ? 'border-2 border-[#111111] rounded-2xl bg-white p-4 shadow-[3px_3px_0px_0px_rgba(17,17,17,1)]' : styles.card} flex items-center justify-between shrink-0`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${isSketch ? 'border-2 border-[#111111] rounded-xl' : 'rounded-2xl border border-[#E9E4DB]'} bg-white flex items-center justify-center font-bold text-lg shadow-xs`}>
            <CalendarIcon className="w-5 h-5 text-current" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider">{monthNames[month]} {selectedDay}, {year}</h2>
            <p className="text-xs font-bold opacity-80">{currentDayOfWeek}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              const yStr = year.toString();
              const mStr = (month + 1).toString().padStart(2, '0');
              const dStr = selectedDay.toString().padStart(2, '0');
              setEventDate(`${yStr}-${mStr}-${dStr}`);
              setShowEventForm(!showEventForm);
            }}
            className={`text-xs font-black py-1.5 px-4 rounded-full flex items-center gap-1 cursor-pointer transition-all ${isSketch ? 'border-2 border-[#111111] bg-white shadow-[2px_2px_0px_0px_rgba(17,17,17,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none' : styles.button}`}
          >
            <Plus className="w-3.5 h-3.5" /> Event
          </button>
          <div className={`w-10 h-10 ${isSketch ? 'border-2 border-[#111111] rounded-xl' : 'rounded-2xl border border-[#E9E4DB]'} bg-white flex items-center justify-center cursor-pointer shadow-xs`}>
            <Bell className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Layout (Agenda Split View) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Calendar (col-span-6) */}
            <div className="lg:col-span-6 space-y-4">
              <div className={`${isSketch ? 'border-2 border-[#111111] rounded-3xl p-5 bg-white shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]' : styles.card} space-y-4`}>
                
                {/* Header Month Switcher */}
                <div className={`flex items-center justify-between border-b-2 border-dashed pb-2 ${isSketch ? 'border-[#111111]' : 'border-gray-200'}`}>
                  <button 
                    onClick={handlePrevMonth}
                    className={`w-7 h-7 border-2 font-black text-xs flex items-center justify-center hover:bg-gray-100 transition-colors ${isSketch ? 'border-[#111111] rounded-lg bg-white' : 'border-[#E9E4DB] rounded-lg bg-white'}`}
                  >
                    &lt;
                  </button>
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    {monthLabel}
                  </h3>
                  <button 
                    onClick={handleNextMonth}
                    className={`w-7 h-7 border-2 font-black text-xs flex items-center justify-center hover:bg-gray-100 transition-colors ${isSketch ? 'border-[#111111] rounded-lg bg-white' : 'border-[#E9E4DB] rounded-lg bg-white'}`}
                  >
                    &gt;
                  </button>
                </div>

                {/* Event Form Drawer */}
                <AnimatePresence>
                  {showEventForm && (
                    <motion.form 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleAddEventSubmit}
                      className={`border-2 rounded-2xl p-4 bg-[#FAF8F5] space-y-3 overflow-hidden ${isSketch ? 'border-[#111111]' : 'border-[#E9E4DB]'}`}
                    >
                      <div className="text-xs font-black uppercase border-b pb-1">Create Calendar Event</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-gray-500">Title</label>
                          <input 
                            type="text" 
                            value={eventTitle}
                            onChange={e => setEventTitle(e.target.value)}
                            placeholder="e.g. Work Sync" 
                            required
                            className={styles.input + " w-full text-xs"}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-gray-500">Type</label>
                          <select 
                            value={eventType}
                            onChange={e => setEventType(e.target.value as any)}
                            className={styles.input + " w-full text-xs font-bold"}
                          >
                            <option value="reminder">🎁 Reminder</option>
                            <option value="birthday">🎂 Birthday</option>
                            <option value="anniversary">💖 Anniversary</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-gray-500">Date</label>
                          <input 
                            type="date" 
                            value={eventDate}
                            onChange={e => setEventDate(e.target.value)}
                            className={styles.input + " w-full text-xs font-bold"}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button 
                          type="button" 
                          onClick={() => setShowEventForm(false)}
                          className="text-xs font-bold border border-gray-400 px-3 py-1 bg-white hover:bg-gray-100 rounded-lg cursor-pointer text-[#111111]"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className={`text-xs font-black px-3 py-1 rounded-lg cursor-pointer ${isSketch ? 'border-2 border-[#111111] bg-[#111111] text-white hover:bg-gray-800' : 'bg-[#8C9A86] text-white hover:bg-[#778671]'}`}
                        >
                          Add Event
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Days Grid */}
                <div className="space-y-1">
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-gray-500 uppercase tracking-wider py-1">
                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {/* Offset blanks */}
                    {Array.from({ length: startOffset }).map((_, i) => (
                      <div key={`blank-${i}`} className={`h-10 rounded-xl border border-transparent ${isSketch ? 'bg-gray-50' : 'bg-[#FAF8F5]/40'}`} />
                    ))}

                    {/* Actual days */}
                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const isSelected = selectedDay === dayNum;
                      const dayEvents = getEventsForDay(dayNum);
                      const hasBirthday = dayEvents.some(e => e.type === 'birthday');
                      const hasAnniversary = dayEvents.some(e => e.type === 'anniversary');
                      const hasReminder = dayEvents.some(e => e.type === 'reminder');

                      return (
                        <div
                          key={`day-${dayNum}`}
                          onClick={() => setSelectedDay(dayNum)}
                          className={`h-11 rounded-xl border flex flex-col justify-between p-1 cursor-pointer transition-all ${
                            isSelected 
                              ? isSketch 
                                ? 'bg-[#111111] border-[#111111] text-white font-black shadow-[2px_2px_0px_0px_rgba(85,85,85,0.4)] scale-98' 
                                : 'bg-[#8C9A86] border-[#8C9A86] text-white font-black scale-98 shadow-sm'
                              : isSketch
                              ? 'bg-white border-[#111111] hover:bg-gray-50 text-[#111111] font-bold'
                              : 'bg-white border-[#E9E4DB] hover:bg-[#FAF8F5] text-current font-bold'
                          }`}
                        >
                          <span className="text-[10px]">{dayNum}</span>
                          <div className="flex gap-0.5 justify-end">
                            {hasBirthday && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-pink-500'}`} title="Birthday" />}
                            {hasAnniversary && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-500'}`} title="Anniversary" />}
                            {hasReminder && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-sky-500'}`} title="Reminder" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend strip */}
                <div className={`flex items-center gap-4 justify-center text-[10px] font-black text-gray-500 pt-2 border-t border-dashed ${isSketch ? 'border-[#111111]' : 'border-gray-200'}`}>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500 block border border-white" /> Birthday
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block border border-white" /> Anniversary
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 block border border-white" /> Reminder
                  </span>
                </div>
              </div>

              {/* Agenda Details Card */}
              {selectedDay && (
                <div className={`${isSketch ? 'border-2 border-[#111111] rounded-2xl bg-white shadow-[3px_3px_0px_0px_rgba(17,17,17,1)]' : styles.card} p-4 space-y-2 text-left`}>
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    Events Scheduled on {monthNames[month]} {selectedDay}, {year}
                  </h4>
                  {getEventsForDay(selectedDay).length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No custom events scheduled. Start checking off your desk checklists!</p>
                  ) : (
                    <div className="space-y-1.5">
                      {getEventsForDay(selectedDay).map(ev => (
                        <div key={ev.id} className={`flex items-center justify-between border rounded-xl px-3 py-2 text-xs bg-[#FAF8F5] ${isSketch ? 'border-[#111111]' : 'border-[#E9E4DB]'}`}>
                          <div className="flex items-center gap-2">
                            {ev.type === 'birthday' && <Gift className="w-4 h-4 text-pink-500" />}
                            {ev.type === 'anniversary' && <Heart className="w-4 h-4 text-amber-500" />}
                            {ev.type === 'reminder' && <Coffee className="w-4 h-4 text-sky-500" />}
                            <span className="font-bold">{ev.title}</span>
                          </div>
                          <span className="text-[9px] font-black text-gray-500 uppercase">{ev.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Companion bubble & Checklist (col-span-6) */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Mascot Bubble */}
              <div className="flex items-center gap-3">
                <div className={`flex-1 bg-white border-2 p-4 relative shadow-sm ${isSketch ? 'border-[#111111] rounded-2xl' : 'border-[#E9E4DB] rounded-3xl'}`}>
                  {isSketch ? (
                    <>
                      <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-l-[10px] border-l-[#111111] border-b-[8px] border-b-transparent" />
                      <div className="absolute right-[-7px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[7px] border-t-transparent border-l-[9px] border-l-white border-b-[7px] border-b-transparent" />
                    </>
                  ) : (
                    <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-l-[8px] border-l-white border-b-[6px] border-b-transparent filter drop-shadow-[1px_0_0_#E9E4DB]" />
                  )}
                  
                  <div className="space-y-0.5 text-left">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider block">
                      Companion {activeCompanion.name}
                    </span>
                    <p className="text-xs font-bold leading-normal italic text-[#111111]">
                      "Good morning! You've got {tasks.filter(t => !t.completed).length} tasks today. Let's go! ✨"
                    </p>
                  </div>
                </div>

                <div className="w-24 h-24 shrink-0 flex items-center justify-center">
                  {isSketch ? (
                    <MascotDrawing pose="waving" size={100} />
                  ) : (
                    <InteractiveCompanion companion={activeCompanion} mood="happy" size="sm" />
                  )}
                </div>
              </div>

              {/* Tasks Checklist Card */}
              <div className={`${isSketch ? 'border-2 border-[#111111] rounded-3xl p-5 bg-white shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]' : styles.card} space-y-4`}>
                <div className={`flex items-center justify-between border-b-2 pb-2 ${isSketch ? 'border-[#111111]' : 'border-gray-100'}`}>
                  <div className="text-left">
                    <h3 className="text-base font-black uppercase tracking-wide">Upcoming Weekly Tasks</h3>
                    <p className="text-[10px] text-gray-500 font-bold">Desk Task Board</p>
                  </div>
                  <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={`w-8 h-8 border-2 rounded-xl flex items-center justify-center font-bold active:translate-y-0.5 active:shadow-none cursor-pointer transition-all ${isSketch ? 'border-[#111111] bg-white shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]' : styles.button}`}
                  >
                    {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>

                {/* Add task builder form */}
                <AnimatePresence>
                  {showAddForm && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleAddTaskSubmit}
                      className={`border-2 rounded-2xl p-4 bg-[#FAF8F5] space-y-3 overflow-hidden text-left ${isSketch ? 'border-[#111111]' : 'border-[#E9E4DB]'}`}
                    >
                      <div className="text-xs font-black uppercase border-b pb-1">Assemble New Flow Task</div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-500">Task Name</label>
                        <input 
                          type="text"
                          value={taskTitle}
                          onChange={e => setTaskTitle(e.target.value)}
                          placeholder="e.g. Study project chapter 3"
                          required
                          className={styles.input + " w-full"}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-gray-500">Energy Cost</label>
                          <select
                            value={taskEnergy}
                            onChange={e => setTaskEnergy(e.target.value as any)}
                            className={styles.input + " w-full font-bold"}
                          >
                            <option value="low">☕ Low Effort</option>
                            <option value="medium">⚡ Medium effort</option>
                            <option value="high">🔥 High cognitive</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-gray-500">Time</label>
                          <input 
                            type="time"
                            value={taskTime}
                            onChange={e => setTaskTime(e.target.value)}
                            className={styles.input + " w-full font-bold"}
                          />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className={`w-full py-2 font-black text-xs rounded-xl cursor-pointer ${isSketch ? 'border-2 border-[#111111] bg-[#111111] text-white hover:bg-gray-800' : 'bg-[#8C9A86] text-white hover:bg-[#778671]'}`}
                      >
                        Assemble Task
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Task Items List */}
                <div className="space-y-3.5 text-left">
                  {tasks.length === 0 ? (
                    <div className={`text-center py-8 border-2 border-dashed rounded-2xl ${isSketch ? 'border-[#111111]' : 'border-gray-200'}`}>
                      <p className="text-xs text-gray-500 font-bold">Your operational desk is completely empty.</p>
                    </div>
                  ) : (
                    tasks.map(task => {
                      const isExpanded = !!expandedTasks[task.id];
                      const deconstructed = task.deconstructed;
                      let totalSteps = 0;
                      let completedSteps = 0;
                      if (deconstructed) {
                        deconstructed.structure.forEach(phase => {
                          phase.tasks.forEach(sub => {
                            sub.microSteps.forEach(step => {
                              totalSteps++;
                              if (step.completed) completedSteps++;
                            });
                          });
                        });
                      }

                      const hasSubtasks = totalSteps > 0;

                      return (
                        <div 
                          key={task.id} 
                          className={`border-2 rounded-2xl p-3.5 bg-white transition-all shadow-xs ${isSketch ? 'border-[#111111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]' : 'border-[#E9E4DB]'} ${
                            task.completed ? 'opacity-65' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <button 
                                onClick={() => onToggleTask(task.id)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSketch ? 'border-[#111111]' : 'border-[#8C9A86]'} ${
                                  task.completed 
                                    ? isSketch ? 'bg-[#111111] text-white' : 'bg-[#8C9A86] text-white' 
                                    : 'bg-white text-transparent'
                                }`}
                              >
                                ✓
                              </button>

                              <div className="min-w-0">
                                <span 
                                  onClick={() => toggleExpandTask(task.id)}
                                  className={`text-xs font-black block cursor-pointer hover:underline truncate ${
                                    task.completed ? 'line-through text-gray-400' : 'text-current'
                                  }`}
                                >
                                  {task.title}
                                </span>
                                <span className="text-[9px] font-bold text-gray-500 block">
                                  {task.scheduledTime ? `${task.scheduledTime}` : 'All Day'} • {task.duration} mins
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`border-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white ${isSketch ? 'border-[#111111]' : 'border-gray-200'}`}>
                                {task.energyCost === 'high' ? 'Study' : task.energyCost === 'medium' ? 'Work' : 'Personal'}
                              </span>

                              <button
                                onClick={() => onDeconstructTask(task.id)}
                                disabled={deconstructLoadingId === task.id}
                                title="Deconstruct overlap"
                                className={`w-7 h-7 border rounded-lg flex items-center justify-center cursor-pointer ${isSketch ? 'border-2 border-[#111111] bg-white' : 'border-[#E9E4DB] bg-white'}`}
                              >
                                {deconstructLoadingId === task.id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin border-current" />
                                ) : (
                                  <Workflow className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <button 
                                onClick={() => onDeleteTask(task.id)}
                                className="w-7 h-7 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-center cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Expandable nested micro-steps */}
                          {hasSubtasks && (
                            <div className={`mt-3.5 border-t-2 border-dashed pt-3.5 space-y-3 bg-[#FAF8F5] p-2.5 rounded-xl ${isSketch ? 'border-[#111111]' : 'border-[#E9E4DB]'}`}>
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase text-gray-500">
                                  Nested Operation Tree ({completedSteps}/{totalSteps})
                                </span>
                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-300 rounded px-1">
                                  Frictionless
                                </span>
                              </div>

                              <div className="space-y-3">
                                {deconstructed?.structure.map((phase, pIdx) => (
                                  <div key={phase.id || pIdx} className="space-y-1.5">
                                    <div className={`text-[10px] font-black uppercase border-b pb-0.5 ${isSketch ? 'border-[#111111]' : 'border-gray-200'}`}>
                                      Phase {pIdx + 1}: {phase.phaseName}
                                    </div>
                                    {phase.tasks.map((st, sIdx) => (
                                      <div key={st.id || sIdx} className="pl-2 space-y-1">
                                        <div className="text-[9px] font-extrabold text-gray-500">{st.taskName}</div>
                                        <div className="pl-2 space-y-1">
                                          {st.microSteps.map((step, kIdx) => (
                                            <div key={step.id || kIdx} className="flex items-center gap-2 text-xs">
                                              <button
                                                onClick={() => onToggleSubtask(task.id, step.id)}
                                                className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 text-[10px] ${isSketch ? 'border-[#111111]' : 'border-[#8C9A86]'} ${
                                                  step.completed 
                                                    ? isSketch ? 'bg-[#111111] text-white' : 'bg-[#8C9A86] text-white' 
                                                    : 'bg-white text-transparent'
                                                }`}
                                              >
                                                ✓
                                              </button>
                                              <span className={`text-[11px] font-medium leading-none ${
                                                step.completed ? 'line-through text-gray-400' : 'text-current'
                                              }`}>
                                                {step.step} ({step.durationMinutes}m)
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {!hasSubtasks && task.description && (
                            <div className="mt-1.5 text-[10px] text-gray-500 pl-9">
                              {task.description}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className={`pt-2 text-center border-t border-dashed ${isSketch ? 'border-[#111111]' : 'border-gray-200'}`}>
                  <span className="text-[11px] font-extrabold text-gray-500 hover:underline cursor-pointer">
                    View all completed tasks ({tasks.filter(t => t.completed).length}) &gt;
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      );
    }
