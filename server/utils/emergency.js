const DANGER_PHRASES = [
  'hitting me', 'beating me', 'beat me', 'attacked me', 'attacking me',
  'not safe', 'i am not safe', 'im not safe', 'unsafe',
  'threatening to kill', 'kill me', 'wants to kill', 'death threat',
  'locked me', 'locked in', 'trapped', 'cannot leave', 'can\'t leave', 'wont let me leave',
  'help me', 'please help', 'need help now', 'emergency',
  'hurting me', 'hurt me', 'burning me', 'acid',
  'forced me', 'forcing me', 'rape', 'raped', 'molest', 'sexual assault',
  'want to die', 'kill myself', 'suicide', 'end my life',
  'child abuse', 'hurting my child', 'beating my child',
  'police won\'t help', 'police refused',
  'thrown out', 'kicked me out', 'nowhere to go',
  'right now', 'happening now', 'currently',
];

export function detectEmergency(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  const matched = DANGER_PHRASES.filter(p => lower.includes(p));
  if (matched.length === 0) return null;

  const severity = matched.some(p =>
    ['kill', 'rape', 'acid', 'suicide', 'right now', 'happening now', 'not safe', 'die'].some(k => p.includes(k))
  ) ? 'critical' : 'high';

  return {
    detected: true,
    severity,
    matched_phrases: matched,
    contacts: [
      { name: 'Police Emergency', number: '112', icon: '🚔' },
      { name: "Women's Helpline", number: '181', icon: '📞' },
      { name: 'NCW Helpline', number: '14490', icon: '🛡️' },
      { name: 'NALSA Legal Aid', number: '15100', icon: '⚖️' },
    ]
  };
}
