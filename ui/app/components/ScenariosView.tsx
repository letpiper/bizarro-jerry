'use client';

import { useState } from 'react';
import type { ScenarioDefinition, ScenarioResult } from '../../types';

export function ScenariosView() {
  const [scenarios] = useState<ScenarioDefinition[]>([
    {
      id: 'scenario-1',
      name: 'Team Sync Meeting',
      description: 'Schedule a team sync meeting with attendees across different timezones',
      steps: [
        {
          id: 'step-1',
          type: 'calendar',
          description: 'Find best time for all attendees',
          integration: 'calendar',
          action: { type: 'find_best_time' },
        },
        {
          id: 'step-2',
          type: 'slack',
          description: 'Send calendar invite in Slack',
          integration: 'slack',
          action: { type: 'send_message' },
        },
      ],
    },
    {
      id: 'scenario-2',
      name: 'Email Response',
      description: 'Process and respond to incoming email',
      steps: [
        {
          id: 'step-1',
          type: 'gmail',
          description: 'Monitor incoming mail',
          integration: 'gmail',
          action: { type: 'fetch' },
        },
      ],
    },
  ]);

  const [selectedScenario, setSelectedScenario] = useState<ScenarioDefinition | null>(scenarios[0]);
  const [results, setResults] = useState<ScenarioResult | null>(null);
  const [running, setRunning] = useState(false);

  const runScenario = () => {
    if (!selectedScenario) return;

    setRunning(true);
    const result: ScenarioResult = {
      id: `result-${Date.now()}`,
      scenarioId: selectedScenario.id,
      status: 'running',
      startTime: new Date(),
      progress: 0,
    };
    setResults(result);

    // Simulate progress
    const interval = setInterval(() => {
      setResults((prev) => {
        if (!prev) return null;
        const newProgress = prev.progress + Math.random() * 30;
        if (newProgress >= 100) {
          clearInterval(interval);
          return {
            ...prev,
            progress: 100,
            status: 'completed',
            endTime: new Date(),
            metrics: {
              availability: 0.95,
              timezone: 0.85,
              conflict: 0.9,
              workingHours: 0.88,
              communication: 0.92,
              performance: 0.94,
              overallScore: 0.909,
              passed: true,
            },
          };
        }
        return {
          ...prev,
          progress: Math.min(newProgress, 99),
        };
      });
    }, 500);

    setTimeout(() => {
      setRunning(false);
    }, 3000);
  };

  return (
    <div style={{ height: '100%', display: 'flex' }}>
      {/* Scenario list */}
      <div style={{ width: '280px', borderRight: '1px solid #2a2a2a', overflow: 'auto' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #2a2a2a' }}>
          <h3 style={{ margin: 0 }}>Scenarios</h3>
          <p style={{ fontSize: '12px', color: '#808080', margin: '8px 0 0 0' }}>
            Pre-built test scenarios
          </p>
        </div>

        <div>
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              onClick={() => setSelectedScenario(scenario)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                background:
                  selectedScenario?.id === scenario.id ? '#252525' : 'transparent',
                borderLeft:
                  selectedScenario?.id === scenario.id
                    ? '3px solid #0066cc'
                    : '3px solid transparent',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (selectedScenario?.id !== scenario.id) {
                  e.currentTarget.style.background = '#1a1a1a';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedScenario?.id !== scenario.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                {scenario.name}
              </div>
              <div style={{ fontSize: '12px', color: '#808080' }}>
                {scenario.steps.length} steps
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario details */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #2a2a2a', background: '#1a1a1a' }}>
          <h2 style={{ margin: '0 0 8px 0' }}>{selectedScenario?.name}</h2>
          {selectedScenario?.description && (
            <p style={{ margin: 0, fontSize: '13px', color: '#808080' }}>
              {selectedScenario.description}
            </p>
          )}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {selectedScenario ? (
            <div>
              <h3 style={{ marginBottom: '16px' }}>Steps</h3>

              <div style={{ marginBottom: '24px' }}>
                {selectedScenario.steps.map((step, index) => (
                  <div
                    key={step.id}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        background: '#0066cc',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </div>
                    <div style={{ flex: 1, paddingTop: '8px' }}>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                        {step.description}
                      </div>
                      <div style={{ fontSize: '12px', color: '#808080' }}>
                        Integration: {step.integration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  className="btn-primary"
                  onClick={runScenario}
                  disabled={running}
                >
                  {running ? '▶ Running...' : '▶ Run Scenario'}
                </button>
              </div>

              {results && (
                <div style={{ marginTop: '24px', background: '#252525', padding: '16px', borderRadius: '4px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Execution Result</h3>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#808080', marginBottom: '8px' }}>
                      Progress
                    </div>
                    <div style={{ background: '#1a1a1a', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          background:
                            results.status === 'completed'
                              ? '#4caf50'
                              : '#0066cc',
                          height: '100%',
                          width: `${results.progress}%`,
                          transition: 'all 0.3s',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '12px', color: '#a0a0a0', marginTop: '6px' }}>
                      {Math.round(results.progress)}% complete
                    </div>
                  </div>

                  {results.status === 'completed' && results.metrics && (
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#808080', marginBottom: '8px' }}>
                        Overall Score
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#4caf50' }}>
                        {Math.round(results.metrics.overallScore * 100)}%
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">Select a scenario</div>
          )}
        </div>
      </div>
    </div>
  );
}
