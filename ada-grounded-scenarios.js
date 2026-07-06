#!/usr/bin/env node

/**
 * Ada-Grounded Piper Scenarios
 *
 * Tests Piper against real Ada workflows, personas, and constraints
 * Based on actual Slack data + real team structure
 *
 * Scenarios:
 * 1. Mike's Daily Decision Batch (CEO action prioritization)
 * 2. Distributed All-Hands Coordination (Impossible case)
 * 3. American Airlines Deal Readiness (Cross-functional sync)
 * 4. PAL Voice POC Customer Coordination (Rapid iteration loop)
 * 5. Infrastructure Priority Negotiation (Ryan's resource allocation)
 * 6. Quarterly Board Prep (Long's synthesis task)
 * 7. Group Scheduling Crisis (Multi-constraint real case)
 * 8. Timezone-Aware Standup Prep (Tech leads weekly)
 */

const fs = require('fs');

// ============================================================================
// Ada Personas (Real)
// ============================================================================

const ada = {
  // Executive
  mike: {
    name: 'Mike Murchison',
    role: 'CEO & Founder',
    timezone: 'America/Toronto', // Canada
    workingHours: { start: 9, end: 17.5 }, // 9 AM - 5:30 PM (hard constraint)
    tools: ['slack', 'gmail', 'calendar', 'linear', 'github', 'granola'],
  },

  ryan: {
    name: 'Ryan Stephens',
    role: 'VP Engineering',
    timezone: 'America/New_York', // ET
    workingHours: { start: 9, end: 17 },
    tools: ['slack', 'calendar', 'linear', 'github'],
  },

  long: {
    name: 'Long Dinh',
    role: 'CFO',
    timezone: 'America/New_York', // ET
    workingHours: { start: 9, end: 17 },
    tools: ['slack', 'gmail', 'calendar', 'sheets'],
  },

  sal: {
    name: 'Sal Uslugil',
    role: 'Head of Sales',
    timezone: 'America/Los_Angeles', // PT
    workingHours: { start: 9, end: 17 },
    tools: ['slack', 'gmail', 'calendar', 'salesforce'],
  },

  zeshan: {
    name: 'Zeshan',
    role: 'Speech/Voice Specialist',
    timezone: 'Asia/Kolkata', // Likely India
    workingHours: { start: 9, end: 18 }, // Flexible for customer support
    tools: ['slack', 'github', 'linear'],
  },

  roystonlee: {
    name: 'Roystonlee',
    role: 'Playbook Engineer',
    timezone: 'America/New_York', // ET
    workingHours: { start: 9, end: 17 },
    tools: ['slack', 'linear', 'docs'],
  },

  kosta: {
    name: 'Kosta',
    role: 'Infrastructure Lead',
    timezone: 'America/New_York', // ET
    workingHours: { start: 9, end: 17 },
    tools: ['slack', 'linear', 'github'],
  },
};

// ============================================================================
// SCENARIO 1: Mike's Daily Decision Batch
// ============================================================================

