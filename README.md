<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1eYY3epNecwHQThAbMWCGb8Dx0oKhki5T

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the API key:


```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```


```
GEMINI_API_KEY=your_gemini_api_key_here
```

You can copy `.env.example` as a starting point.
3. Run the app:
   `npm run dev`

Notes:
- Vite requires environment variables exposed to the client to be prefixed with `VITE_`. That's why we use `VITE_GEMINI_API_KEY` for browser usage.
- Server-side or local Node scripts should use `GEMINI_API_KEY` (or `API_KEY`) as shown in the test files.

Production / hiding your API key (recommended):

 - Do NOT put the real API key in client-side code. Instead run the small backend proxy included in this repository (`server.js`) and keep the key on the server only.

 - To run the backend locally (PowerShell):

```powershell
# From project root (mini-main)
#$env:GEMINI_API_KEY = 'your_real_api_key_here'
npm run server
```

 - To make the client route requests to the backend, set `VITE_USE_BACKEND=true` in `mini-main/.env`:

```
VITE_USE_BACKEND=true
VITE_GEMINI_API_KEY=placeholder_or_empty
```

 - Start the client (still from `mini-main`):

```powershell
npm install
npm run dev
```

The client will call `http://localhost:5000/api` endpoints and the server will make requests to the GenAI API using the secret key from `process.env.GEMINI_API_KEY`.

Vercel deployment (serverless)
 - This repo includes serverless API handlers under `mini-main/api/` that mirror the local Express proxy. Deploying the `mini-main` project to Vercel will publish both the static frontend and the serverless endpoints at `/api/*`.
 - Vercel project settings (recommended):
    - **Root directory**: `mini-main`
    - **Build command**: `npm run build`
    - **Output directory**: `dist`
    - **Environment variables (set in Vercel dashboard)**:
       - `GEMINI_API_KEY` = your real API key (server-side secret used by the serverless functions)
       - `VITE_USE_BACKEND` = `true`
       - `VITE_BACKEND_URL` = `/api`
 - After deployment the chat endpoint will be at `https://<your-vercel-domain>/api/chat` and the client will POST to `/api/*` automatically.

Security notes:

- Ensure `.env` is in `.gitignore` (done) so you don't accidentally commit secrets.
- In production, set `GEMINI_API_KEY` in your hosting provider's environment variable config (do not commit it).
