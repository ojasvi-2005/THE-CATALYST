import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client Lazily/Safely
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. AI features will fallback to client-side heuristics.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", hasApiKey: !!process.env.GEMINI_API_KEY });
});

// 2. Ambient Brain-Dump Parser (Chaos-Parsing & Decompression Engine)
// Extracts structured tasks with metadata and mandatory buffers from raw, chaotic vent text
app.post("/api/gemini/brain-dump", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "Text is required and must be a string." });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback heuristics if no key exists
      const mockResult = generateLocalBrainDumpFallback(text);
      res.json(mockResult);
      return;
    }

    const now = new Date();
    const hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const format2Digits = (num: number) => String(num).padStart(2, '0');
    const userLocalTimeStr = `${now.getFullYear()}-${format2Digits(now.getMonth() + 1)}-${format2Digits(now.getDate())} ${format2Digits(displayHours)}:${format2Digits(now.getMinutes())} ${ampm} Local Timezone`;
    const modelInput = `[USER_LOCAL_TIME: ${userLocalTimeStr}]\nUser Input: "${text}"`;

    const ai = getGeminiClient();
    const systemPrompt = `You are the Chaos-Parsing & Decompression Engine for Catalyst AI. Your job is to take raw, messy, unstructured thoughts ("brain-dumps") and extract actionable tasks, deadlines, and required decompression buffers.

CRITICAL INSTRUCTIONS:
1. Temporal Reference: You will be provided with the variable [USER_LOCAL_TIME]. You MUST use this exact reference to calculate all relative time expressions (e.g., "tomorrow morning", "in two hours"). Never guess the current date or timezone.
2. Energy Wave Analysis: Categorize the user's implicit cognitive load and emotional state based on their phrasing.
3. Decompression Scheduling: For intense or high-energy tasks, explicitly schedule a mandatory buffer block immediately afterward.

INPUT SYNTAX EXPECTED:
[USER_LOCAL_TIME: YYYY-MM-DD HH:MM AM/PM Local Timezone]
User Input: "..."

OUTPUT FORMAT (JSON Schema):
{
  "extractedTasks": [
    { "task": "String", "targetDateTime": "YYYY-MM-DD HH:MM or null", "energyCost": "Low | Medium | High" }
  ],
  "recommendedBuffers": [
    { "afterTask": "String", "durationMinutes": Integer, "activitySuggestion": "String (Low cognitive overhead activity)" }
  ],
  "userEnergyState": "Overwhelmed | Focused | Fatigued | Creative"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: modelInput,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["extractedTasks", "recommendedBuffers", "userEnergyState"],
          properties: {
            extractedTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["task", "targetDateTime", "energyCost"],
                properties: {
                  task: { type: Type.STRING },
                  targetDateTime: { type: Type.STRING },
                  energyCost: {
                    type: Type.STRING,
                    enum: ["Low", "Medium", "High"]
                  }
                }
              }
            },
            recommendedBuffers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["afterTask", "durationMinutes", "activitySuggestion"],
                properties: {
                  afterTask: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                  activitySuggestion: { type: Type.STRING }
                }
              }
            },
            userEnergyState: {
              type: Type.STRING,
              enum: ["Overwhelmed", "Focused", "Fatigued", "Creative"]
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Brain-dump extraction failed:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

// 3. Recursive Task Deconstructor
// Decomposes any complex or ambiguous goal into a nested hierarchy of Phases, Tasks, and sub-15 minute Micro-steps
app.post("/api/gemini/decompose-task", async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      res.status(400).json({ error: "Task title is required." });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const mockResult = generateLocalDecomposeFallback(title, description);
      res.json(mockResult);
      return;
    }

    const ai = getGeminiClient();
    const systemPrompt = `You are the Core Task Deconstruction Engine for Catalyst AI. Your goal is to alleviate executive dysfunction by breaking overwhelming, ambiguous projects into a clear, nested hierarchy of actionable steps.