function scenario1_dailyDecisionBatch() {
  // Tuesday morning, Mike's office

  const actionItems = [
    // From PAL POC (customer success)
    {
      id: 'pal-1',
      source: 'PAL Voice POC',
      assignee: 'Zeshan',
      description: 'Fix Tagalog transcription quality (code-switching issue)',
      impact: 'High (customer-facing)',
      effort: 'Medium',
      dueDate: '2026-07-09', // Red-code: next day
      status: 'blocked_on_approval',
    },
    {
      id: 'pal-2',
      source: 'PAL Voice POC',
      assignee: 'Roystonlee',
      description: 'Clean up KB hallucination cases (5 items)',
      impact: 'Medium (quality)',
      effort: 'Low',
      dueDate: '2026-07-10',
      status: 'waiting_decision',
    },
    {
      id: 'pal-3',
      source: 'PAL Voice POC',
      assignee: 'Michael Caira',
      description: 'CSAT survey iteration based on Mac feedback',
      impact: 'Medium (POC metrics)',
      effort: 'Low',
      dueDate: '2026-07-09',
      status: 'waiting_approval',
    },

    // From American Airlines Deal
    {
      id: 'aa-1',
      source: 'American Airlines Deal',
      assignee: 'Long',
      description: 'Financial modeling for AA contract (terms, volume, margin)',
      impact: 'Critical (deal)',
      effort: 'High',
      dueDate: '2026-07-10', // Needed for customer call Thursday
      status: 'waiting_approval',
    },
    {
      id: 'aa-2',
      source: 'American Airlines Deal',
      assignee: 'Sal',
      description: 'Draft contract language with legal',
      impact: 'Critical (deal)',
      effort: 'High',
      dueDate: '2026-07-11',
      status: 'blocked_awaiting_legal',
    },
    {
      id: 'aa-3',
      source: 'American Airlines Deal',
      assignee: 'Ryan',
      description: 'DR readiness + infrastructure sign-off for AA deployment',
      impact: 'Critical (deal)',
      effort: 'Medium',
      dueDate: '2026-07-11',
      status: 'awaiting_status',
    },

    // Personal
    {
      id: 'mike-1',
      source: 'Jetpack/Piper',
      assignee: 'Mike',
      description: 'Code review + approve group scheduling session changes (PR #730)',
      impact: 'Medium (product)',
      effort: 'Low',
      dueDate: '2026-07-08', // Today
      status: 'pending_mike',
    },
    {
      id: 'mike-2',
      source: 'Investor Relations',
      assignee: 'Mike',
      description: 'Prep for investor call with Anuj (Thursday 2 PM)',
      impact: 'Medium (fundraising)',
      effort: 'Medium',
      dueDate: '2026-07-10',
      status: 'pending_mike',
    },
  ];

  // Expected Piper behavior:
  // 1. Rank by impact (AA deal critical, PAL POC high, personal medium)
  // 2. Identify blockers (AA-2 blocked on legal, AA-3 awaiting status)
  // 3. Route to appropriate people (don't make Mike do Zeshan's work)
  // 4. Highlight dependencies (AA deal items linked)
  // 5. Suggest approval/defer decisions

  const rubric = {
    'action_ranking': { weight: 0.25, description: 'Ranks by business impact (deal > customer > personal)' },
    'blocker_detection': { weight: 0.2, description: 'Identifies blocked items, escalates appropriately' },
    'routing_quality': { weight: 0.2, description: 'Routes to right person, doesn\'t overload Mike' },
    'dependency_awareness': { weight: 0.15, description: 'Understands AA items are linked' },
    'decision_support': { weight: 0.2, description: 'Summarizes decision needed + context for Mike to approve' },
  };

  return {
    name: 'Scenario 1: Daily Decision Batch',
    description: 'Mike reviews 8 action items (PAL POC + AA deal + personal), needs to prioritize + decide routing',
    input: {
      persona: 'Mike (CEO)',
      context: 'Tuesday morning, 9 AM. Mike gets action summary from Granola.',
      actionItems,
    },
    rubric,
    expectedOutput: {
      prioritized: [
        'aa-1 (financial modeling)',
        'aa-3 (infra sign-off)',
        'aa-2 (contract language, but blocked)',
        'pal-1 (Tagalog fix)',
        'pal-3 (CSAT iteration)',
        'pal-2 (KB cleanup)',
        'mike-2 (investor prep)',
        'mike-1 (code review)',
      ],
      blockers: [
        'aa-2 (waiting on legal)',
        'aa-3 (needs Ryan\'s status)',
        'pal-1 (high effort, needs prioritization)',
      ],
      decisions: [
        'Approve AA-1 financial modeling (high priority)',
        'Escalate AA-2 to legal team',
        'Check AA-3 status with Ryan',
        'Approve Zeshan\'s Tagalog fix (red-code pace)',
        'Defer KB cleanup to next week',
      ],
    },
  };
}

// ============================================================================
// SCENARIO 2: Distributed All-Hands (Impossible Case)
// ============================================================================

