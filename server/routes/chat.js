import { Router } from 'express';
import groq, { MODEL } from '../groq.js';
import { SYSTEM_PROMPT } from '../prompts/system.js';
import { detectEmergency } from '../utils/emergency.js';

export const chatRouter = Router();

// SSE streaming chat
chatRouter.post('/stream', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  // Check emergency in latest user message
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
  const emergency = lastUserMsg ? detectEmergency(lastUserMsg.content) : null;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // Send emergency flag first if detected
  if (emergency) {
    res.write(`data: ${JSON.stringify({ type: 'emergency', data: emergency })}\n\n`);
  }

  try {
    const stream = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-12), // last 12 messages for context
      ],
      stream: true,
      max_tokens: 4096,
      temperature: 0.4,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ type: 'token', data: content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (err) {
    console.error('Chat stream error:', err.message);
    res.write(`data: ${JSON.stringify({ type: 'error', data: err.message })}\n\n`);
    res.end();
  }
});

// Non-streaming chat (fallback)
chatRouter.post('/', async (req, res) => {
  const { messages } = req.body;
  if (!messages?.length) return res.status(400).json({ error: 'messages required' });

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-12)],
      max_tokens: 4096,
      temperature: 0.4,
    });
    res.json({ content: response.choices[0]?.message?.content || '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
