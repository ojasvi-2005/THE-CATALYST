import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

// ========== SECURITY & MIDDLEWARE ==========

// Basic middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Simple rate limiting implementation (without external package)
interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 30; // 30 requests per window

function simpleRateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const clientIP = req.ip || "unknown";
  const now = Date.now();

  if (!rateLimitStore[clientIP]) {
    rateLimitStore[clientIP] = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
    return next();
  }

  const record = rateLimitStore[clientIP];

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return res.status(429).json({
      error: "Too many requests. Please try again later.",
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    });
  }

  record.count++;
  next();
}

// ========== GEMINI CLIENT ==========

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ GEMINI_API_KEY not set - using fallback mode");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "catalyst-ai-studio",
        },
      },
    });
  }
  return aiClient;
}

// ========== VALIDATION FUNCTIONS ==========

/**
 * Validates the brain-dump API response structure
 */
function validateBrainDumpResponse(data: any): void {
  if (!data || typeof data !== "object") {
    throw new Error("Response must be a JSON object");
  }

  // Check extractedTasks
  if (!Array.isArray(data.extractedTasks)) {
    throw new Error(
      `extractedTasks must be an array, received ${typeof data.extractedTasks}`
    );
  }

  for (let i = 0; i < data.extractedTasks.length; i++) {
    const task = data.extractedTasks[i];
    if (typeof task !== "object" || task === null) {
      throw new Error(`extractedTasks[${i}] must be an object`);
    }

    if (typeof task.task !== "string" || task.task.trim() === "") {
      throw new Error(`extractedTasks[${i}].task must be a non-empty string`);
    }

    if (
      task.targetDateTime !== null &&
      typeof task.targetDateTime !== "string"
    ) {
      throw new Error(
        `extractedTasks[${i}].targetDateTime must be a string or null`
      );
    }

    const validEnergies = ["Low", "Medium", "High"];
    if (!validEnergies.includes(task.energyCost)) {
      throw new Error(
        `extractedTasks[${i}].energyCost must be one of ${validEnergies.join(", ")}, got "${task.energyCost}"`
      );
    }
  }

  // Check recommendedBuffers
  if (!Array.isArray(data.recommendedBuffers)) {
    throw new Error(
      `recommendedBuffers must be an array, received ${typeof data.recommendedBuffers}`
    );
  }

  for (let i = 0; i < data.recommendedBuffers.length; i++) {
    const buffer = data.recommendedBuffers[i];
    if (typeof buffer !== "object" || buffer === null) {
      throw new Error(`recommendedBuffers[${i}] must be an object`);
    }

    if (typeof buffer.afterTask !== "string" || buffer.afterTask.trim() === "") {
      throw new Error(
        `recommendedBuffers[${i}].afterTask must be a non-empty string`
      );
    }

    if (
      !Number.isInteger(buffer.durationMinutes) ||
      buffer.durationMinutes < 1
    ) {
      throw new Error(
        `recommendedBuffers[${i}].durationMinutes must be a positive integer`
      );
    }

    if (
      typeof buffer.activitySuggestion !== "string" ||
      buffer.activitySuggestion.trim() === ""
    ) {
      throw new Error(
        `recommendedBuffers[${i}].activitySuggestion must be a non-empty string`
      );
    }
  }

  // Check userEnergyState
  if (typeof data.userEnergyState !== "string") {
    throw new Error(
      `userEnergyState must be a string, received ${typeof data.userEnergyState}`
    );
  }

  const validStates = ["Overwhelmed", "Focused", "Fatigued", "Creative"];
  if (!validStates.includes(data.userEnergyState)) {
    throw new Error(
      `userEnergyState must be one of ${validStates.join(", ")}, got "${data.userEnergyState}"`
    );
  }
}

/**
 * Validates the task decomposition response structure
 */
