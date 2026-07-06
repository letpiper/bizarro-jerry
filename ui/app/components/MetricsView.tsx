'use client';

import { useState } from 'react';
import type { EvaluationMetrics } from '../../types';

export function MetricsView() {
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [scenarioRunning, setScenarioRunning] = useState(false);

  const testMetrics: EvaluationMetrics = {
    availability: 0.95,
    timezone: 0.85,
    conflict: 0.9,
    workingHours: 0.88,
    communication: 0.92,
    performance: 0.94,
    overallScore: 0.909,
    passed: true,
  };

  const handleRunScenario = () => {
    setScenarioRunning(true);
    // Simulate metric updates
    setTimeout(() => {
      setMetrics(testMetrics);
      setScenarioRunning(false);
    }, 2000);
  };

  const MetricBar = ({ name, value, weight }: { name: string; value: number; weight?: number }) => {
    const percentage = Math.round(value * 100);
    const color =
      percentage >= 90
        ? '#4caf50'
        : percentage >= 75
          ? '#ff9800'
          : '#f44336';

    return (
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '6px',
          }}
        >
          <span style={{ fontWeight: 600 }}>{name}</span>
          <span style={{ fontSize: '14px' }}>
            <span style={{ color, fontWeight: 600 }}>{percentage}%</span>
            {weight && <span style={{ color: '#808080', marginLeft: '8px' }}>({weight * 100}%)</span>}
          </span>
        </div>
        <div style={{ background: '#2a2a2a', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              background: color,
              height: '100%',
              width: `${percentage}%`,
              transition: 'all 0.3s',
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #2a2a2a', background: '#1a1a1a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ margin: 0 }}>Evaluation Metrics</h2>
          <button
            className="btn-primary btn-small"
            onClick={handleRunScenario}
            disabled={scenarioRunning}
          >
            {scenarioRunning ? 'Running...' : 'Run Scenario'}
          </button>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#808080' }}>
          Real-time metric updates during scenario execution
        </p>
      </div>

      {/* Metrics content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {!metrics ? (
          <div className="empty-state">
            <p>Run a scenario to see evaluation metrics</p>
            <button className="btn-primary" onClick={handleRunScenario} style={{ marginTop: '16px' }}>
              Run Scenario
            </button>
          </div>
        ) : (
          <div>
            {/* Overall score */}
            <div
              style={{
                background: metrics.passed ? '#1a3a1a' : '#3a1a1a',
                border: `2px solid ${metrics.passed ? '#4caf50' : '#f44336'}`,
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '24px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '14px', color: '#808080', marginBottom: '8px' }}>
                Overall Score
              </div>
              <div
                style={{
                  fontSize: '64px',
                  fontWeight: 700,
                  color: metrics.passed ? '#4caf50' : '#f44336',
                  marginBottom: '8px',
                }}
              >
                {Math.round(metrics.overallScore * 100)}%
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>
                {metrics.passed ? 'PASSED' : 'FAILED'}
              </div>
            </div>

            {/* Individual metrics */}
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h3 style={{ marginBottom: '20px' }}>Metric Breakdown</h3>

              <MetricBar name="Availability" value={metrics.availability} weight={1 / 6} />
              <MetricBar name="Timezone" value={metrics.timezone} weight={1 / 6} />
              <MetricBar name="Conflict Resolution" value={metrics.conflict} weight={1 / 6} />
              <MetricBar name="Working Hours" value={metrics.workingHours} weight={1 / 6} />
              <MetricBar name="Communication" value={metrics.communication} weight={1 / 6} />
              <MetricBar name="Performance" value={metrics.performance} weight={1 / 6} />
            </div>

            {/* Scoring details */}
            <div style={{ maxWidth: '600px', margin: '24px auto 0' }}>
              <h3 style={{ marginBottom: '16px' }}>Scoring Details</h3>
              <div style={{ background: '#252525', padding: '16px', borderRadius: '4px' }}>
                <p style={{ fontSize: '13px', color: '#a0a0a0', marginBottom: '12px' }}>
                  Each metric is weighted equally at 16.67%. The overall score is the average of all six metrics.
                </p>
                <table className="table" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Score</th>
                      <th>Weight</th>
                      <th>Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Availability</td>
                      <td>{Math.round(metrics.availability * 100)}%</td>
                      <td>16.67%</td>
                      <td>{Math.round((metrics.availability / 6) * 100) / 100}</td>
                    </tr>
                    <tr>
                      <td>Timezone</td>
                      <td>{Math.round(metrics.timezone * 100)}%</td>
                      <td>16.67%</td>
                      <td>{Math.round((metrics.timezone / 6) * 100) / 100}</td>
                    </tr>
                    <tr>
                      <td>Conflict</td>
                      <td>{Math.round(metrics.conflict * 100)}%</td>
                      <td>16.67%</td>
                      <td>{Math.round((metrics.conflict / 6) * 100) / 100}</td>
                    </tr>
                    <tr>
                      <td>Working Hours</td>
                      <td>{Math.round(metrics.workingHours * 100)}%</td>
                      <td>16.67%</td>
                      <td>{Math.round((metrics.workingHours / 6) * 100) / 100}</td>
                    </tr>
                    <tr>
                      <td>Communication</td>
                      <td>{Math.round(metrics.communication * 100)}%</td>
                      <td>16.67%</td>
                      <td>{Math.round((metrics.communication / 6) * 100) / 100}</td>
                    </tr>
                    <tr>
                      <td>Performance</td>
                      <td>{Math.round(metrics.performance * 100)}%</td>
                      <td>16.67%</td>
                      <td>{Math.round((metrics.performance / 6) * 100) / 100}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
