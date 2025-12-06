import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!ai) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on the server' });
  }

  try {
    const { message, context, image } = req.body || {};
    const parts = [];

    if (context) parts.push({ text: `System Instruction: You are VitalSync, a helpful health AI. Context: ${context}` });
    if (image) {
      const base64Data = image.includes(',') ? image.split(',')[1] : image;
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Data } });
    }
    parts.push({ text: message || '' });

    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts } });
    res.json({ text: response.text || null });
  } catch (err) {
    console.error('chat api error:', err);
    res.status(500).json({ error: String(err) });
  }
}
