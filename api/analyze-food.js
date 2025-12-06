import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!ai) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on the server' });
  }

  try {
    const { image } = req.body || {};
    const base64Data = (image || '').includes(',') ? image.split(',')[1] : image;
    const prompt = `Analyze this food image and provide nutritional information. Return ONLY a raw JSON object with this structure (no markdown formatting): { "foodName": "string", "calories": number, "protein": number, "carbs": number, "fats": number, "healthy": boolean, "advice": "string" }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [ { text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: base64Data } } ] },
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text;
    const parsed = text ? JSON.parse(text) : null;
    res.json(parsed);
  } catch (err) {
    console.error('analyze-food error:', err);
    res.status(500).json({ error: String(err) });
  }
}