function scenario2_distributedAllHands() {
  // Monday morning

  const request = {
    title: 'Ada All-Hands Meeting',
    duration: 120, // 2 hours
    attendees: [
      ada.mike, // Toronto ET
      ada.ryan, // ET (25+ eng leads under him)
      ada.long, // ET
      ada.sal, // PT
      ada.zeshan, // IST (India)
      // Plus: ~100+ other engineers (mix of US + Europe)
    ],
    dateRange: '2026-07-17 to 2026-07-18', // Next week
    notes: 'Company all-hands, cannot be async (board updates, strategy share)',
  };

  // Real constraint: No 2-hour slot works for all timezones
  // - Mike: 9 AM - 5:30 PM ET (hard constraint)
  // - Engineers: US (9-5 ET/CT/PT) + Europe (9-5 UTC+1) + India (Zeshan TZ varies)
  // - 2-hour meeting = too long for any overlap zone

  const rubric = {
    'impossible_detection': { weight: 0.3, description: 'Recognizes scenario is mathematically impossible' },
    'graceful_degradation': { weight: 0.25, description: 'Proposes fallback (async + optional sync, regional meetings, etc)' },
    'alternative_suggestions': { weight: 0.25, description: 'Suggests 60-min optional sync + async update' },
    'user_guidance': { weight: 0.2, description: 'Explains trade-offs clearly' },
  };

  return {
    name: 'Scenario 2: All-Hands Coordination (Impossible)',
    description: 'Schedule 2-hour all-hands across timezones (Toronto + ET + PT + Europe + India). No slot works.',
    input: request,
    rubric,
    expectedOutput: {
      feasibility: 'IMPOSSIBLE - no 2-hour slot respects all working hours',
      recommendation: 'Async + optional sync',
      fallback: [
        'Option A: 60-min optional sync (ET morning, records for others)',
        'Option B: Split into regional meetings (US/EU + APAC)',
        'Option C: Fully async (Slack thread + Granola notes + async Q&A)',
      ],
      bestOption: {
        approach: 'Async-first with optional 60-min sync',
        timing: 'Thu 9 AM ET (optional for US/EU, async for Zeshan)',
        format: 'Board update video + Slack Q&A + async feedback',
      },
    },
  };
}

// ============================================================================
// SCENARIO 3: American Airlines Deal Readiness
// ============================================================================

function scenario3_aaReadiness() {
  const dealStatus = {
    title: 'American Airlines Contract Execution',
    target: '2026-07-25', // 3 weeks out
    criticalPaths: [
      {
        area: 'Finance',
        owner: 'Long',
        items: [
          { desc: 'Financial modeling (pricing, volume, margin)', status: 'pending', dueDate: '2026-07-10' },
          { desc: 'Board approval (deal value + terms)', status: 'pending', dueDate: '2026-07-15' },
          { desc: 'Contract signature authority', status: 'unknown', dueDate: '2026-07-20' },
        ],
      },
      {
        area: 'Legal',
        owner: 'External Legal',
        items: [
          { desc: 'Contract draft + review', status: 'pending', dueDate: '2026-07-12' },
          { desc: 'SLA language + liability limits', status: 'pending', dueDate: '2026-07-15' },
        ],
      },
      {
        area: 'Infrastructure',
        owner: 'Ryan + Kosta',
        items: [
          { desc: 'DR readiness (July deadline)', status: 'in_progress', dueDate: '2026-07-10' },
          { desc: 'Cell-based architecture deployment', status: 'in_progress', dueDate: '2026-07-15' },
          { desc: 'Capacity planning for AA customer', status: 'pending', dueDate: '2026-07-12' },
          { desc: 'SLA commitment verification', status: 'pending', dueDate: '2026-07-18' },
        ],
      },
      {
        area: 'Product/CS',
        owner: 'Roystonlee',
        items: [
          { desc: 'Custom playbook for AA use case', status: 'pending', dueDate: '2026-07-15' },
          { desc: 'Voice quality verification', status: 'pending', dueDate: '2026-07-18' },
          { desc: 'Implementation readiness', status: 'pending', dueDate: '2026-07-20' },
        ],
      },
    ],
  };

  const rubric = {
    'synthesis': { weight: 0.25, description: 'Synthesizes status across 4 teams into coherent narrative' },
    'critical_path': { weight: 0.25, description: 'Identifies true blockers (infra blocks product, legal blocks finance)' },
    'risk_detection': { weight: 0.2, description: 'Flags risks (DR deadline tight, custom playbook aggressive)' },
    'recommendation': { weight: 0.15, description: 'Clear next steps (what Mike needs to decide/escalate)' },
    'timeline_visibility': { weight: 0.15, description: 'Shows if 2026-07-25 target is achievable' },
  };

  return {
    name: 'Scenario 3: American Airlines Deal Readiness',
    description: 'Cross-functional deal status: synthesize Finance + Legal + Infrastructure + Product into readiness assessment',
    input: dealStatus,
    rubric,
    expectedOutput: {
      readiness: 'At Risk',
      riskFactors: [
        'Infra: Cell-based architecture (2026-07-15) blocks product deployment (2026-07-18)',
        'Finance: Board approval (2026-07-15) needs to happen before customer commitment',
        'Product: Custom playbook (2026-07-15) is high-effort, aggressive timeline',
      ],
      criticalPaths: [
        'Finance modeling (Long, due 2026-07-10) → Board approval → Signature',
        'Infrastructure (Ryan/Kosta, due 2026-07-15) → Product deployment → Voice quality',
        'Legal (External, due 2026-07-12) → Contract review → Signature',
      ],
      recommendations: [
        'Fast-track finance modeling (due 2026-07-09, not 2026-07-10)',
        'Infra: Confirm cell-based architecture is on track for 2026-07-15',
        'Product: Assess playbook complexity, may need help from playbook team',
        'Decision needed: Can we commit to 2026-07-25? Or push to 2026-08-15?',
      ],
    },
  };
}

