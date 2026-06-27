import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, SubTask } from '../types';
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Clock, 
  Battery, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Sparkles, 
  Loader2,
  FileCode,
  Calendar
} from 'lucide-react';

interface TaskTreeProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (task: Partial<Task>) => void;
  onDeconstructTask: (taskId: string) => Promise<void>;
  deconstructLoadingId: string | null;
  onRAGLaunch: (task: Task) => void;
}

export default function TaskTree({
  tasks,
  onToggleTask,
  onToggleSubtask,
  onDeleteTask,
  onAddTask,
  onDeconstructTask,
  deconstructLoadingId,
  onRAGLaunch
}: TaskTreeProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  
  // New task form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [energyCost, setEnergyCost] = useState<'low' | 'medium' | 'high'>('medium');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isDeconstructingNew, setIsDeconstructingNew] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedTasks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAddTask({
      title,
      description,
      duration,
      energyCost,
      scheduledTime: scheduledTime || undefined,
      subtasks: [],
      status: 'pending'
    });

    // Reset form
    setTitle('');
    setDescription('');
    setDuration(30);
    setEnergyCost('medium');
    setScheduledTime('');
    setIsAdding(false);
  };

  return (
    <div className="bg-white border border-[#E9E4DB] rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#2C2A29] tracking-tight">Active Desk Tasks</h2>
          <p className="text-xs text-[#5D5750]">Micro-sliced, frictionless operations workspace</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 bg-[#8C9A86] hover:bg-[#778671] text-white text-xs font-semibold px-3 py-2 rounded-full shadow-sm transition-all cursor-pointer"
        >
          {isAdding ? 'Close Builder' : 'Add Custom Task'}
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Task Builder Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="overflow-hidden border-b border-[#E9E4DB] pb-6 space-y-4"
          >
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5D5750] uppercase tracking-wider">Task Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Draft Chemistry Homework Set 2"
                required
                className="w-full bg-[#FAF9F5] border border-[#E2DCCE] rounded-xl px-3 py-2 text-sm text-[#2C2A29] focus:outline-none focus:border-[#8C9A86]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5D5750] uppercase tracking-wider">Objective Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Details, specifications or notes..."
                rows={2}
                className="w-full bg-[#FAF9F5] border border-[#E2DCCE] rounded-xl px-3 py-2 text-sm text-[#2C2A29] focus:outline-none focus:border-[#8C9A86]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D5750] uppercase tracking-wider">Estimated Mins</label>
                <input
                  type="number"
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                  min={1}
                  required
                  className="w-full bg-[#FAF9F5] border border-[#E2DCCE] rounded-xl px-3 py-2 text-sm text-[#2C2A29] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D5750] uppercase tracking-wider">Energy Drain</label>
                <select
                  value={energyCost}
                  onChange={e => setEnergyCost(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full bg-[#FAF9F5] border border-[#E2DCCE] rounded-xl px-3 py-2 text-sm text-[#2C2A29] focus:outline-none"
                >
                  <option value="low">☕ Low Effort</option>
                  <option value="medium">⚡ Medium Effort</option>
                  <option value="high">🔥 High Cognitive</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D5750] uppercase tracking-wider">Schedule Time</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={e => setScheduledTime(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#E2DCCE] rounded-xl px-3 py-2 text-sm text-[#2C2A29] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-[#8C9A86] text-white py-2 rounded-xl text-xs font-bold hover:bg-[#778671] transition-colors cursor-pointer"
              >
                Assemble Task
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#DFD6C4]">
            <p className="text-sm text-[#8C867E]">No tasks loaded on your desk.</p>
            <p className="text-xs text-[#ACAA9F] mt-1">Use the builder or do a raw brain dump to instantly create some!</p>
          </div>
        ) : (
          tasks.map(task => {
            const isExpanded = expandedTasks[task.id] || false;
            
            const deconstructed = task.deconstructed;
            let totalSteps = 0;
            let completedSteps = 0;
            if (deconstructed) {
              deconstructed.structure.forEach(phase => {
                phase.tasks.forEach(dt => {
                  dt.microSteps.forEach(step => {
                    totalSteps++;
                    if (step.completed) completedSteps++;
                  });
                });
              });
            }

            const hasDeconstructed = !!deconstructed && totalSteps > 0;
            const subtaskCount = hasDeconstructed ? totalSteps : (task.subtasks?.length || 0);
            const completedSubtaskCount = hasDeconstructed ? completedSteps : (task.subtasks?.filter(s => s.completed).length || 0);
            const hasSubtasks = subtaskCount > 0;

            return (
              <div
                key={task.id}
                className={`border rounded-2xl transition-all duration-300 ${
                  task.completed 
                    ? 'border-[#E3DEC9] bg-[#FAF8EE] opacity-75' 
                    : 'border-[#E9E4DB] bg-white hover:border-[#DFD6C4] shadow-sm'
                }`}
              >
                {/* Task Header info */}
                <div className="p-4 flex items-start gap-3">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 text-[#5D5750] hover:text-[#8C9A86] transition-colors cursor-pointer flex-shrink-0"
                  >
                    {task.completed ? (
                      <CheckSquare className="w-5 h-5 text-[#8C9A86] fill-[#FAF8EE]" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0" onClick={() => toggleExpand(task.id)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold text-sm leading-tight cursor-pointer ${
                        task.completed ? 'line-through text-[#8C867E]' : 'text-[#2C2A29]'
                      }`}>
                        {task.title}
                      </span>
                      
                      {/* Energy Battery Tag */}
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        task.energyCost === 'high' 
                          ? 'bg-rose-100 text-rose-800' 
                          : task.energyCost === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        <Battery className="w-3 h-3" />
                        {task.energyCost}
                      </span>

                      {/* Duration Tag */}
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-[#8C867E] bg-[#FAF8F5] border border-[#E9E4DB] px-1.5 py-0.5 rounded-full font-medium">
                        <Clock className="w-3 h-3" />
                        {task.duration}m
                      </span>

                      {/* Scheduled Time Tag */}
                      {task.scheduledTime && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-[#728671] bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full font-medium">
                          <Calendar className="w-3 h-3" />
                          {task.scheduledTime}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-[#5D5750] mt-1 line-clamp-1 cursor-pointer">
                        {task.description}
                      </p>
                    )}

                    {hasSubtasks && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#FAF8F5] rounded-full overflow-hidden border border-[#E9E4DB]">
                          <div 
                            className="h-full bg-[#8C9A86] transition-all duration-300"
                            style={{ width: `${(completedSubtaskCount / subtaskCount) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#5D5750]">
                          {completedSubtaskCount}/{subtaskCount} Micro-actions
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center gap-1">
                    {/* Launchpad Workspace Button */}
                    {!task.completed && (
                      <button
                        onClick={() => onRAGLaunch(task)}
                        title="Prepare Context Launchpad"
                        className="p-1.5 text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <FileCode className="w-4 h-4" />
                      </button>
                    )}

                    {/* Biscuit Deconstruct Trigger */}
                    {!task.completed && !hasSubtasks && (
                      <button
                        onClick={() => onDeconstructTask(task.id)}
                        disabled={deconstructLoadingId === task.id}
                        title="Deconstruct into micro-actions"
                        className="p-1.5 text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {deconstructLoadingId === task.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => toggleExpand(task.id)}
                      className="p-1 text-[#5D5750] hover:text-[#2C2A29] rounded-lg cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1 text-[#C88478] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtask micro-checklist area */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-[#E9E4DB] bg-[#FAF9F6] px-4 py-3 space-y-2 rounded-b-2xl overflow-hidden"
                    >
                      {task.description && (
                        <p className="text-xs text-[#5D5750] bg-white border border-[#E9E4DB] p-2.5 rounded-xl mb-3 leading-relaxed">
                          <strong>Goal Context:</strong> {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs font-bold text-[#5D5750] tracking-wider uppercase">Micro-Sliced Action Checklist</span>
                        {!hasSubtasks && (
                          <button
                            type="button"
                            onClick={() => onDeconstructTask(task.id)}
                            className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-800 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Biscuit, slice this up!
                          </button>
                        )}
                      </div>

                      {hasDeconstructed ? (
                        <div className="space-y-4 pt-2">
                          {deconstructed.structure.map(phase => (
                            <div key={phase.id} className="space-y-2 border-l-2 border-[#8C9A86]/30 pl-3">
                              <h5 className="text-[10px] font-extrabold text-[#728671] tracking-wider uppercase bg-[#F2ECE1] px-2 py-0.5 rounded-md inline-block">
                                {phase.phaseName}
                              </h5>
                              
                              <div className="space-y-3 pl-1">
                                {phase.tasks.map(dt => (
                                  <div key={dt.id} className="space-y-1.5">
                                    <h6 className="text-[10px] font-bold text-[#8C867E] uppercase tracking-wide">
                                      Focus Box: {dt.taskName}
                                    </h6>
                                    
                                    <div className="space-y-1.5 pl-2">
                                      {dt.microSteps.map(step => (
                                        <div 
                                          key={step.id}
                                          className={`flex items-center justify-between p-2 rounded-xl border border-[#EBE7DF] bg-white transition-all ${
                                            step.completed ? 'opacity-65 bg-[#FAF8EE]' : 'hover:border-[#DFD6C4] shadow-xs'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <button
                                              type="button"
                                              onClick={() => onToggleSubtask(task.id, step.id)}
                                              className="text-[#5D5750] hover:text-[#8C9A86] cursor-pointer"
                                            >
                                              {step.completed ? (
                                                <CheckSquare className="w-4 h-4 text-[#8C9A86]" />
                                              ) : (
                                                <Square className="w-4 h-4 text-[#ACAA9F]" />
                                              )}
                                            </button>
                                            <span className={`text-[11px] font-medium leading-tight ${step.completed ? 'line-through text-[#8C867E]' : 'text-[#2C2A29]'}`}>
                                              {step.step}
                                            </span>
                                          </div>
                                          
                                          <div className="flex items-center gap-1.5 shrink-0">
                                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                                              step.energyRequired === 'Medium' ? 'bg-amber-50 text-amber-800 border border-amber-100' : 'bg-green-50 text-green-800 border border-green-100'
                                            }`}>
                                              {step.energyRequired}
                                            </span>
                                            <span className="text-[9px] font-bold text-[#8C867E] bg-[#FAF8F5] px-1.5 py-0.5 rounded-md border border-[#E9E4DB]">
                                              {step.durationMinutes}m
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : hasSubtasks ? (
                        <div className="space-y-2">
                          {task.subtasks?.map(sub => (
                            <div 
                              key={sub.id}
                              className={`flex items-center justify-between p-2 rounded-xl border border-[#EBE7DF] bg-white transition-all ${
                                sub.completed ? 'opacity-60 bg-[#FAF8EE]' : 'hover:border-[#DFD6C4]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <button
                                  type="button"
                                  onClick={() => onToggleSubtask(task.id, sub.id)}
                                  className="text-[#5D5750] hover:text-[#8C9A86] cursor-pointer"
                                >
                                  {sub.completed ? (
                                    <CheckSquare className="w-4.5 h-4.5 text-[#8C9A86]" />
                                  ) : (
                                    <Square className="w-4.5 h-4.5 text-[#ACAA9F]" />
                                  )}
                                </button>
                                <span className={`text-xs font-medium ${sub.completed ? 'line-through text-[#8C867E]' : 'text-[#2C2A29]'}`}>
                                  {sub.title}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-[#8C867E] bg-[#FAF8F5] px-1.5 py-0.5 rounded-md border border-[#E9E4DB]">
                                {sub.duration} mins
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#8C867E] italic py-1">No micro-actions currently generated. Biscuit can deconstruct this goal for you!</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