function validateDecomposeTaskResponse(data: any): void {
  if (!data || typeof data !== "object") {
    throw new Error("Response must be a JSON object");
  }

  if (typeof data.projectTitle !== "string" || data.projectTitle.trim() === "") {
    throw new Error("projectTitle must be a non-empty string");
  }

  const validEnergies = ["Low", "Medium", "High"];
  if (!validEnergies.includes(data.estimatedTotalEnergy)) {
    throw new Error(
      `estimatedTotalEnergy must be one of ${validEnergies.join(", ")}`
    );
  }

  if (!Array.isArray(data.structure)) {
    throw new Error("structure must be an array");
  }

  for (let i = 0; i < data.structure.length; i++) {
    const phase = data.structure[i];
    if (typeof phase !== "object" || phase === null) {
      throw new Error(`structure[${i}] must be an object`);
    }

    if (typeof phase.phaseName !== "string" || phase.phaseName.trim() === "") {
      throw new Error(`structure[${i}].phaseName must be a non-empty string`);
    }

    if (!Array.isArray(phase.tasks)) {
      throw new Error(`structure[${i}].tasks must be an array`);
    }

    for (let j = 0; j < phase.tasks.length; j++) {
      const task = phase.tasks[j];
      if (typeof task !== "object" || task === null) {
        throw new Error(`structure[${i}].tasks[${j}] must be an object`);
      }

      if (typeof task.taskName !== "string" || task.taskName.trim() === "") {
        throw new Error(
          `structure[${i}].tasks[${j}].taskName must be a non-empty string`
        );
      }

      if (!Array.isArray(task.microSteps)) {
        throw new Error(`structure[${i}].tasks[${j}].microSteps must be an array`);
      }

      for (let k = 0; k < task.microSteps.length; k++) {
        const step = task.microSteps[k];
        if (typeof step !== "object" || step === null) {
          throw new Error(
            `structure[${i}].tasks[${j}].microSteps[${k}] must be an object`
          );
        }

        if (typeof step.step !== "string" || step.step.trim() === "") {
          throw new Error(
            `structure[${i}].tasks[${j}].microSteps[${k}].step must be a non-empty string`
          );
        }

        if (
          !Number.isInteger(step.durationMinutes) ||
          step.durationMinutes < 1 ||
          step.durationMinutes > 15
        ) {
          throw new Error(
            `structure[${i}].tasks[${j}].microSteps[${k}].durationMinutes must be an integer between 1 and 15`
          );
        }

        const validEnergySteps = ["Low", "Medium"];
        if (!validEnergySteps.includes(step.energyRequired)) {
          throw new Error(
            `structure[${i}].tasks[${j}].microSteps[${k}].energyRequired must be one of ${validEnergySteps.join(", ")}`
          );
        }
      }
    }
  }
}

// ========== ROUTES ==========

// 1. Health check
app.get("/api/health", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        status: "degraded",
        hasApiKey: false,
        message: "GEMINI_API_KEY not configured",
      });
    }

    // Test Gemini connectivity
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        status: "error",
        message: "Failed to initialize Gemini client",
      });
    }

    await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Say ok",
    });

    res.json({ status: "ok", hasApiKey: true });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// 2. Brain-Dump Parser
app.post("/api/gemini/parse-brain-dump", simpleRateLimit, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res
        .status(400)
        .json({ error: "Text field is required and must be a string." });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({ error: "Text cannot be empty." });
    }

    if (text.length > 5000) {
      return res.status(400).json({ error: "Text must be under 5000 characters." });
    }

    const ai = getGeminiClient();

    if (!ai) {
      return res.json(generateLocalBrainDumpFallback(text));
    }

    const systemPrompt = `You are a productivity assistant that parses unstructured brain-dumps.

INPUT: User's raw thoughts, ideas, and concerns
OUTPUT FORMAT (JSON only):
{
  "extractedTasks": [
    { "task": "string", "targetDateTime": "ISO string or null", "energyCost": "Low|Medium|High" }
  ],
  "recommendedBuffers": [
    { "afterTask": "string", "durationMinutes": number, "activitySuggestion": "string" }
  ],
  "userEnergyState": "Overwhelmed|Focused|Fatigued|Creative"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Parse this brain-dump:\n\n${text.trim()}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    let parsedData: any;
    try {
      parsedData = JSON.parse(response.text || "{}");
    } catch (parseError) {
      console.error("Failed to parse brain-dump response:", parseError);
      return res.status(502).json({
        error: "AI returned invalid brain-dump data",
        code: "INVALID_JSON_RESPONSE",
      });
    }

    validateBrainDumpResponse(parsedData);

    res.json(parsedData);
  } catch (error) {
    console.error("Brain-dump parsing failed:", error);
    res.status(500).json({
      error: "Internal server error",
      code: "SERVER_ERROR",
    });
  }
});

// 3. Task Decomposition
app.post("/api/gemini/decompose-task", simpleRateLimit, async (req, res) => {
  try {
    const { projectTitle, projectDescription } = req.body;

    if (!projectTitle || typeof projectTitle !== "string") {
      return res
        .status(400)
        .json({ error: "projectTitle is required and must be a string." });
    }

    if (projectTitle.trim().length === 0) {
      return res.status(400).json({ error: "projectTitle cannot be empty." });
    }

    if (!projectDescription || typeof projectDescription !== "string") {
      return res.status(400).json({
        error: "projectDescription is required and must be a string.",
      });
    }

    if (projectDescription.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "projectDescription cannot be empty." });
    }

    const ai = getGeminiClient();

    if (!ai) {
      return res.json(
        generateLocalDecomposeFallback(projectTitle, projectDescription)
      );
    }

    const systemPrompt = `You are a task decomposition expert. Break down projects into phases, tasks, and micro-steps.