// ============================================================================
// SCENARIO 4: PAL Voice POC Customer Coordination
// ============================================================================

function scenario4_palCustomer() {
  // Tuesday, PAL POC daily sync
  const customerFeedback = {
    customer: 'Mac (PAL customer)',
    context: 'Daily customer feedback loop, red-code pace (fix within 3 days)',
    feedback: [
      {
        issue: 'Tagalog transcription quality drops when customer code-switches (Tagalog + English)',
        severity: 'Critical',
        frequency: 'Every 2-3 calls',
        impact: 'Intent detection fails, misroutes calls',
        suggested_fix: 'Better code-switching model',
      },
      {
        issue: '5 hallucination cases in last 48 hours',
        severity: 'High',
        frequency: 'Occasional',
        impact: 'Customer frustration, affects CSAT',
        suggested_fix: 'KB cleanup + retraining',
      },
      {
        issue: 'CSAT survey not capturing reason for low scores',
        severity: 'Medium',
        frequency: 'Every survey',
        impact: 'Can\'t diagnose problems',
        suggested_fix: 'Add multi-question CSAT survey',
      },
      {
        issue: 'Call routing to human takes too long (>30 sec wait)',
        severity: 'Medium',
        frequency: 'In high-volume periods',
        impact: 'Customer frustration',
        suggested_fix: 'Optimize handoff flow',
      },
    ],
  };

  // Expected Piper workflow:
  // 1. Ingest customer feedback
  // 2. Rank by severity + frequency + impact
  // 3. Route to right specialists (Zeshan for transcription, Roystonlee for playbook, Michael for CSAT)
  // 4. Create action items with red-code timeline
  // 5. Schedule engineering implementation (same day or next day)
  // 6. Create test plan
  // 7. Schedule customer feedback loop (validate fix works)

  const rubric = {
    'feedback_ingestion': { weight: 0.15, description: 'Extracts structured data from customer feedback' },
    'severity_ranking': { weight: 0.2, description: 'Ranks issues by impact (code-switching critical, hallucinations high)' },
    'routing': { weight: 0.2, description: 'Routes to specialists (Zeshan, Roystonlee, Michael)' },
    'action_creation': { weight: 0.15, description: 'Creates actions with red-code timeline (fix by next day)' },
    'test_plan': { weight: 0.15, description: 'Defines how to validate fixes' },
    'followup_loop': { weight: 0.15, description: 'Schedules customer feedback validation' },
  };

  return {
    name: 'Scenario 4: PAL POC Customer Coordination',
    description: 'Ingest daily customer feedback (red-code pace), prioritize, route to engineering, create action loop',
    input: customerFeedback,
    rubric,
    expectedOutput: {
      prioritizedActions: [
        {
          rank: 1,
          issue: 'Tagalog code-switching',
          assignee: 'Zeshan',
          action: 'Test Soniox + model variants for code-switching',
          deadline: '2026-07-09 (next day)',
          validation: 'Test with 10 customer calls, measure accuracy',
        },
        {
          rank: 2,
          issue: 'Hallucinations (5 cases)',
          assignee: 'Roystonlee',
          action: 'KB cleanup + retraining on flagged cases',
          deadline: '2026-07-09',
          validation: 'Verify in test suite, deploy with monitoring',
        },
        {
          rank: 3,
          issue: 'CSAT survey inadequate',
          assignee: 'Michael Caira',
          action: 'Upgrade to multi-question CSAT (reason capture)',
          deadline: '2026-07-09',
          validation: 'Deploy survey v2, collect results by 2026-07-10',
        },
        {
          rank: 4,
          issue: 'Handoff delay (>30s)',
          assignee: 'Roystonlee',
          action: 'Optimize handoff flow in playbook',
          deadline: '2026-07-10',
          validation: 'Measure latency, customer feedback',
        },
      ],
      customerFollowup: {
        timing: '2026-07-10 9 AM (customer time)',
        format: 'Zeshan presents fixes, customer tests live',
        metrics: 'CSAT, transcription accuracy, call resolution rate',
      },
    },
  };
}

