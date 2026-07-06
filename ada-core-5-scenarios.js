#!/usr/bin/env node

/**
 * Ada Core 5 Personas Test Scenarios
 *
 * Focus: Mike, Goz, Jason, Judy, Long
 * Purpose: Measure Piper's value for Ada's core workflows
 *
 * Scenarios:
 * 1. Mike's Daily Decision Batch (CEO action approval)
 * 2. Judy's Calendar Coordination Crisis (EA scheduling complexity)
 * 3. Jason's Customer Call Loop (AE sales workflow)
 * 4. Goz's Product Planning Synthesis (CPTO strategy)
 * 5. Long's Board Prep (CFO reporting)
 * 6. Impossible Case: Cross-Team Coordination (constraint handling)
 */

const fs = require('fs');

// ============================================================================
// Core 5 Personas (Real Ada People)
// ============================================================================

const personas = {
  mike: {
    name: 'Mike',
    role: 'CEO & Co-founder',
    timezone: 'America/Toronto',
    workingHours: { start: 9, end: 17.5 }, // 9 AM - 5:30 PM (hard constraint)
    tools: ['calendar', 'slack', 'gmail', 'linear', 'github', 'granola'],
    constraints: ['hard stop 5:30 PM', 'back-to-back meetings common'],
  },

  goz: {
    name: 'Goz',
    role: 'CPTO (Chief Product & Technology Officer)',
    timezone: 'America/New_York', // Assume ET
    workingHours: { start: 9, end: 17 },
    tools: ['calendar', 'slack', 'linear', 'github', 'docs', 'figma'],
    constraints: ['balances product vision with engineering', 'prioritization decisions'],
  },

  jason: {
    name: 'Jason',
    role: 'Account Executive (Sales)',
    timezone: 'America/Los_Angeles', // PT for customer coverage
    workingHours: { start: 9, end: 17 },
    tools: ['calendar', 'slack', 'gmail', 'salesforce', 'granola'],
    constraints: ['high call volume', 'CRM SLA tracking', 'context-heavy'],
  },

  judy: {
    name: 'Judy',
    role: 'Executive Assistant',
    timezone: 'America/Toronto', // With Mike
    workingHours: { start: 8.5, end: 17.5 }, // Supports Mike
    tools: ['calendar', 'slack', 'gmail', 'sheets', 'docs', 'asana'],
    constraints: ['gate to Mike', 'info hub', 'respects Mike 5:30 PM'],
  },

  long: {
    name: 'Long',
    role: 'CFO',
    timezone: 'America/New_York',
    workingHours: { start: 9, end: 17 },
    tools: ['calendar', 'slack', 'gmail', 'sheets', 'salesforce'],
    constraints: ['board deadlines hard', 'cross-team data needed', 'investor critical'],
  },
};

// ============================================================================
// SCENARIO 1: Mike's Daily Decision Batch
// ============================================================================

