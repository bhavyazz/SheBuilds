export const legalAidData = {
  emergency: [
    {
      id: "police-emergency",
      name: "Police Emergency",
      number: "112",
      type: "emergency",
      description: "Pan-India emergency number for police, fire, and ambulance",
      available: "24/7",
      languages: ["Hindi", "English", "Regional"],
      icon: "🚔"
    },
    {
      id: "women-helpline",
      name: "Women's Helpline",
      number: "181",
      type: "emergency",
      description: "Toll-free helpline for women in distress. Provides information, referral to police, shelter homes, legal aid, and One Stop Centres",
      available: "24/7",
      languages: ["Hindi", "English", "Regional"],
      icon: "📞"
    },
    {
      id: "ncw-helpline",
      name: "National Commission for Women",
      number: "14490",
      type: "emergency",
      description: "24/7 helpline for women facing violence, harassment, or discrimination",
      available: "24/7",
      languages: ["Hindi", "English"],
      website: "http://ncw.nic.in",
      icon: "🛡️"
    },
    {
      id: "nalsa-helpline",
      name: "NALSA Free Legal Aid",
      number: "15100",
      type: "legal_aid",
      description: "National Legal Services Authority — free legal aid, connect with panel lawyers. Option to speak with female advocate available.",
      available: "24/7",
      languages: ["Hindi", "English", "Regional"],
      website: "https://nalsa.gov.in",
      icon: "⚖️"
    },
    {
      id: "cybercrime",
      name: "Cybercrime Helpline",
      number: "1930",
      type: "emergency",
      description: "Report cyber crimes including online harassment, morphed images, blackmail",
      available: "24/7",
      languages: ["Hindi", "English"],
      website: "https://cybercrime.gov.in",
      icon: "🖥️"
    },
    {
      id: "childline",
      name: "Childline",
      number: "1098",
      type: "emergency",
      description: "For reporting child abuse, child marriage, or children in need of care",
      available: "24/7",
      languages: ["Hindi", "English", "Regional"],
      icon: "👶"
    }
  ],
  national: [
    {
      id: "nalsa",
      name: "National Legal Services Authority (NALSA)",
      type: "legal_services",
      description: "Provides free legal aid to women, SC/ST, persons with disabilities, and economically weaker sections. Every district has a District Legal Services Authority (DLSA).",
      website: "https://nalsa.gov.in",
      phone: "15100",
      services: ["Free legal aid", "Panel lawyers", "Lok Adalats", "Legal awareness camps"],
      icon: "⚖️"
    },
    {
      id: "ncw",
      name: "National Commission for Women (NCW)",
      type: "commission",
      description: "Statutory body investigating complaints of women's rights violations. Can issue summons and investigate cases.",
      website: "http://ncw.nic.in",
      phone: "14490",
      services: ["Complaint investigation", "Suo motu action", "Legal advice", "Gender sensitization"],
      complaint_portal: "http://ncwapps.nic.in/onlinecomplaint/",
      icon: "🏛️"
    },
    {
      id: "shebox",
      name: "SHe-Box (Sexual Harassment Electronic Box)",
      type: "portal",
      description: "Online complaint portal for workplace sexual harassment. Monitored by Ministry of Women & Child Development.",
      website: "https://shebox.wcd.gov.in",
      services: ["File workplace harassment complaints", "Track complaint status", "Direct to Internal/Local Committee"],
      icon: "📦"
    },
    {
      id: "one-stop-centre",
      name: "One Stop Centres (Sakhi)",
      type: "shelter",
      description: "Integrated support including police, legal, medical, and counseling services under one roof for women affected by violence. 700+ centres across India.",
      website: "https://wcd.nic.in/schemes/one-stop-centre-scheme-1",
      services: ["Emergency shelter", "Police facilitation", "Medical aid", "Counseling", "Legal aid"],
      icon: "🏠"
    }
  ],
  ngos: [
    {
      id: "majlis",
      name: "Majlis Legal Centre",
      type: "ngo",
      location: "Mumbai, Maharashtra",
      description: "Leading women's rights legal advocacy organization. Provides free legal representation in domestic violence and sexual assault cases.",
      website: "https://www.majlislaw.com",
      services: ["Legal representation", "Counseling", "Advocacy"],
      icon: "⚖️"
    },
    {
      id: "swayam",
      name: "Swayam",
      type: "ngo",
      location: "Kolkata, West Bengal",
      description: "Works on violence against women and children. Provides counseling, legal support, and shelter.",
      phone: "033-24862397",
      services: ["Counseling", "Legal aid", "Shelter", "Advocacy"],
      icon: "🤝"
    },
    {
      id: "jagori",
      name: "Jagori",
      type: "ngo",
      location: "New Delhi",
      description: "Women's rights organization focused on ending violence against women. Runs helpline and provides legal support.",
      website: "https://jagori.org",
      phone: "011-26692700",
      services: ["Helpline", "Legal aid", "Safe city initiatives", "Training"],
      icon: "💪"
    },
    {
      id: "sneha",
      name: "SNEHA (Society for Nutrition, Education & Health Action)",
      type: "ngo",
      location: "Mumbai, Maharashtra",
      description: "Provides crisis intervention, counseling, and legal support for women facing domestic violence.",
      website: "https://snehamumbai.org",
      phone: "1800-102-0968",
      services: ["Crisis helpline", "Counseling", "Legal aid", "Shelter referral"],
      icon: "❤️"
    },
    {
      id: "saheli",
      name: "Saheli Women's Resource Centre",
      type: "ngo",
      location: "New Delhi",
      description: "Autonomous women's organization providing legal, medical, and emotional support to women.",
      website: "https://sahelirgn.in",
      phone: "011-24616485",
      services: ["Legal support", "Counseling", "Advocacy", "Women's rights education"],
      icon: "🌸"
    },
    {
      id: "pratham",
      name: "Martha Farrell Foundation",
      type: "ngo",
      location: "New Delhi",
      description: "Specializes in workplace sexual harassment prevention and POSH Act compliance.",
      website: "https://marthafarrellfoundation.org",
      services: ["POSH training", "IC member training", "Policy development", "Complaint support"],
      icon: "🏢"
    }
  ],
  state_commissions: [
    { state: "Andhra Pradesh", name: "AP State Commission for Women", website: "https://apscw.ap.gov.in" },
    { state: "Bihar", name: "Bihar State Commission for Women", website: "https://bswc.bihar.gov.in" },
    { state: "Delhi", name: "Delhi Commission for Women", website: "http://dcw.delhigovt.nic.in", phone: "181" },
    { state: "Gujarat", name: "Gujarat State Commission for Women", website: "https://gscw.gujarat.gov.in" },
    { state: "Karnataka", name: "Karnataka State Women's Commission", website: "https://kswc.karnataka.gov.in" },
    { state: "Kerala", name: "Kerala State Women's Commission", website: "https://kswc.kerala.gov.in" },
    { state: "Madhya Pradesh", name: "MP State Commission for Women", website: "https://mpscw.mp.gov.in" },
    { state: "Maharashtra", name: "Maharashtra State Commission for Women", website: "https://mscw.org.in" },
    { state: "Rajasthan", name: "Rajasthan State Commission for Women", website: "https://rscw.rajasthan.gov.in" },
    { state: "Tamil Nadu", name: "Tamil Nadu State Commission for Women", website: "https://tscw.tn.gov.in" },
    { state: "Telangana", name: "Telangana State Women's Commission", website: "https://tswc.telangana.gov.in" },
    { state: "Uttar Pradesh", name: "UP State Commission for Women", website: "https://upmahilaayog.in" },
    { state: "West Bengal", name: "West Bengal Commission for Women", website: "https://wbcw.gov.in" }
  ],
  online_portals: [
    {
      name: "e-Courts Services",
      url: "https://ecourts.gov.in",
      description: "Check case status, court orders, and hearing dates online"
    },
    {
      name: "Online FIR (varies by state)",
      url: "https://digitalpolice.gov.in",
      description: "File FIR online in participating states"
    },
    {
      name: "SHe-Box",
      url: "https://shebox.wcd.gov.in",
      description: "File workplace sexual harassment complaints online"
    },
    {
      name: "Cybercrime Portal",
      url: "https://cybercrime.gov.in",
      description: "Report cyber crimes against women online"
    },
    {
      name: "NALSA Online Legal Aid",
      url: "https://nalsa.gov.in",
      description: "Apply for free legal aid online"
    },
    {
      name: "NCW Online Complaints",
      url: "http://ncwapps.nic.in/onlinecomplaint/",
      description: "File complaints with National Commission for Women"
    }
  ]
};

