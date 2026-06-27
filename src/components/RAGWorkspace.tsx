import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, ContextFile } from '../types';
import { 
  FolderClosed, 
  FileText, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  Check, 
  Plus,
  BookOpen,
  ArrowUpRight,
  Code,
  Globe,
  Loader2,
  Minimize2
} from 'lucide-react';

interface RAGWorkspaceProps {
  connectedFiles: ContextFile[];
  onAddConnectedFile: (file: Partial<ContextFile>) => void;
  activeLaunchpad: {
    task: Task;
    matchedFiles: string[];
    prefetchedSummary: string;
    preloadedState: string;
    studyChecklist: string[];
  } | null;
  onClearLaunchpad: () => void;
  ragLoading: boolean;
  onTriggerToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export default function RAGWorkspace({
  connectedFiles,
  onAddConnectedFile,
  activeLaunchpad,
  onClearLaunchpad,
  ragLoading,
  onTriggerToast
}: RAGWorkspaceProps) {
  const [showFolderUploader, setShowFolderUploader] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'Textbook' | 'Notes' | 'Shared Drive' | 'Code Repository'>('Notes');
  const [newFileSummary, setNewFileSummary] = useState('');
  const [newFileDetail, setNewFileDetail] = useState('');
  
  // Interactive Document Workspace Panel (simulation of the actual workspace)
  const [documentContent, setDocumentContent] = useState('');
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const handleAddFileSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    onAddConnectedFile({
      name: newFileName.endsWith('.txt') || newFileName.endsWith('.pdf') || newFileName.endsWith('.ts') ? newFileName : `${newFileName}.txt`,
      type: newFileType,
      contentSummary: newFileSummary || "User connected resource file.",
      detailedContent: newFileDetail || "Full details and lecture specifications are synced here."
    });

    setNewFileName('');
    setNewFileSummary('');
    setNewFileDetail('');
    setShowFolderUploader(false);
  };

  const handleLaunchIntegratedWorkspace = () => {
    if (!activeLaunchpad) return;
    setDocumentContent(`// Integrated Catalyst Workspace preloaded with ${activeLaunchpad.task.title}\n// Context: ${activeLaunchpad.preloadedState}\n\n// Start writing here...\n`);
    setIsWorkspaceOpen(true);
  };

  const toggleStep = (step: string) => {
    setCompletedSteps(prev => ({ ...prev, [step]: !prev[step] }));
  };

