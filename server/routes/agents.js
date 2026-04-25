import { Router } from 'express';
import groq, { MODEL } from '../groq.js';

export const agentsRouter = Router();

/* ── Legal Domain Agent Pool ─────────────────────────────────────────── */
const AGENT_POOL = {
  legal: {
    emoji: '⚖️', color: '#6366f1',
    name: 'Legal Expert',
    systemPrompt: `You are a Legal Expert Agent specializing in Indian law affecting women.
You analyze cases through: IPC sections, PWDVA 2005, POSH Act 2013, Hindu Succession Act, CrPC, family law, constitutional rights.
You cite specific sections and legal provisions. You identify applicable laws, jurisdiction, and procedural requirements.
You are SKEPTICAL of non-legal resolutions — you believe the law must be invoked for justice.`
  },
  financial: {
    emoji: '💰', color: '#10b981',
    name: 'Financial Advisor',
    systemPrompt: `You are a Financial Expert Agent analyzing women's legal cases through an economic lens.
You focus on: maintenance rights (Section 125 CrPC), property valuation, Stridhan recovery, alimony calculation, financial abuse patterns, economic independence strategies, cost of legal proceedings.
You are SKEPTICAL of solutions that ignore the financial dimension. You believe economic empowerment is key to justice.`
  },
  psychology: {
    emoji: '🧠', color: '#8b5cf6',
    name: 'Psychological Counselor',
    systemPrompt: `You are a Psychology Expert Agent analyzing women's legal cases through a mental health and behavioral lens.
You focus on: trauma responses, gaslighting patterns, cycle of abuse, impact on children, coping strategies, emotional safety, when to seek professional help.
You are SKEPTICAL of purely procedural solutions that ignore the psychological toll. You believe healing matters as much as legal victory.`
  },
  social: {
    emoji: '🌐', color: '#f43f5e',
    name: 'Social Worker',
    systemPrompt: `You are a Social Work Expert Agent analyzing women's legal cases through a community and support lens.
You focus on: family dynamics, community resources, shelter homes, support groups, social stigma management, children's welfare, practical survival strategies.
You are SKEPTICAL of solutions that only exist on paper. You believe real-world execution and community support are what matter.`
  },
  rights: {
    emoji: '🛡️', color: '#f59e0b',
    name: 'Human Rights Advocate',
    systemPrompt: `You are a Human Rights Expert Agent analyzing women's legal cases through a constitutional and rights-based lens.
You focus on: fundamental rights violations, gender discrimination, constitutional guarantees (Article 14, 15, 21), international conventions (CEDAW), systemic injustice patterns, policy gaps.
You are SKEPTICAL of case-by-case approaches. You believe systemic advocacy and rights awareness are the real solutions.`
  },
  procedural: {
    emoji: '📋', color: '#06b6d4',
    name: 'Procedural Guide',
    systemPrompt: `You are a Procedural Expert Agent who knows exactly HOW to navigate the Indian legal system.
You focus on: step-by-step filing procedures, which forms to fill, which court to approach, timelines, document checklists, common procedural mistakes, how to deal with police/courts.
You are SKEPTICAL of theoretical advice. You believe knowing the exact process is what empowers women.`
  }
};