function scenario1_mikeDecisionBatch() {
  return {
    name: 'Scenario 1: Mike Daily Decision Batch',
    persona: 'Mike (CEO)',
    description: 'Mike reviews morning action items (product + sales + operations), ranks by impact, routes for execution',
    input: {
      context: 'Tuesday morning, 9 AM. Judy (assistant) prepared summary. 8 action items waiting for decision.',
      actionItems: [
        {
          id: 'aa-1',
          source: 'American Airlines Deal',
          assignee: 'Long',
          title: 'Financial modeling for AA contract',
          priority: 'Critical',
          deadline: '2026-07-10',
          status: 'pending_approval',
          impact: 'Deal closes or stalls',
        },
        {
          id: 'product-1',
          source: 'Goz Weekly Planning',
          assignee: 'Goz',
          title: 'Feature prioritization: LLM cost reduction vs new AI features',
          priority: 'High',
          deadline: '2026-07-09',
          status: 'pending_decision',
          impact: 'Product roadmap direction',
        },
        {
          id: 'sales-1',
          source: 'Jason Customer Call',
          assignee: 'Jason',
          title: 'Follow-up with Prospect X (custom feature needed)',
          priority: 'Medium',
          deadline: '2026-07-08',
          status: 'ready_to_execute',
          impact: 'Deals at risk if not followed up',
        },
        {
          id: 'infra-1',
          source: 'Ryan (Engineering)',
          assignee: 'Mike',
          title: 'Approve cell-based architecture timeline (blocks AA)',
          priority: 'Critical',
          deadline: '2026-07-08',
          status: 'blocked_on_mike',
          impact: 'AA deployment timeline',
        },
        {
          id: 'hr-1',
          source: 'Hiring',
          assignee: 'Mike',
          title: 'Approve engineering offer (3 candidates, need Mike sign-off)',
          priority: 'Medium',
          deadline: '2026-07-15',
          status: 'pending_approval',
          impact: 'Team capacity',
        },
        {
          id: 'investor-1',
          source: 'Board Prep',
          assignee: 'Mike',
          title: 'Prepare investor update (quarterly deck)',
          priority: 'High',
          deadline: '2026-07-14',
          status: 'pending_start',
          impact: 'Investor relations',
        },
        {
          id: 'personal-1',
          source: 'Mike',
          assignee: 'Mike',
          title: 'Code review + approve Jetpack PR #730 (group scheduling)',
          priority: 'Low',
          deadline: '2026-07-08',
          status: 'ready_to_execute',
          impact: 'Product quality',
        },
        {
          id: 'strategy-1',
          source: 'Agentic Engineering Initiative',
          assignee: 'Goz + Mike',
          title: 'Decide: dedicated team or distributed across product + eng?',
          priority: 'High',
          deadline: 'EOW',
          status: 'pending_decision',
          impact: 'Company strategy',
        },
      ],
    },

    rubric: {
      'impact_ranking': {
        weight: 0.25,
        description: 'Ranks by business impact (deal > product direction > operations > personal)',
      },
      'urgency_awareness': {
        weight: 0.2,
        description: 'Identifies which items need decision today vs can defer',
      },
      'blocker_escalation': {
        weight: 0.2,
        description: 'Flags items blocking others (infra blocks AA, AA blocks finance)',
      },
      'decision_support': {
        weight: 0.2,
        description: 'Provides context + options for Mike to decide quickly',
      },
      'routing': {
        weight: 0.15,
        description: 'Routes to right person (don\'t make Mike do work someone else owns)',
      },
    },

    expectedOutput: {
      prioritizedActions: [
        'aa-1 (financial modeling) - APPROVE, start immediately',
        'infra-1 (cell-based approval) - APPROVE, needed for AA timeline',
        'strategy-1 (agentic team structure) - DECIDE, affects hiring + priorities',
        'product-1 (feature prioritization) - DEFER to Goz decision + feedback',
        'investor-1 (board prep) - SCHEDULE prep time, delegate draft to Long',
        'hr-1 (hiring approvals) - BATCH review, decide all 3 at once',
        'sales-1 (customer follow-up) - Jason owns, no Mike decision needed',
        'personal-1 (code review) - DEFER, lowest priority',
      ],
      decisions: {
        approve: ['aa-1', 'infra-1'],
        defer: ['product-1 to Goz', 'hr-1 to Friday batch', 'personal-1 to evening'],
        delegate: ['investor-1 draft to Long', 'sales-1 to Jason'],
        decide: ['strategy-1 - agentic team structure'],
      },
      blockers: [
        'AA deal blocked on financial modeling (Long needs approval)',
        'AA deployment blocked on infra approval (cell-based timeline)',
        'Agentic strategy affects hiring plan',
      ],
      nextSteps: [
        'Approve AA financial modeling, notify Long',
        'Approve cell-based timeline, notify Ryan',
        'Sync with Goz on agentic team structure today',
        'Batch HR approvals Friday',
      ],
    },
  };
}

// ============================================================================
// SCENARIO 2: Judy's Calendar Coordination Crisis
// ============================================================================

