import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '10mb' }));

// Simple CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY not set. Set GEMINI_API_KEY in your environment for the server.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'Backend API is running' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, context, image } = req.body;
    const parts = [];

    if (context) parts.push({ text: `System Instruction: You are VitalSync, a helpful health AI. Context: ${context}` });
    if (image) {
      const base64Data = image.includes(',') ? image.split(',')[1] : image;
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Data } });
    }
    parts.push({ text: message });

    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts } });
    res.json({ text: response.text || null });
  } catch (err) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/analyze-food', async (req, res) => {
  try {
    const { image } = req.body;
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
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
    console.error('Analyze-food error:', err);
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/predict-water', async (req, res) => {
  try {
    const { weather, activity, weight } = req.body;
    const prompt = `Calculate daily water intake goal (in ml) for a person with:\nWeight: ${weight}kg\nActivity Level: ${activity}\nWeather Condition: ${weather}\nReturn ONLY a JSON object: { "water_needs": number }`;

    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [{ text: prompt }] }, config: { responseMimeType: 'application/json' } });
    const text = response.text;
    const json = text ? JSON.parse(text) : { water_needs: 2500 };
    res.json(json);
  } catch (err) {
    console.error('Predict-water error:', err);
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/analyze-mood', async (req, res) => {
  try {
    const { diary } = req.body;
    const prompt = `Analyze this diary entry: "${diary}"\nReturn ONLY a JSON object: { "sentiment": "string (e.g., Happy, Stressed, Anxious)", "suggestion": "string (short helpful tip)" }`;

    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [{ text: prompt }] }, config: { responseMimeType: 'application/json' } });
    const text = response.text;
    const parsed = text ? JSON.parse(text) : { sentiment: 'Neutral', suggestion: 'Keep tracking your mood.' };
    res.json(parsed);
  } catch (err) {
    console.error('Analyze-mood error:', err);
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Backend proxy listening on port ${PORT}`);
});