OUTPUT FORMAT (JSON only):
{
  "projectTitle": "string",
  "estimatedTotalEnergy": "Low|Medium|High",
  "structure": [
    {
      "phaseName": "string",
      "tasks": [
        {
          "taskName": "string",
          "microSteps": [
            { "step": "string", "durationMinutes": 1-15, "energyRequired": "Low|Medium" }
          ]
        }
      ]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Project: ${projectTitle}\n\nDescription:\n${projectDescription.trim()}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    let parsedData: any;
    try {
      parsedData = JSON.parse(response.text || "{}");
    } catch (parseError) {
      console.error("Failed to parse decompose response:", parseError);
      return res.status(502).json({
        error: "AI returned invalid decomposition data",
        code: "INVALID_JSON_RESPONSE",
      });
    }

    validateDecomposeTaskResponse(parsedData);

    res.json(parsedData);
  } catch (error) {
    console.error("Task decomposition failed:", error);
    res.status(500).json({
      error: "Internal server error",
      code: "SERVER_ERROR",
    });
  }
});

// 4. Mascot Generation
app.post("/api/gemini/generate-mascot", simpleRateLimit, async (req, res) => {
  try {
    const { animalName } = req.body;

    if (!animalName || typeof animalName !== "string") {
      return res
        .status(400)
        .json({ error: "animalName is required and must be a string." });
    }

    if (animalName.trim().length === 0) {
      return res.status(400).json({ error: "animalName cannot be empty." });
    }

    const ai = getGeminiClient();

    if (!ai) {
      return res.json(generateLocalMascotFallback(animalName));
    }

    const systemPrompt = `You are a cute mascot character designer for a productivity app. Design a mascot based on the given animal or creature type.

OUTPUT FORMAT (JSON):
{
  "name": "Creative name for the mascot",
  "species": "Full species description",
  "description": "A warm, welcoming quote in quotes",
  "svgMarkup": "SVG code for the mascot",
  "animalType": "Animal category",
  "mood": "Current mood",
  "palette": { "primaryBodyColor": "#HEX", "accentColor": "#HEX", "cheekBlushColor": "#HEX" },
  "features": { "eyeStyle": "Style name", "mouthStyle": "Style name", "accessory": "Accessory name" },
  "animationTrigger": "Animation type"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Create a cute mascot based on: ${animalName.trim()}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    let parsedData: any;
    try {
      parsedData = JSON.parse(response.text || "{}");
    } catch (parseError) {
      console.error("Failed to parse mascot response:", parseError);
      return res.status(502).json({
        error: "AI returned invalid mascot data",
        code: "INVALID_JSON_RESPONSE",
      });
    }

    // Basic validation
    if (!parsedData.name || !parsedData.svgMarkup) {
      return res.status(502).json({
        error: "AI response missing required mascot fields",
        code: "SCHEMA_VALIDATION_FAILED",
      });
    }

    res.json(parsedData);
  } catch (error) {
    console.error("Mascot generation failed:", error);
    res.status(500).json({
      error: "Internal server error",
      code: "SERVER_ERROR",
    });
  }
});

// 5. Companion Chat
app.post("/api/gemini/chat", simpleRateLimit, async (req, res) => {
  try {
    const { message, history, companionName, companionSpecies } = req.body;

    if (!message || typeof message !== "string") {
      return res
        .status(400)
        .json({ error: "Message is required and must be a string." });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty." });
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: "Message must be under 2000 characters." });
    }

    // Validate history if provided
    const MAX_HISTORY_TURNS = 20;
    if (history && Array.isArray(history)) {
      if (history.length > MAX_HISTORY_TURNS) {
        return res.status(400).json({
          error: `Chat history limited to ${MAX_HISTORY_TURNS} turns`,
        });
      }

      for (let i = 0; i < history.length; i++) {
        const turn = history[i];
        if (!turn.role || !turn.text || typeof turn.text !== "string") {
          return res.status(400).json({
            error:
              "Each history entry must have 'role' and 'text' string fields",
          });
        }
      }
    }

    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reply:
          "I'm in offline mode! Please configure your GEMINI_API_KEY to chat with me.",
      });
    }

    const systemPrompt = `You are ${companionName || "Pixel"}, a supportive study buddy mascot. Your species is ${companionSpecies || "Kitten"}.
Your tone is comfortable, calm, clear, and intellectual. Keep responses brief (1-2 paragraphs).
Help with focus strategies, task planning, time management, and positive encouragement.`;

    // Build conversation history
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        contents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.text }],
        });
      }
    }
    contents.push({ role: "user", parts: [{ text: message.trim() }] });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text || "I'm listening!" });
  } catch (error) {
    console.error("Companion chat failed:", error);
    res.status(500).json({
      error: "Internal server error",
      code: "SERVER_ERROR",
    });
  }
});

// ========== FALLBACK GENERATORS (for when API key is missing) ==========

function generateLocalBrainDumpFallback(text: string) {
  return {
    extractedTasks: [
      {
        task: "Review your brain-dump input",
        targetDateTime: null,
        energyCost: "Low",
      },
    ],
    recommendedBuffers: [
      {
        afterTask: "Review",
        durationMinutes: 5,
        activitySuggestion: "Take a short walk or stretch",
      },
    ],
    userEnergyState: "Focused",
  };
}

function generateLocalDecomposeFallback(title: string, description: string) {
  return {
    projectTitle: title,
    estimatedTotalEnergy: "Medium",
    structure: [
      {
        phaseName: "Planning",
        tasks: [
          {
            taskName: "Define scope",
            microSteps: [
              {
                step: "Write down project goals",
                durationMinutes: 10,
                energyRequired: "Low",
              },
            ],
          },
        ],
      },
      {
        phaseName: "Execution",
        tasks: [
          {
            taskName: "Complete work",
            microSteps: [
              {
                step: "Work on main deliverables",
                durationMinutes: 15,
                energyRequired: "Medium",
              },
            ],
          },
        ],
      },
    ],
  };
}

function generateLocalMascotFallback(animalName: string) {
  const cleanName = (animalName || "Pet").trim();
  const lower = cleanName.toLowerCase();

  let primaryColor = "#F7EBE1";
  let secondaryColor = "#8C9A86";
  let name = cleanName;

  if (lower.includes("panda")) {
    primaryColor = "#FFFFFF";
    secondaryColor = "#2C2A29";
    name = "Bambu";
  } else if (lower.includes("frog")) {
    primaryColor = "#D4E8D4";
    secondaryColor = "#77A677";
    name = "Hoppy";
  }

  const svgMarkup = `
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="18" y="25" width="64" height="52" rx="26" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="2" />
    <circle cx="38" cy="48" r="6" fill="#2C2A29" />
    <circle cx="62" cy="48" r="6" fill="#2C2A29" />
    <path d="M 46,55 Q 50,58 54,55" fill="none" stroke="#2C2A29" stroke-width="2.5" stroke-linecap="round" />
  </svg>
  `.trim();

  return {
    name,
    species: `Cute Little ${cleanName}`,
    description: `"${name} is here to keep you focused and productive!"`,
    svgMarkup,
    animalType: "Capybara",
    mood: "Cozy",
    palette: {
      primaryBodyColor: primaryColor,
      accentColor: secondaryColor,
      cheekBlushColor: "#FFA6B6",
    },
    features: {
      eyeStyle: "Sparkle",
      mouthStyle: "Slight Smile",
      accessory: "None",
    },
    animationTrigger: "Breathing",
  };
}

// ========== VITE INTEGRATION ==========

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Looks for the front-end assets in the correct 'dist' directory
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    console.log(`API URL: ${APP_URL}`);
  });
}

startServer();