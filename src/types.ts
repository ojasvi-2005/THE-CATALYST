export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  duration: number; // in minutes (sub-15 actions)
}

export interface DeconstructedStep {
  id: string;
  step: string;
  durationMinutes: number;
  energyRequired: 'Low' | 'Medium';
  completed: boolean;
}

export interface DeconstructedTask {
  id: string;
  taskName: string;
  microSteps: DeconstructedStep[];
}

export interface DeconstructedPhase {
  id: string;
  phaseName: string;
  tasks: DeconstructedTask[];
}

export interface DeconstructedProject {
  projectTitle: string;
  estimatedTotalEnergy: 'Low' | 'Medium' | 'High';
  structure: DeconstructedPhase[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  duration: number; // in minutes
  energyCost: 'low' | 'medium' | 'high';
  scheduledTime?: string; // e.g., '14:00'
  contextFiles?: string[]; // references to connected file IDs
  subtasks?: SubTask[];
  deconstructed?: DeconstructedProject;
  status: 'pending' | 'active' | 'completed';
  createdAt: string;
}

export interface ContextFile {
  id: string;
  name: string;
  type: 'Textbook' | 'Notes' | 'Shared Drive' | 'Code Repository';
  contentSummary: string;
  detailedContent: string;
}

export interface ChronotypeStats {
  historicalCompletionRate: number; // percentage
  responseLatency: number; // average response time to notifications (sec)
  fatigueCount: number; // times buffer triggered
  averageFocusDuration: number; // minutes
}

export interface EnergyDataPoint {
  hour: number; // 0-23
  score: number; // 0-100
}

export interface CompanionMascot {
  id: string;
  name: string;
  species: string;
  imageUrl: string;
  description: string;
  svgMarkup?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'birthday' | 'anniversary' | 'reminder';
}

export interface InboundMessage {
  id: string;
  sender: string;
  source: 'Slack' | 'Discord' | 'Email';
  content: string;
  timestamp: string;
  detectedTaskTitle?: string;
  detectedDeadline?: string;
  status: 'pending' | 'added' | 'dismissed';
}