// ============================================================================
// SCENARIO 5: Infrastructure Priority Negotiation
// ============================================================================

function scenario5_infraPriorities() {
  const infraBacklog = {
    context: 'Ryan (VP Eng) needs to prioritize infrastructure work. Can\'t do everything.',
    projects: [
      {
        name: 'Multi-Region DR (Disaster Recovery)',
        owner: 'Kosta',
        deadline: '2026-07-10', // Critical path for AA deal
        effort: 'High (2-3 weeks)',
        blockedBy: 'MongoDB cross-region replication (Alex/Sahib negotiating with MongoDB)',
        impact: 'Enables AA deal, production resilience',
        riskIfDeferred: 'Critical - AA deal can\'t close without DR capacity',
      },
      {
        name: 'Cell-Based Architecture + App-level Isolation',
        owner: 'Kosta',
        deadline: '2026-07-15', // Critical path for AA deal
        effort: 'High (3-4 weeks)',
        blockedBy: 'None, but resource contention with DR',
        impact: 'AA deal requirement, production stability',
        riskIfDeferred: 'High - AA customer needs it',
      },
      {
        name: 'LLM Cost Reduction',
        owner: 'TBD (engineering initiative)',
        deadline: 'None specified',
        effort: 'High (4-6 weeks)',
        blockedBy: 'None',
        impact: 'Unit economics, company priority #2',
        riskIfDeferred: 'Medium - affects profitability',
      },
      {
        name: 'Agentic Engineering Initiative',
        owner: 'TBD',
        deadline: 'None specified',
        effort: 'High (6-8 weeks)',
        blockedBy: 'None',
        impact: 'Competitive differentiation, company priority #3',
        riskIfDeferred: 'Medium - slips competitive window',
      },
      {
        name: 'Kubernetes Upgrades',
        owner: 'Kosta',
        deadline: 'None specified',
        effort: 'Medium (2-3 weeks)',
        blockedBy: 'None',
        impact: 'Technical debt, security updates',
        riskIfDeferred: 'Low - rolling deadline',
      },
      {
        name: 'Azure Standardization',
        owner: 'Chris + Chris',
        deadline: 'None specified',
        effort: 'Medium (2-3 weeks)',
        blockedBy: 'None',
        impact: 'Cost reduction, standardization',
        riskIfDeferred: 'Low - rolling deadline',
      },
      {
        name: 'Secrets Management (Doppler chosen)',
        owner: 'TBD',
        deadline: 'None specified',
        effort: 'Low-Medium (1-2 weeks)',
        blockedBy: 'None',
        impact: 'Security hardening',
        riskIfDeferred: 'Low',
      },
      {
        name: 'RabbitMQ Quorum Migration',
        owner: 'TBD',
        deadline: 'None specified',
        effort: 'Medium (2-3 weeks)',
        blockedBy: 'Data Pipeline Refresh (paused to not block it)',
        impact: 'Infrastructure stability',
        riskIfDeferred: 'Low - paused intentionally',
      },
    ],
  };

  const rubric = {
    'impact_analysis': { weight: 0.25, description: 'Ranks by impact (AA deal > unit economics > debt)' },
    'deadline_respect': { weight: 0.25, description: 'Respects hard deadlines (DR 2026-07-10, cell-based 2026-07-15)' },
    'dependency_mapping': { weight: 0.2, description: 'Identifies dependencies (DR blocks cell-based)' },
    'trade_off_clarity': { weight: 0.2, description: 'Clear articulation of what gets deferred + why' },
    'recommendation': { weight: 0.1, description: 'Clear prioritization ranking with rationale' },
  };

  return {
    name: 'Scenario 5: Infrastructure Priority Negotiation',
    description: 'Ryan needs to prioritize 8 infrastructure projects. AA deal needs DR (2026-07-10) + cell-based (2026-07-15).',
    input: infraBacklog,
    rubric,
    expectedOutput: {
      priorityRanking: [
        {
          rank: 1,
          project: 'Multi-Region DR',
          rationale: 'Hard deadline (2026-07-10), critical for AA deal',
          resources: 'Kosta + 2-3 team members, full-time',
        },
        {
          rank: 2,
          project: 'Cell-Based Architecture',
          rationale: 'Hard deadline (2026-07-15), critical for AA deal, follows DR',
          resources: 'Kosta + 3-4 team members, full-time',
        },
        {
          rank: 3,
          project: 'LLM Cost Reduction',
          rationale: 'Company priority #2, no hard deadline, defer 2 weeks',
          resources: 'TBD team, start 2026-07-17',
        },
        {
          rank: 4,
          project: 'Agentic Engineering',
          rationale: 'Company priority #3, longest effort, start after cost reduction',
          resources: 'TBD team, start 2026-07-31',
        },
      ],
      deferred: [
        'Kubernetes Upgrades (low risk, can do in August)',
        'Azure Standardization (low risk, can do in August)',
        'RabbitMQ (intentionally paused)',
      ],
      capacityNote: 'Need to hire or reassign 5-6 engineers to meet all AA timeline + cost reduction',
      decisionNeeded: 'Do we hire now or slip cost reduction? Or ask AA for 1-week extension?',
    },
  };
}

