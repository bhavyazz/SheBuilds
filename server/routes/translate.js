import { Router } from 'express';
import groq, { MODEL } from '../groq.js';

export const translateRouter = Router();

const SUPPORTED_LANGS = ['English', 'Hindi', 'Telugu', 'Kannada', 'Tamil', 'Bengali', 'Marathi', 'Gujarati', 'Malayalam', 'Punjabi', 'Odia', 'Urdu'];

translateRouter.post('/', async (req, res) => {
  const { text, sourceLang, targetLang } = req.body;
  if (!text || !targetLang) return res.status(400).json({ error: 'text and targetLang required' });

  if (!SUPPORTED_LANGS.includes(targetLang)) {
    return res.status(400).json({ error: `Unsupported language. Supported: ${SUPPORTED_LANGS.join(', ')}` });
  }

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert legal document translator specializing in Indian languages. Translate legal documents while:
1. Preserving all legal terminology accurately
2. Keeping section numbers and law names in their original form (e.g., "Section 498A IPC" stays as-is)
3. Maintaining the formal tone and structure
4. Adding transliteration in parentheses for complex legal terms
5. Ensuring the translation is understandable by a common person
Return ONLY the translated text, nothing else.`
        },
        {
          role: 'user',
          content: `Translate the following ${sourceLang || 'document'} text to ${targetLang}. If it contains legal terms, preserve section numbers and add simple explanations in ${targetLang} where helpful.\n\n${text}`
        }
      ],
      max_tokens: 4096,
      temperature: 0.2,
    });

    res.json({
      translated: response.choices[0]?.message?.content || '',
      sourceLang: sourceLang || 'Auto-detected',
      targetLang,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SSE streaming translation for long documents
translateRouter.post('/stream', async (req, res) => {
  const { text, sourceLang, targetLang } = req.body;
  if (!text || !targetLang) return res.status(400).json({ error: 'text and targetLang required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = await groq.chat.completions.create({
      model: MODEL,
      stream: true,
      messages: [
        {
          role: 'system',
          content: `You are an expert legal document translator for Indian languages. Translate accurately while preserving legal terms. Return ONLY the translation.`
        },
        {
          role: 'user',
          content: `Translate to ${targetLang}:\n\n${text}`
        }
      ],
      max_tokens: 4096,
      temperature: 0.2,
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
    res.write(`data: ${JSON.stringify({ type: 'error', data: err.message })}\n\n`);
    res.end();
  }
});

translateRouter.get('/languages', (_req, res) => {
  res.json(SUPPORTED_LANGS);
});
