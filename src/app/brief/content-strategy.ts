// Go-To-Market Strategy — Week of April 6–12, 2026
// Positioning: Claude Consultant / Claude Implementation Expert
// Mode: REVENUE-FIRST. Content is an ad for the offer, not the goal.

export interface Action {
  rank: number;
  title: string;
  type: "offer" | "outreach" | "content" | "asset";
  owner: "you";
  hoursEstimate: number;
  directRevenueImpact: "immediate" | "30-day" | "long-tail";
  description: string;
  deliverables: string[];
  successMetric: string;
}

export const weeklyPlan: Action[] = [
  {
    rank: 1,
    title: "Productize and launch: Claude Code Auto Mode Readiness Audit",
    type: "offer",
    owner: "you",
    hoursEstimate: 4,
    directRevenueImpact: "immediate",
    description:
      "Flat-fee diagnostic engagement. 1-week turnaround. Tied to an urgent problem every eng manager is asking about right now: 'are we ready to let Claude Code run unsupervised?' This is the wedge into bigger implementation retainers.",
    deliverables: [
      "One-page offer doc (problem, deliverable, price, timeline)",
      "Price: $2,500 flat (or $3,500 with a 30-day follow-up slot)",
      "Deliverable: written readiness assessment + .claude/CLAUDE.md template + permission boundary config + 60-min walkthrough call",
      "Stripe/Paddle payment link or simple invoice flow",
      "Simple landing page (Carrd, Framer, or a single Next.js route here)",
    ],
    successMetric: "Offer is live and shareable by Wednesday EOD",
  },
  {
    rank: 2,
    title: "Build the warm list and run direct outreach",
    type: "outreach",
    owner: "you",
    hoursEstimate: 6,
    directRevenueImpact: "immediate",
    description:
      "Content without distribution is journaling. Before writing anything public, identify 20 warm contacts at companies already using Claude Code. DM them the offer directly. This is where the money comes from this month.",
    deliverables: [
      "List of 20 warm contacts (eng managers, CTOs, heads of platform/devex)",
      "Personalized DM template (3 sentences: specific observation about their stack, the offer, a concrete ask for a 20-min call)",
      "Send 5/day Mon–Fri",
      "Track in a simple sheet: name, company, sent date, reply, outcome",
    ],
    successMetric: "20 DMs sent, 3+ discovery calls booked by Friday",
  },
  {
    rank: 3,
    title: "Reactivate dormant network",
    type: "outreach",
    owner: "you",
    hoursEstimate: 2,
    directRevenueImpact: "immediate",
    description:
      "The highest-converting outreach is to people who already know you. Past clients, ex-colleagues, and anyone you've done work for before. They don't need to be sold on you — just informed that you're taking on Claude work.",
    deliverables: [
      "List of 15 past clients / former colleagues / people who've referred you before",
      "Short 'here's what I'm doing now' email — 4 sentences max, no ask, just an FYI with the offer link",
      "Send all 15 on Monday",
    ],
    successMetric: "15 emails sent, 2+ intro conversations or referrals",
  },
  {
    rank: 4,
    title: "One content piece — as an ad for the offer",
    type: "content",
    owner: "you",
    hoursEstimate: 3,
    directRevenueImpact: "30-day",
    description:
      "Write the Auto Mode walkthrough, but its job is to sell the audit, not to rank on Google. Ends with a direct CTA: 'I'm running 3 readiness audits this month — DM me.' Post on LinkedIn (where the budget holders are), cross-post to X.",
    deliverables: [
      "1 LinkedIn post, 1,200–1,800 characters, with 2–3 screenshots",
      "Structure: hook → what I tried → what broke → what you need to check before turning Auto Mode on → CTA with offer link",
      "Cross-post as X thread",
    ],
    successMetric: "Post live by Thursday, 1+ inbound DM from it",
  },
  {
    rank: 5,
    title: "Mythos hot take — free positioning, 30 minutes of effort",
    type: "content",
    owner: "you",
    hoursEstimate: 0.5,
    directRevenueImpact: "long-tail",
    description:
      "Only because the effort is near-zero and the news window closes in 48 hours. Short LinkedIn post, strategic framing, no blog post. Reinforces the 'strategic advisor, not just implementer' positioning that justifies the audit price tag.",
    deliverables: [
      "1 LinkedIn post, 600–900 characters",
      "Angle: gated releases = enterprises need advisors who understand capability AND compliance",
    ],
    successMetric: "Posted Tuesday, done in 30 minutes",
  },
];

export const deprioritized = [
  {
    item: "Claude Certified Architect long-form guide",
    reason:
      "Authority asset with 3–6 month compound return. Worth doing later when revenue is stable. Do NOT spend this week on it — the ROI timeline doesn't match the cash need.",
    revisitWeek: "Week of May 4 or after $15K in closed audit revenue, whichever comes first",
  },
  {
    item: "MCP production server deep-dive tutorial",
    reason:
      "High effort, long payoff. A great Q3 asset but this week it's a distraction from revenue.",
    revisitWeek: "Month 2",
  },
  {
    item: "Cowork for non-engineers walkthrough",
    reason:
      "Good lane, but the audience (non-technical budget holders) is further from ready-to-buy than the eng managers already using Auto Mode.",
    revisitWeek: "After 3 audits delivered — it becomes a case-study-ready piece then",
  },
];

export const strategyMeta = {
  generatedAt: "2026-04-08",
  weekOf: "April 6–12, 2026",
  mode: "revenue-first",
  positioning: "Claude Consultant / Claude Implementation Expert",
  thesis:
    "Content alone does not generate short-term consulting revenue. A productized offer + warm-network outreach + one piece of content that sells the offer does. This week is 80% GTM, 20% content.",
  weeklyCadence: [
    "Mon Apr 8 — Draft offer doc + landing page (2h). Send 15 dormant-network emails (1h). Send 5 DMs (1h).",
    "Tue Apr 9 — Ship Mythos hot take (30min). Send 5 DMs (1h). Finish landing page (2h).",
    "Wed Apr 10 — Offer live. Send 5 DMs (1h). Draft Auto Mode post (2h).",
    "Thu Apr 11 — Ship Auto Mode post (1h). Send 5 DMs (1h). Take any discovery calls that land.",
    "Fri Apr 12 — Follow up with all DMs/emails (1h). Review pipeline. Book next week's calls.",
  ],
  nonNegotiable:
    "No new content production until at least 15 outreach touches are out the door. Content without distribution is the trap.",
  weeklyTargetRevenue: "$5,000 (2 audits at $2,500) or 3+ qualified discovery calls",
};