/* ── Case Intelligence: multi-tab analysis ──────────────────────────── */
async function analyzeTab(tabType, caseDescription, courtType) {
  const tabPrompts = {
    overview: `Provide a comprehensive case overview as JSON:
{
  "case_type": "Type of legal case (e.g., Domestic Violence, Workplace Harassment)",
  "parties": ["party1 role", "party2 role"],
  "key_facts": ["fact 1", "fact 2", "fact 3", "fact 4"],
  "legal_domains": ["Criminal Law", "Family Law", etc.],
  "jurisdiction": "Which court/authority has jurisdiction",
  "ipc_sections": ["Section X - description", "Section Y - description"],
  "applicable_acts": ["Act 1 - relevance", "Act 2 - relevance"],
  "summary": "2-3 sentence plain-language summary"
}`,
    risk: `Provide a detailed risk assessment as JSON:
{
  "overall_risk": "low|medium|high|critical",
  "risk_score": 0-100,
  "physical_safety": { "level": "low|medium|high|critical", "factors": ["factor 1", "factor 2"] },
  "legal_risk": { "level": "low|medium|high", "factors": ["factor 1"] },
  "financial_risk": { "level": "low|medium|high", "factors": ["factor 1"] },
  "emotional_risk": { "level": "low|medium|high", "factors": ["factor 1"] },
  "escalation_likelihood": "low|medium|high",
  "immediate_threats": ["threat 1", "threat 2"],
  "protective_measures": ["measure 1", "measure 2", "measure 3"],
  "risk_mitigators": ["mitigator 1", "mitigator 2"]
}`,
    strength: `Provide a case strength assessment as JSON:
{
  "overall_strength": "weak|moderate|strong|very_strong",
  "strength_score": 0-100,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "evidence_available": ["type of evidence available"],
  "evidence_needed": ["additional evidence needed"],
  "legal_merit": "Assessment of legal merit in 2 sentences",
  "success_probability": "low|moderate|high",
  "recommendations": ["recommendation 1", "recommendation 2"]
}`,
    precedents: `Find 6-8 similar Indian legal precedents as JSON. Include landmark Supreme Court and High Court cases that are directly relevant. Provide detailed rulings.
{
  "precedents": [
    {
      "case_name": "Full Case Name v. Respondent Name",
      "year": "YYYY",
      "court": "Supreme Court / High Court / District Court",
      "bench": "Justice Name(s) if landmark",
      "citation": "AIR/SCC citation if known",
      "key_ruling": "Detailed ruling in 2-3 sentences",
      "relevance": "Specific explanation of how this applies to the current case",
      "outcome": "favorable|unfavorable|mixed",
      "key_principle": "The legal principle established by this case"
    }
  ],
  "legal_trend": "Description of how courts have been ruling in similar cases over time",
  "landmark_cases": ["Most important landmark case and why it changed the legal landscape"]
}`,
    timeline: `Create a realistic legal timeline as JSON:
{
  "phases": [
    {
      "phase": "Phase name",
      "duration": "X days/weeks/months",
      "actions": ["action 1", "action 2"],
      "status": "immediate|short_term|medium_term|long_term"
    }
  ],
  "total_estimated_duration": "X months to Y months",
  "critical_deadlines": ["deadline 1 - why it matters"],
  "fast_track_options": ["option to speed up the process"]
}`,
  };

  const prompt = tabPrompts[tabType];
  if (!prompt) return null;

  // Dynamic timeline prompt based on court
  let finalPrompt = prompt;
  if (tabType === 'timeline' && courtType) {
    const courtNames = {
      district: 'District Court',
      family: 'Family Court',
      sessions: 'Sessions Court',
      high_court: 'High Court',
      supreme_court: 'Supreme Court',
      consumer: 'Consumer Forum',
      labour: 'Labour Court',
    };
    const courtName = courtNames[courtType] || 'District Court';
    finalPrompt = `Create a realistic legal timeline specifically for the ${courtName} in India.
Consider the typical processing speed, backlog, and procedures specific to ${courtName}.
Be realistic about timelines — ${courtName === 'Supreme Court' ? 'cases can take 5-10 years' : courtName === 'High Court' ? 'cases typically take 2-5 years' : courtName === 'Family Court' ? 'cases can be resolved in 6-18 months with mediation' : 'cases typically take 1-3 years'}.
Return JSON:\n{\n  "court": "${courtName}",\n  "phases": [{"phase": "Phase name", "duration": "X days/weeks/months", "actions": ["action 1"], "status": "immediate|short_term|medium_term|long_term"}],\n  "total_estimated_duration": "Realistic estimate for ${courtName}",\n  "critical_deadlines": ["deadline - why"],\n  "fast_track_options": ["option"],\n  "court_specific_notes": "Any notes specific to ${courtName} procedures"\n}`;
  }

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are an expert Indian legal analyst. Analyze the case and respond with ONLY valid JSON. Be specific, cite real Indian laws and sections.' },
        { role: 'user', content: `Case: "${caseDescription}"\n\n${finalPrompt}` }
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const raw = response.choices[0]?.message?.content || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch (e) {
    console.error(`Tab ${tabType} error:`, e.message);
    const msg = e.message || '';
    if (msg.includes('rate_limit') || msg.includes('Rate limit') || msg.includes('429')) {
      return { _error: 'Groq API rate limit reached. Please wait a few minutes and try again, or upgrade your Groq plan.' };
    }
    return { _error: `Analysis failed: ${msg}` };
  }
  return { _error: 'AI returned no usable data. Please try again.' };
}

