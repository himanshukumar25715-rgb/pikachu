**Repository Summary**
**Repository Overview**
+ **What**: Frontend (React + Vite) + optional Express proxy / serverless API for calling Google GenAI (Gemini). App name: VitalSync (health assistant).
+ **Structure**: Frontend at repo root (`App.tsx`, `index.tsx`, `components/`); AI helpers in `services/`; server proxy `server.js`; serverless handlers in `api/`.

**Run & Debug (key commands)**
- **Install**: `npm install`
- **Start backend proxy**: `npm run server` (runs `node server.js`, default port `5000`)
- **Start frontend**: `npm run dev` (Vite dev server)
- **Build / preview**: `npm run build` / `npm run preview`

**AI Integration — essential facts**
- `services/geminiService.ts` controls client-side vs backend flows via `VITE_USE_BACKEND` / `USE_BACKEND`.
- If `USE_BACKEND=true` the client POSTs to `VITE_BACKEND_URL` (default `http://localhost:5000/api`) and `server.js` uses `process.env.GEMINI_API_KEY`.
- Direct client calls use `@google/genai` with `VITE_GEMINI_API_KEY` exposed to the browser.
- Model used throughout: `gemini-2.5-flash` (see `geminiService.ts` and `server.js`).

**Key files to inspect when changing behavior**
- `services/geminiService.ts` — functions: `generateHealthResponse`, `analyzeFoodImage`, `predictWaterNeeds`, `analyzeMoodAndSuggest`. Follow existing `parts` → `contents` pattern (system instruction, optional `inlineData`, user text).
- `server.js` — local Express proxy endpoints: `/api/chat`, `/api/analyze-food`, `/api/predict-water`, `/api/analyze-mood`. It uses `GoogleGenAI` server-side with `GEMINI_API_KEY`.
- `services/storageService.ts` — localStorage keys: `vitalsync_profile`, `vitalsync_logs`, `vitalsync_token` (use these for state consistency).
- `api/` — serverless handlers (mirrors `server.js`) for deployments like Vercel.

**API shapes and parsing rules (must-follow)**
- `/api/chat` body: `{ message, context?, image? }` → response: `{ text: string }` (client expects `.text`).
- `/api/analyze-food` body: `{ image }` → response: a JSON object: `{ "foodName": string, "calories": number, "protein": number, "carbs": number, "fats": number, "healthy": boolean, "advice": string }`.
- `/api/predict-water` body: `{ weather, activity, weight }` → response: `{ "water_needs": number }`.
- `/api/analyze-mood` body: `{ diary }` → response: `{ "sentiment": string, "suggestion": string }`.
- Parsers defensively handle double-encoded JSON: callers use `typeof data === 'string' ? JSON.parse(data) : data`.

**Project conventions & gotchas**
- Prompts for analytic endpoints explicitly require raw JSON only. Do not add markdown or explanatory text — client code parses JSON directly (`responseMimeType: 'application/json'` is used).
- Images are passed as Data URLs on the client; both client and server strip the `data:*;base64,` header and send only base64 data to Gemini.
- Vite client env vars must use `VITE_` prefix (`VITE_GEMINI_API_KEY`, `VITE_USE_BACKEND`, `VITE_BACKEND_URL`). Server secrets use `GEMINI_API_KEY` or `API_KEY`.

**When editing or adding AI endpoints**
- Keep system instructions first in `parts`, add `inlineData` for images, then user text. Mirror the server `responseMimeType: 'application/json'` when you need machine-readable output.
- Update both `services/geminiService.ts` and `server.js` (or `api/*`) to keep client & backend in sync.

**PR checklist for AI changes**
- Update prompt text and document expected JSON shape in a comment near the function.
- Verify both flows locally: 1) direct client with `VITE_GEMINI_API_KEY`, 2) proxy flow with `GEMINI_API_KEY` and `VITE_USE_BACKEND=true`.
- Run the app and test the endpoint with sample payloads (Postman/curl or client UI).

If you'd like, I can expand this with CI/deploy notes or add short sample prompts and unit examples. Tell me which section to expand.
- **Image handling**: chat and food-analysis send data URLs (e.g. `data:image/jpeg;base64,...`). Both client and server strip the header and send only base64 data to the GenAI API.