function scenario2_judyScheduling() {
  return {
    name: 'Scenario 2: Judy Calendar Coordination',
    persona: 'Judy (Executive Assistant)',
    description: 'Judy has 10 meeting requests for Mike. Multiple conflicts, timezones, hard constraints. Find solution.',
    input: {
      context: 'Tuesday 10 AM. Judy receives 10 meeting requests for this week. Must respect Mike\'s 5:30 PM hard stop.',
      requests: [
        {
          id: 'req-1',
          requester: 'Goz',
          title: 'Product Strategy Weekly (1h)',
          attendees: ['Mike', 'Goz'],
          preferredTime: 'Tue-Thu morning',
          flexibility: 'Medium',
        },
        {
          id: 'req-2',
          requester: 'Long',
          title: 'AA Deal Review (1.5h)',
          attendees: ['Mike', 'Long'],
          preferredTime: 'Thu afternoon',
          flexibility: 'Low (investor call Fri)',
        },
        {
          id: 'req-3',
          requester: 'Jason',
          title: 'Sales Pipeline Review (1h)',
          attendees: ['Mike', 'Jason'],
          preferredTime: 'Wed morning PT',
          flexibility: 'Medium',
        },
        {
          id: 'req-4',
          requester: 'Ryan',
          title: 'Infrastructure Status (30m)',
          attendees: ['Mike', 'Ryan (VP Eng)'],
          preferredTime: 'Mon-Fri morning',
          flexibility: 'High',
        },
        {
          id: 'req-5',
          requester: 'Board',
          title: 'Investor Call (45m)',
          attendees: ['Mike', 'Long', 'Investor'],
          preferredTime: 'Thu 2-3 PM ET',
          flexibility: 'Low (investor constraint)',
        },
        {
          id: 'req-6',
          requester: 'Goz',
          title: 'Agentic Engineering Decision (1h)',
          attendees: ['Mike', 'Goz'],
          preferredTime: 'This week',
          flexibility: 'Low (impacts hiring)',
        },
        {
          id: 'req-7',
          requester: 'Quarterly Planning',
          title: 'Q3 Planning Kickoff (2h)',
          attendees: ['Mike', 'Goz', 'Long'],
          preferredTime: 'Fri afternoon',
          flexibility: 'Medium',
        },
        {
          id: 'req-8',
          requester: 'HR',
          title: 'Hiring Pipeline Review (1h)',
          attendees: ['Mike', 'HR Lead'],
          preferredTime: 'Fri morning',
          flexibility: 'High',
        },
        {
          id: 'req-9',
          requester: 'Customer',
          title: 'VIP Customer Call (30m)',
          attendees: ['Mike', 'Jason', 'Customer'],
          preferredTime: 'Wed-Thu, customer TZ constraint',
          flexibility: 'Low',
        },
        {
          id: 'req-10',
          requester: 'Engineering',
          title: 'Tech Leads Standup (1h, optional for Mike)',
          attendees: ['Engineering team'],
          preferredTime: 'Mon-Fri 10 AM ET',
          flexibility: 'High (Mike optional)',
        },
      ],

      existingMeetings: {
        tue: [
          { time: '9-10', title: 'Daily standup' },
          { time: '1-2', title: 'PAL POC sync' },
        ],
        wed: [
          { time: '9-10', title: 'Standup' },
          { time: '2-3', title: '1:1 with Goz' },
        ],
        thu: [
          { time: '9-10', title: 'Standup' },
          { time: '2-3', title: 'Investor call (fixed)' },
        ],
        fri: [
          { time: '9-10', title: 'Standup' },
          { time: '10-11', title: '1:1 with Jason' },
        ],
      },

      constraints: [
        'Mike: Hard stop 5:30 PM ET every day',
        'Jason: PT timezone (3h behind Mike)',
        'Investor call: Thu 2-3 PM ET (fixed)',
        'Some meetings need quorum (can\'t split)',
        'Some meetings can be split (2-4 hour windows acceptable)',
      ],
    },

    rubric: {
      'constraint_awareness': { weight: 0.25, description: 'Respects all constraints (5:30 PM, timezones, fixed items)' },
      'optimization': { weight: 0.2, description: 'Packs meetings efficiently without overload' },
      'prioritization': { weight: 0.2, description: 'Identifies critical meetings (investor, AA deal, agentic decision)' },
      'alternatives': { weight: 0.15, description: 'Offers creative solutions (async, split sessions, etc)' },
      'communication': { weight: 0.2, description: 'Clear explanation of trade-offs + recommendations' },
    },

    expectedOutput: {
      schedule: [
        {
          day: 'Tue',
          meetings: [
            { time: '10-11', title: 'Agentic Engineering Decision (req-6)', attendees: ['Mike', 'Goz'] },
            { time: '2-2:30', title: 'Infrastructure Status (req-4)', attendees: ['Mike', 'Ryan'] },
          ],
        },
        {
          day: 'Wed',
          meetings: [
            { time: '9:30-10:30', title: 'Sales Pipeline Review (req-3)', attendees: ['Mike', 'Jason (PT)'] },
            { time: '3-4', title: 'VIP Customer Call (req-9)', attendees: ['Mike', 'Jason', 'Customer'] },
          ],
        },
        {
          day: 'Thu',
          meetings: [
            { time: '11-12:30', title: 'AA Deal Review (req-2)', attendees: ['Mike', 'Long'] },
            { time: '2-3', title: 'Investor Call (req-5)', attendees: ['Mike', 'Long', 'Investor'] },
          ],
        },
        {
          day: 'Fri',
          meetings: [
            { time: '11-12', title: 'Hiring Pipeline Review (req-8)', attendees: ['Mike', 'HR'] },
            { time: '1-3', title: 'Q3 Planning Kickoff (req-7)', attendees: ['Mike', 'Goz', 'Long'] },
          ],
        },
      ],

      conflicts: {
        'req-1 (Product Strategy)': 'DEFER - already covered in other 1:1 and planning session',
        'req-10 (Tech Leads)': 'OPTIONAL - Mike doesn\'t attend (optional for CEO)',
      },

      rationale: {
        'Agentic decision early': 'High impact, affects hiring (req-6 Tue)',
        'Investor call preserved': 'Hard constraint (req-5 Thu 2-3 PM)',
        'AA deal before investor': 'Financial modeling needed for investor update (req-2 Thu 11-12)',
        'All 5:30 PM constraints met': 'Latest meeting ends 3 PM Fri',
        'Jason timezone handled': 'Sales calls moved to early Wed (his morning)',
      },

      impossible: null, // This one IS solvable
      nextActions: [
        'Judy sends calendar holds for all scheduled meetings',
        'Judy sends briefing materials 2h before each meeting',
        'Judy tracks decisions + action items from each meeting',
      ],
    },
  };
}

