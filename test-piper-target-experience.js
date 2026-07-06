#!/usr/bin/env node

/**
 * Piper Meeting Booking: Target Experience Test
 *
 * Tests Piper against the ACTUAL target experience:
 * "When you ask me to book a meeting, my job is to find the best slot
 *  fast and intelligently — not just the first open one."
 *
 * Core capabilities tested:
 * 1. Purpose-first (understand the meeting's outcome)
 * 2. Ranking against goals (read calendar, rank against Ada's + Mike's goals)
 * 3. Privacy by default (protect calendar details in group settings)
 * 4. Own complexity (reconcile everyone's availability for groups)
 * 5. Minimal-cost relaxation (solve constraints, don't broadcast)
 * 6. Agent-to-agent negotiation (secure coordination)
 * 7. Calendar as source of truth (RSVP status, not Slack)
 * 8. Crisp answer fast (one recommendation, not options)
 */

const scenarios = [
  {
    id: 'scenario-1',
    name: 'Purpose-First: Understanding Meeting Intent',
    description:
      'Piper understands the meeting\'s purpose before proposing time',

    scenario: {
      request:
        'Can you book a meeting with Long and Ryan about Q3 funding targets?',
      context: {
        attendees: ['mike@ada.cx', 'long@ada.cx', 'ryan@ada.cx'],
        requester: 'mike@ada.cx',
        purpose: 'DECISION - Align on Q3 funding targets for board',
      },
    },

    targetBehavior: {
      steps: [
        '1. Ask purpose if unclear: "Is this to decide Q3 funding, or gather input?"',
        '2. Understand impact: Decision meetings rank higher than reviews',
        '3. Know who is essential: Mike + Long + Ryan all critical',
        '4. Estimate duration: Decision meeting = 60 min (not 30)',
        '5. Rank against existing: Board decision > customer calls > standard syncs',
      ],
      startWithPurpose: true,
      understandsImportance: true,
      identifiesEssentialAttendees: true,
    },

    rubric: {
      'Asks clarifying question on purpose': {
        weight: 20,
        scoring: {
          100: '"Is this to decide Q3 targets or gather input?" (single question)',
          50: 'Some purpose clarification, but vague or multiple questions',
          0: 'No clarification, assumes purpose',
        },
      },
      'Identifies meeting importance level': {
        weight: 20,
        scoring: {
          100:
            'Recognizes as DECISION-level (impacts board, funding, strategy)',
          50: 'Recognizes as important, but not clear why',
          0: 'Treats as routine meeting',
        },
      },
      'Identifies essential attendees': {
        weight: 20,
        scoring: {
          100: 'All 3 are critical; none can be made optional',
          50: 'Most essential identified, but some ambiguity',
          0: 'No distinction between essential/optional',
        },
      },
      'Ranks against other meetings': {
        weight: 20,
        scoring: {
          100:
            'Would consider moving lower-priority meetings if needed (customer calls okay to reschedule)',
          50: 'Considers some prioritization',
          0: 'Takes calendar as-is, no ranking',
        },
      },
      'Purpose informs timing': {
        weight: 20,
        scoring: {
          100: 'Allocates 60 min (decision time) + 30 min prep context = 90 min total',
          50: 'Allocates 60 min, but no prep time',
          0: 'Allocates first available 30-min slot',
        },
      },
    },

    expectedOutput: {
      startingPoint:
        '"This is a funding decision meeting — Mike + Long + Ryan all essential. Estimating 60 min decision + 30 min context = 90 min total."',
      question:
        '"Before I check calendars: Is this decision time urgent (Q3 decision needed by end-of-month) or planning-phase flexible?"',
      recommendation:
        '"Recommend Wednesday 2-3:30 PM ET (covers decision + immediate follow-up). Long has open time. Ryan can move his 2-3 design review (lower priority than funding). No conflicts for Mike."',
    },
  },

  {
    id: 'scenario-2',
    name: 'Privacy by Default: Group Scheduling Without Exposure',
    description:
      'Piper protects calendar details in group settings, only exposes free/busy',

    scenario: {
      request: 'Schedule all-hands for 1 hour, all 5 core team members',
      context: {
        attendees: ['mike@ada.cx', 'goz@ada.cx', 'judy@ada.cx', 'jason@ada.cx', 'long@ada.cx'],
        requester: 'judy@ada.cx',
        publicChannel: '#piper-internal',
      },
    },

    targetBehavior: {
      privateInfo: {
        mikes_actual_calendars: [
          { title: 'AA deal review - CONFIDENTIAL', time: '2-3 PM' },
          { title: "Noa's concert - PERSONAL", time: '5 PM' },
          { title: 'Investor call - NDA', time: '3-4 PM' },
        ],
        what_piper_knows: 'All of it (in private context)',
        what_group_sees: 'Only free/busy blocks, no titles or reasons',
        what_individual_sees: 'Their own full detail, others only free/busy',
      },
    },

    rubric: {
      'Keeps private details private in group settings': {
        weight: 30,
        scoring: {
          100:
            'Group never sees meeting titles, attendees, or personal details. Only: "Mike has conflict 2-3 PM"',
          50: 'Mostly private, but leaked one detail somewhere',
          0: '"Mike has AA deal 2-3 PM" exposed in #piper-internal',
        },
      },
      'Uses free/busy language only in groups': {
        weight: 20,
        scoring: {
          100: '"Works for 4/5, one conflict for Mike Tuesday" (never what conflict is)',
          50: 'Sometimes uses free/busy, sometimes exposes detail',
          0: 'Lists specific conflicts for everyone',
        },
      },
      'Shows full detail to individuals': {
        weight: 20,
        scoring: {
          100: 'Mike sees his own calendar titles; sees others only as free/busy blocks',
          50: 'Some individual detail visible',
          0: 'Same redacted view for everyone',
        },
      },
      'Agent-to-agent negotiation': {
        weight: 15,
        scoring: {
          100:
            'Coordinates via secure channel: "Mike, can you move 2-3 PM call?" → gets approval → updates group',
          50: 'Some negotiation, but exposes details in shared channel',
          0: 'Public negotiation exposes conflicts',
        },
      },
      'Calendar is source of truth': {
        weight: 15,
        scoring: {
          100: 'Checks RSVP status from Calendar API, not Slack "sounds good"',
          50: 'Uses Calendar, but also relies on Slack confirmation',
          0: 'Only checks Slack thread responses',
        },
      },
    },

    expectedOutput: {
      privateContext:
        'Mike: AA deal, Noa concert, investor call. Goz: full calendar visible. Jason: visible. Judy: visible. Long: visible.',
      publicChannel:
        '"All-hands: Recommend Tuesday 11 AM-12 PM ET. Works for 5/5 with minimal movement. Ready to book?"',
      behindTheScenes:
        'Mike needs to move 10-11 AM hold (personal flex time). Secure request sent to Mike\'s Piper: "Your 10-11 hold blocks all-hands; can you move? Relaxing it unlocks 11-12 slot for everyone." Mike approves. All-hands booked.',
    },
  },

  {
    id: 'scenario-3',
    name: 'Minimal-Cost Constraint Relaxation: Solving Without Broadcasting',
    description:
      'When there\'s no clean slot, Piper finds smallest change that solves it',

    scenario: {
      request: 'Book 1-hour sync with Goz + Ryan + Judy on product roadmap',
      context: {
        attendees: ['goz@ada.cx', 'ryan@ada.cx', 'judy@ada.cx'],
        requester: 'mike@ada.cx',
        calendar: {
          goz: [
            { time: '10-11 AM', title: 'Customer call 1' },
            { time: '2-3 PM', title: 'Design review' },
          ],
          ryan: [
            { time: '9-10 AM', title: 'Team standup' },
            { time: '11 AM-12 PM', title: 'Architecture discussion' },
            { time: '2-4 PM', title: 'Eng planning' },
          ],
          judy: [
            { time: '1-2 PM', title: 'Mike prep' },
            { time: '3-4 PM', title: 'Board materials' },
          ],
        },
      },
    },

    targetBehavior: {
      analysis: {
        cleanSlots: 'None (Goz + Ryan conflict at every slot)',
        constraint_relaxation: [
          'Option 1: Move Ryan\'s 11-12 arch discussion (lowest priority)',
          'Option 2: Move Goz\'s 10-11 customer call (medium priority, reschedulable)',
          'Option 3: Async-first (recording + follow-up)',
        ],
        selected:
          'Option 1: Move Ryan\'s arch discussion (his own meeting, he can reschedule it)',
        approach:
          'Never broadcast "you have to move something". Instead: ask Ryan directly via secure channel: "Your 11-12 architecture discussion blocks the product roadmap sync the whole team wants — okay to move it to 3-4 or Thursday 10-11?"',
      },
    },

    rubric: {
      'Identifies all clean slots': {
        weight: 20,
        scoring: {
          100: 'Correctly identifies zero clean slots exist',
          50: 'Identifies some slots but misses conflicts',
          0: 'Proposes time with conflicts',
        },
      },
      'Ranks constraint relaxations by cost': {
        weight: 25,
        scoring: {
          100:
            'Lowest cost: move Ryan\'s meeting (his own). Medium: move Goz\'s customer call (needs customer coordination). Highest: move Judy\'s board prep (Mike\'s prep).',
          50: 'Some ranking, but not clear priority',
          0: 'No ranking, random selection',
        },
      },
      'Approaches person directly, not group': {
        weight: 25,
        scoring: {
          100: 'DMs Ryan: "Can you move 11-12?" with specific ask. No public broadcast.',
          50: 'Asks Ryan, but also broadcasts in group',
          0: 'Asks group to make space',
        },
      },
      'Solves before proposing': {
        weight: 20,
        scoring: {
          100: 'Gets Ryan\'s approval first, then proposes final time to whole group',
          50: 'Proposes with caveat "if Ryan moves his meeting"',
          0: 'Broadcasts problem "Can someone move something?"',
        },
      },
      'Gives person options with context': {
        weight: 10,
        scoring: {
          100: '"Move to 3-4 (same day, after Judy\'s board prep) or Thursday 10-11 (quieter day)?"',
          50: '"Can you move it?" with no options',
          0: '"You have to move it"',
        },
      },
    },

    expectedOutput: {
      analysis: 'Zero clean slots. Ryan\'s 11-12 architecture discussion is lowest-priority blocking meeting.',
      directApproach:
        'Ryan (via Piper DM): "Product roadmap sync needs 11 AM-12 PM slot with Goz + Judy. Your 11-12 architecture discussion is the smallest blocker. Can you move it to 3-4 PM (same day, Mike still free) or Thursday 10-11 AM (less crowded)?"',
      afterApproval:
        'Ryan approves: "Move to Thursday 10-11". Piper to group: "Recommend Monday 11 AM-12 PM for product roadmap sync (Goz, Ryan, Judy). Clean slot once Ryan\'s arch discussion moves to Thursday."',
      timing: 'Negotiation happens agent-to-agent, group hears final answer, not the back-and-forth',
    },
  },

  {
    id: 'scenario-4',
    name: 'Crisp Answer, Clear Tradeoffs: Why This Slot',
    description:
      'Piper proposes one recommendation with clear reasoning, not a list of options',

    scenario: {
      request: 'Book meeting with Judy + Goz + Jason to finalize customer proposal',
      context: {
        attendees: ['judy@ada.cx', 'goz@ada.cx', 'jason@ada.cx'],
        requester: 'mike@ada.cx',
        urgency: 'Customer decision deadline Friday EOD',
        status: 'Piper found 3 possible slots with tradeoffs',
      },
    },

    targetBehavior: {
      slots: [
        {
          slot: 'Tuesday 2-3 PM',
          tradeoff: 'All in working hours, but Jason has lower-priority customer call',
          score: 'BEST',
        },
        {
          slot: 'Wednesday 10-11 AM',
          tradeoff: 'Goz out of office (needs dial-in), all in working hours',
          score: 'GOOD',
        },
        {
          slot: 'Thursday 4-5 PM',
          tradeoff: 'After hours for Jason (PT), but only clean slot with all present',
          score: 'OKAY',
        },
      ],
    },

    rubric: {
      'Proposes ONE recommendation': {
        weight: 25,
        scoring: {
          100:
            '"Recommend Tuesday 2-3 PM ET" (not "Options are Tuesday/Wednesday/Thursday")',
          50: 'Mentions primary but lists alternatives first',
          0: 'Starts with "Could be X, Y, or Z"',
        },
      },
      'Explains why recommendation is best': {
        weight: 25,
        scoring: {
          100:
            '"Recommend Tuesday because all in working hours and Jason can move his call (lower priority than proposal close)."',
          50: 'Explains some reasoning',
          0: 'No explanation',
        },
      },
      'Acknowledges tradeoff but recommends anyway': {
        weight: 20,
        scoring: {
          100:
            '"Jason moves lower-priority call. Worth it because Friday deadline for customer decision."',
          50: 'Mentions tradeoff but unsure about recommendation',
          0: 'Lists tradeoffs without guidance',
        },
      },
      'Offers alternative only if primary fails': {
        weight: 15,
        scoring: {
          100:
            '"If Tuesday doesn\'t work, Wednesday 10 AM (Goz dial-in from travel) is backup."',
          50: 'Mentions alternatives',
          0: 'Doesn\'t mention alternatives',
        },
      },
      'Shows decision is final': {
        weight: 15,
        scoring: {
          100: '"Book Tuesday 2-3 PM ET? Ready to send invites once you confirm."',
          50: '"Is this okay?" (leaves door open for indecision)',
          0: '"Let me know what works best"',
        },
      },
    },

    expectedOutput: {
      recommendation:
        'Recommend Tuesday 2-3 PM ET (Judy, Goz, Jason - finalizing customer proposal)',
      why: 'Customer decision deadline Friday — Tuesday gives 3 days for final edits. All in working hours. Jason moves lower-priority customer call.',
      tradeoff:
        'Tradeoff: Jason reschedules customer call to Wednesday 10 AM (he confirmed it\'s lower priority).',
      backup:
        'Backup: If Tuesday doesn\'t work, Wednesday 10-11 AM with Goz on dial-in (he\'s in LA).',
      decision: 'Ready to send Tuesday invite. Approve?',
    },
  },

  {
    id: 'scenario-5',
    name: 'Judy\'s Scenario: A Real, Complex Case',
    description: 'Judy coordinates 10 meeting requests for Mike — the full experience',

    scenario: {
      requests: [
        {
          id: 1,
          title: 'Eng standup',
          requester: 'Ryan',
          duration: 60,
          importance: 'RECURRING - low',
        },
        {
          id: 2,
          title: 'Investor call prep',
          requester: 'Long',
          duration: 60,
          importance: 'DECISION - high',
        },
        {
          id: 3,
          title: 'Customer call (potential new deal)',
          requester: 'Sal',
          duration: 30,
          importance: 'EXTERNAL - high',
        },
        {
          id: 4,
          title: 'AA deal review',
          requester: 'Long, Legal',
          duration: 90,
          importance: 'DECISION - critical',
        },
      ],
    },

    targetBehavior: {
      approach: [
        '1. Understand Mike\'s goals: Close AA deal, prepare investor call, protect family time (5:30 PM)',
        '2. Rank meetings: AA deal + investor > customer > standup',
        '3. Protect Mike\'s blocks: 5:30 PM is unmovable (personal)',
        '4. Solve each request: Not all can be perfect, minimize disruption',
        '5. Give Judy ONE calendar that works, not options',
      ],
      result:
        'Judy gets a clean week with AA deal blocked Wed, investor prep Thu, customer call Tue, standup kept recurring. All before 5:30 PM. Judy gains 2+ hours for strategic work.',
    },

    rubric: {
      'Knows Mike\'s goals': {
        weight: 20,
        scoring: {
          100: 'AA deal by 2026-07-25, investor call ready, family 5:30 PM unmovable',
          50: 'Some goals known, priority unclear',
          0: 'Treats all meetings equally',
        },
      },
      'Ranks by importance': {
        weight: 20,
        scoring: {
          100:
            'AA deal + investor > customer > standup. Standup could be moved/async.',
          50: 'Some ranking, not fully clear',
          0: 'No ranking',
        },
      },
      'Respects hard constraints': {
        weight: 20,
        scoring: {
          100: 'No meetings past 5:30 PM ET, ever. Personal block is unmovable.',
          50: 'Mostly respects, one exception',
          0: 'Ignores constraint',
        },
      },
      'Solves, doesn\'t delegate': {
        weight: 20,
        scoring: {
          100:
            'Piper finds times, schedules, handles conflicts. Judy says "done" not "here are options"',
          50: 'Piper proposes, Judy decides',
          0: 'Judy does all the work',
        },
      },
      'Result: Judy gains strategic time': {
        weight: 20,
        scoring: {
          100: 'Judy spends 30 min coordinating (not 3 hrs). Has 2.5 hrs for exec prep, action tracking, strategy.',
          50: 'Judy saves some time',
          0: 'Judy still spends 3 hours on calendar tetris',
        },
      },
    },

    expectedOutput: {
      week: {
        monday: 'Standup 9-10 AM, Available',
        tuesday: 'Customer call (Sal) 2-3 PM. Opens investor prep.',
        wednesday: 'AA deal review 2-3:30 PM (critical meeting, Mike + Long + Legal)',
        thursday: 'Investor call prep 10-11 AM (Mike + Long). DONE.',
      },
      coordination: 'Piper handles it. Judy sees: "Calendar clean. All meetings scheduled. You have Thu afternoon + Fri for executive prep work."',
      outcome: 'Judy gained 2.5+ hours. Mike\'s goals protected. All requests accommodated without conflicts.',
    },
  },
];