**Important files and patterns**
- **`App.tsx`**: top-level routing of views; authentication gating via `services/storageService.ts`.
- **`components/ChatAssistant.tsx`**: shows the chat UI flow — constructs a `context` string from `user` and calls `generateHealthResponse` from `services/geminiService.ts`. Handles image attachments (FileReader -> DataURL), speech input, and message queuing.
- **`services/geminiService.ts`**: central AI helpers: `generateHealthResponse`, `analyzeFoodImage`, `predictWaterNeeds`, `analyzeMoodAndSuggest`. Look here for request shapes, prompts, and JSON response parsing. The file also documents how API keys are discovered (`VITE_GEMINI_API_KEY`, `GEMINI_API_KEY`, `API_KEY`).
- **`server.js`**: minimal Express API proxy with endpoints `/api/chat`, `/api/analyze-food`, `/api/predict-water`, `/api/analyze-mood`. These endpoints expect JSON body fields shown in the code and often return JSON-only responses (server instructs models to return raw JSON for some endpoints).
- **`services/storageService.ts`**: localStorage keys and conventions: `vitalsync_profile`, `vitalsync_logs`, `vitalsync_token`. Use these keys when reading/writing user state.
- **`package.json`**: scripts you will use: `npm run dev`, `npm run server`, `npm run build`, `npm run preview`. `dev` runs Vite; `server` runs `node server.js`.

**Environment & run notes (practical)**
- **Client env var**: Vite requires client-exposed vars to be prefixed with `VITE_` (e.g. `VITE_GEMINI_API_KEY` or `VITE_USE_BACKEND`).
- **Server env var**: server expects `GEMINI_API_KEY` or `API_KEY` in `process.env`.
- **To run locally (PowerShell)**:
```powershell
npm install
npm run server # starts Express proxy on :5000
npm run dev    # starts Vite dev server (client)
```
- **To prefer backend proxy**: set `VITE_USE_BACKEND=true` in `.env` (client) and ensure the server has `GEMINI_API_KEY` set.

**API shapes & expectations (examples)**
- `/api/chat` (body): `{ message: string, context?: string, image?: string }` -> response shape `{ text: string }`.
- `/api/analyze-food` (body): `{ image: string }` -> response: JSON object exactly like:
  `{ "foodName": "...", "calories": number, "protein": number, "carbs": number, "fats": number, "healthy": boolean, "advice": "string" }` (server instructs model to return raw JSON).
- `/api/analyze-mood` (body): `{ diary: string }` -> response: `{ "sentiment": "...", "suggestion": "..." }`.

**Project-specific conventions / gotchas**
- **JSON-only model responses**: For analytic endpoints (`analyze-food`, `analyze-mood`, `predict-water`) prompts explicitly ask the model to return ONLY a raw JSON object. Do not add markdown or explanatory text — the client parses JSON directly.
- **Double-encoding**: Some responses may be returned as a JSON string; callers defensively try `typeof data === 'string' ? JSON.parse(data) : data` in `geminiService.ts` and `server.js`.
- **Client-side API key warning**: The code warns when no API key is found. Avoid hard-coding real keys; use the backend proxy for production.
- **Local debug logs**: `geminiService.ts` and `server.js` log responses/errors to console — use those when debugging.

**When editing or adding AI interactions**
- Reference `geminiService.ts` for request building: add `parts` to `contents` (system instruction, optional image inlineData, then user text). Keep the existing pattern: system instruction first, then image, then user message.
- If adding new endpoints, follow existing server patterns: strict JSON responses, `responseMimeType: 'application/json'` when you want machine-readable output.

**Quick checklist for PRs that change AI behavior**
- Update prompts in `services/geminiService.ts` and `server.js` together (client and backend must stay consistent).
- Add/adjust unit examples in code comments showing the expected JSON shape.
- Verify both `USE_BACKEND` flows locally: (1) client direct call with `VITE_GEMINI_API_KEY`, (2) proxy flow with `GEMINI_API_KEY` on server.

**If something is unclear**
- Point me to the file and the function you want changed (e.g., `generateHealthResponse` in `services/geminiService.ts`) and I will produce a focused patch.

---
Feedback: tell me any missing details you want added (e.g., CI, deployment, or more sample prompts).