// ============================================================================
// SCENARIO 3: Jason's Customer Call Loop
// ============================================================================

function scenario3_jasonCustomerLoop() {
  return {
    name: 'Scenario 3: Jason Customer Call Workflow',
    persona: 'Jason (Account Executive)',
    description: 'Jason has customer call, needs: action extraction → CRM update → proposal draft → follow-up scheduling',
    input: {
      context: 'Wednesday 10 AM PT. Jason just finished call with Prospect X (large enterprise customer).',
      callNotes: `
Call with Prospect X - 45 min

Attendees: Jason (Ada), Prospect's CTO, Prospect's Ops Lead

What they want:
- Voice IVR for customer support (like PAL POC)
- Custom routing logic for premium vs standard customers
- Integration with their existing Salesforce
- CSAT capture (like we did for PAL)

Key constraints:
- Deployment in 60 days (aggressive)
- They want POC first (2 weeks)
- Budget approved up to $50K for POC

Next steps:
- They want custom pricing proposal
- Need to show ROI calculation (CTO skeptical)
- Ops lead wants implementation timeline
- CTO wants technical spec

Their team:
- CTO: David (technical decision maker)
- Ops Lead: Sarah (implementation owner)
- Procurement: Not met yet

Competitive situation:
- They mentioned Decagon as backup option
- Concerned about our uptime SLA (want 99.9%)

Timeline:
- Decision deadline: 30 days
- POC start target: 60 days from today
`,
      salesforceData: {
        account: {
          name: 'Prospect X',
          industry: 'Finance',
          employees: 500,
          annualRevenue: '$100M',
          stage: 'Technical Discovery',
        },
        openOpportunities: [
          { id: 'opp-1', name: 'VoiceIVR Implementation', amount: '$50K', stage: 'Proposal' },
        ],
      },
    },

    rubric: {
      'note_extraction': { weight: 0.2, description: 'Extracts key info (requirements, constraints, competitors, people)' },
      'crm_update': { weight: 0.2, description: 'Updates Salesforce with accurate stage + next steps' },
      'action_creation': { weight: 0.2, description: 'Creates specific, sequenced actions for Jason + product team' },
      'proposal_drafting': { weight: 0.2, description: 'Drafts custom proposal based on customer requirements' },
      'cross_team_routing': { weight: 0.2, description: 'Routes feature requests to product, technical questions to eng' },
    },

    expectedOutput: {
      extractedInfo: {
        requirements: [
          'Voice IVR for customer support',
          'Custom routing (premium vs standard)',
          'Salesforce integration',
          'CSAT capture',
        ],
        constraints: [
          'Deployment in 60 days',
          'POC in 2 weeks',
          '99.9% uptime SLA requirement',
          '$50K POC budget approved',
        ],
        competitors: ['Decagon'],
        decisionMaker: 'CTO (David)',
        timeline: '30-day decision deadline',
      },

      salesforceUpdates: {
        accountUpdate: {
          stage: 'Active Evaluation',
          lastActivity: '2026-07-08 customer call',
          notes: 'Interested in VoiceIVR POC, wants custom routing + Salesforce integration',
        },
        opportunityUpdate: {
          id: 'opp-1',
          stage: 'Proposal',
          amount: '$50K (POC) → potential $200K-500K full deployment',
          decisionDate: '2026-08-07',
          notes: 'Wants ROI calculation, competitive threat from Decagon, technical spec needed',
        },
      },

      actionsForJason: [
        {
          priority: 'Critical',
          action: 'Draft custom proposal (price, timeline, ROI)',
          owner: 'Jason',
          deadline: '2026-07-09',
          context: 'CTO David skeptical, needs ROI to justify',
        },
        {
          priority: 'High',
          action: 'Follow-up call with technical discussion (David + Jason)',
          owner: 'Jason',
          deadline: '2026-07-10',
          context: 'David wants technical spec, answer uptime concerns',
        },
        {
          priority: 'High',
          action: 'Implementation timeline discussion (Sarah + Jason)',
          owner: 'Jason',
          deadline: '2026-07-10',
          context: 'Ops lead Sarah owns implementation timeline',
        },
        {
          priority: 'Medium',
          action: 'Meet with procurement (intro needed)',
          owner: 'Jason',
          deadline: '2026-07-15',
          context: 'Haven\'t met procurement yet, need budget confirmation',
        },
      ],

      actionsForProductTeam: [
        {
          priority: 'High',
          action: 'Create technical spec (custom routing)',
          assignee: 'Goz + Eng team',
          deadline: '2026-07-10',
          context: 'CTO needs technical spec for evaluation',
          impact: 'Deal blocker - David won\'t move forward without this',
        },
        {
          priority: 'High',
          action: 'Salesforce integration assessment',
          assignee: 'Goz',
          deadline: '2026-07-10',
          context: 'Customer requires Salesforce integration, need feasibility + timeline',
        },
        {
          priority: 'Medium',
          action: 'Review 99.9% uptime SLA (can we commit?)',
          assignee: 'Ryan (Eng)',
          deadline: '2026-07-09',
          context: 'CTO concerned about SLA, need technical assessment',
        },
      ],

      proposalDraft: {
        sections: [
          'Executive Summary (VoiceIVR solution, custom routing, Salesforce integration)',
          'Requirements Coverage (how we meet their 4 requirements)',
          'Timeline (2-week POC, 60-day deployment)',
          'ROI Calculation (savings from automation, reduced support costs)',
          'Pricing ($50K POC, $250K-500K full deployment estimate)',
          'Technical Spec (custom routing, CSAT, Salesforce sync)',
          'SLA & Support (99.9% uptime commitment)',
          'Next Steps (30-day decision deadline)',
        ],
      },

      followUpSchedule: [
        { date: '2026-07-09', action: 'Send proposal draft to David (CTO)' },
        { date: '2026-07-10 9 AM PT', action: 'Technical deep-dive call (Jason + David + Goz?)' },
        { date: '2026-07-10 11 AM PT', action: 'Implementation timeline call (Jason + Sarah)' },
        { date: '2026-07-15', action: 'Procurement intro call' },
        { date: '2026-08-07', action: 'Decision deadline' },
      ],
    },
  };
}

