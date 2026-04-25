import { Router } from 'express';
import groq, { MODEL } from '../groq.js';

export const draftRouter = Router();

const DRAFT_SYSTEM = `You are a legal document drafting assistant for Indian law. Generate formal, professional complaint/application drafts.

RULES:
1. Use proper legal formatting with numbered paragraphs
2. Leave blanks like [YOUR NAME], [DATE], [ADDRESS] for user to fill
3. Cite relevant legal sections
4. Include Subject line, Body, Prayer/Relief, Signature block
5. Add disclaimer: "This is a draft template. Please review with a qualified advocate before submission."

DOCUMENT TYPES:
- police_complaint: FIR application to Station House Officer
- dv_application: Domestic Violence application under PWDVA 2005
- posh_complaint: Workplace harassment complaint under POSH Act
- legal_notice: Formal legal notice to opposing party
- maintenance_application: Under Section 125 CrPC
- rti_application: Right to Information request`;

draftRouter.post('/', async (req, res) => {
  const { type, details } = req.body;
  if (!type || !details) return res.status(400).json({ error: 'type and details required' });

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: DRAFT_SYSTEM },
        { role: 'user', content: `Generate a ${type.replace(/_/g, ' ')} based on these details:\n\n${details}\n\nFormat it as a complete, properly structured legal document ready for review.` }
      ],
      max_tokens: 4096,
      temperature: 0.2,
    });

    res.json({ draft: response.choices[0]?.message?.content || '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
