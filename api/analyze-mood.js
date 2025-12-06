import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!ai) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on the server' });
  }

  try {
    const { diary } = req.body || {};
    const prompt = `Analyze this diary entry: "${diary}"\nReturn ONLY a JSON object: { "sentiment": "string (e.g., Happy, Stressed, Anxious)", "suggestion": "string (short helpful tip)" }`;

    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [{ text: prompt }] }, config: { responseMimeType: 'application/json' } });
    const text = response.text;
    const parsed = text ? JSON.parse(text) : { sentiment: 'Neutral', suggestion: 'Keep tracking your mood.' };
    res.json(parsed);
  } catch (err) {
    console.error('analyze-mood error:', err);
    res.status(500).json({ error: String(err) });
  }
}