// ============================================================================
// Evaluation Framework
// ============================================================================

const evaluationSummary = (scenario) => {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`SCENARIO: ${scenario.name}`);
  console.log(`${'═'.repeat(80)}`);
  console.log(`\nDescription: ${scenario.description}`);

  console.log(`\nKey Capability Tested:`);
  Object.entries(scenario.rubric).forEach(([criterion, details]) => {
    console.log(`  • ${criterion} (${details.weight}%)`);
  });

  console.log(`\nTarget Behavior:`);
  if (scenario.targetBehavior.steps) {
    scenario.targetBehavior.steps.forEach((step) => console.log(`  ${step}`));
  } else {
    Object.entries(scenario.targetBehavior).forEach(([key, val]) => {
      if (typeof val === 'string') {
        console.log(`  ${key}: ${val}`);
      } else if (Array.isArray(val)) {
        val.forEach((item) => console.log(`    - ${item}`));
      }
    });
  }

  console.log(`\nExpected Output:`);
  if (scenario.expectedOutput.steps) {
    scenario.expectedOutput.steps.forEach((step) => console.log(`  ${step}`));
  } else {
    Object.entries(scenario.expectedOutput).forEach(([key, val]) => {
      console.log(`  ${key}: ${val}`);
    });
  }
};

// ============================================================================
// Main
// ============================================================================

