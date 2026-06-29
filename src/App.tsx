import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, ContextFile, InboundMessage, CompanionMascot, CalendarEvent, ChronotypeStats } from './types';
import CalendarPage from './components/CalendarPage';
import FocusPage from './components/FocusPage';
import EnergyPage from './components/EnergyPage';
import ProfilePage from './components/ProfilePage';
import AmbientPipeline from './components/AmbientPipeline';
import RAGWorkspace from './components/RAGWorkspace';
import CompanionChat from './components/CompanionChat';
import TaskTree from './components/TaskTree';
import Companion from './components/Companion';

// Static assets imported as ES modules to compile with Vite
import pixelCatImg from './assets/images/pixel_cat_companion_1782385652283.jpg';
import foxyImg from './assets/images/fox_companion_friend_1782385667174.jpg';
import biscuitImg from './assets/images/biscuit_avatar_1782381164224.jpg';
import mochiImg from './assets/images/rabbit_companion_friend_1782385698353.jpg';

import { 
  Calendar as CalendarIcon, 
  Target, 
  User, 
  LogOut, 
  Compass, 
  Sparkles, 
  Terminal, 
  FolderClosed, 
  Heart,
  ChevronRight,
  Info,
  Clock,
  Shield,
  Coffee,
  Activity,
  Zap
} from 'lucide-react';