/* ── Agent Debate: agents argue with each other ──────────────────────── */
async function runDebate(caseDescription, findings) {
  const agentSummaries = findings.map(f =>
    `${f.emoji} ${f.agent_name} (${f.domain}): ${f.stance}\nKey: ${(f.key_insights || []).join('; ')}`
  ).join('\n\n');

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a debate moderator analyzing disagreements between legal expert agents. Return ONLY valid JSON.' },
        { role: 'user', content: `Case: "${caseDescription}"

Expert Analyses:
${agentSummaries}

Identify conflicts and cross-domain causal chains. Return JSON:
{
  "conflicts": [
    {
      "agent_a": "domain_name",
      "agent_b": "domain_name",
      "claim_a": "What agent A argues",
      "claim_b": "What agent B argues",
      "severity": "low|moderate|critical",
      "incompatibility": "Root cause of disagreement"
    }
  ],
  "cross_domain_chains": [
    {
      "chain": [
        {"domain": "domain1", "claim": "First cause"},
        {"domain": "domain2", "claim": "This leads to"},
        {"domain": "domain3", "claim": "Which ultimately causes"}
      ],
      "non_obvious_insight": "What this chain reveals that no single agent could see"
    }
  ],
  "consensus_points": ["Where all agents agree"],
  "blind_spots": ["What no agent addressed"]
}` }
      ],
      max_tokens: 2000,
      temperature: 0.4,
    });

    const raw = response.choices[0]?.message?.content || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch (e) { console.error('Debate error:', e.message); }

  return { conflicts: [], cross_domain_chains: [], consensus_points: [], blind_spots: [] };
}

/* ── Meta Agent: select relevant domains ─────────────────────────────── */
async function selectDomains(caseDescription) {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{
        role: 'system',
        content: 'You select which expert agents to activate for a legal case. Return ONLY valid JSON.'
      }, {
        role: 'user',
        content: `Given this case description, select 3-5 most relevant agents from: legal, financial, psychology, social, rights, procedural.

Case: "${caseDescription}"

Return JSON: {"agents": ["agent1", "agent2", "agent3"], "reasoning": "why these agents"}`
      }],
      max_tokens: 300,
      temperature: 0.3,
    });

    const raw = response.choices[0]?.message?.content || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const data = JSON.parse(match[0]);
      const valid = (data.agents || []).filter(a => AGENT_POOL[a]);
      if (valid.length >= 2) return { agents: valid.slice(0, 5), reasoning: data.reasoning || '' };
    }
  } catch (e) { console.error('Meta agent error:', e.message); }

  return { agents: ['legal', 'psychology', 'procedural'], reasoning: 'Default agents selected for broad coverage.' };
}

/* ── Run single agent ────────────────────────────────────────────────── */
async function runAgent(domain, caseDescription) {
  const agent = AGENT_POOL[domain];
  if (!agent) return null;

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: agent.systemPrompt },
        { role: 'user', content: `Analyze this case from your expert perspective. Be specific, actionable, and cite relevant laws/resources.

Case: "${caseDescription}"

Provide your analysis as JSON:
{
  "domain": "${domain}",
  "stance": "Your expert assessment in 2-3 sentences",
  "key_insights": ["insight 1", "insight 2", "insight 3"],
  "action_items": ["specific action 1", "specific action 2", "specific action 3"],
  "risk_level": "low|medium|high|critical",
  "priority_score": 0-100,
  "what_others_miss": "One critical thing other experts will overlook",
  "confidence": 0.0-1.0,
  "prediction": "How this case will likely unfold from your perspective"
}` }
      ],
      max_tokens: 1500,
      temperature: 0.4,
    });

    const raw = response.choices[0]?.message?.content || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const finding = JSON.parse(match[0]);
      finding.domain = domain;
      finding.agent_name = agent.name;
      finding.emoji = agent.emoji;
      finding.color = agent.color;
      return finding;
    }
  } catch (e) { console.error(`Agent ${domain} error:`, e.message); }

  return {
    domain, agent_name: agent.name, emoji: agent.emoji, color: agent.color,
    stance: `Analysis from ${agent.name} perspective.`,
    key_insights: ['Analysis pending'], action_items: ['Consult a professional'],
    risk_level: 'medium', priority_score: 50, confidence: 0.5,
    what_others_miss: 'Further analysis needed', prediction: 'Need more information.'
  };
}