// ============================================================================
// SCENARIO 4: Goz's Product Planning Synthesis
// ============================================================================

function scenario4_gozPlanning() {
  return {
    name: 'Scenario 4: Goz Product Planning',
    persona: 'Goz (CPTO)',
    description: 'Goz synthesizes customer feedback + engineering capacity + strategic priorities into roadmap',
    input: {
      context: 'Friday morning. Goz needs to make Q3 prioritization decision (feature vs debt vs cost reduction).',
      customerFeedback: [
        {
          source: 'Jason (sales)',
          feedback: 'Prospect X wants custom routing (VoiceIVR)',
          priority: 'High',
          frequency: '3 customers asking in last month',
          effort: 'Medium',
          impact: '$500K+ deal value',
        },
        {
          source: 'PAL POC',
          feedback: 'Tagalog code-switching transcription issues',
          priority: 'Critical (customer-facing)',
          frequency: 'Every 3-5 calls',
          effort: 'Medium',
          impact: 'Customer satisfaction (CSAT)',
        },
        {
          source: 'Sales team',
          feedback: 'Customers want better Salesforce integration',
          priority: 'High',
          frequency: '5+ customers',
          effort: 'High',
          impact: 'Deal-blocker for enterprise',
        },
        {
          source: 'Engineering',
          feedback: 'LLM cost reduction would improve margins significantly',
          priority: 'Strategic (company priority #2)',
          frequency: 'Ongoing',
          effort: 'High',
          impact: 'Profitability',
        },
        {
          source: 'Support',
          feedback: 'KB hallucinations (5 cases)',
          priority: 'Medium',
          frequency: 'Occasional',
          effort: 'Low',
          impact: 'Customer satisfaction',
        },
      ],

      engineeringCapacity: {
        availableCapacity: '3 engineers (50% of team on AA deal, cell-based)',
        velocity: '25 story points/sprint',
        sprintLength: 2,
      },

      strategicPriorities: [
        'American Airlines deal (infrastructure work)',
        'LLM cost reduction (company priority)',
        'Agentic Engineering (company priority)',
      ],
    },

    rubric: {
      'feedback_synthesis': { weight: 0.2, description: 'Aggregates customer feedback into themes' },
      'impact_assessment': { weight: 0.2, description: 'Ranks by customer impact + deal value + strategic value' },
      'tradeoff_analysis': { weight: 0.25, description: 'Clear feature vs debt vs cost reduction trade-offs' },
      'roadmap_clarity': { weight: 0.2, description: 'Produces clear roadmap (what, when, why)' },
      'engineering_realism': { weight: 0.15, description: 'Respects capacity constraints, doesn\'t overcommit' },
    },

    expectedOutput: {
      themes: [
        'Enterprise integration (Salesforce + custom routing)',
        'Stability & quality (Tagalog fix, KB cleanup, speech improvements)',
        'Cost efficiency (LLM cost reduction)',
        'Strategic capabilities (Agentic Engineering)',
      ],

      prioritization: [
        {
          rank: 1,
          item: 'Tagalog code-switching fix (quality)',
          rationale: 'Customer-facing, blocks PAL POC success',
          effort: '1 sprint',
          impact: 'High (CSAT)',
          ownedBy: 'Zeshan + speech team',
        },
        {
          rank: 2,
          item: 'Salesforce integration (enterprise feature)',
          rationale: 'Deal-blocker for Prospect X + 4 others',
          effort: '2 sprints',
          impact: 'High ($500K+)',
          ownedBy: 'Platform team',
        },
        {
          rank: 3,
          item: 'Custom routing for VoiceIVR (feature)',
          rationale: 'Highest deal value, aligns with Prospect X POC timeline',
          effort: '1.5 sprints',
          impact: 'High (deal)',
          ownedBy: 'Product + eng',
        },
        {
          rank: 4,
          item: 'LLM cost reduction (engineering)',
          rationale: 'Company priority #2, affects profitability',
          effort: '2-3 sprints (ongoing)',
          impact: 'Medium (margins)',
          ownedBy: 'Cost reduction team',
        },
        {
          rank: 5,
          item: 'KB cleanup (quick wins)',
          rationale: 'Low effort, improves customer experience',
          effort: '0.5 sprint',
          impact: 'Low (quality)',
          ownedBy: 'Roystonlee',
        },
      ],

      roadmap: [
        {
          sprint: 'Q3 Sprint 1 (2 weeks)',
          items: [
            'Tagalog transcription fix (Zeshan)',
            'KB cleanup (Roystonlee)',
            'Custom routing spec (product)',
          ],
          capacity: '10/25 points',
        },
        {
          sprint: 'Q3 Sprint 2 (2 weeks)',
          items: [
            'Salesforce integration phase 1 (platform)',
            'Custom routing implementation (eng)',
            'LLM cost investigation (cost team)',
          ],
          capacity: '20/25 points',
        },
      ],

      tradeoffs: [
        'Custom routing for Prospect X: HIGH priority (deal blocker)',
        'Agentic Engineering: Deferred to Q4 (AA + cost reduction take priority)',
        'Salesforce integration: Phased approach (critical for enterprise, but complex)',
        'LLM cost reduction: Parallel path (separate team, not blocking customer features)',
      ],

      recommendations: [
        'Approve Tagalog fix immediately (critical path item for PAL POC)',
        'Allocate 2 engineers to Salesforce integration (deal-blocking feature)',
        'Green-light custom routing POC with Prospect X (60-day deployment timeline)',
        'Reserve LLM cost reduction team (doesn\'t compete with customer features)',
        'Defer Agentic work to Q4 (focus Q3 on customer delivery + profitability)',
      ],
    },
  };
}