export default function App() {
  // Navigation & Sub-views
  const [activeTab, setActiveTab] = useState<'calendar' | 'focus' | 'energy' | 'profile' | 'chat'>('calendar');
  const [activeTheme, setActiveTheme] = useState<string>('minimal');

  // User details
  const [userName, setUserName] = useState(() => {
    try {
      return localStorage.getItem('catalyst_user_name') || 'Alex Walker';
    } catch {
      return 'Alex Walker';
    }
  });
  const [userProfilePic, setUserProfilePic] = useState<string | null>(() => {
    try {
      return localStorage.getItem('catalyst_user_profile_pic');
    } catch {
      return null;
    }
  });
  const [userSpeechBubble, setUserSpeechBubble] = useState('Hi Alex! Let\'s have a productive day!');

  // Companion / Mascot state list
  const [allCompanions, setAllCompanions] = useState<CompanionMascot[]>([
    {
      id: 'mascot-1',
      name: 'Pixel',
      species: 'Kitten Mascot',
      imageUrl: pixelCatImg,
      description: 'A cozy chubby white cat who sits calmly on your desk and purrs when you complete tasks.'
    },
    {
      id: 'mascot-2',
      name: 'Foxy',
      species: 'Fox Friend',
      imageUrl: foxyImg,
      description: 'A playful red fox full of energetic encouragement and high-fives!'
    },
    {
      id: 'mascot-3',
      name: 'Biscuit',
      species: 'Cozy Puppy',
      imageUrl: biscuitImg,
      description: 'Your loyal operational sidekick who executes celebration flips when goals are hit.'
    },
    {
      id: 'mascot-4',
      name: 'Mochi',
      species: 'White Rabbit',
      imageUrl: mochiImg,
      description: 'A quiet, calm little rabbit who loves to watch you work in complete silence.'
    }
  ]);

  const [activeCompanion, setActiveCompanion] = useState<CompanionMascot>(allCompanions[0]); // Pixel as default
  const [companionXp, setCompanionXp] = useState(250);

  // Biological circadian rhythm status
  const [fatigueLevel, setFatigueLevel] = useState<'low' | 'moderate' | 'critical'>('low');
  const [bufferActive, setBufferActive] = useState(false);
  const [generatingMascot, setGeneratingMascot] = useState(false);
  const [chronotypeStats, setChronotypeStats] = useState<ChronotypeStats>({
    historicalCompletionRate: 88,
    responseLatency: 45,
    fatigueCount: 3,
    averageFocusDuration: 42
  });

  // Toast Notification System
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleGenerateMascot = async (animalName: string) => {
    setGeneratingMascot(true);
    try {
      const response = await fetch('/api/gemini/generate-mascot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animalName })
      });
      const data = await response.json();
      if (data.name && data.svgMarkup) {
        const newCompanion: CompanionMascot = {
          id: `custom-mascot-${Date.now()}`,
          name: data.name,
          species: data.species,
          imageUrl: '',
          description: data.description,
          svgMarkup: data.svgMarkup
        };
        setAllCompanions(prev => [...prev, newCompanion]);
        setActiveCompanion(newCompanion);
        setUserSpeechBubble(`Wow! Meet ${data.name}, your new ${data.species}! ${data.description}`);
        setCompanionXp(prev => Math.min(prev + 120, 500));
      }
    } catch (err) {
      console.error("Mascot generation failed:", err);
    } finally {
      setGeneratingMascot(false);
    }
  };

  const initialEnergyWave = [
    { hour: 0, score: 20 }, { hour: 4, score: 5 }, { hour: 8, score: 65 }, 
    { hour: 12, score: 70 }, { hour: 14, score: 90 }, { hour: 15, score: 95 }, 
    { hour: 18, score: 55 }, { hour: 22, score: 30 }
  ];

  // Connected Files / Spec Documents
  const [connectedFiles, setConnectedFiles] = useState<ContextFile[]>([
    {
      id: 'file-1',
      name: 'Linear_Algebra_Chapter_4.pdf',
      type: 'Textbook',
      contentSummary: 'Covers linear matrix transformations, reflection models, and projection matrices formulas.',
      detailedContent: 'Section 4.2 focuses on geometric linear transformations. The standard matrix for reflection through the y-axis is [[-1, 0], [0, 1]].'
    },
    {
      id: 'file-2',
      name: 'Physics_Notes_Lecture_12.txt',
      type: 'Notes',
      contentSummary: 'Kinetic friction formulas, incline calculations, and pulley setup specifications.',
      detailedContent: 'Review equation for friction: F_f = mu * F_N.'
    }
  ]);

  // Unified Task state
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-1',
      title: 'Study project chapter 3',
      description: 'Complete project chapter 3 matrix transformation formulas.',
      completed: false,
      duration: 60,
      energyCost: 'high',
      scheduledTime: '10:00',
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-2',
      title: 'Team meeting',
      description: 'Sync on weekly design goals and review companion parameters.',
      completed: false,
      duration: 30,
      energyCost: 'medium',
      scheduledTime: '14:00',
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-3',
      title: "Mom's Birthday 🎂",
      description: 'Call mom and arrange flower deliveries.',
      completed: false,
      duration: 15,
      energyCost: 'low',
      scheduledTime: '17:00',
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-4',
      title: 'Grocery shopping',
      description: 'Buy fresh food, snacks, and milk.',
      completed: false,
      duration: 45,
      energyCost: 'low',
      scheduledTime: '18:00',
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  ]);

  // Silent pipeline radar feed
  const [inboundMessages, setInboundMessages] = useState<InboundMessage[]>([
    {
      id: 'msg-1',
      sender: 'Alex (Lead Dev)',
      source: 'Slack',
      content: 'Hey focus partner! Let me know if the checkout page interface looks good by Thursday afternoon so we can merge the branch.',
      timestamp: '10 Mins Ago',
      detectedTaskTitle: 'Write Checkout Page Component Spec',
      detectedDeadline: 'Thursday Afternoon',
      status: 'pending'
    },
    {
      id: 'msg-2',
      sender: 'Professor Collins',
      source: 'Email',
      content: 'Remember that Linear Algebra Problem Set 4 is due by 5:00 PM tomorrow. Solutions post immediately after.',
      timestamp: '2 Hours Ago',
      detectedTaskTitle: 'Complete Linear Algebra Problem Set 4',
      detectedDeadline: 'Tomorrow at 17:00',
      status: 'pending'
    }
  ]);

  // RAG workspace launcher
  const [activeLaunchpad, setActiveLaunchpad] = useState<{
    task: Task;
    matchedFiles: string[];
    prefetchedSummary: string;
    preloadedState: string;
    studyChecklist: string[];
  } | null>(null);

  // Loaders
  const [parseLoading, setParseLoading] = useState(false);
  const [ragLoading, setRagLoading] = useState(false);
  const [deconstructLoadingId, setDeconstructLoadingId] = useState<string | null>(null);

  // Expandable diagnostic widgets in the Calendar view
  const [showRAGDrawer, setShowRAGDrawer] = useState(false);
  const [showStressDrawer, setShowStressDrawer] = useState(false);

  // Reward XP helper
  const handleRewardXp = (amount: number) => {
    setCompanionXp(prev => {
      const nextXp = prev + amount;
      if (nextXp >= 500) {
        return nextXp - 500; // Level up rollover
      }
      return nextXp;
    });
  };

  // Toggle tasks
  const handleToggleTask = (id: string) => {
    setTasks(prev => 
      prev.map(t => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted) handleRewardXp(50); // Earn 50 XP per standard task check!
          return { ...t, completed: nextCompleted, status: nextCompleted ? 'completed' : 'pending' };
        }
        return t;
      })
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        // 1. Check if we have standard flat subtasks
        if (t.subtasks && t.subtasks.some(s => s.id === subtaskId)) {
          const updated = t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
          const completedCount = updated.filter(s => s.completed).length;
          const allCompleted = completedCount === updated.length;
          if (allCompleted) handleRewardXp(100);
          else handleRewardXp(10);
          return { ...t, subtasks: updated, completed: allCompleted, status: allCompleted ? 'completed' : 'pending' } as Task;
        }
        // 2. Check if we have nested deconstructed structure
        if (t.deconstructed) {
          let stepToggled = false;
          const updatedStructure = t.deconstructed.structure.map(phase => {
            const updatedTasks = phase.tasks.map(task => {
              const updatedSteps = task.microSteps.map(step => {
                if (step.id === subtaskId) {
                  stepToggled = true;
                  const nextCompleted = !step.completed;
                  handleRewardXp(nextCompleted ? 15 : 0);
                  return { ...step, completed: nextCompleted };
                }
                return step;
              });
              return { ...task, microSteps: updatedSteps };
            });
            return { ...phase, tasks: updatedTasks };
          });

          // Check if ALL steps in the whole project are completed
          let allCompleted = true;
          let totalSteps = 0;
          let completedSteps = 0;
          updatedStructure.forEach(phase => {
            phase.tasks.forEach(task => {
              task.microSteps.forEach(step => {
                totalSteps++;
                if (step.completed) completedSteps++;
                else allCompleted = false;
              });
            });
          });

          if (stepToggled) {
            if (allCompleted && totalSteps > 0) {
              handleRewardXp(150);
            }
            return {
              ...t,
              deconstructed: {
                ...t.deconstructed,
                structure: updatedStructure
              },
              completed: allCompleted,
              status: allCompleted ? 'completed' : 'pending'
            } as Task;
          }
        }
      }
      return t;
    }));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    triggerToast("Task deleted from desk.", "info");
  };

  const handleDeconstructTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setDeconstructLoadingId(taskId);
    try {
      const response = await fetch('/api/gemini/decompose-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: task.title, description: task.description })
      });
      const data = await response.json();
      
      if (data && data.structure && Array.isArray(data.structure)) {
        const structureWithIds = data.structure.map((phase: any, pIdx: number) => ({
          id: `phase-${Date.now()}-${pIdx}`,
          phaseName: phase.phaseName,
          tasks: (phase.tasks || []).map((t: any, tIdx: number) => ({
            id: `subtask-${Date.now()}-${pIdx}-${tIdx}`,
            taskName: t.taskName,
            microSteps: (t.microSteps || []).map((step: any, sIdx: number) => ({
              id: `step-${Date.now()}-${pIdx}-${tIdx}-${sIdx}`,
              step: step.step,
              durationMinutes: step.durationMinutes || 10,
              energyRequired: step.energyRequired || 'Low',
              completed: false
            }))
          }))
        }));

        setTasks(prev => prev.map(t => {
          if (t.id === taskId) {
            return {
              ...t,
              deconstructed: {
                projectTitle: data.projectTitle || t.title,
                estimatedTotalEnergy: data.estimatedTotalEnergy || 'Medium',
                structure: structureWithIds
              }
            };
          }
          return t;
        }));

        handleRewardXp(80);
        triggerToast("Biscuit has deconstructed your project! 🐾", "success");
      } else {
        triggerToast("Failed to parse deconstructed task tree format.", "error");
      }
    } catch (e) {
      console.error(e);
      triggerToast("Failed to deconstruct task due to server error.", "error");
    } finally {
      setDeconstructLoadingId(null);
    }
  };

  const handleRAGLaunch = async (task: Task) => {
    setRagLoading(true);
    setShowRAGDrawer(true);
    try {
      const response = await fetch('/api/gemini/context-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: task.title,
          taskDescription: task.description,
          connectedFiles
        })
      });
      const data = await response.json();
      setActiveLaunchpad({
        task,
        matchedFiles: data.matchedFiles || [],
        prefetchedSummary: data.prefetchedSummary || '',
        preloadedState: data.preloadedState || '',
        studyChecklist: data.studyChecklist || []
      });
      triggerToast("Launchpad workspace ready! 🚀", "success");
    } catch (e) {
      console.error(e);
      triggerToast("Failed to synthesize workspace context.", "error");
    } finally {
      setRagLoading(false);
    }
  };

  // Inbound ingestion
  const handleIngestMessage = (msgId: string) => {
    const msg = inboundMessages.find(m => m.id === msgId);
    if (!msg) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: msg.detectedTaskTitle || 'Radar Action Item',
      description: `Inbound context: "${msg.content}"`,
      completed: false,
      duration: 30,
      energyCost: 'medium',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [...prev, newTask]);
    setInboundMessages(prev => 
      prev.map(m => m.id === msgId ? { ...m, status: 'added' } : m)
    );
    handleRewardXp(30);
  };

  const handleDismissMessage = (msgId: string) => {
    setInboundMessages(prev => 
      prev.map(m => m.id === msgId ? { ...m, status: 'dismissed' } : m)
    );
  };

  const handleParseBrainDump = async (text: string) => {
    setParseLoading(true);
    try {
      const response = await fetch('/api/gemini/brain-dump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      
      const extractedTasks = data.extractedTasks || data.tasks || [];
      const recommendedBuffers = data.recommendedBuffers || [];
      const userEnergyState = data.userEnergyState || 'Focused';

      if (Array.isArray(extractedTasks) && extractedTasks.length > 0) {
        const parsed: Task[] = [];
        
        extractedTasks.forEach((t: any, i: number) => {
          const taskTitle = t.task || t.title || "Extracted Task";
          const scheduledTime = t.targetDateTime ? t.targetDateTime.split(" ")[1] : (t.scheduledTime || undefined);
          const energyCost = (t.energyCost || "Medium").toLowerCase() as 'low' | 'medium' | 'high';
          
          parsed.push({
            id: `task-parsed-${Date.now()}-${i}`,
            title: taskTitle,
            description: `Extracted from brain-dump. Cognitive state: ${userEnergyState}`,
            completed: false,
            duration: 30,
            energyCost: energyCost,
            status: 'pending',
            scheduledTime,
            createdAt: new Date().toISOString(),
            subtasks: []
          });

          const buffer = recommendedBuffers.find((b: any) => b.afterTask === taskTitle);
          if (buffer) {
            parsed.push({
              id: `task-buffer-${Date.now()}-${i}`,
              title: `🌸 Decompression Buffer (${buffer.durationMinutes}m)`,
              description: buffer.activitySuggestion || "Screen-free resting break.",
              completed: false,
              duration: buffer.durationMinutes || 15,
              energyCost: 'low',
              status: 'pending',
              createdAt: new Date().toISOString(),
              subtasks: []
            });
          }
        });

        setTasks(prev => [...parsed, ...prev]);
        handleRewardXp(60);
        triggerToast(`Cognitive Wave: ${userEnergyState}! Extracted ${extractedTasks.length} tasks and ${recommendedBuffers.length} buffers. 🧘‍♀️`, "success");
      } else {
        triggerToast("No clear actionable tasks extracted. Try adding more detail!", "info");
      }
    } catch (e) {
      console.error(e);
      triggerToast("Failed to parse your thoughts. Please check connection.", "error");
    } finally {
      setParseLoading(false);
    }
  };

  const handleAddConnectedFile = (file: Partial<ContextFile>) => {
    const fresh: ContextFile = {
      id: `file-${Date.now()}`,
      name: file.name || 'Doc.txt',
      type: file.type || 'Notes',
      contentSummary: file.contentSummary || '',
      detailedContent: file.detailedContent || ''
    };
    setConnectedFiles(prev => [...prev, fresh]);
    handleRewardXp(40);
  };

  // Timeline circadian wave alignment
  const handleRescheduleTasks = () => {
    setTasks(prev => 
      prev.map(t => {
        if (t.energyCost === 'high' && !t.completed) {
          return { ...t, scheduledTime: '15:00' };
        }
        return t;
      })
    );
    handleRewardXp(40);
  };

  const handleInjectBuffer = () => {
    if (bufferActive) {
      setBufferActive(false);
      setTasks(prev => prev.filter(t => t.title !== '🌸 Decompression Buffer'));
    } else {
      setBufferActive(true);
      const bufferTask: Task = {
        id: 'decompression-buffer',
        title: '🌸 Decompression Buffer',
        description: 'Time to rest your biological battery!',
        completed: false,
        duration: 15,
        energyCost: 'low',
        status: 'pending',
        scheduledTime: '14:15',
        createdAt: new Date().toISOString()
      };
      setTasks(prev => [bufferTask, ...prev]);
    }
  };

  const handleUpdateUserName = (newName: string) => {
    setUserSpeechBubble(prev => {
      let updated = prev;
      const escapedOldName = userName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regexOld = new RegExp(escapedOldName, 'gi');
      updated = updated.replace(regexOld, newName);
      
      if (userName.toLowerCase() !== 'alex' && userName.toLowerCase() !== 'alex walker') {
        updated = updated.replace(/\bAlex\b/gi, newName);
        updated = updated.replace(/\bAlex Walker\b/gi, newName);
      }
      return updated;
    });
    setUserName(newName);
    try {
      localStorage.setItem('catalyst_user_name', newName);
    } catch (e) {
      console.warn("Storage write failed:", e);
    }
  };

  const handleUpdateUserProfilePic = (newPic: string | null) => {
    setUserProfilePic(newPic);
    try {
      if (newPic) {
        localStorage.setItem('catalyst_user_profile_pic', newPic);
      } else {
        localStorage.removeItem('catalyst_user_profile_pic');
      }
    } catch (e) {
      console.warn("Storage write failed:", e);
    }
  };

  // Determine fatigue level dynamically
  useEffect(() => {
    const highCost = tasks.filter(t => !t.completed && t.energyCost === 'high').length;
    if (bufferActive) {
      setFatigueLevel('low');
    } else if (highCost >= 2) {
      setFatigueLevel('critical');
    } else if (highCost === 1) {
      setFatigueLevel('moderate');
    } else {
      setFatigueLevel('low');
    }
  }, [tasks, bufferActive]);

  // Background and text classes dependent on active Theme selected in Profile Page
  const getThemeClasses = () => {
    switch (activeTheme) {
      case 'sketch':
        return {
          appBg: 'bg-white text-[#111111] selection:bg-gray-100',
          sidebarBg: 'bg-white border-r-2 border-[#111111]',
          sidebarActive: 'bg-[#111111] text-white rounded-2xl border-2 border-[#111111]',
          sidebarText: 'text-[#111111] hover:bg-gray-100 rounded-2xl border border-transparent',
          headingColor: 'text-[#111111]',
          subtitleColor: 'text-[#555555]',
          logoColor: 'bg-[#111111] text-white',
          barColor: 'bg-[#111111]',
        };
      case 'night':
        return {
          appBg: 'bg-[#121820] text-slate-200 selection:bg-slate-700',
          sidebarBg: 'bg-[#18202C] border-slate-800',
          sidebarActive: 'bg-slate-800 text-white',
          sidebarText: 'text-slate-400 hover:text-white',
          headingColor: 'text-white',
          subtitleColor: 'text-slate-400',
          logoColor: 'bg-slate-700 text-white',
          barColor: 'bg-indigo-600',
        };
      case 'forest':
        return {
          appBg: 'bg-[#DFE7DD] text-stone-800 selection:bg-stone-200',
          sidebarBg: 'bg-[#CAD4C7] border-stone-300',
          sidebarActive: 'bg-[#8C9A86] text-white',
          sidebarText: 'text-stone-700 hover:text-stone-900',
          headingColor: 'text-[#2B3E29]',
          subtitleColor: 'text-stone-600',
          logoColor: 'bg-[#8C9A86] text-white',
          barColor: 'bg-[#8C9A86]',
        };
      case 'lavender':
        return {
          appBg: 'bg-[#F2EAFA] text-purple-950 selection:bg-purple-200',
          sidebarBg: 'bg-[#E5D7F3] border-purple-200',
          sidebarActive: 'bg-[#9C84BE] text-white',
          sidebarText: 'text-purple-900 hover:text-purple-950',
          headingColor: 'text-[#3B294F]',
          subtitleColor: 'text-purple-800/80',
          logoColor: 'bg-[#9C84BE] text-white',
          barColor: 'bg-[#9C84BE]',
        };
      case 'minimal':
      default:
        return {
          appBg: 'bg-[#FAF8F5] text-[#2C2A29] selection:bg-amber-100',
          sidebarBg: 'bg-white border-[#E9E4DB]',
          sidebarActive: 'bg-[#FAF8F5] text-[#2C2A29] border-r-4 border-[#8C9A86]',
          sidebarText: 'text-[#8C867E] hover:text-[#2C2A29]',
          headingColor: 'text-[#2C2A29]',
          subtitleColor: 'text-[#5D5750]',
          logoColor: 'bg-[#8C9A86] text-white',
          barColor: 'bg-[#8C9A86]',
        };
    }
  };

  const theme = getThemeClasses();

  return (
    <div className={`h-screen flex ${theme.appBg} transition-colors duration-500 overflow-hidden`}>
      
      {/* LEFT SIDEBAR NAVIGATION matching mockup perfectly */}
      <aside className={`w-64 flex flex-col justify-between border-r ${theme.sidebarBg} transition-colors duration-500 p-4 shrink-0 hidden md:flex h-full overflow-hidden`}>
        <div className="space-y-8">
          
          {/* Logo brand at top */}
          <div className="flex items-center gap-3 px-2 pt-2">
            <div className={`w-10 h-10 rounded-2xl ${theme.logoColor} flex items-center justify-center font-bold text-lg overflow-hidden`}>
              {userProfilePic ? (
                <img src={userProfilePic} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                "🐱"
              )}
            </div>
            <div>
              <span className={`text-sm font-extrabold block ${theme.headingColor}`}>Pixel Flow</span>
              <span className="text-[10px] font-bold text-[#8C9A86] uppercase tracking-wider">Companion</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'calendar' ? theme.sidebarActive : theme.sidebarText
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Calendar
            </button>

            <button
              onClick={() => setActiveTab('focus')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'focus' ? theme.sidebarActive : theme.sidebarText
              }`}
            >
              <Target className="w-4 h-4" />
              Focus
            </button>

            <button
              onClick={() => setActiveTab('energy')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'energy' ? theme.sidebarActive : theme.sidebarText
              }`}
            >
              <Activity className="w-4 h-4" />
              Energy Wave
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'profile' ? theme.sidebarActive : theme.sidebarText
              }`}
            >
              {userProfilePic ? (
                <img src={userProfilePic} alt="Profile" className="w-4 h-4 rounded-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-4 h-4" />
              )}
              Profile
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'chat' ? theme.sidebarActive : theme.sidebarText
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Companion Chat
            </button>
          </nav>
        </div>

        {/* Log Out button at bottom */}
        <div className="border-t border-[#FAF8F5] pt-4">
          <button 
            onClick={() => triggerToast("Securing active session. See you next time focus partner! 🐾", "info")}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* MOBILE NAVIGATION HEADER */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 py-2.5 px-6 flex items-center justify-around ${
        activeTheme === 'sketch' 
          ? 'bg-white border-t-2 border-[#111111] text-[#111111]' 
          : 'bg-white border-t border-[#E9E4DB] shadow-lg'
      }`}>
        <button 
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-black ${
            activeTab === 'calendar' 
              ? (activeTheme === 'sketch' ? 'text-[#111111] scale-105' : 'text-[#8C9A86]') 
              : (activeTheme === 'sketch' ? 'text-gray-400' : 'text-[#8C867E]')
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          Calendar
        </button>
        <button 
          onClick={() => setActiveTab('focus')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-black ${
            activeTab === 'focus' 
              ? (activeTheme === 'sketch' ? 'text-[#111111] scale-105' : 'text-[#8C9A86]') 
              : (activeTheme === 'sketch' ? 'text-gray-400' : 'text-[#8C867E]')
          }`}
        >
          <Target className="w-5 h-5" />
          Focus
        </button>
        <button 
          onClick={() => setActiveTab('energy')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-black ${
            activeTab === 'energy' 
              ? (activeTheme === 'sketch' ? 'text-[#111111] scale-105' : 'text-[#8C9A86]') 
              : (activeTheme === 'sketch' ? 'text-gray-400' : 'text-[#8C867E]')
          }`}
        >
          <Activity className="w-5 h-5" />
          Energy
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-black ${
            activeTab === 'profile' 
              ? (activeTheme === 'sketch' ? 'text-[#111111] scale-105' : 'text-[#8C9A86]') 
              : (activeTheme === 'sketch' ? 'text-gray-400' : 'text-[#8C867E]')
          }`}
        >
          {userProfilePic ? (
            <img src={userProfilePic} alt="Profile" className="w-5 h-5 rounded-full object-cover border border-[#111111]" referrerPolicy="no-referrer" />
          ) : (
            <User className="w-5 h-5" />
          )}
          Profile
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-black ${
            activeTab === 'chat' 
              ? (activeTheme === 'sketch' ? 'text-[#111111] scale-105' : 'text-[#8C9A86]') 
              : (activeTheme === 'sketch' ? 'text-gray-400' : 'text-[#8C867E]')
          }`}
        >
          <Sparkles className="w-5 h-5" />
          Chat
        </button>
      </div>

      {/* MAIN CONTAINER CONTENT VIEW - Strictly constrained to prevent scrolling the whole page */}
      <main className="flex-1 overflow-hidden p-4 md:p-6 flex flex-col h-full gap-4 relative pb-24 md:pb-6">
        
        {/* Dynamic header route tracker strip */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E9E4DB]/40 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C867E] uppercase tracking-wider">
            <span>Pixel Flow Dashboard</span>
            <span>/</span>
            <span className="text-[#8C9A86]">{activeTab}</span>
          </div>

          {/* Biological widget on top bar matching mockup */}
          <div className="flex items-center gap-2.5">
            {activeTab === 'calendar' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowStressDrawer(!showStressDrawer)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
                    showStressDrawer ? 'bg-amber-100 text-amber-900' : 'bg-white border border-[#DFD6C4] hover:bg-amber-50'
                  }`}
                >
                  🌋 Brain Vent Hub
                </button>
                <button
                  onClick={() => setShowRAGDrawer(!showRAGDrawer)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
                    showRAGDrawer ? 'bg-emerald-100 text-emerald-900' : 'bg-white border border-[#DFD6C4] hover:bg-emerald-50'
                  }`}
                >
                  📁 Spec RAG Sync
                </button>
              </div>
            )}
            
            <div className="bg-white border border-[#E9E4DB] rounded-full px-3 py-1.5 flex items-center gap-2 text-xs font-bold shadow-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${bufferActive ? 'bg-indigo-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-[#5D5750]">
                {bufferActive ? 'Decompressing (15m)' : 'Energy Level Ascent'}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Expandable RAG SPEC Drawer */}
        <AnimatePresence>
          {showRAGDrawer && activeTab === 'calendar' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden shrink-0"
            >
              <RAGWorkspace
                connectedFiles={connectedFiles}
                onAddConnectedFile={handleAddConnectedFile}
                activeLaunchpad={activeLaunchpad}
                onClearLaunchpad={() => setActiveLaunchpad(null)}
                ragLoading={ragLoading}
                onTriggerToast={triggerToast}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Expandable STRESS VENT Drawer */}
        <AnimatePresence>
          {showStressDrawer && activeTab === 'calendar' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden shrink-0"
            >
              <AmbientPipeline
                inboundMessages={inboundMessages}
                onIngestMessage={handleIngestMessage}
                onDismissMessage={handleDismissMessage}
                onParseBrainDump={handleParseBrainDump}
                parseLoading={parseLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sub-view switcher based on Tab select - Height is constrained to remaining area */}
        <div className="flex-1 min-h-0 w-full flex flex-col relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 w-full h-full flex flex-col"
            >
              {activeTab === 'calendar' && (
                <CalendarPage
                  tasks={tasks}
                  onToggleTask={handleToggleTask}
                  onToggleSubtask={handleToggleSubtask}
                  onDeleteTask={handleDeleteTask}
                  onAddTask={(t) => setTasks(prev => [{ ...t, id: `task-${Date.now()}`, completed: false, status: 'pending', createdAt: new Date().toISOString(), subtasks: [] } as Task, ...prev])}
                  onDeconstructTask={handleDeconstructTask}
                  deconstructLoadingId={deconstructLoadingId}
                  onRAGLaunch={handleRAGLaunch}
                  activeCompanion={activeCompanion}
                  companionXp={companionXp}
                  userName={userName}
                  activeTheme={activeTheme}
                />
              )}

              {activeTab === 'focus' && (
                <FocusPage
                  activeCompanion={activeCompanion}
                  onNavigateToProfile={() => setActiveTab('profile')}
                  onRewardXp={handleRewardXp}
                  userName={userName}
                  activeTheme={activeTheme}
                />
              )}

              {activeTab === 'energy' && (
                <EnergyPage
                  energyWave={initialEnergyWave}
                  fatigueLevel={fatigueLevel}
                  onInjectBuffer={handleInjectBuffer}
                  bufferActive={bufferActive}
                  onRescheduleTasks={handleRescheduleTasks}
                  stats={chronotypeStats}
                  activeTheme={activeTheme}
                />
              )}

              {activeTab === 'profile' && (
                <ProfilePage
                  activeCompanion={activeCompanion}
                  allCompanions={allCompanions}
                  onSelectCompanion={(comp) => setActiveCompanion(comp)}
                  activeTheme={activeTheme}
                  onSelectTheme={(th) => setActiveTheme(th)}
                  userName={userName}
                  onUpdateUserName={handleUpdateUserName}
                  userSpeechBubble={userSpeechBubble}
                  onUpdateUserSpeechBubble={(bubble) => setUserSpeechBubble(bubble)}
                  onGenerateMascot={handleGenerateMascot}
                  generatingMascot={generatingMascot}
                  userProfilePic={userProfilePic}
                  onUpdateUserProfilePic={handleUpdateUserProfilePic}
                />
              )}

              {activeTab === 'chat' && (
                <CompanionChat
                  activeCompanion={activeCompanion}
                  companionXp={companionXp}
                  userProfilePic={userProfilePic}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* Toast Notification Container */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[100] max-w-sm bg-white border border-[#E9E4DB] rounded-2xl p-4 shadow-xl flex items-center gap-3 border-l-4 border-l-[#8C9A86]"
          >
            <div className="w-2 h-2 rounded-full bg-[#8C9A86] shrink-0" />
            <p className="text-xs font-bold text-[#2C2A29] leading-normal">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