// ============================================================================
// SCENARIO 6: Group Scheduling with Real Constraints
// ============================================================================

function scenario6_groupScheduling() {
  // Monday afternoon
  const request = {
    title: 'Quarterly Planning Meeting',
    duration: 120, // 2 hours
    attendees: [ada.mike, ada.ryan, ada.long, ada.sal],
    window: '2026-07-07 to 2026-07-11', // Tue-Fri
    notes: 'Critical discussion: AA deal + LLM cost reduction + Agentic Engineering prioritization',
    constraints: [
      'Mike: Hard stop 5:30 PM (family time)',
      'Ryan: Tech Leads standup Mon-Fri 10-11 AM ET (optional but important)',
      'Long: Board prep Thu 2-4 PM (investor relations)',
      'Sal: Customer calls (flexible but prefer morning PT)',
    ],
    existingMeetings: {
      mike: [
        // Tuesday
        { day: 'tue', start: 9, end: 10 }, // Daily standup
        { day: 'tue', start: 10.5, end: 11.5 }, // Product review
        { day: 'tue', start: 2, end: 3 }, // 1:1 with Ryan
        // Wednesday
        { day: 'wed', start: 9, end: 10 }, // Standup
        { day: 'wed', start: 11, end: 12 }, // Investor call prep
        { day: 'wed', start: 3, end: 4 }, // PAL POC sync
        // Thursday
        { day: 'thu', start: 9, end: 10 }, // Standup
        { day: 'thu', start: 2, end: 3 }, // Investor call (with Long)
        // Friday
        { day: 'fri', start: 9, end: 10 }, // Standup
        { day: 'fri', start: 10, end: 11 }, // 1:1 with Sal
      ],
      ryan: [
        // Daily standups 10-11 AM ET (Mon-Fri)
        { day: 'tue', start: 10, end: 11 },
        { day: 'wed', start: 10, end: 11 },
        { day: 'thu', start: 10, end: 11 },
        { day: 'fri', start: 10, end: 11 },
        // Infrastructure office hours
        { day: 'wed', start: 11, end: 12 },
      ],
      long: [
        // Board prep
        { day: 'thu', start: 2, end: 4 }, // Board prep meeting
        // Investor call
        { day: 'thu', start: 2, end: 3 }, // Investor call with Mike
      ],
      sal: [
        // Customer calls (variable)
        { day: 'tue', start: 9, end: 11 }, // Customer call 1
        { day: 'tue', start: 1, end: 2 }, // Customer call 2
        { day: 'fri', start: 10, end: 11 }, // 1:1 with Mike
      ],
    },
  };

  const rubric = {
    'constraint_awareness': { weight: 0.25, description: 'Respects Mike 5:30 PM, Ryan standup, etc' },
    'timezone_handling': { weight: 0.25, description: 'Accounts for ET/PT 3-hour offset' },
    'alternative_options': { weight: 0.2, description: 'Proposes 2-3 options with trade-offs' },
    'conflict_resolution': { weight: 0.15, description: 'Suggests who should move/defer, not just fails' },
    'explanation_quality': { weight: 0.15, description: 'Clear trade-offs shown to user' },
  };

  return {
    name: 'Scenario 6: Group Scheduling with Real Constraints',
    description: '2-hour meeting, 4 people, multiple hard constraints, mixed timezones. Find best slot.',
    input: request,
    rubric,
    expectedOutput: {
      recommendations: [
        {
          option: 'A',
          timing: 'Tuesday 3-5 PM ET / 12-2 PM PT',
          feasibility: 'Tight for Mike (ends 5:30 PM ET)',
          tradeoffs: 'Sal has to move customer call, Mike hard stop',
          score: '70%',
        },
        {
          option: 'B',
          timing: 'Friday 3-5 PM ET / 12-2 PM PT',
          feasibility: 'Best option',
          tradeoffs: 'Sal moves 1:1 with Mike to Thursday',
          score: '85%',
        },
        {
          option: 'C',
          timing: 'Split: Fri 3-4 PM (planning), Mon 10-11 AM (decisions)',
          feasibility: 'Async-first approach',
          tradeoffs: 'Less ideal, but avoids 2-hour block',
          score: '60%',
        },
      ],
      recommendation: 'Option B (Friday 3-5 PM ET)',
      whyNotDefault: 'Not during standup, respects Mike 5:30 PM, gives all attendees working hours',
    },
  };
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runScenarios() {
  console.log('Ada-Grounded Piper Scenarios');
  console.log('============================\n');

  const scenarios = [
    scenario1_dailyDecisionBatch(),
    scenario2_distributedAllHands(),
    scenario3_aaReadiness(),
    scenario4_palCustomer(),
    scenario5_infraPriorities(),
    scenario6_groupScheduling(),
  ];

  const results = {
    timestamp: new Date().toISOString(),
    scenarios: [],
  };

  for (const scenario of scenarios) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`${scenario.name}`);
    console.log(`${'='.repeat(80)}`);
    console.log(`\nDescription: ${scenario.description}\n`);

    console.log('Input:');
    console.log(JSON.stringify(scenario.input, null, 2).slice(0, 300) + '...\n');

    console.log('Rubric:');
    Object.entries(scenario.rubric).forEach(([key, val]) => {
      console.log(`  - ${key} (${Math.round(val.weight * 100)}%): ${val.description}`);
    });

    console.log('\nExpected Output:');
    console.log(JSON.stringify(scenario.expectedOutput, null, 2).slice(0, 400) + '...\n');

    results.scenarios.push({
      name: scenario.name,
      status: 'defined',
    });
  }

  // Save results
  fs.writeFileSync(
    '/tmp/simulated-world/ada-scenarios-defined.json',
    JSON.stringify(results, null, 2)
  );

  console.log(`\n${'='.repeat(80)}`);
  console.log('Summary');
  console.log(`${'='.repeat(80)}`);
  console.log(`\nDefined ${scenarios.length} Ada-grounded scenarios:`);
  scenarios.forEach((s, i) => console.log(`  ${i + 1}. ${s.name}`));
  console.log('\nNext: Implement Piper behavior + scoring for each scenario');
}

// Run
runScenarios().catch(console.error);
