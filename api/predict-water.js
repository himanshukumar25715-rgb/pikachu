import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!ai) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on the server' });
  }

  try {
    const { weather, activity, weight } = req.body || {};
    const prompt = `Calculate daily water intake goal (in ml) for a person with:\nWeight: ${weight}kg\nActivity Level: ${activity}\nWeather Condition: ${weather}\nReturn ONLY a JSON object: { "water_needs": number }`;

    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [{ text: prompt }] }, config: { responseMimeType: 'application/json' } });
    const text = response.text;
    const json = text ? JSON.parse(text) : { water_needs: 2500 };
    res.json(json);
  } catch (err) {
    console.error('predict-water error:', err);
    res.status(500).json({ error: String(err) });
  }
}
