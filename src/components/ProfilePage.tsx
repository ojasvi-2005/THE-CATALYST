import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CompanionMascot } from '../types';
import MascotDrawing from './MascotDrawing';
import InteractiveCompanion from './InteractiveCompanion';
import { 
  User, 
  Bell, 
  Sliders, 
  Palette, 
  Heart, 
  ChevronRight, 
  Volume2, 
  Sparkles,
  Info,
  LogOut,
  Upload,
  Trash2,
  Settings,
  Image as ImageIcon
} from 'lucide-react';

interface ProfilePageProps {
  activeCompanion: CompanionMascot;
  allCompanions: CompanionMascot[];
  onSelectCompanion: (companion: CompanionMascot) => void;
  activeTheme: string;
  onSelectTheme: (theme: string) => void;
  userName: string;
  onUpdateUserName: (name: string) => void;
  userSpeechBubble: string;
  onUpdateUserSpeechBubble: (text: string) => void;
  onGenerateMascot: (animalName: string) => Promise<void>;
  generatingMascot: boolean;
  userProfilePic?: string | null;
  onUpdateUserProfilePic: (newPic: string | null) => void;
}

export default function ProfilePage({
  activeCompanion,
  allCompanions,
  onSelectCompanion,
  activeTheme,
  onSelectTheme,
  userName,
  onUpdateUserName,
  userSpeechBubble,
  onUpdateUserSpeechBubble,
  onGenerateMascot,
  generatingMascot,
  userProfilePic = null,
  onUpdateUserProfilePic
}: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'buddy' | 'themes' | 'preferences' | 'support'>('buddy');
  const [activeSettingsSection, setActiveSettingsSection] = useState<'general' | 'account' | 'notifications' | 'timer'>('general');
  const [showEditSpeech, setShowEditSpeech] = useState(false);
  const [speechInput, setSpeechInput] = useState(userSpeechBubble);
  const [nameInput, setNameInput] = useState(userName);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      // Create an image element to get dimensions and resize
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Resize the profile pic to a standard 128x128px to save localStorage quota
        const maxDim = 128;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with 0.8 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          onUpdateUserProfilePic(compressedDataUrl);
        } else {
          // Fallback if canvas context is not available
          onUpdateUserProfilePic(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === fileInputRef.current) return;
    fileInputRef.current?.click();
  };

  useEffect(() => {
    setNameInput(userName);
  }, [userName]);

  useEffect(() => {
    setSpeechInput(userSpeechBubble);
  }, [userSpeechBubble]);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [buddyBarks, setBuddyBarks] = useState(true);
  const [customAnimalInput, setCustomAnimalInput] = useState('cat');

  const handleCustomMascotSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!customAnimalInput.trim() || generatingMascot) return;
    await onGenerateMascot(customAnimalInput.trim());
    setCustomAnimalInput('cat');
  };

  const handleUpdateAccount = (e: FormEvent) => {
    e.preventDefault();
    onUpdateUserName(nameInput);
    setActiveSettingsSection('general');
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
    innerCard: isSketch
      ? "bg-white border-2 border-[#111111] text-[#111111]"
      : activeTheme === 'night'
      ? "bg-[#242A3E] border border-slate-700 text-slate-100"
      : activeTheme === 'forest'
      ? "bg-[#2D3F35] border border-emerald-900/30 text-[#ECF2EF]"
      : activeTheme === 'lavender'
      ? "bg-[#FAF8FC] border border-[#E2DAF2] text-[#3D3A45]"
      : "bg-[#FAF9F5] border border-[#EFECE6] text-[#2C2A29]", // minimal
    innerBg: isSketch
      ? "bg-[#FAF8F5]"
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
      : "bg-white border border-[#E2DCCE] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#8C9A86] text-[#2C2A29]", // minimal
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
      : "rounded-2xl bg-[#8C9A86] text-white shadow-md hover:bg-[#778671]" // minimal
  };

  const textPrimary = isSketch 
    ? "text-[#111111]" 
    : activeTheme === 'night' 
    ? "text-[#ECEEF5]" 
    : activeTheme === 'forest' 
    ? "text-[#ECF2EF]" 
    : activeTheme === 'lavender' 
    ? "text-[#3D3A45]" 
    : "text-[#2C2A29]";

  const textSecondary = isSketch 
    ? "text-gray-600" 
    : activeTheme === 'night' 
    ? "text-slate-400" 
    : activeTheme === 'forest' 
    ? "text-[#ECF2EF]/75" 
    : activeTheme === 'lavender' 
    ? "text-[#635B8F]/85" 
    : "text-gray-500";

  return (
    <div id="profile-page-workspace" className={`h-full w-full overflow-y-auto pb-8 pr-1 space-y-5 select-none ${styles.container}`}>
      
      {/* 1. Header with Settings wheel */}
      <div className={`flex items-center justify-between ${isSketch ? 'border-2 border-[#111111] rounded-2xl bg-white p-4 shadow-[3px_3px_0px_0px_rgba(17,17,17,1)]' : styles.card} shrink-0`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${isSketch ? 'border-2 border-[#111111] rounded-xl bg-white shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]' : 'rounded-2xl'} ${styles.iconBg} flex items-center justify-center`}>
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider">Profile</h2>
            <p className="text-xs font-bold opacity-80">Preferences Hub</p>
          </div>
        </div>

        <button className={`w-10 h-10 ${isSketch ? 'border-2 border-[#111111] rounded-xl bg-white shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]' : 'rounded-2xl'} ${styles.iconBg} flex items-center justify-center`}>
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: User Profile details & Settings switchers (col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* 2. Profile Greeting Card */}
          <div className={`${isSketch ? 'border-2 border-[#111111] rounded-3xl p-5 bg-white shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]' : styles.card} space-y-4 text-left`}>
            
            {/* Avatar & User info */}
            <div className={`flex items-center gap-4 border-b pb-4 ${
              isSketch 
                ? 'border-dashed border-[#111111]' 
                : activeTheme === 'night' 
                ? 'border-slate-800' 
                : activeTheme === 'forest' 
                ? 'border-emerald-900/30' 
                : 'border-gray-100'
            }`}>
              <div className={`w-16 h-16 rounded-full ${isSketch ? 'border-2 border-[#111111] bg-[#FAF6F0] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]' : `border ${activeTheme === 'night' ? 'border-slate-700' : activeTheme === 'forest' ? 'border-emerald-950/20' : 'border-[#E9E4DB]'}`} overflow-hidden flex items-center justify-center shrink-0`}>
                {userProfilePic ? (
                  <img src={userProfilePic} alt={userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-8 h-8" />
                )}
              </div>
              <div>
                <h3 className="text-base font-black leading-none">{userName}</h3>
                <p className={`text-[10px] font-bold mt-1 ${textSecondary}`}>Stay focused. Grow every day.</p>
              </div>
            </div>

            {/* Mascot Chat Bubble inside profile */}
            <div className={`flex items-center gap-3 ${isSketch ? 'border-2 border-[#111111] rounded-2xl bg-[#FAF8F5]' : styles.innerCard} p-3 relative`}>
              {/* Dialogue Bubble tail */}
              {isSketch ? (
                <>
                  <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-[#111111] border-b-[6px] border-b-transparent" />
                  <div className="absolute left-[-7px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-r-[7px] border-r-[#FAF8F5] border-b-[5px] border-b-transparent" />
                </>
              ) : (
                <div className={`absolute left-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[7px] ${
                  activeTheme === 'night' 
                    ? 'border-r-[#242A3E] filter drop-shadow-[-1px_0_0_#334155]' 
                    : activeTheme === 'forest' 
                    ? 'border-r-[#2D3F35] filter drop-shadow-[-1px_0_0_#064e3b]' 
                    : 'border-r-[#FAF8F5] filter drop-shadow-[-1px_0_0_#E9E4DB]'
                }`} />
              )}
              
              <div className="flex-1 min-w-0">
                <span className={`text-[8px] font-black uppercase block ${textSecondary}`}>Mascot Greeting</span>
                <p className="text-xs font-bold leading-normal italic truncate">
                  "Hi {userName}! Let's have a productive day!"
                </p>
              </div>
              <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                {isSketch ? (
                  <MascotDrawing pose="waving" size={55} />
                ) : (
                  <InteractiveCompanion companion={activeCompanion} mood="happy" size="sm" />
                )}
              </div>
            </div>
          </div>

          {/* 3. Settings Quick Nav List */}
          <div className={`${isSketch ? 'border-2 border-[#111111] rounded-3xl p-5 bg-white shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]' : styles.card} space-y-3 text-left`}>
            <h4 className={`text-[10px] font-black uppercase tracking-wider border-b pb-1 ${
              isSketch 
                ? 'border-[#111111]' 
                : activeTheme === 'night' 
                ? 'border-slate-800' 
                : activeTheme === 'forest' 
                ? 'border-emerald-900/30' 
                : 'border-gray-100'
            } ${textSecondary}`}>
              Settings Menu
            </h4>

            <div className="space-y-2">
              {[
                { id: 'preferences', label: 'Account Profile', sub: 'Manage user credentials', tabSec: 'account', icon: User },
                { id: 'themes', label: 'Appearance Theme', sub: 'Change visual color preset', tabSec: 'general', icon: Palette },
                { id: 'preferences', label: 'Notifications sound', sub: 'Manage alerts and barks', tabSec: 'notifications', icon: Bell },
                { id: 'preferences', label: 'Focus Timer settings', sub: 'Change intervals & goals', tabSec: 'timer', icon: Sliders }
              ].map((item, idx) => {
                const isSelected = activeTab === item.id && (item.id !== 'preferences' || activeSettingsSection === item.tabSec);
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setActiveSettingsSection(item.tabSec as any);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                      isSelected 
                        ? isSketch 
                          ? 'bg-[#111111] border-[#111111] text-white' 
                          : styles.buttonActive
                        : isSketch
                        ? 'bg-white border-[#111111] hover:bg-gray-50 text-[#111111]'
                        : `${styles.innerCard} hover:opacity-90`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-current'}`} />
                      <div>
                        <p className="text-xs font-black leading-none">{item.label}</p>
                        <p className={`text-[9px] font-bold mt-0.5 ${isSelected ? 'opacity-85' : textSecondary}`}>{item.sub}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-current'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tab Panel details (col-span-7) */}
        <div className="lg:col-span-7">
          
          {/* Active Panel container */}
          <div className={`${isSketch ? 'border-2 border-[#111111] rounded-3xl bg-white shadow-[4px_4px_0px_0px_rgba(17,17,17,1)]' : styles.card} p-5 space-y-4`}>
            
            {/* Quick Top tabs bar */}
            <div className={`flex ${isSketch ? 'border-2 border-[#111111] rounded-xl bg-[#FAF8F5]' : `border ${activeTheme === 'night' ? 'border-slate-700 bg-[#181B28]' : activeTheme === 'forest' ? 'border-emerald-900/30 bg-[#1C2822]' : 'border-[#E9E4DB] bg-[#FAF8F5]'}`} p-1 gap-1 rounded-2xl`}>
              {[
                { id: 'buddy', label: '🐱 Buddy' },
                { id: 'themes', label: '🎨 Themes' },
                { id: 'preferences', label: '⚙️ Settings' },
                { id: 'support', label: 'ℹ️ About' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? isSketch 
                        ? 'bg-[#111111] text-white' 
                        : styles.buttonActive
                      : `${textSecondary} hover:text-current`
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* TAB 1: Buddy customization & Generator */}
              {activeTab === 'buddy' && (
                <motion.div
                  key="tab-buddy"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 text-left"
                >
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wide">Customize Your Companion</h3>
                    <p className={`text-xs font-bold ${textSecondary}`}>Choose your focus buddy or generate a custom one!</p>
                  </div>

                  {/* Buddies Grid list */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    {allCompanions.slice(0, 4).map(companion => {
                       const isSelected = companion.id === activeCompanion.id;
                      return (
                        <div
                          key={companion.id}
                          onClick={() => onSelectCompanion(companion)}
                          className={`border rounded-2xl p-2 text-center flex flex-col justify-center items-center h-24 cursor-pointer transition-all ${
                            isSelected 
                              ? isSketch 
                                ? 'bg-gray-100 border-[#111111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]' 
                                : activeTheme === 'night'
                                ? 'bg-[#242A3E] border-sky-500 ring-2 ring-sky-500/20 text-white'
                                : activeTheme === 'forest'
                                ? 'bg-[#2D3F35] border-emerald-500 ring-2 ring-emerald-500/20 text-white'
                                : 'bg-[#FAF8F5] border-[#8C9A86] ring-2 ring-[#8C9A86]/20'
                              : isSketch
                              ? 'bg-white border-[#111111]/30 hover:border-[#111111]'
                              : `${styles.innerCard} hover:opacity-90`
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl overflow-hidden border flex items-center justify-center ${isSketch ? 'border-2 border-[#111111] bg-white' : activeTheme === 'night' ? 'border-slate-700 bg-slate-900' : activeTheme === 'forest' ? 'border-emerald-950/20 bg-emerald-950/40' : 'border-[#E9E4DB] bg-white'}`}>
                            {companion.svgMarkup ? (
                              <div 
                                className="w-full h-full p-1 [&>svg]:w-full [&>svg]:h-full"
                                dangerouslySetInnerHTML={{ __html: companion.svgMarkup }}
                              />
                            ) : (
                              <img src={companion.imageUrl} alt={companion.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="w-full mt-1.5">
                            <p className="text-[10px] font-black truncate">{companion.name}</p>
                            <p className={`text-[8px] font-bold truncate ${textSecondary}`}>{companion.species}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>


                </motion.div>
              )}

              {/* TAB 2: Themes selection */}
              {activeTab === 'themes' && (
                <motion.div
                  key="tab-themes"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wide">Manage Themes</h3>
                      <p className={`text-xs font-bold ${textSecondary}`}>Change colors and interface presets instantly</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[
                      { id: 'sketch', label: 'Hand-Drawn Comic', previewClass: 'bg-white border-2 border-dashed border-[#111111]', text: 'Monochrome outline' },
                      { id: 'minimal', label: 'Minimal', previewClass: 'bg-[#FAF8F5] border-[#DFD6C4]', text: 'Creamy soft workspace' },
                      { id: 'night', label: 'City Night', previewClass: 'bg-[#121820] border-slate-700', text: 'Cozy deep dark mode' },
                      { id: 'forest', label: 'Forest', previewClass: 'bg-[#DFE7DD] border-[#9AB596]', text: 'Organic sage forest' },
                      { id: 'lavender', label: 'Lavender', previewClass: 'bg-[#F2EAFA] border-[#D1BEE3]', text: 'Calm purple lilac' }
                    ].map(themeItem => {
                      const isSelected = activeTheme === themeItem.id;
                      return (
                        <div
                          key={themeItem.id}
                          onClick={() => onSelectTheme(themeItem.id)}
                          className={`border rounded-2xl p-2.5 cursor-pointer transition-all flex items-center gap-3 ${
                            isSelected 
                              ? isSketch 
                                ? 'bg-gray-50 border-2 border-[#111111] shadow-[2px_2px_0px_0px_rgba(17,17,17,1)]' 
                                : activeTheme === 'night'
                                ? 'bg-slate-800 border-sky-500 ring-2 ring-sky-500/20 text-white'
                                : activeTheme === 'forest'
                                ? 'bg-[#2D3F35] border-emerald-500 ring-2 ring-emerald-500/20 text-white'
                                : 'bg-[#FAF8F5] border-[#8C9A86] ring-2 ring-[#8C9A86]/20'
                              : isSketch
                              ? 'bg-white border-[#111111]/20 hover:border-[#111111]'
                              : `${styles.innerCard} hover:opacity-90`
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg ${themeItem.previewClass} border shrink-0`} />
                          <div className="text-left min-w-0">
                            <p className="text-[11px] font-black truncate">{themeItem.label}</p>
                            <p className={`text-[9px] font-bold truncate ${textSecondary}`}>{themeItem.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: Preferences & accounts */}
              {activeTab === 'preferences' && (
                <motion.div
                  key="tab-preferences"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 text-left"
                >
                  {activeSettingsSection === 'account' && (
                    <div className="space-y-3.5">
                      <h4 className={`text-xs font-black uppercase border-b pb-1 ${
                        isSketch 
                          ? 'border-[#111111]' 
                          : activeTheme === 'night' 
                          ? 'border-slate-800' 
                          : activeTheme === 'forest' 
                          ? 'border-emerald-900/30' 
                          : 'border-gray-100'
                      } ${textSecondary}`}>Account & Details</h4>
                      
                      <form onSubmit={handleUpdateAccount} className="space-y-3">
                        <div className="space-y-1">
                          <label className={`text-[10px] font-black uppercase ${textSecondary}`}>Edit Name</label>
                          <input 
                            type="text" 
                            value={nameInput}
                            onChange={e => setNameInput(e.target.value)}
                            required
                            className={styles.input + " w-full"}
                          />
                        </div>

                        <button 
                          type="submit"
                          className={`px-4 py-1.5 text-xs font-black rounded-lg cursor-pointer ${
                            isSketch 
                              ? 'bg-[#111111] hover:bg-gray-800 text-white border-2 border-[#111111]' 
                              : 'bg-[#8C9A86] hover:bg-[#778671] text-white'
                          }`}
                        >
                          Save Changes
                        </button>
                      </form>

                      {/* Profile Picture drag drop upload */}
                      <div className={`space-y-1 pt-2 border-t border-dashed ${isSketch ? 'border-[#111111]' : 'border-gray-100'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <label className={`text-[10px] font-black uppercase block ${textSecondary}`}>Avatar Image</label>
                          {userProfilePic && (
                            <button
                              type="button"
                              onClick={() => onUpdateUserProfilePic(null)}
                              className="text-[10px] text-red-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Remove Pic
                            </button>
                          )}
                        </div>
                        <div 
                          onClick={handleContainerClick}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                            isDragging 
                              ? isSketch 
                                ? 'bg-gray-100 border-[#111111]' 
                                : 'bg-[#FAF8EE] border-[#8C9A86]'
                              : isSketch 
                              ? 'bg-[#FAF8F5] border-[#111111]/30 hover:border-[#111111]' 
                              : activeTheme === 'night'
                              ? 'bg-[#242A3E] border-slate-700 hover:border-sky-500'
                              : activeTheme === 'forest'
                              ? 'bg-[#2D3F35] border-emerald-900/30 hover:border-emerald-500'
                              : 'bg-white border-[#E9E4DB] hover:border-gray-400'
                          }`}
                        >
                          <div className="space-y-1 pointer-events-none">
                            <Upload className="w-5 h-5 mx-auto text-current" />
                            <p className={`text-[10px] font-black ${textSecondary}`}>
                              {userProfilePic ? "Click or drag to change profile pic" : "Drag profile pic here or browse"}
                            </p>
                            <input 
                              ref={fileInputRef}
                              type="file" 
                              accept="image/*" 
                              onChange={handleFileInputChange} 
                              className="hidden" 
                              id="avatar-file-upload" 
                            />
                            <span className="text-[9px] font-black hover:underline block mt-1 cursor-pointer">
                              Select from computer
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSettingsSection === 'notifications' && (
                    <div className="space-y-4">
                      <h4 className={`text-xs font-black uppercase border-b pb-1 ${
                        isSketch 
                          ? 'border-[#111111]' 
                          : activeTheme === 'night' 
                          ? 'border-slate-800' 
                          : activeTheme === 'forest' 
                          ? 'border-emerald-900/30' 
                          : 'border-gray-100'
                      } ${textSecondary}`}>Mute Options</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-black">Enable Timer Alarm sound</p>
                            <p className={`text-[9px] font-bold ${textSecondary}`}>Plays a soft bell chime when work block ends</p>
                          </div>
                          <button 
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                              soundEnabled 
                                ? isSketch ? 'bg-[#111111] border-2 border-[#111111]' : 'bg-[#8C9A86]' 
                                : activeTheme === 'night' || activeTheme === 'forest'
                                ? 'bg-slate-900 border border-slate-700'
                                : 'bg-gray-100 border border-gray-300'
                            }`}
                          >
                            <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-xs transition-transform ${
                              soundEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-black">Play Companion greetings</p>
                            <p className={`text-[9px] font-bold ${textSecondary}`}>Shows interactive speech bubbles periodically</p>
                          </div>
                          <button 
                            onClick={() => setBuddyBarks(!buddyBarks)}
                            className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                              buddyBarks 
                                ? isSketch ? 'bg-[#111111] border-2 border-[#111111]' : 'bg-[#8C9A86]' 
                                : activeTheme === 'night' || activeTheme === 'forest'
                                ? 'bg-slate-900 border border-slate-700'
                                : 'bg-gray-100 border border-gray-300'
                            }`}
                          >
                            <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-xs transition-transform ${
                              buddyBarks ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSettingsSection === 'timer' && (
                    <div className="space-y-4">
                      <h4 className={`text-xs font-black uppercase border-b pb-1 ${
                        isSketch 
                          ? 'border-[#111111]' 
                          : activeTheme === 'night' 
                          ? 'border-slate-800' 
                          : activeTheme === 'forest' 
                          ? 'border-emerald-900/30' 
                          : 'border-gray-100'
                      } ${textSecondary}`}>Global Timer Intervals</h4>
                      
                      <div className="space-y-2">
                        <div className={`flex justify-between items-center p-3 rounded-xl ${isSketch ? 'bg-[#FAF8F5] border-2 border-[#111111]' : styles.innerCard}`}>
                          <div>
                            <p className="text-xs font-black">Customize intervals</p>
                            <p className={`text-[9px] font-bold ${textSecondary}`}>Adjust default durations on the Focus Page.</p>
                          </div>
                          <button className={`text-xs font-black px-3 py-1 rounded-lg cursor-pointer ${isSketch ? 'border-2 border-[#111111] bg-white text-[#111111]' : styles.button}`}>
                            Configure
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 4: About/Legal details */}
              {activeTab === 'support' && (
                <motion.div
                  key="tab-support"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3 text-left"
                >
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wide">About Catalyst AI</h3>
                    <p className={`text-[10px] font-bold ${textSecondary}`}>Multi-Theme Responsive Edition v1.2</p>
                  </div>

                  <p className={`text-xs font-medium leading-relaxed ${isSketch ? 'text-gray-600' : 'text-current'}`}>
                    Catalyst AI is an offline-friendly, cognitive-wellness productivity suite. It uses structured time slicing, nested operation trees, and interactive companions to defeat executive dysfunction.
                  </p>

                  <div className={`p-3 rounded-2xl text-[10px] font-bold italic border ${isSketch ? 'bg-gray-50 border-2 border-[#111111]' : styles.innerCard}`}>
                    "Crafted with love using modern high-contrast aesthetic alignments to maximize focus and visual calmness."
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