  return (
    <div className="bg-white border border-[#E9E4DB] rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#2C2A29] tracking-tight">Connected Directories & RAG</h2>
          <p className="text-xs text-[#5D5750]">Synched folders containing learning files and specification libraries</p>
        </div>
        <button
          onClick={() => setShowFolderUploader(!showFolderUploader)}
          className="flex items-center gap-1.5 border border-[#DFD6C4] hover:bg-[#FAF8F5] text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm transition-all cursor-pointer"
        >
          Connect File
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Connected Files Folder View */}
      <div className="bg-[#FAF9F5] border border-[#E9E4DB] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FolderClosed className="w-4.5 h-4.5 text-[#8C9A86]" />
          <span className="text-xs font-bold text-[#5D5750] uppercase tracking-wider">Connected Resource Repository ({connectedFiles.length})</span>
        </div>

        <AnimatePresence>
          {showFolderUploader && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddFileSubmit}
              className="bg-white border border-[#E9E4DB] rounded-xl p-3 mb-3 space-y-3 overflow-hidden text-xs"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="font-bold text-[#5D5750]">Resource Name</label>
                  <input 
                    type="text" 
                    value={newFileName}
                    onChange={e => setNewFileName(e.target.value)}
                    placeholder="e.g. Physics_Formulas.txt" 
                    required
                    className="w-full bg-[#FAF9F5] border border-[#E2DCCE] rounded-lg px-2 py-1.5 text-xs text-[#2C2A29] focus:outline-none"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="font-bold text-[#5D5750]">Directory Type</label>
                  <select 
                    value={newFileType}
                    onChange={e => setNewFileType(e.target.value as any)}
                    className="w-full bg-[#FAF9F5] border border-[#E2DCCE] rounded-lg px-2 py-1.5 text-xs text-[#2C2A29] focus:outline-none"
                  >
                    <option value="Notes">📝 Notes</option>
                    <option value="Textbook">📖 Textbook</option>
                    <option value="Shared Drive">☁️ Shared Drive</option>
                    <option value="Code Repository">💻 Code Repository</option>
                  </select>
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="font-bold text-[#5D5750]">Quick Summary (Index)</label>
                <input 
                  type="text" 
                  value={newFileSummary}
                  onChange={e => setNewFileSummary(e.target.value)}
                  placeholder="e.g. Reference sheet for equations" 
                  className="w-full bg-[#FAF9F5] border border-[#E2DCCE] rounded-lg px-2 py-1.5 text-xs text-[#2C2A29] focus:outline-none"
                />
              </div>

              <div className="space-y-0.5">
                <label className="font-bold text-[#5D5750]">Detailed Contents (For RAG lookups)</label>
                <textarea 
                  value={newFileDetail}
                  onChange={e => setNewFileDetail(e.target.value)}
                  placeholder="Paste section contents, formula libraries, or specifications..." 
                  rows={2}
                  className="w-full bg-[#FAF9F5] border border-[#E2DCCE] rounded-lg px-2 py-1.5 text-xs text-[#2C2A29] focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowFolderUploader(false)}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-[#5D5750] rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-2.5 py-1 bg-[#8C9A86] hover:bg-[#778671] text-white rounded font-semibold cursor-pointer"
                >
                  Sync File
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Small horizontal list of connected files */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {connectedFiles.map(file => (
            <div 
              key={file.id} 
              title={file.detailedContent}
              className="bg-white border border-[#E9E4DB] rounded-xl p-2.5 flex items-center gap-2 shadow-xs"
            >
              {file.type === 'Textbook' && <BookOpen className="w-4 h-4 text-amber-600 flex-shrink-0" />}
              {file.type === 'Notes' && <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
              {file.type === 'Shared Drive' && <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />}
              {file.type === 'Code Repository' && <Code className="w-4 h-4 text-indigo-600 flex-shrink-0" />}

              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#2C2A29] truncate">{file.name}</p>
                <p className="text-[9px] text-[#8C867E] truncate">{file.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RAG Active Launchpad card visual */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-[#5D5750] uppercase tracking-wider">RAG Synthesis Launchpad</h3>
        
        {ragLoading ? (
          <div className="flex flex-col items-center justify-center py-12 bg-[#FAF8F5] border border-dashed border-[#DFD6C4] rounded-2xl">
            <Loader2 className="w-8 h-8 text-[#8C9A86] animate-spin mb-2" />
            <p className="text-xs font-semibold text-[#8C867E]">Retrieving directories & matching materials...</p>
            <p className="text-[10px] text-[#ACAA9F]">Assembling your workspace desk details</p>
          </div>
        ) : activeLaunchpad ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#FFFDF6] border-2 border-amber-200/60 rounded-2xl p-5 space-y-4 relative shadow-sm"
          >
            {/* Launchpad Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="bg-amber-100 text-amber-900 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border border-amber-200">
                  🐾 Desk Launchpad Prepared
                </span>
                <h4 className="text-base font-extrabold text-[#2C2A29] mt-1.5 leading-tight">{activeLaunchpad.task.title}</h4>
              </div>
              <button 
                onClick={onClearLaunchpad}
                className="text-[#8C867E] hover:text-[#2C2A29] text-xs font-bold cursor-pointer"
              >
                Clear
              </button>
            </div>

            {/* Matching Directory References */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-[#5D5750] mr-1">RAG Context:</span>
              {activeLaunchpad.matchedFiles.map((fn, idx) => (
                <span key={idx} className="bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10px] px-2 py-0.5 rounded-md font-bold">
                  {fn}
                </span>
              ))}
            </div>

            {/* Synthesized Paragraph */}
            <div className="bg-white border border-[#E9E4DB] rounded-xl p-3 text-xs leading-relaxed text-[#2C2A29]">
              <div className="flex items-center gap-1 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <strong className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">Biscuit's Pre-Fetched Summary</strong>
              </div>
              {activeLaunchpad.prefetchedSummary}
            </div>

            {/* Study Checklist / Prep steps */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#5D5750] uppercase tracking-wider block">Recommended Milestones</span>
              <div className="space-y-1.5">
                {activeLaunchpad.studyChecklist.map((step, idx) => (
                  <div 
                    key={idx}
                    onClick={() => toggleStep(step)}
                    className="flex items-start gap-2 bg-white border border-[#E9E4DB] hover:border-[#DFD6C4] rounded-xl p-2.5 cursor-pointer transition-colors"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {completedSteps[step] ? (
                        <Check className="w-4 h-4 text-emerald-600 font-bold" />
                      ) : (
                        <div className="w-4 h-4 border border-[#ACAA9F] rounded-full" />
                      )}
                    </div>
                    <span className={`text-xs ${completedSteps[step] ? 'line-through text-[#8C867E]' : 'text-[#2C2A29]'}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Workspace action trigger */}
            <div className="pt-2 border-t border-[#EAE2D4] flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#8C867E]">
                Status: {activeLaunchpad.preloadedState}
              </span>
              <button
                onClick={handleLaunchIntegratedWorkspace}
                className="flex items-center gap-1 bg-[#8C9A86] hover:bg-[#778671] text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Launch Workspace
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-10 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#DFD6C4]">
            <p className="text-xs text-[#8C867E]">Launchpad standby.</p>
            <p className="text-[10px] text-[#ACAA9F] mt-0.5">Click the document launch button next to any task above.</p>
          </div>
        )}
      </div>

      {/* Integrated Workspace modal / panel simulation */}
      <AnimatePresence>
        {isWorkspaceOpen && activeLaunchpad && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-[#2C2A29]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          >
            <div className="bg-[#FFFDF9] border border-[#E9E4DB] rounded-3xl p-6 shadow-2xl max-w-2xl w-full space-y-4">
              <div className="flex items-center justify-between border-b border-[#E9E4DB] pb-3">
                <div>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase">
                    Integrated Workspace Active
                  </span>
                  <h3 className="text-base font-bold text-[#2C2A29] mt-1">{activeLaunchpad.task.title}</h3>
                </div>
                <button
                  onClick={() => setIsWorkspaceOpen(false)}
                  className="p-1.5 text-[#8C867E] hover:text-[#2C2A29] rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <Minimize2 className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Connected materials reference strip */}
              <div className="bg-[#FAF9F5] border border-[#E9E4DB] rounded-xl p-3 flex gap-4 overflow-x-auto text-[11px]">
                <div className="flex-shrink-0">
                  <strong className="text-emerald-800">Pre-Fetched Guide:</strong>
                </div>
                <div>
                  {activeLaunchpad.prefetchedSummary}
                </div>
              </div>

              {/* Simulated draft editor */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D5750] uppercase tracking-wider block">Workspace Editor</label>
                <textarea
                  value={documentContent}
                  onChange={e => setDocumentContent(e.target.value)}
                  rows={8}
                  className="w-full bg-[#1e1e1e] border-2 border-[#E2DCCE] rounded-2xl p-4 font-mono text-xs text-green-400 focus:outline-none focus:border-[#8C9A86] resize-none"
                />
              </div>

              {/* Progress and submit */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-bold text-amber-800">
                  🐾 Biscuit is sitting on your rug, watching happily!
                </span>
                <button
                  onClick={() => {
                    if (onTriggerToast) {
                      onTriggerToast("Awesome! Draft progress saved. Biscuit executes a triple backflip of celebration! 🎉", "success");
                    }
                    setIsWorkspaceOpen(false);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Save Draft Progress
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
