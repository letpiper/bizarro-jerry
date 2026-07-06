/**
 * Run All Scenarios and Collect Results
 * Executes all meeting booking scenarios and produces a summary report
 */
import { runBasicMeetingScenario } from './meeting-booking-basic';
import { runGroupMeetingScenario } from './meeting-booking-group';
import { runConflictResolutionScenario } from './meeting-booking-conflict-resolution';
import { runTimezoneEdgeCaseScenario } from './meeting-booking-timezone-edge-cases';
import { runPiperAdapterExample } from './piper-adapter-example';
async function runAllScenarios() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   PIPER MEETING SCHEDULING SCENARIO SUITE                  ║');
    console.log('║   Comprehensive evaluation of meeting booking capabilities ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    const results = [];
    // Scenario 1: Basic 1-on-1
    try {
        console.log('\n[1/5] Running: Basic 1-on-1 Meeting...');
        const result1 = await runBasicMeetingScenario();
        results.push({
            name: 'Basic 1-on-1 Meeting',
            success: result1.result.success,
            overallScore: result1.score.overall,
            duration: result1.result.duration,
        });
    }
    catch (error) {
        results.push({
            name: 'Basic 1-on-1 Meeting',
            success: false,
            overallScore: 0,
            duration: 0,
            error: String(error),
        });
    }
    // Scenario 2: Group Meeting
    try {
        console.log('\n[2/5] Running: Group Meeting (4+ timezones)...');
        const result2 = await runGroupMeetingScenario();
        results.push({
            name: 'Group Meeting (4+ timezones)',
            success: result2.result.success,
            overallScore: result2.score.overall,
            duration: result2.result.duration,
        });
    }
    catch (error) {
        results.push({
            name: 'Group Meeting (4+ timezones)',
            success: false,
            overallScore: 0,
            duration: 0,
            error: String(error),
        });
    }
    // Scenario 3: Conflict Resolution
    try {
        console.log('\n[3/5] Running: Conflict Resolution...');
        const result3 = await runConflictResolutionScenario();
        results.push({
            name: 'Conflict Resolution',
            success: result3.result.success,
            overallScore: result3.score.overall,
            duration: result3.result.duration,
        });
    }
    catch (error) {
        results.push({
            name: 'Conflict Resolution',
            success: false,
            overallScore: 0,
            duration: 0,
            error: String(error),
        });
    }
    // Scenario 4: Timezone Edge Cases
    try {
        console.log('\n[4/5] Running: Timezone Edge Cases...');
        const result4 = await runTimezoneEdgeCaseScenario();
        results.push({
            name: 'Timezone Edge Cases',
            success: result4.result.success,
            overallScore: result4.score.overall,
            duration: result4.result.duration,
        });
    }
    catch (error) {
        results.push({
            name: 'Timezone Edge Cases',
            success: false,
            overallScore: 0,
            duration: 0,
            error: String(error),
        });
    }
    // Scenario 5: Piper Adapter Example
    try {
        console.log('\n[5/5] Running: Piper Adapter Example...');
        const result5 = await runPiperAdapterExample();
        results.push({
            name: 'Piper Adapter Example',
            success: result5.result.success,
            overallScore: result5.score.overall,
            duration: result5.result.duration,
        });
    }
    catch (error) {
        results.push({
            name: 'Piper Adapter Example',
            success: false,
            overallScore: 0,
            duration: 0,
            error: String(error),
        });
    }
    // Print summary
    printSummary(results);
}
function printSummary(results) {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   SUMMARY                                                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n');
    console.log('Scenario Results:');
    console.log('');
    const results_sorted = results.sort((a, b) => b.overallScore - a.overallScore);
    results_sorted.forEach((result, idx) => {
        const statusIcon = result.success ? '✓' : '✗';
        const scoreBar = createScoreBar(result.overallScore);
        console.log(`  ${statusIcon} ${result.name.padEnd(35)}`);
        console.log(`    Score: ${scoreBar} ${result.overallScore.toFixed(1)}%`);
        console.log(`    Time:  ${result.duration}ms`);
        if (result.error) {
            console.log(`    Error: ${result.error.substring(0, 50)}`);
        }
        console.log('');
    });
    // Calculate overall metrics
    const totalScenarios = results.length;
    const passedScenarios = results.filter((r) => r.success).length;
    const avgScore = results.reduce((sum, r) => sum + r.overallScore, 0) / totalScenarios;
    const totalTime = results.reduce((sum, r) => sum + r.duration, 0);
    console.log('Overall Metrics:');
    console.log(`  Total Scenarios: ${totalScenarios}`);
    console.log(`  Passed: ${passedScenarios}/${totalScenarios} (${((passedScenarios / totalScenarios) * 100).toFixed(0)}%)`);
    console.log(`  Average Score: ${avgScore.toFixed(1)}%`);
    console.log(`  Total Runtime: ${totalTime}ms`);
    // Key metrics
    console.log('\nKey Metrics for Meeting Scheduling Success:');
    console.log('  1. Availability Detection: >= 90%');
    console.log('  2. Timezone Handling: >= 95%');
    console.log('  3. Conflict Detection: >= 85%');
    console.log('  4. Working Hours Respect: >= 80%');
    console.log('  5. Communication: >= 80%');
    console.log('  6. Performance: < 2000ms');
    console.log('\nCapabilities Needed for Full Support:');
    console.log('  [ ] Query Google Calendar free/busy');
    console.log('  [ ] Create events in attendees\' calendars');
    console.log('  [ ] Handle timezone conversions (ET, PT, UK, IST, JST, NZST)');
    console.log('  [ ] Detect conflicts and suggest alternatives');
    console.log('  [ ] Respect working hour preferences');
    console.log('  [ ] Handle 4+ person scheduling');
    console.log('  [ ] Explain tradeoffs in natural language');
    console.log('  [ ] Post notifications to Slack');
    console.log('  [ ] Handle date boundary crossings');
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   EVALUATION COMPLETE                                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
}
function createScoreBar(score) {
    const filled = Math.round(score / 10);
    const empty = 10 - filled;
    return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}
// Run
runAllScenarios().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=run-all-scenarios.js.map