console.log(`
${'█'.repeat(80)}
█ PIPER MEETING BOOKING: TARGET EXPERIENCE TEST SUITE
█
█ Tests Piper against the actual target experience:
█ "Find the best slot fast and intelligently — not just the first open one"
█
█ Evaluates:
█ 1. Purpose-first understanding
█ 2. Ranking against goals
█ 3. Privacy by default
█ 4. Own the complexity (don't broadcast problems)
█ 5. Minimal-cost constraint relaxation
█ 6. Agent-to-agent negotiation
█ 7. Calendar as source of truth
█ 8. Crisp answer, clear reasoning
█
${'█'.repeat(80)}
`);

scenarios.forEach((scenario) => {
  evaluationSummary(scenario);
});

console.log(`\n${'═'.repeat(80)}`);
console.log('FULL TEST SUITE DEFINED');
console.log(`${'═'.repeat(80)}`);
console.log(`\n${scenarios.length} scenarios covering all aspects of the target experience.`);
console.log(`\nNext: Implement Piper capabilities and run this test suite.`);
console.log(`\nTo measure improvement:`);
console.log(`  1. Run test suite against current Piper`);
console.log(`  2. Record scores for each scenario`);
console.log(`  3. Implement one capability (e.g., Purpose-First)`);
console.log(`  4. Re-run test suite`);
console.log(`  5. Compare scores`);
console.log(`  6. Iterate to next capability`);
console.log(`\nFinal goal: All scenarios passing ≥70% overall, Judy gains strategic time.`);