export const rightsKnowledge = [
  {
    id: "domestic-violence",
    title: "Domestic Violence",
    icon: "🏠",
    color: "#e11d48",
    summary: "Protection from physical, emotional, verbal, sexual, and economic abuse at home",
    laws: [
      { name: "Protection of Women from Domestic Violence Act, 2005", shortName: "PWDVA 2005" },
      { name: "IPC Section 498A", shortName: "Cruelty by Husband/Relatives" }
    ],
    rights: [
      "You have the right to live in your shared household — even if it's in your husband's or in-laws' name",
      "Domestic violence includes not just physical violence, but also verbal abuse, emotional abuse, threats, and controlling your money or movements",
      "You can get a Protection Order from the court that stops the abuser from contacting you, entering your home, or coming near your workplace",
      "You are entitled to monetary relief — the abuser must pay for your expenses, medical bills, and damages",
      "You can file a complaint even if you are in a live-in relationship — you don't need to be legally married",
      "The police MUST register your complaint — they cannot refuse or tell you to 'settle it at home'"
    ],
    steps: [
      "Ensure your immediate safety — call 112 (Police) or 181 (Women's Helpline) if in danger",
      "Document everything — save screenshots, photos of injuries, record dates and incidents",
      "Visit the nearest Protection Officer or Women's Cell at your local police station",
      "File a Domestic Incident Report (DIR) with the Protection Officer",
      "Apply to the Magistrate Court for Protection Order (your lawyer or legal aid can help)",
      "You can also directly file an FIR under Section 498A IPC at any police station",
      "Call NALSA at 15100 for FREE legal representation"
    ],
    evidence: ["Photos of injuries", "Medical reports", "Screenshots of threats", "Witness statements", "Financial records", "Audio/video recordings"]
  },
  {
    id: "workplace-harassment",
    title: "Workplace Harassment",
    icon: "🏢",
    color: "#7c3aed",
    summary: "Protection from sexual harassment at your workplace under the POSH Act",
    laws: [
      { name: "Sexual Harassment of Women at Workplace Act, 2013", shortName: "POSH Act" },
      { name: "IPC Section 354A", shortName: "Sexual Harassment" }
    ],
    rights: [
      "Every workplace with 10+ employees MUST have an Internal Committee (IC) to handle complaints",
      "Sexual harassment includes unwelcome physical contact, advances, remarks, showing pornography, and demanding sexual favors",
      "You can file a complaint within 3 months of the incident (extendable to 6 months)",
      "Your employer CANNOT terminate you or retaliate for filing a complaint",
      "You can request transfer — either yours or the accused's — during investigation",
      "If your workplace has no IC, you can file with the Local Committee at the District Collector's office",
      "You can also file online through SHe-Box (shebox.wcd.gov.in)"
    ],
    steps: [
      "Write down exactly what happened — dates, times, places, witnesses",
      "File a written complaint with the Internal Committee (IC) of your organization",
      "If no IC exists, file with the Local Committee at the District Collector/Deputy Commissioner office",
      "You can also file online via SHe-Box portal",
      "The IC must complete the inquiry within 90 days",
      "If unsatisfied with the IC's decision, appeal within 90 days to the appropriate court",
      "You can also file a police complaint under IPC Section 354A"
    ],
    evidence: ["Emails/messages from the harasser", "Witness names and statements", "CCTV footage", "Screenshots of inappropriate messages", "Record of complaints to HR"]
  },
  {
    id: "property-inheritance",
    title: "Property & Inheritance",
    icon: "🏡",
    color: "#059669",
    summary: "Equal rights to ancestral and family property regardless of marital status",
    laws: [
      { name: "Hindu Succession Act, 1956 (amended 2005)", shortName: "HSA" },
      { name: "Indian Succession Act, 1925", shortName: "ISA" }
    ],
    rights: [
      "Daughters have EQUAL rights as sons in ancestral/coparcenary property — this is the law since 2005",
      "Your right to ancestral property exists by BIRTH — it doesn't depend on your father's death",
      "Getting married does NOT reduce your property rights — married daughters have equal share",
      "Any property you possess as a Hindu woman is your ABSOLUTE property (Section 14 HSA)",
      "Stridhan (gifts received at or before marriage) belongs ONLY to you — husband has no right over it",
      "If your husband dies without a will, you are a Class I heir and inherit equally with children"
    ],
    steps: [
      "Identify the property in question — is it ancestral (coparcenary) or self-acquired?",
      "For ancestral property: you have a birthright share — no one needs to 'give' it to you",
      "If family refuses your share, send a legal notice through an advocate",
      "File a civil suit for partition in the appropriate civil court",
      "Apply for free legal aid through DLSA if you cannot afford a lawyer",
      "For Stridhan recovery, file a case under Section 406 IPC (criminal breach of trust)"
    ],
    evidence: ["Property documents (title deed, sale deed)", "Family tree/genealogy", "Revenue records (khata, pahani)", "Will (if any)", "Stridhan list (often made at marriage)"]
  },
  {
    id: "divorce",
    title: "Divorce & Maintenance",
    icon: "💔",
    color: "#dc2626",
    summary: "Rights during separation including maintenance, custody, and property division",
    laws: [
      { name: "Hindu Marriage Act, 1955", shortName: "HMA" },
      { name: "Special Marriage Act, 1954", shortName: "SMA" },
      { name: "Section 125 CrPC", shortName: "Maintenance" }
    ],
    rights: [
      "You can seek divorce on grounds of cruelty, adultery, desertion (2+ years), mental disorder, or conversion",
      "You are entitled to maintenance (financial support) from your husband — even during the divorce process",
      "Section 125 CrPC gives you the right to maintenance regardless of your religion",
      "You can claim maintenance even without filing for divorce — just for living separately",
      "Children below 5 years are generally given to the mother's custody",
      "You have the right to your Stridhan and any jointly owned property",
      "Mutual consent divorce requires 6 months cooling period (can be waived by Supreme Court)"
    ],
    steps: [
      "Consult a family court lawyer (or call NALSA 15100 for free legal aid)",
      "Decide: contested divorce or mutual consent",
      "File a maintenance petition under Section 125 CrPC (even before filing divorce)",
      "File divorce petition in the Family Court of the jurisdiction where you last lived together",
      "Gather evidence for grounds of divorce (cruelty, desertion, etc.)",
      "Apply for interim maintenance during the case proceedings",
      "For child custody, file application in the same Family Court"
    ],
    evidence: ["Marriage certificate", "Evidence of cruelty/grounds", "Income proof of husband", "Children's birth certificates", "List of Stridhan", "Bank statements"]
  },
  {
    id: "dowry-harassment",
    title: "Dowry Harassment",
    icon: "⛓️",
    color: "#b91c1c",
    summary: "Protection from dowry demands, dowry harassment, and dowry-related violence",
    laws: [
      { name: "Dowry Prohibition Act, 1961", shortName: "DPA" },
      { name: "IPC Section 498A", shortName: "Cruelty" },
      { name: "IPC Section 304B", shortName: "Dowry Death" }
    ],
    rights: [
      "Giving or taking dowry is a CRIMINAL offense punishable with imprisonment up to 5 years",
      "If anyone demands dowry from you or your family, you can file a criminal complaint",
      "IPC 498A treats dowry harassment as a cognizable and non-bailable offense",
      "If a woman dies within 7 years of marriage under unnatural circumstances AND faced dowry harassment, it's treated as dowry death (IPC 304B) — punishable with minimum 7 years imprisonment",
      "You have the right to ALL gifts given to you at your marriage (Stridhan)"
    ],
    steps: [
      "Keep records of all dowry demands (texts, calls, witnesses)",
      "File an FIR at the nearest police station under Section 498A IPC and Dowry Prohibition Act",
      "The police CANNOT refuse to register the FIR — if they do, approach the SP/Commissioner",
      "You can also file a complaint with the Women's Cell of local police",
      "Apply for Protection Order under PWDVA 2005 simultaneously",
      "Contact NALSA (15100) for free legal representation"
    ],
    evidence: ["Messages/recordings demanding dowry", "List of items given as dowry", "Witness statements", "Medical reports", "Bank transaction records"]
  },
  {
    id: "cybercrime",
    title: "Cyber Crime & Online Harassment",
    icon: "💻",
    color: "#6366f1",
    summary: "Protection from online harassment, morphed images, stalking, and blackmail",
    laws: [
      { name: "IT Act Section 66E", shortName: "Privacy Violation" },
      { name: "IT Act Section 67", shortName: "Obscene Content" },
      { name: "IPC Section 354D", shortName: "Stalking" },
      { name: "IPC Section 509", shortName: "Insulting Modesty" }
    ],
    rights: [
      "Publishing or sharing your intimate/private images without consent is a criminal offense",
      "Cyber stalking, online harassment, and blackmail are punishable under the IT Act",
      "You can get objectionable content removed from websites and social media platforms",
      "Your identity will be kept confidential during investigation",
      "You can file complaints online — you don't need to visit a police station"
    ],
    steps: [
      "Take screenshots of EVERYTHING — don't delete any evidence",
      "Report and block the harasser on the platform",
      "File a complaint on cybercrime.gov.in or call 1930",
      "You can also file an FIR at any police station",
      "Request content removal from the platform (contact their support)",
      "If images are involved, you can apply for an injunction to prevent further sharing"
    ],
    evidence: ["Screenshots of harassment", "URLs of offensive content", "Profile details of harasser", "Email headers", "Chat logs"]
  },
  {
    id: "sexual-assault",
    title: "Sexual Assault & Rape",
    icon: "🛡️",
    color: "#991b1b",
    summary: "Legal protections and rights of survivors of sexual assault",
    laws: [
      { name: "IPC Section 376", shortName: "Rape" },
      { name: "IPC Section 354", shortName: "Assault/Outraging Modesty" },
      { name: "POCSO Act, 2012", shortName: "Protection of Children" }
    ],
    rights: [
      "You can file an FIR at ANY police station — not just the one in whose jurisdiction the crime occurred",
      "A woman police officer MUST record your statement if you request it",
      "Medical examination must be conducted by a female doctor with your consent",
      "Your identity is protected by law — media cannot reveal your name",
      "The defense lawyer CANNOT ask about your 'character' or sexual history in court",
      "Free legal aid is your RIGHT — you don't need to pay for a lawyer",
      "No time limit for filing rape complaint"
    ],
    steps: [
      "Your safety comes first — reach a safe place immediately",
      "Call 112 (Police) or go to the nearest police station",
      "Do NOT bathe or change clothes before medical examination (preserves forensic evidence)",
      "Insist on immediate medical examination at a government hospital",
      "The statement will be recorded by a Magistrate under Section 164 CrPC",
      "Free legal aid will be provided — contact DLSA or call NALSA 15100",
      "Counseling support is available through One Stop Centres"
    ],
    evidence: ["Medical examination report", "Clothes worn (preserved)", "Any physical evidence", "Witness information", "CCTV footage if available"]
  }
];