/* ── Synthesis ─────────────────────────────────────────────────────── */
async function synthesizeFindings(caseDescription, findings) {
  const agentSummaries = findings.map(f =>
    `${f.emoji} ${f.agent_name}: ${f.stance}\nKey: ${(f.key_insights || []).join('; ')}\nActions: ${(f.action_items || []).join('; ')}`
  ).join('\n\n');

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{
        role: 'system',
        content: 'You synthesize multiple expert analyses into one clear, actionable summary. Be empathetic, clear, and practical. Return ONLY valid JSON.'
      }, {
        role: 'user',
        content: `Case: "${caseDescription}"

Expert Analyses:
${agentSummaries}

Synthesize into JSON:
{
  "overall_assessment": "2-3 sentence summary",
  "severity": "informational|urgent|emergency",
  "immediate_actions": ["action 1", "action 2", "action 3"],
  "key_laws": [{"name": "Law Name", "section": "Section X"}],
  "timeline": "expected timeline",
  "empowerment_note": "encouraging message",
  "consensus_points": ["where agents agreed"],
  "conflict_points": ["where agents disagreed"],
  "what_each_domain_missed": {"domain": "what they missed"}
}`
      }],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const raw = response.choices[0]?.message?.content || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch (e) { console.error('Synthesis error:', e.message); }

  return {
    overall_assessment: 'Multiple experts have analyzed your case.',
    severity: 'urgent',
    immediate_actions: findings.flatMap(f => f.action_items || []).slice(0, 5),
    key_laws: [], timeline: 'Varies', empowerment_note: 'You are not alone.',
    consensus_points: [], conflict_points: [],
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   ROUTES
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Tab analysis: POST /api/agents/tab ─────────────────────────────── */
agentsRouter.post('/tab', async (req, res) => {
  const { tab, caseDescription, court } = req.body;
  if (!tab || !caseDescription) return res.status(400).json({ error: 'Missing tab or caseDescription' });

  const result = await analyzeTab(tab, caseDescription, court);
  if (result && result._error) {
    return res.json({ tab, data: null, error: result._error });
  }
  res.json({ tab, data: result });
});

/* ── Full pipeline: POST /api/agents/analyze ─────────────────────────── */
agentsRouter.post('/analyze', async (req, res) => {
  const { caseDescription } = req.body;
  if (!caseDescription || caseDescription.trim().length < 10) {
    return res.status(400).json({ error: 'Please describe your situation in at least a few sentences.' });
  }

  // SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const emit = (type, data) => res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);

  try {
    // Stage 1: Meta agent
    emit('stage', { stage: 'meta', message: '🤖 Meta Agent analyzing your case...' });
    const { agents: selectedDomains, reasoning } = await selectDomains(caseDescription);
    emit('domains_selected', {
      domains: selectedDomains.map(d => ({
        id: d, name: AGENT_POOL[d]?.name || d,
        emoji: AGENT_POOL[d]?.emoji || '🔍', color: AGENT_POOL[d]?.color || '#6b7280',
      })),
      reasoning
    });

    // Stage 2: Run agents in parallel
    emit('stage', { stage: 'agents', message: `🧠 Deploying ${selectedDomains.length} expert agents...` });
    const agentPromises = selectedDomains.map(async (domain) => {
      emit('agent_start', { domain, name: AGENT_POOL[domain]?.name, emoji: AGENT_POOL[domain]?.emoji });
      const finding = await runAgent(domain, caseDescription);
      emit('agent_complete', { domain, finding });
      return finding;
    });
    const findings = (await Promise.all(agentPromises)).filter(Boolean);

    // Stage 3: Agent debate
    emit('stage', { stage: 'debate', message: '⚔️ Agents debating and finding conflicts...' });
    const debate = await runDebate(caseDescription, findings);
    emit('debate', { debate });

    // Stage 4: Synthesis
    emit('stage', { stage: 'synthesis', message: '📊 Synthesizing all expert analyses...' });
    const synthesis = await synthesizeFindings(caseDescription, findings);
    emit('synthesis', { synthesis });

    emit('done', { findings, synthesis, debate });
    res.end();
  } catch (err) {
    console.error('Agent pipeline error:', err);
    emit('error', { message: err.message });
    res.end();
  }
});

// Available agents
agentsRouter.get('/pool', (_req, res) => {
  const pool = Object.entries(AGENT_POOL).map(([id, a]) => ({
    id, name: a.name, emoji: a.emoji, color: a.color
  }));
  res.json(pool);
});