CRITICAL INSTRUCTIONS:
1. Scope Assessment: Evaluate the scale of the user's input. Do not return a flat list. You must break the project down into nested Phases, Tasks, and Micro-steps.
2. The 15-Minute Rule: The lowest-level "microSteps" MUST take 15 minutes or less to complete. They must represent physical, undeniable actions (e.g., "Draft 3 bullet points" not "Research topic").
3. Emotional Tone: Keep titles objective but clear. Avoid intimidating jargon.

OUTPUT FORMAT (JSON Schema):
{
  "projectTitle": "String",
  "estimatedTotalEnergy": "Low | Medium | High",
  "structure": [
    {
      "phaseName": "String (High-level stage)",
      "tasks": [
        {
          "taskName": "String (Specific sub-task)",
          "microSteps": [
            { 
              "step": "String (Actionable step)", 
              "durationMinutes": "Integer (Max 15)", 
              "energyRequired": "Low | Medium" 
            }
          ]
        }
      ]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Large Goal: "${title}"\nDetails: "${description || "None"}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["projectTitle", "estimatedTotalEnergy", "structure"],
          properties: {
            projectTitle: { type: Type.STRING },
            estimatedTotalEnergy: {
              type: Type.STRING,
              enum: ["Low", "Medium", "High"]
            },
            structure: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["phaseName", "tasks"],
                properties: {
                  phaseName: { type: Type.STRING },
                  tasks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["taskName", "microSteps"],
                      properties: {
                        taskName: { type: Type.STRING },
                        microSteps: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            required: ["step", "durationMinutes", "energyRequired"],
                            properties: {
                              step: { type: Type.STRING },
                              durationMinutes: { type: Type.INTEGER },
                              energyRequired: {
                                type: Type.STRING,
                                enum: ["Low", "Medium"]
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Task decomposition failed:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

// 4. Contextual RAG Synthesis Engine (Contextual Document Synthesis Engine)
// Matches files dynamically with the task, prefetches reading info, and formats a Workspace Launchpad
app.post("/api/gemini/context-rag", async (req, res) => {
  try {
    const { taskTitle, taskDescription, connectedFiles } = req.body;
    if (!taskTitle) {
      res.status(400).json({ error: "Task title is required." });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const mockResult = generateLocalRagFallback(taskTitle, connectedFiles);
      res.json(mockResult);
      return;
    }

    const ai = getGeminiClient();
    const systemPrompt = `You are the Contextual Document Synthesis Engine for Catalyst AI. You are provided with raw snippets of user-connected documents. Your job is to extract only the highest-signal context for their current task.

CRITICAL INSTRUCTIONS:
1. Strict Relevance Filter: Scan the provided file text. If a text snippet does NOT directly help complete the current task, IGNORE IT completely. 
2. Anti-Hallucination: Rely ONLY on the explicit facts present in the text. Do not extrapolate, infer, or assume missing details.
3. Information Density: Condense matching data into clear, actionable bullet points that lower the user's activation energy to start the task.

OUTPUT FORMAT (JSON Schema):
{
  "relevantContextFound": Boolean,
  "matchedFileNames": ["String"],
  "prefetchedSummary": "String (Synthesized reference info to help them start)",
  "insights": ["String (High-density factual insights extracted directly from files)"],
  "actionableDependencies": ["String (Prerequisites found in the text)"]
}`;

    const connectedFilesText = Array.isArray(connectedFiles) 
      ? connectedFiles.map((f: any) => `File: ${f.name} (${f.type})\nSummary: ${f.contentSummary}\nDetail: ${f.detailedContent}`).join("\n\n")
      : "No files currently connected.";

    const contents = `Task: "${taskTitle}"\nDescription: "${taskDescription || ""}"\n\nConnected Files Available:\n${connectedFilesText}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "relevantContextFound",
            "matchedFileNames",
            "prefetchedSummary",
            "insights",
            "actionableDependencies"
          ],
          properties: {
            relevantContextFound: { type: Type.BOOLEAN },
            matchedFileNames: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            prefetchedSummary: { type: Type.STRING },
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            actionableDependencies: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    
    // Map new fields to backward compatible ones for the frontend
    res.json({
      ...parsedData,
      // Backend new fields:
      relevantContextFound: parsedData.relevantContextFound || false,
      matchedFileNames: parsedData.matchedFileNames || [],
      prefetchedSummary: parsedData.prefetchedSummary || '',
      insights: parsedData.insights || [],
      actionableDependencies: parsedData.actionableDependencies || [],
      
      // Frontend backward-compatible fields:
      matchedFiles: parsedData.matchedFileNames || [],
      preloadedState: parsedData.relevantContextFound ? "Relevant context pre-loaded successfully." : "Ready to start task.",
      studyChecklist: parsedData.actionableDependencies && parsedData.actionableDependencies.length > 0 
        ? parsedData.actionableDependencies 
        : (parsedData.insights && parsedData.insights.length > 0 ? parsedData.insights : ["Review matched materials and documents"])
    });
  } catch (error: any) {
    console.error("RAG Synthesis failed:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

// Fallback logic for local offline experience/development if API keys are missing
function generateLocalBrainDumpFallback(text: string) {
  const lowercase = text.toLowerCase();
  const extractedTasks = [];
  const recommendedBuffers = [];
  let userEnergyState: "Overwhelmed" | "Focused" | "Fatigued" | "Creative" = "Focused";

  if (lowercase.includes("stressed") || lowercase.includes("tired") || lowercase.includes("overwhelmed") || lowercase.includes("too much") || lowercase.includes("hard")) {
    userEnergyState = "Overwhelmed";
  } else if (lowercase.includes("sleepy") || lowercase.includes("exhausted") || lowercase.includes("fatigued")) {
    userEnergyState = "Fatigued";
  } else if (lowercase.includes("idea") || lowercase.includes("create") || lowercase.includes("design") || lowercase.includes("creative")) {
    userEnergyState = "Creative";
  }

  const now = new Date();
  const getTomorrowStr = (hoursAndMinutes: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hoursAndMinutes}`;
  };

  const getTodayStr = (hoursAndMinutes: string) => {
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hoursAndMinutes}`;
  };

  if (lowercase.includes("math") || lowercase.includes("linear") || lowercase.includes("algebra") || lowercase.includes("homework")) {
    extractedTasks.push({
      task: "Complete Linear Algebra Homework",
      targetDateTime: getTodayStr("15:00"),
      energyCost: "High"
    });
    recommendedBuffers.push({
      afterTask: "Complete Linear Algebra Homework",
      durationMinutes: 15,
      activitySuggestion: "Take a quiet 15-minute screen-free coffee break to restore cognitive capacity ☕"
    });
  }
  if (lowercase.includes("groceries") || lowercase.includes("buy") || lowercase.includes("eat") || lowercase.includes("milk")) {
    extractedTasks.push({
      task: "Go shopping for groceries",
      targetDateTime: getTodayStr("18:00"),
      energyCost: "Low"
    });
  }
  if (lowercase.includes("email") || lowercase.includes("professor") || lowercase.includes("write") || lowercase.includes("mail")) {
    extractedTasks.push({
      task: "Email professor regarding extension",
      targetDateTime: getTomorrowStr("11:00"),
      energyCost: "Medium"
    });
  }
  
  if (extractedTasks.length === 0) {
    const cleanedTitle = text.length > 50 ? text.substring(0, 47) + "..." : text;
    extractedTasks.push({
      task: `Organize notes on: ${cleanedTitle}`,
      targetDateTime: getTodayStr("16:00"),
      energyCost: "Medium"
    });
  }

  return {
    extractedTasks,
    recommendedBuffers,
    userEnergyState
  };
}

function generateLocalDecomposeFallback(title: string, description?: string) {
  return {
    projectTitle: title,
    estimatedTotalEnergy: "Medium",
    structure: [
      {
        phaseName: "Phase 1: Setup & Groundwork",
        tasks: [
          {
            taskName: "Initialization",
            microSteps: [
              { step: "Define visual placeholder block", durationMinutes: 3, energyRequired: "Low" },
              { step: "Write down layout specifications", durationMinutes: 5, energyRequired: "Low" }
            ]
          }
        ]
      },
      {
        phaseName: "Phase 2: Core Engineering",
        tasks: [
          {
            taskName: "Implementation",
            microSteps: [
              { step: "Connect bounciness action handler", durationMinutes: 7, energyRequired: "Medium" },
              { step: "Verify container rendering metrics", durationMinutes: 5, energyRequired: "Low" }
            ]
          }
        ]
      }
    ]
  };
}

function generateLocalRagFallback(taskTitle: string, connectedFiles: any[]) {
  // Try to find files with matching title keywords
  const titleWords = taskTitle.toLowerCase().split(/\s+/);
  const matched = (connectedFiles || []).filter((f: any) => 
    titleWords.some(w => w.length > 3 && f.name.toLowerCase().includes(w))
  );

  const filenames = matched.map((f: any) => f.name);
  if (filenames.length === 0 && (connectedFiles || []).length > 0) {
    filenames.push(connectedFiles[0].name);
  }

  return {
    matchedFiles: filenames.length > 0 ? filenames : ["General Notes.txt"],
    prefetchedSummary: `Biscuit mapped this task directly to your study workspace. We've fetched Ch 4 on Matrix Transformations. Practice focuses on reflection vectors & scale factors!`,
    preloadedState: "Draft notebook preloaded to Section 2: Reflection Exercises",
    studyChecklist: [
      "Review reflection matrices formulas in Ch 4.2",
      "Draft draft solutions for problems 1 to 5"
    ],
    relevantContextExtracted: filenames.length > 0,
    insights: [
      "Reflection matrix through the y-axis is represented as [[-1, 0], [0, 1]].",
      "All formulas reside in Ch 4 section 4.2 under transformations."
    ],
    actionableDependencies: [
      "Review Chapter 4.1 introduction before beginning matrix multiplication exercises."
    ]
  };
}

// 5. Dynamic Cute Vector Mascot Generator (Visual Identity Companion Designer)
// Generates an interactive, beautiful custom vector mascot and companion configurations
app.post("/api/gemini/generate-mascot", async (req, res) => {
  let animalName = "";
  try {
    animalName = req.body.animalName || "";
    if (!animalName || typeof animalName !== "string") {
      res.status(400).json({ error: "Animal name is required and must be a string." });
      return;
    }

    const ALLOWED_ANIMALS = [
      "spider", "tiger", "cat", "fox", "red panda", "panda", "lion", "snake",
      "pig", "dog", "rabbit", "elephant", "penguin", "owl", "hamster"
    ];
    const cleanAnimal = animalName.trim().toLowerCase();
    if (!ALLOWED_ANIMALS.includes(cleanAnimal)) {
      res.status(400).json({ error: `Unsupported animal. Allowed list: ${ALLOWED_ANIMALS.join(', ')}` });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const fallbackMascot = generateLocalMascotFallback(animalName);
      res.json(fallbackMascot);
      return;
    }

    const ai = getGeminiClient();
    const systemPrompt = `You are the Visual Identity Companion Designer for Catalyst AI. Your job is to generate a structured styling configuration for a "cozy, chubby animal companion" that mirrors the user's current productivity state.

CRITICAL INSTRUCTIONS:
1. NEVER output raw HTML, CSS, or SVG coordinate paths. You are mathematically blind and cannot draw vectors accurately.
2. Output a semantic styling token object based on the user's animal choice and emotional state.
3. Match the mood: if the user is tired, the mascot should be "Cozy/Sleepy"; if focused, it should be "Alert/Cheering".

OUTPUT FORMAT (JSON Schema):
{
  "name": "String (A cute name)",
  "species": "String (e.g., Chubby Little Fox)",
  "dialogue": "String (1-2 sentences of contextual encouragement)",
  "animalType": "Capybara | Cat | Bear | Frog | Otter | Fox | Dog",
  "mood": "Cozy | Focused | Celebrating | Restful",
  "palette": {
    "primaryBodyColor": "Hex Code (soft/pastel only)",
    "accentColor": "Hex Code",
    "cheekBlushColor": "Hex Code"
  },
  "features": {
    "eyeStyle": "Sleepy | Dots | Sparkle | Closed-Happy",
    "mouthStyle": "Slight Smile | Open Whee | Comfy Line",
    "accessory": "Coffee Mug | Blanket | Glasses | Headbands | None"
  },
  "animationTrigger": "Breathing | Floating | Nodding | Pouncing"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Design a cute mascot and configuration for the animal: "${animalName}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "name", "species", "dialogue", "animalType", "mood", "palette", "features", "animationTrigger"
          ],
          properties: {
            name: { type: Type.STRING },
            species: { type: Type.STRING },
            dialogue: { type: Type.STRING },
            animalType: {
              type: Type.STRING,
              enum: ["Capybara", "Cat", "Bear", "Frog", "Otter", "Fox", "Dog"]
            },
            mood: {
              type: Type.STRING,
              enum: ["Cozy", "Focused", "Celebrating", "Restful"]
            },
            palette: {
              type: Type.OBJECT,
              required: ["primaryBodyColor", "accentColor", "cheekBlushColor"],
              properties: {
                primaryBodyColor: { type: Type.STRING },
                accentColor: { type: Type.STRING },
                cheekBlushColor: { type: Type.STRING }
              }
            },
            features: {
              type: Type.OBJECT,
              required: ["eyeStyle", "mouthStyle", "accessory"],
              properties: {
                eyeStyle: {
                  type: Type.STRING,
                  enum: ["Sleepy", "Dots", "Sparkle", "Closed-Happy"]
                },
                mouthStyle: {
                  type: Type.STRING,
                  enum: ["Slight Smile", "Open Whee", "Comfy Line"]
                },
                accessory: {
                  type: Type.STRING,
                  enum: ["Coffee Mug", "Blanket", "Glasses", "Headbands", "None"]
                }
              }
            },
            animationTrigger: {
              type: Type.STRING,
              enum: ["Breathing", "Floating", "Nodding", "Pouncing"]
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    
    // Generate beautiful SVGs based on semantic tokens
    const svgMarkup = generateMascotSvg(
      parsedData.animalType || "Capybara",
      parsedData.palette,
      parsedData.features
    );

    // Maintain backward compatibility for the frontend (which expects description & svgMarkup)
    res.json({
      ...parsedData,
      description: parsedData.dialogue || "Hello, I'm here to help you stay focused!",
      svgMarkup
    });
  } catch (error: any) {
    console.error("Mascot generation failed:", error);
    // On any error, fallback gracefully to procedural SVG so the user is never blocked
    const fallbackMascot = generateLocalMascotFallback(animalName);
    res.json(fallbackMascot);
  }
});

function generateMascotSvg(
  animalType: string,
  palette: { primaryBodyColor: string; accentColor: string; cheekBlushColor: string },
  features: { eyeStyle: string; mouthStyle: string; accessory: string }
): string {
  const primary = palette?.primaryBodyColor || "#F7EBE1";
  const accent = palette?.accentColor || "#8C9A86";
  const blush = palette?.cheekBlushColor || "#FFA6B6";
  
  const eyeStyle = features?.eyeStyle || "Dots";
  const mouthStyle = features?.mouthStyle || "Slight Smile";
  const accessory = features?.accessory || "None";
  
  let ears = "";
  if (animalType === "Cat") {
    ears = `
      <polygon points="20,30 30,12 42,28" fill="${accent}" />
      <polygon points="80,30 70,12 58,28" fill="${accent}" />
      <polygon points="23,28 30,16 38,27" fill="${blush}" />
      <polygon points="77,28 70,16 62,27" fill="${blush}" />
    `;
  } else if (animalType === "Bear" || animalType === "Panda") {
    ears = `
      <circle cx="28" cy="24" r="11" fill="${accent}" />
      <circle cx="72" cy="24" r="11" fill="${accent}" />
      <circle cx="28" cy="24" r="6" fill="${blush}" />
      <circle cx="72" cy="24" r="6" fill="${blush}" />
    `;
  } else if (animalType === "Frog") {
    ears = `
      <circle cx="35" cy="26" r="10" fill="${primary}" stroke="${accent}" stroke-width="2" />
      <circle cx="65" cy="26" r="10" fill="${primary}" stroke="${accent}" stroke-width="2" />
    `;
  } else if (animalType === "Fox") {
    ears = `
      <polygon points="18,32 25,8 40,25" fill="${accent}" />
      <polygon points="82,32 75,8 60,25" fill="${accent}" />
      <polygon points="22,29 27,14 36,25" fill="#FFFFFF" />
      <polygon points="78,29 73,14 64,25" fill="#FFFFFF" />
    `;
  } else if (animalType === "Dog") {
    ears = `
      <ellipse cx="20" cy="42" rx="7" ry="16" fill="${accent}" />
      <ellipse cx="80" cy="42" rx="7" ry="16" fill="${accent}" />
    `;
  } else {
    // Capybara/Otter/default round ears
    ears = `
      <circle cx="24" cy="34" r="8" fill="${accent}" />
      <circle cx="76" cy="34" r="8" fill="${accent}" />
      <circle cx="24" cy="34" r="4" fill="${blush}" />
      <circle cx="76" cy="34" r="4" fill="${blush}" />
    `;
  }

  let eyes = "";
  if (eyeStyle.includes("Sleepy")) {
    eyes = `
      <path d="M 32,46 Q 38,50 44,46" fill="none" stroke="#2C2A29" stroke-width="3" stroke-linecap="round" />
      <path d="M 56,46 Q 62,50 68,46" fill="none" stroke="#2C2A29" stroke-width="3" stroke-linecap="round" />
    `;
  } else if (eyeStyle.includes("Sparkle")) {
    eyes = `
      <circle cx="38" cy="46" r="6" fill="#2C2A29" />
      <polygon points="38,42 40,46 44,46 40,48 38,52 36,48 32,46 36,46" fill="#FFFFFF" />
      <circle cx="62" cy="46" r="6" fill="#2C2A29" />
      <polygon points="62,42 64,46 68,46 64,48 62,52 60,48 56,46 60,46" fill="#FFFFFF" />
    `;
  } else if (eyeStyle.includes("Closed-Happy")) {
    eyes = `
      <path d="M 32,48 Q 38,42 44,48" fill="none" stroke="#2C2A29" stroke-width="3" stroke-linecap="round" />
      <path d="M 56,48 Q 62,42 68,48" fill="none" stroke="#2C2A29" stroke-width="3" stroke-linecap="round" />
    `;
  } else {
    eyes = `
      <circle cx="38" cy="46" r="5" fill="#2C2A29" />
      <circle cx="36.5" cy="44.5" r="1.5" fill="#FFFFFF" />
      <circle cx="62" cy="46" r="5" fill="#2C2A29" />
      <circle cx="60.5" cy="44.5" r="1.5" fill="#FFFFFF" />
    `;
  }

  let mouth = "";
  if (mouthStyle.includes("Open") || mouthStyle.includes("Whee")) {
    mouth = `
      <path d="M 45,52 Q 50,58 55,52" fill="none" stroke="#2C2A29" stroke-width="2.5" stroke-linecap="round" />
      <path d="M 46,53 Q 50,62 54,53 Z" fill="#EFA9B0" stroke="#2C2A29" stroke-width="2" />
    `;
  } else if (mouthStyle.includes("Comfy") || mouthStyle.includes("Line")) {
    mouth = `
      <path d="M 44,54 Q 50,52 56,54" fill="none" stroke="#2C2A29" stroke-width="2.5" stroke-linecap="round" />
    `;
  } else {
    mouth = `
      <path d="M 44,53 Q 47,56 50,53 Q 53,56 56,53" fill="none" stroke="#2C2A29" stroke-width="2.5" stroke-linecap="round" />
    `;
  }

  let accHtml = "";
  if (accessory.includes("Coffee")) {
    accHtml = `
      <rect x="68" y="60" width="16" height="18" rx="4" fill="#C084FC" stroke="#2C2A29" stroke-width="2" />
      <path d="M 84,64 C 88,64 88,74 84,74" fill="none" stroke="#2C2A29" stroke-width="2" />
      <path d="M 72,56 Q 74,52 73,50 Q 77,52 76,50" fill="none" stroke="#8C9A86" stroke-width="1.5" />
    `;
  } else if (accessory.includes("Blanket") || accessory.includes("Scarf")) {
    accHtml = `
      <rect x="24" y="68" width="52" height="12" rx="6" fill="#FCA5A5" stroke="#2C2A29" stroke-width="2" />
      <line x1="34" y1="68" x2="34" y2="80" stroke="#FFFFFF" stroke-width="2" />
      <line x1="48" y1="68" x2="48" y2="80" stroke="#FFFFFF" stroke-width="2" />
      <line x1="62" y1="68" x2="62" y2="80" stroke="#FFFFFF" stroke-width="2" />
    `;
  } else if (accessory.includes("Glasses")) {
    accHtml = `
      <circle cx="38" cy="46" r="9" fill="none" stroke="#E27B35" stroke-width="2.5" />
      <circle cx="62" cy="46" r="9" fill="none" stroke="#E27B35" stroke-width="2.5" />
      <line x1="47" y1="46" x2="53" y2="46" stroke="#E27B35" stroke-width="2.5" />
    `;
  } else if (accessory.includes("Headband")) {
    accHtml = `
      <path d="M 28,30 Q 50,22 72,30" fill="none" stroke="#F472B6" stroke-width="4" stroke-linecap="round" />
      <polygon points="50,22 44,16 44,28 50,22" fill="#F472B6" stroke="#2C2A29" stroke-width="1.5" />
      <polygon points="50,22 56,16 56,28 50,22" fill="#F472B6" stroke="#2C2A29" stroke-width="1.5" />
      <circle cx="50" cy="22" r="3.5" fill="#FFFFFF" stroke="#2C2A29" stroke-width="1.5" />
    `;
  }

  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      ${ears}
      <rect x="18" y="28" width="64" height="52" rx="26" fill="${primary}" stroke="${accent}" stroke-width="2.5" />
      <ellipse cx="28" cy="56" rx="6" ry="4" fill="${blush}" opacity="0.8" />
      <ellipse cx="72" cy="56" rx="6" ry="4" fill="${blush}" opacity="0.8" />
      ${eyes}
      ${mouth}
      ${accHtml}
    </svg>
  `.trim().replace(/\n\s*/g, ' ');
}

function generateLocalMascotFallback(animalName: string) {
  const cleanName = (animalName || "Pet").trim();
  const lower = cleanName.toLowerCase();
  
  let primaryColor = "#F7EBE1"; // Cozy Cream default
  let secondaryColor = "#8C9A86"; // Sage default
  let species = `Cute Little ${cleanName}`;
  let name = cleanName;

  if (lower.includes("panda")) {
    primaryColor = "#FFFFFF";
    secondaryColor = "#2C2A29";
    name = "Bambu";
    species = "Chubby Little Panda";
  } else if (lower.includes("frog")) {
    primaryColor = "#D4E8D4";
    secondaryColor = "#77A677";
    name = "Hoppy";
    species = "Cozy Green Frog";
  } else if (lower.includes("pig")) {
    primaryColor = "#FCE1E4";
    secondaryColor = "#EFA9B0";
    name = "Piglet";
    species = "Blushing Chubby Piggy";
  } else if (lower.includes("fox") || lower.includes("orange")) {
    primaryColor = "#FAD2B4";
    secondaryColor = "#E27B35";
    name = "Rusty";
    species = "Energetic Fox Buddy";
  } else if (lower.includes("cat") || lower.includes("kitten")) {
    primaryColor = "#ECE9E4";
    secondaryColor = "#8C867E";
    name = "Whiskers";
    species = "Cozy Calico Kitten";
  } else if (lower.includes("dog") || lower.includes("puppy")) {
    primaryColor = "#EBD8C1";
    secondaryColor = "#B09276";
    name = "Cookie";
    species = "Loyal Golden Puppy";
  } else if (lower.includes("bear")) {
    primaryColor = "#DFCDBC";
    secondaryColor = "#A48670";
    name = "Honey";
    species = "Cuddly Brown Bear";
  } else {
    // Procedural color mapping based on name hashing
    let hash = 0;
    for (let i = 0; i < cleanName.length; i++) {
      hash += cleanName.charCodeAt(i);
    }
    const hues = [35, 140, 200, 280, 320, 0];
    const hue = hues[hash % hues.length];
    primaryColor = `hsl(${hue}, 70%, 88%)`;
    secondaryColor = `hsl(${hue}, 40%, 55%)`;
    name = cleanName.length > 3 ? cleanName.slice(0, 4) + "y" : cleanName + "y";
    species = `Cute Little ${cleanName}`;
  }

  const svgMarkup = `
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- Back Head/Ears -->
    <circle cx="28" cy="28" r="12" fill="${secondaryColor}" />
    <circle cx="72" cy="28" r="12" fill="${secondaryColor}" />
    <circle cx="28" cy="28" r="7" fill="#FFA6B6" />
    <circle cx="72" cy="28" r="7" fill="#FFA6B6" />
    
    <!-- Main Chubby Head -->
    <rect x="18" y="25" width="64" height="52" rx="26" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="2" />
    
    <!-- Large Sparkly Eyes -->
    <circle cx="38" cy="48" r="6" fill="#2C2A29" />
    <circle cx="36" cy="46" r="1.8" fill="#FFFFFF" />
    <circle cx="40" cy="50" r="0.8" fill="#FFFFFF" />
    
    <circle cx="62" cy="48" r="6" fill="#2C2A29" />
    <circle cx="60" cy="46" r="1.8" fill="#FFFFFF" />
    <circle cx="64" cy="50" r="0.8" fill="#FFFFFF" />
    
    <!-- Soft Rosy Blushing Cheeks -->
    <ellipse cx="28" cy="56" rx="5" ry="3.5" fill="#FFA6B6" opacity="0.8" />
    <ellipse cx="72" cy="56" rx="5" ry="3.5" fill="#FFA6B6" opacity="0.8" />
    
    <!-- Little Happy Mouth/Nose -->
    <path d="M 46,55 Q 50,58 54,55" fill="none" stroke="#2C2A29" stroke-width="2.5" stroke-linecap="round" />
    <polygon points="48,51 52,51 50,53" fill="#2C2A29" />
  </svg>
  `.trim().replace(/\n\s*/g, ' ');

  return {
    name,
    species,
    description: `"${cleanName} is here to remind you that consistency and self-care go hand-in-hand! Let's complete our goals! 🐾"`,
    svgMarkup,
    animalType: lower.includes("cat") ? "Cat" : lower.includes("bear") ? "Bear" : lower.includes("frog") ? "Frog" : "Capybara",
    mood: "Cozy",
    palette: {
      primaryBodyColor: primaryColor,
      accentColor: secondaryColor,
      cheekBlushColor: "#FFA6B6"
    },
    features: {
      eyeStyle: "Sparkle",
      mouthStyle: "Slight Smile",
      accessory: "None"
    },
    animationTrigger: "Breathing"
  };
}


// 6. Companion Chatbot
// Provides a ChatGPT-style conversational buddy with fewer emojis
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history, companionName, companionSpecies } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required." });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.json({
        reply: `Hello! I am ${companionName || 'Pixel'}, your ${companionSpecies || 'companion'}. I am here to help you decompress, structure your study plans, and keep your focus intact. Let's get things done today!`
      });
      return;
    }

    const ai = getGeminiClient();
    const systemPrompt = `You are ${companionName || 'Pixel'}, a supportive and warm study buddy mascot. Your species is ${companionSpecies || 'Kitten'}.
Your tone is comfortable, calm, clear, and intellectual, similar to ChatGPT but with very few emojis (at most 1 subtle emoji per message, or none).
You help the user with focus strategies, task planning, time management, stress reduction, and positive encouragement.
Keep your response brief (1-2 paragraphs or a short bulleted list) so that it fits nicely on a single screen without scrolling.`;

    // Convert simple history format to Gemini roles ('user' and 'model')
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        contents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text }]
        });
      }
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    res.json({ reply: response.text || "I'm listening!" });
  } catch (error: any) {
    console.error("Companion chat failed:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

// Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