// ============================================================================
// SCENARIO 5: Long's Board Prep
// ============================================================================

function scenario5_longBoardPrep() {
  return {
    name: 'Scenario 5: Long Board Preparation',
    persona: 'Long (CFO)',
    description: 'Long synthesizes metrics from multiple sources into quarterly board deck + narrative',
    input: {
      context: 'Wednesday. Board meeting in 2 weeks. Long needs data from: Sales (Jason), Product (Goz), Ops, Finance.',
      sourceData: {
        sales: {
          revenue: '$2.3M ARR',
          churn: '5% MRR',
          newArr: '$200K this quarter',
          pipeline: '$5.2M',
          largeDeals: ['American Airlines (TBD)', 'Prospect X (in progress)'],
        },
        product: {
          userEngagement: 'DAU up 15% QoQ',
          features: 'Custom routing in progress, Salesforce integration planned',
          technicalDebt: 'High (Agentic work deferred)',
        },
        operations: {
          uptime: '99.95%',
          incidents: '2 major (resolved)',
          teamSize: '150+ employees',
          hiring: '5 open reqs',
        },
        finance: {
          monthlyBurn: '$480K',
          runway: '24 months',
          lastFunding: 'Series A (details)',
        },
      },
    },

    rubric: {
      'data_synthesis': { weight: 0.25, description: 'Aggregates data from 4+ sources into coherent narrative' },
      'narrative_creation': { weight: 0.25, description: 'Creates story (momentum, progress, risks)' },
      'risk_assessment': { weight: 0.2, description: 'Identifies key risks (churn, hiring, AA dependency)' },
      'clarity': { weight: 0.15, description: 'Board-ready presentation (clear, actionable)' },
      'strategic_framing': { weight: 0.15, description: 'Connects metrics to strategy (growth + efficiency)' },
    },

    expectedOutput: {
      boardDeck: [
        {
          slide: 'Title',
          content: 'Q2 2026 Board Update - Ada',
        },
        {
          slide: 'Key Metrics',
          metrics: [
            { metric: 'ARR', current: '$2.3M', growth: '+10% QoQ', trend: 'up' },
            { metric: 'Monthly Churn', current: '5%', growth: 'stable', trend: 'neutral' },
            { metric: 'Pipeline', current: '$5.2M', growth: '+20%', trend: 'up' },
            { metric: 'Runway', current: '24 months', growth: 'stable', trend: 'neutral' },
          ],
        },
        {
          slide: 'Highlights',
          items: [
            'Revenue growth: +10% QoQ, tracking to $3M ARR by year-end',
            'Pipeline momentum: $5.2M (2.2x ARR), including American Airlines opportunity',
            'Product: Custom routing (high-value feature), Salesforce integration (enterprise blocker)',
            'Operations: 99.95% uptime, 2 resolved incidents',
            'Team: Growing to 150+ employees, 5 open engineering reqs',
          ],
        },
        {
          slide: 'Risk Factors',
          items: [
            'Revenue concentration: 2 large deals (AA) would represent 20%+ of growth',
            'Churn: Stable at 5% but needs improvement to hit profitability targets',
            'Hiring: 5 open reqs, competitive market for AI/voice talent',
            'Product roadmap: Agentic work deferred to Q4 (strategic priority, but delayed)',
            'Profitability: Burning $480K/month, need cost reduction + revenue growth',
          ],
        },
        {
          slide: 'Outlook',
          items: [
            'Q3 Focus: Close American Airlines, launch Salesforce integration, improve unit economics',
            'H2 Focus: Scale to $3M+ ARR, launch Agentic capabilities, achieve profitability runway',
            'Investment needed: R&D for Agentic Engineering, Sales expansion team',
          ],
        },
      ],

      narrative: `
Ada is executing well on its AI voice platform strategy. Q2 showed solid progress:

Revenue Growth: ARR reached $2.3M (10% QoQ growth), with strong pipeline momentum at $5.2M. The American Airlines opportunity represents a significant growth catalyst if closed.

Product Progress: We're building enterprise-grade features (Salesforce integration, custom routing) to move upmarket. Our PAL POC with a major customer validates product-market fit in high-volume customer support use cases.

Operational Excellence: 99.95% uptime demonstrates production readiness. Our team of 150+ is well-positioned to support growth.

Key Risks: Revenue concentration (AA deal, top 2 customers), churn rate (5% needs improvement), and delayed Agentic roadmap are areas to monitor.

Path to Profitability: With unit economics work (LLM cost reduction) and revenue growth, we can reach cash-positive by end of 2026.

Board Decision: Approve continuation of strategy (expand upmarket, improve margins, build Agentic). Request budget for AI/voice hiring.
      `,

      decisions: [
        'Approve Q3-H2 roadmap (AA focus, Agentic deferred)',
        'Allocate budget for engineering hiring (5 open reqs)',
        'Green-light Salesforce integration investment (enterprise feature)',
        'Monitor churn KPI (5% acceptable but needs 3% path by EOY)',
      ],

      followUp: [
        'Weekly AA deal status update (investor confidence)',
        'Monthly revenue forecast (track toward $3M target)',
        'Churn analysis (why 5%? can we reduce?)',
        'Agentic capabilities demo (for next board meeting)',
      ],
    },
  };
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runScenarios() {
  console.log('Ada Core 5 Personas: Test Scenarios');
  console.log('===================================\n');

  const scenarios = [
    scenario1_mikeDecisionBatch(),
    scenario2_judyScheduling(),
    scenario3_jasonCustomerLoop(),
    scenario4_gozPlanning(),
    scenario5_longBoardPrep(),
  ];

  const results = {
    timestamp: new Date().toISOString(),
    scenarios: [],
  };

  for (const scenario of scenarios) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`${scenario.name}`);
    console.log(`${'='.repeat(80)}`);
    console.log(`\nPersona: ${scenario.persona}`);
    console.log(`Description: ${scenario.description}\n`);

    console.log('Rubric:');
    Object.entries(scenario.rubric).forEach(([key, val]) => {
      console.log(`  - ${key} (${Math.round(val.weight * 100)}%): ${val.description}`);
    });

    console.log('\nKey Challenge:');
    console.log(JSON.stringify(scenario.input.context || scenario.input).slice(0, 200) + '...\n');

    results.scenarios.push({
      name: scenario.name,
      persona: scenario.persona,
      status: 'defined',
    });
  }

  // Save results
  fs.writeFileSync(
    '/tmp/simulated-world/ada-core-5-scenarios-defined.json',
    JSON.stringify(results, null, 2)
  );

  console.log(`\n${'='.repeat(80)}`);
  console.log('Summary');
  console.log(`${'='.repeat(80)}`);
  console.log(`\nDefined ${scenarios.length} Core 5 test scenarios:\n`);
  scenarios.forEach((s, i) => console.log(`  ${i + 1}. ${s.persona}: ${s.name}`));
  console.log('\nReady to: Implement Piper behavior + scoring');
  console.log('Target: Measure Piper value for Ada\'s core workflows');
}

// Run
runScenarios().catch(console.error);
