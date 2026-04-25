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

translateRouter.post('/summarize', async (req, res) => {
  const { text } = req.body;
  if (!text || text.length < 20) return res.status(400).json({ error: 'Please provide at least a few sentences to summarize.' });

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a legal document summarizer for Indian women. Summarize legal documents in plain, simple language that a non-lawyer can understand. Return ONLY valid JSON.`
        },
        {
          role: 'user',
          content: `Summarize this legal document in simple language. Identify all legal terms and explain them. Return JSON:
{
  "title": "Brief title of the document",
  "document_type": "Type (e.g. FIR, Court Order, Complaint, Notice, Petition)",
  "plain_summary": "3-5 sentence plain-language summary anyone can understand",
  "key_points": ["Important point 1", "Important point 2", "Important point 3", "Important point 4", "Important point 5"],
  "legal_terms": [{"term": "Legal term used", "meaning": "Simple explanation"}, {"term": "Another term", "meaning": "Simple explanation"}],
  "action_required": "What the person needs to do next, if anything. Null if no action needed.",
  "deadlines": ["Any deadlines mentioned"],
  "parties_involved": ["Party 1 - role", "Party 2 - role"],
  "severity": "informational|important|urgent|critical"
}

Document:
${text.slice(0, 6000)}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.2,
    });

    const raw = response.choices[0]?.message?.content || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      res.json({ summary: JSON.parse(match[0]) });
    } else {
      res.json({ summary: { plain_summary: raw, key_points: [], legal_terms: [] } });
    }
  } catch (err) {
    // Fallback on rate limit
    if (err.status === 429 || (err.message && err.message.includes('429'))) {
      try {
        const fallback = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'Summarize this legal document in simple language. Return ONLY valid JSON with keys: title, document_type, plain_summary, key_points (array), legal_terms (array of {term, meaning}), action_required, severity.' },
            { role: 'user', content: text.slice(0, 4000) }
          ],
          max_tokens: 1500,
          temperature: 0.2,
        });
        const raw = fallback.choices[0]?.message?.content || '';
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) return res.json({ summary: JSON.parse(match[0]) });
      } catch (e2) { /* fall through */ }
    }
    res.status(500).json({ error: err.message });
  }
});

translateRouter.get('/languages', (_req, res) => {
  res.json(SUPPORTED_LANGS);
});