export const legalMyths = [
  {
    id: 1,
    myth: "Police can refuse to register an FIR if they think the case is not serious",
    fact: "Police CANNOT refuse to register an FIR. Under Section 154 CrPC, if a cognizable offense is reported, the police MUST register the FIR. If they refuse, you can complain to the Superintendent of Police (SP), file it by post to the SP, or approach the Magistrate under Section 156(3) to direct the police.",
    category: "Police & FIR",
    icon: "🚔"
  },
  {
    id: 2,
    myth: "Daughters don't have rights to ancestral property if they are married",
    fact: "Since the 2005 amendment to the Hindu Succession Act, daughters — married or unmarried — have EQUAL rights as sons in ancestral property. Marriage does NOT affect your inheritance rights in any way.",
    category: "Property",
    icon: "🏡"
  },
  {
    id: 3,
    myth: "Domestic violence means only physical beating",
    fact: "Under the PWDVA 2005, domestic violence includes physical, sexual, verbal, emotional, AND economic abuse. Controlling your money, insulting you in front of others, threatening you, restricting your movement — these are ALL domestic violence under the law.",
    category: "Domestic Violence",
    icon: "🏠"
  },
  {
    id: 4,
    myth: "You need a lawyer to file an FIR",
    fact: "You do NOT need a lawyer to file an FIR. Any person can walk into any police station and report a cognizable offense. The police are legally bound to register it. However, a lawyer can help you follow up.",
    category: "Police & FIR",
    icon: "🚔"
  },
  {
    id: 5,
    myth: "Only married women can file domestic violence cases",
    fact: "The PWDVA 2005 protects women in ALL domestic relationships — married, live-in, mother-daughter, sister-in-law. You don't need to be legally married to seek protection.",
    category: "Domestic Violence",
    icon: "🏠"
  },
  {
    id: 6,
    myth: "If you file a workplace harassment complaint, you will lose your job",
    fact: "Under the POSH Act, your employer CANNOT retaliate against you for filing a complaint. Termination, demotion, or transfer as retaliation is itself a violation of the law. Your identity should also be kept confidential.",
    category: "Workplace",
    icon: "🏢"
  },
  {
    id: 7,
    myth: "A wife cannot file for maintenance unless she files for divorce",
    fact: "Under Section 125 CrPC, a wife can claim maintenance even during the marriage — you don't need to file for divorce. If your husband is not providing for you, you can directly approach the Family Court or Magistrate.",
    category: "Divorce & Maintenance",
    icon: "💰"
  },
  {
    id: 8,
    myth: "There's a time limit after which you can't report rape",
    fact: "There is NO time limit (statute of limitations) for filing a rape complaint in India. You can report it at any time — whether it happened yesterday or years ago.",
    category: "Sexual Assault",
    icon: "🛡️"
  },
  {
    id: 9,
    myth: "Cyber harassment is not a 'real' crime",
    fact: "Cyber harassment, online stalking, sharing intimate images, and blackmail are all criminal offenses under the IT Act and IPC. They carry imprisonment of up to 3-7 years. File a complaint at cybercrime.gov.in or call 1930.",
    category: "Cybercrime",
    icon: "💻"
  },
  {
    id: 10,
    myth: "Only the mother can get custody of children after divorce",
    fact: "While mothers generally get custody of children under 5, courts decide custody based on the 'best interest of the child.' Fathers can also get custody. Both parents have rights, but the child's welfare comes first.",
    category: "Child Custody",
    icon: "👶"
  },
  {
    id: 11,
    myth: "A woman needs her husband's permission to work",
    fact: "Every woman has a fundamental right to work and earn her livelihood under Article 19(1)(g) of the Constitution. No husband or family member can legally prevent you from working.",
    category: "Workplace",
    icon: "💼"
  },
  {
    id: 12,
    myth: "Filing a false dowry case (498A) is easy and common",
    fact: "While there's concern about misuse, the Supreme Court has held that Section 498A is a crucial protection for women. Filing a false case is itself a criminal offense. The law exists because dowry deaths and harassment are tragically common in India.",
    category: "Dowry",
    icon: "⛓️"
  },
  {
    id: 13,
    myth: "If the husband earns less, he doesn't need to pay maintenance",
    fact: "Maintenance is based on the husband's capacity to earn, not just current earnings. Courts consider assets, standard of living, and the wife's needs. Even unemployed men have been ordered to pay maintenance if they have the ability to earn.",
    category: "Divorce & Maintenance",
    icon: "💰"
  },
  {
    id: 14,
    myth: "You can only file a complaint in the police station of where the crime happened",
    fact: "Under the Zero FIR system, you can file an FIR at ANY police station in India, regardless of jurisdiction. The police are required to register it and then transfer it to the correct jurisdiction.",
    category: "Police & FIR",
    icon: "🚔"
  },
  {
    id: 15,
    myth: "Legal aid is only for the very poor",
    fact: "Under the Legal Services Authorities Act, free legal aid is available to ALL women (regardless of income), SC/ST communities, persons with disabilities, industrial workers, and others. Call NALSA at 15100.",
    category: "Legal Aid",
    icon: "⚖️"
  },
  {
    id: 16,
    myth: "Marital rape is not a crime in India",
    fact: "While marital rape is not specifically criminalized as a separate offense under IPC, the Supreme Court has recognized forced sexual acts within marriage as a form of cruelty. Under PWDVA 2005, sexual abuse by husband IS domestic violence and grounds for protection orders, divorce, and criminal prosecution under other sections.",
    category: "Sexual Assault",
    icon: "🛡️"
  },
  {
    id: 17,
    myth: "A woman must return to her husband if he says sorry",
    fact: "No woman is legally obligated to return to her husband — ever. Reconciliation is always the woman's choice. Courts cannot force a woman to live with her husband against her will.",
    category: "Domestic Violence",
    icon: "🏠"
  },
  {
    id: 18,
    myth: "Muslim women cannot get maintenance after divorce",
    fact: "The Supreme Court in the Shah Bano case and subsequent legislation ensures that Muslim women ARE entitled to maintenance. The Muslim Women (Protection of Rights on Divorce) Act provides for maintenance during the iddat period and beyond if she has not remarried.",
    category: "Divorce & Maintenance",
    icon: "💰"
  }
];
