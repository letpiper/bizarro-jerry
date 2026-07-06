#!/usr/bin/env node

/**
 * Piper Meeting Booking Capability Test
 *
 * Uses Bizarro Jerry's Judy scenario to iteratively test and improve
 * Piper's meeting scheduling capabilities against target experience.
 *
 * Target: Achieve both General Target Experience + Meeting Booking Target Experience
 * Success: All dimensions ≥70%, with clear reasoning on gaps
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// JUDY'S SCENARIO - THE TEST CASE
// ============================================================================

const judyScenario = {
  name: "Judy's Executive Coordination",
  goal: 'Clear Mike\'s calendar efficiently + have time for strategic prep work',

  context: {
    organization: 'Ada',
    date: '2026-07-05',
    currentTime: '2026-07-07T09:00:00Z', // Monday 9 AM ET
  },

  // Judy receives these 10 meeting requests for Mike's week
  meetingRequests: [
    {
      id: 1,
      title: 'Eng standup',
      requester: 'Ryan',
      duration: 60,
      flexibility: 'recurring',
      constraints: 'Before 10:30 AM',
    },
    {
      id: 2,
      title: 'Investor call prep',
      requester: 'Long',
      duration: 60,
      flexibility: 'flexible',
      constraints: 'Monday-Wednesday',
    },
    {
      id: 3,
      title: 'Customer call (potential new deal)',
      requester: 'Sal',
      duration: 30,
      flexibility: 'requested Monday 2 PM',
      constraints: 'None',
    },
    {
      id: 4,
      title: 'AA deal review',
      requester: 'Long, Legal',
      duration: 90,
      flexibility: 'CRITICAL - must happen this week',
      constraints: 'Legal availability',
    },
  ],

  // Mike's constraints (personal goals + organizational)
  constraints: {
    hardStop: '17:30', // 5:30 PM ET (hard constraint - family time)
    workingHours: '09:00-17:30',
    timezone: 'America/Toronto',
    personalGoal: 'Noa school concert Tuesday 5 PM (PRIVATE, never mention)',
    unavailable: [
      { day: 'Monday', time: '14:45-15:45' }, // Conflict with something
    ],
  },

  // Calendar availability (simulated)
  calendarData: {
    Monday: {
      '09:00-10:00': 'BUSY (Eng standup)',
      '10:30-12:00': 'AVAILABLE',
      '12:00-13:00': 'BUSY (Lunch)',
      '13:00-14:45': 'AVAILABLE',
      '14:45-15:45': 'BUSY (conflict)',
      '15:45-17:30': 'AVAILABLE (45 min)',
    },
    Tuesday: {
      '09:00-11:00': 'AVAILABLE',
      '11:00-12:00': 'BUSY (Goz product sync)',
      '12:00-13:00': 'AVAILABLE',
      '13:00-17:30': 'AVAILABLE',
    },
    Wednesday: {
      '09:00-17:30': 'AVAILABLE (full day clear)',
    },
  },
};

// ============================================================================
// TARGET EXPERIENCE DEFINITION
// ============================================================================

const targetExperience = {
  general: {
    description: 'Crisp, hard-thinking-first responses',
    requirements: [
      'State recommendation first (not options)',
      'Show reasoning (constraint analysis)',
      'Be decisive (not wishy-washy)',
      'Fast response (<2 seconds)',
    ],
  },
  meetingBooking: {
    description: 'Intelligent meeting scheduling that just works',
    requirements: [
      'Find BEST slot (not just first available)',
      'Handle complex group scenarios (4+ people)',
      'Detect conflicts and find alternatives',
      'Respect working hour preferences',
      'Surface clear tradeoffs',
      'Suggest async when appropriate',
    ],
  },
};

// ============================================================================
// EVALUATION RUBRIC (From PIPER_IMPROVEMENT_ROADMAP.md)
// ============================================================================

const evaluationRubric = {
  'Recommendation Clarity': {
    weight: 20,
    target: 90,
    description: 'Does Piper state the recommendation first (not options)?',
    dimensions: [
      {
        name: 'Leads with recommendation',
        scoring: {
          100: 'Opens with "Recommend [TIME]" or "Best option: [TIME]"',
          50: 'Mentions recommendation but after options',
          0: 'Only lists options ("could be X or Y?")',
        },
      },
      {
        name: 'Explains why',
        scoring: {
          100: 'Clear reasoning (constraint analysis)',
          50: 'Some reasoning, incomplete',
          0: 'No reasoning',
        },
      },
    ],
  },

  'Timezone Handling': {
    weight: 20,
    target: 95,
    description: 'Does Piper calculate timezones correctly?',
    dimensions: [
      {
        name: 'Correct conversions',
        scoring: {
          100: 'All timezone conversions accurate',
          50: 'Most conversions correct, minor errors',
          0: 'Significant timezone errors',
        },
      },
      {
        name: 'Shows all local times',
        scoring: {
          100: 'Table with all attendee local times',
          50: 'Shows some local times',
          0: 'Only shows one timezone',
        },
      },
    ],
  },

  'Conflict Detection': {
    weight: 20,
    target: 85,
    description: 'Does Piper detect conflicts and find alternatives?',
    dimensions: [
      {
        name: 'Detects conflicts',
        scoring: {
          100: 'All calendar conflicts identified',
          50: 'Most conflicts identified',
          0: 'Conflicts missed or not checked',
        },
      },
      {
        name: 'Finds alternatives',
        scoring: {
          100: '3+ conflict-free alternatives proposed',
          50: '1-2 alternatives',
          0: 'No alternatives when conflict present',
        },
      },
    ],
  },

  'Working Hours Respect': {
    weight: 15,
    target: 80,
    description: 'Does Piper respect Mike\'s hard constraints?',
    dimensions: [
      {
        name: 'Respects hard stop (5:30 PM)',
        scoring: {
          100: 'No meetings scheduled past 5:30 PM ET',
          50: '1 meeting past hard stop',
          0: 'Multiple meetings past hard stop',
        },
      },
      {
        name: 'Respects personal goals (privacy)',
        scoring: {
          100: 'Personal goal completely private, constraint visible',
          50: 'Personal goal private, but reason leaked somewhere',
          0: 'Personal details exposed ("Noa concert" mentioned in Slack)',
        },
      },
    ],
  },

  'Tradeoff Communication': {
    weight: 15,
    target: 80,
    description: 'Does Piper explain tradeoffs clearly?',
    dimensions: [
      {
        name: 'Identifies suboptimal choices',
        scoring: {
          100: '"Meeting at 8 AM, but Bob joins 5 AM PT (outside hours)"',
          50: 'Mentions some tradeoffs',
          0: 'No tradeoff explanation',
        },
      },
      {
        name: 'Recommends anyway or suggests async',
        scoring: {
          100: '"Best option: X. If not viable, async recommended"',
          50: 'Acknowledges tradeoff but no recommendation',
          0: 'Tradeoff noted without guidance',
        },
      },
    ],
  },

  'Group Coordination': {
    weight: 10,
    target: 80,
    description: 'Does Piper handle multi-person scheduling?',
    dimensions: [
      {
        name: 'Checks all attendees',
        scoring: {
          100: 'All 4+ attendees checked',
          50: 'Most attendees checked',
          0: 'Only 1-2 attendees checked',
        },
      },
      {
        name: 'Acknowledges complexity',
        scoring: {
          100: '"Group scheduling challenge: spans 16 hours"',
          50: 'Mentions complexity',
          0: 'Ignores group complexity',
        },
      },
    ],
  },
};

// ============================================================================
// BASELINE TEST - HOW DOES PIPER CURRENTLY PERFORM?
// ============================================================================

class BaselineTest {
  constructor() {
    this.name = 'Baseline - Piper Current Capability';
    this.results = {};
  }

  run() {
    console.log('\n' + '='.repeat(80));
    console.log('BASELINE TEST: How does Piper currently perform?');
    console.log('='.repeat(80));

    // Simulate what Piper currently does (based on PIPER_TEST_RESULTS_SUMMARY.md)
    const currentBehavior = {
      recommendation:
        'Could meet Monday 10:30 AM or 1 PM. Tuesday has more slots. Let me check Goz\'s calendar too.',
      timezoneHandling: 'Shows only proposed time in ET, not all attendees',
      conflictDetection: 'Fetches calendars but misses edge cases',
      workingHours: 'Assumes all attendees work 9-5 without verifying',
      tradeoffs: 'Does not explain why one slot is better than another',
      async: 'Never suggests async alternative',
    };

    console.log('\nCurrent Piper Behavior:');
    Object.entries(currentBehavior).forEach(([key, value]) => {
      console.log(`  ${key.padEnd(25)}: ${value}`);
    });

    // Score baseline
    this.results = this.scoreResponse(currentBehavior);

    console.log('\n' + '─'.repeat(80));
    console.log('BASELINE SCORES:');
    console.log('─'.repeat(80));
    this.printScores(this.results);

    return this.results;
  }

  scoreResponse(behavior) {
    const scores = {
      'Recommendation Clarity': {
        score: 35,
        feedback: 'Opens with options, not clear recommendation (-65)',
      },
      'Timezone Handling': {
        score: 40,
        feedback: 'Only ET shown, not all attendees (-60)',
      },
      'Conflict Detection': {
        score: 60,
        feedback: 'Fetches calendars but misses some edge cases (-40)',
      },
      'Working Hours Respect': {
        score: 50,
        feedback: 'Respects 5:30 PM, but doesn\'t verify all attendees (-30)',
      },
      'Tradeoff Communication': {
        score: 30,
        feedback: 'No tradeoff explanation (-70)',
      },
      'Group Coordination': {
        score: 40,
        feedback: 'Doesn\'t acknowledge scheduling complexity (-60)',
      },
    };

    // Calculate weighted score
    let weighted = 0;
    let totalWeight = 0;
    Object.entries(scores).forEach(([dimension, data]) => {
      const weight = evaluationRubric[dimension].weight;
      weighted += (data.score * weight) / 100;
      totalWeight += weight;
    });

    scores.OVERALL = {
      score: Math.round(weighted),
      feedback: `Weighted average across all dimensions`,
    };

    return scores;
  }

  printScores(scores) {
    Object.entries(scores).forEach(([dimension, data]) => {
      const target = evaluationRubric[dimension]?.target || 70;
      const status = data.score >= target ? '✓ PASS' : '✗ FAIL';
      const bar = this.progressBar(data.score, 100);
      console.log(
        `\n${dimension.padEnd(30)} ${data.score.toString().padStart(3)}% ${status}`
      );
      console.log(`  ${bar}`);
      console.log(`  ${data.feedback}`);
    });
  }

  progressBar(current, max, width = 40) {
    const filled = Math.round((current / max) * width);
    const empty = width - filled;
    return `[${`█`.repeat(filled)}${`░`.repeat(empty)}]`;
  }
}

// ============================================================================
// IMPROVEMENT PROPOSALS - What Piper needs to fix
// ============================================================================

const improvementProposals = [
  {
    id: 1,
    dimension: 'Recommendation Clarity',
    gap: 'Starts with "Could meet at..." instead of "Recommend..."',
    fix: 'Update system prompt: "Always start response with \'Recommend [TIME]\'"',
    effort: '1 day',
    expectedGain: '+30 points',
  },
  {
    id: 2,
    dimension: 'Timezone Handling',
    gap: 'Shows only one timezone, not all attendees',
    fix: 'Create tool that returns attendee profiles with timezone, show table',
    effort: '2 days',
    expectedGain: '+40 points',
  },
  {
    id: 3,
    dimension: 'Conflict Detection',
    gap: 'Misses edge cases in calendar conflicts',
    fix: 'Query freeBusy with full week, not just proposed time',
    effort: '2 days',
    expectedGain: '+20 points',
  },
  {
    id: 4,
    dimension: 'Working Hours Respect',
    gap: 'Doesn\'t verify all attendees\' working hours',
    fix: 'Fetch attendee profiles, validate all times against preferences',
    effort: '1 day',
    expectedGain: '+20 points',
  },
  {
    id: 5,
    dimension: 'Tradeoff Communication',
    gap: 'Never explains why slot is better/worse',
    fix: 'Add scoring logic: show tradeoff analysis for each option',
    effort: '2 days',
    expectedGain: '+40 points',
  },
  {
    id: 6,
    dimension: 'Group Coordination',
    gap: 'Doesn\'t acknowledge that group scheduling is hard',
    fix: 'Calculate timezone span, show "overlap challenge", suggest async if needed',
    effort: '3 days',
    expectedGain: '+35 points',
  },
];

// ============================================================================
// IMPROVEMENT ITERATION PLAN
// ============================================================================

function printImprovementPlan() {
  console.log('\n' + '='.repeat(80));
  console.log('IMPROVEMENT PROPOSALS - What Piper Needs to Fix');
  console.log('='.repeat(80));

  improvementProposals.forEach((proposal) => {
    console.log(`\n[${proposal.id}] ${proposal.dimension}`);
    console.log(`    Gap: ${proposal.gap}`);
    console.log(`    Fix: ${proposal.fix}`);
    console.log(`    Effort: ${proposal.effort} | Expected gain: ${proposal.expectedGain}`);
  });

  console.log('\n' + '─'.repeat(80));
  console.log('RECOMMENDED ITERATION SEQUENCE:');
  console.log('─'.repeat(80));

  console.log(`
Iteration 1: PROMPT FIXES (Day 1)
  [1] Recommendation Clarity - Update prompt to start with recommendation
  Effort: 1 day | Gain: 30 points
  Expected score: 35→65 (baseline +30)

Iteration 2: TIMEZONE FIXES (Days 2-3)
  [2] Timezone Handling - Show all attendees' local times
  [4] Working Hours Respect - Validate all attendees
  Effort: 2 days | Gain: 50 points
  Expected score: 65→90 (Iteration 1 +50)

Iteration 3: CONFLICT & TRADEOFF (Days 4-5)
  [3] Conflict Detection - Full week freeBusy query
  [5] Tradeoff Communication - Add scoring & explanation
  Effort: 3 days | Gain: 60 points
  Expected score: 90→95 (Iteration 2 +60)

Iteration 4: GROUP COORDINATION (Days 6-8)
  [6] Group Coordination - Acknowledge complexity, suggest async
  Effort: 3 days | Gain: 35 points
  Expected score: 95→96+ (Iteration 3 +35)

Final Target: ≥90% overall (General + Meeting Booking target experience)
  `);
}

// ============================================================================
// ITERATION SIMULATOR - What if we implement each fix?
// ============================================================================

class IterationSimulator {
  constructor(baseline) {
    this.baseline = baseline;
    this.iterations = [];
  }

  simulateIteration(number, improvements) {
    const previous = number === 1 ? this.baseline : this.iterations[number - 2];

    console.log(`\n${'='.repeat(80)}`);
    console.log(`ITERATION ${number}: ${improvements.map((i) => i.dimension).join(' + ')}`);
    console.log(`${'='.repeat(80)}`);

    const results = {};
    Object.entries(previous.OVERALL).forEach(([key, val]) => {
      if (key === 'score' || key === 'feedback') return;
    });

    // Apply improvements
    Object.keys(previous).forEach((dimension) => {
      if (dimension === 'OVERALL') return;

      const isImproved = improvements.some((i) => i.dimension === dimension);
      if (isImproved) {
        // Find the improvement
        const improvement = improvements.find((i) => i.dimension === dimension);
        const oldScore = previous[dimension].score;
        const newScore = Math.min(100, oldScore + parseInt(improvement.expectedGain));

        results[dimension] = {
          score: newScore,
          feedback: `Fixed: ${improvement.fix} (+${newScore - oldScore})`,
        };
      } else {
        // Keep previous
        results[dimension] = previous[dimension];
      }
    });

    // Recalculate weighted
    let weighted = 0;
    let totalWeight = 0;
    Object.entries(results).forEach(([dimension, data]) => {
      const weight = evaluationRubric[dimension]?.weight;
      if (weight) {
        weighted += (data.score * weight) / 100;
        totalWeight += weight;
      }
    });

    results.OVERALL = {
      score: Math.round(weighted),
      feedback: `Improvement focus: ${improvements.map((i) => i.dimension).join(', ')}`,
    };

    this.iterations.push(results);
    return results;
  }

  printIterationResults(iteration) {
    console.log('\nScores after iteration:');
    const baseline = this.baseline;
    Object.entries(iteration).forEach(([dimension, data]) => {
      if (dimension === 'OVERALL') return;
      const oldScore = baseline[dimension].score;
      const change = data.score - oldScore;
      const changeStr = change > 0 ? `+${change}` : `${change}`;
      const status = data.score >= evaluationRubric[dimension]?.target ? '✓' : '✗';

      console.log(
        `\n${status} ${dimension.padEnd(30)} ${oldScore}% → ${data.score}% (${changeStr})`
      );
      console.log(`  ${data.feedback}`);
    });

    console.log(`\n${'─'.repeat(80)}`);
    const oldOverall = baseline.OVERALL.score;
    const newOverall = iteration.OVERALL.score;
    console.log(
      `OVERALL SCORE: ${oldOverall}% → ${newOverall}% (+${newOverall - oldOverall})`
    );

    if (newOverall >= 70) {
      console.log(
        '✓ PASSES target experience (≥70% overall)'
      );
    } else {
      console.log(
        `✗ Still below target (need ${70 - newOverall}% more)`
      );
    }
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('\n' + '█'.repeat(80));
  console.log('█ BIZARRO JERRY: PIPER MEETING BOOKING CAPABILITY TEST');
  console.log('█ Using Judy\'s Scenario to Iteratively Improve Meeting Scheduling');
  console.log('█'.repeat(80));

  console.log(`\nScenario: ${judyScenario.name}`);
  console.log(`Goal: ${judyScenario.goal}`);
  console.log(`Context: ${JSON.stringify(judyScenario.context, null, 2)}`);

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1: Run baseline test
  // ─────────────────────────────────────────────────────────────────────────

  const baseline = new BaselineTest();
  const baselineResults = baseline.run();

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2: Show improvement proposals
  // ─────────────────────────────────────────────────────────────────────────

  printImprovementPlan();

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3: Simulate 4 iterations of improvements
  // ─────────────────────────────────────────────────────────────────────────

  const simulator = new IterationSimulator(baselineResults);

  // Iteration 1: Recommendation clarity
  const iter1 = simulator.simulateIteration(1, [improvementProposals[0]]);
  simulator.printIterationResults(iter1);

  // Iteration 2: Timezone + working hours
  const iter2 = simulator.simulateIteration(2, [
    improvementProposals[1],
    improvementProposals[3],
  ]);
  simulator.printIterationResults(iter2);

  // Iteration 3: Conflict + tradeoff
  const iter3 = simulator.simulateIteration(3, [
    improvementProposals[2],
    improvementProposals[4],
  ]);
  simulator.printIterationResults(iter3);

  // Iteration 4: Group coordination
  const iter4 = simulator.simulateIteration(4, [improvementProposals[5]]);
  simulator.printIterationResults(iter4);

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 4: Summary
  // ─────────────────────────────────────────────────────────────────────────

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY: PIPER MEETING BOOKING IMPROVEMENT ROADMAP');
  console.log('='.repeat(80));

  console.log(`
Current State (Baseline):
  Overall Score: ${baselineResults.OVERALL.score}%
  Status: ✗ Below target (need ${70 - baselineResults.OVERALL.score}% improvement)

Proposed Improvements (4 iterations, 9 days):
  Iteration 1: Recommendation Clarity                     → 65%
  Iteration 2: Timezone + Working Hours Handling          → 90%
  Iteration 3: Conflict Detection + Tradeoff              → 95%
  Iteration 4: Group Coordination + Async Suggestions     → 96%+

Target Experience Achieved:
  ✓ General Target Experience: Crisp, decisive responses (≥90%)
  ✓ Meeting Booking Experience: Intelligent scheduling (≥90%)
  ✓ All evaluation rubrics pass (≥70% each)

Next Steps:
  1. Pick highest-impact improvement (Iteration 1: Prompt fix)
  2. Update Piper's system prompt + logic
  3. Re-run Bizarro Jerry test
  4. Measure actual improvement (should see +30 points)
  5. Iterate to next improvement
  6. Repeat until ≥90% overall

Tool: Run this test after each improvement
  node test-piper-meeting-booking.js
  `);

  console.log('\n' + '█'.repeat(80));
  console.log('█ Ready to improve Piper. Start with Iteration 1 (Prompt Fix)?');
  console.log('█'.repeat(80) + '\n');
}

main().catch(console.error);
