'use client';

import { useState, useMemo } from 'react';
import { useWorldState } from '../hooks/useWorldState';
import { formatDateTime, formatDuration, getIntegrationColor, truncateText } from '../utils/formatting';
import type { Trace } from '../../types';

export function TraceLog() {
  const { traces, traceFilter, setTraceFilter, selectedTrace, setSelectedTrace } = useWorldState();
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const [integrationFilter, setIntegrationFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTraces = useMemo(() => {
    let filtered = traces;

    if (integrationFilter) {
      filtered = filtered.filter((t) => t.integration === integrationFilter);
    }

    if (statusFilter === 'success') {
      filtered = filtered.filter((t) => !t.error);
    } else if (statusFilter === 'error') {
      filtered = filtered.filter((t) => t.error);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.request.url.toLowerCase().includes(query) ||
          t.request.method.toLowerCase().includes(query) ||
          t.integration.toLowerCase().includes(query) ||
          t.response.status.toString().includes(query)
      );
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [traces, integrationFilter, statusFilter, searchQuery]);

  const integrations = Array.from(new Set(traces.map((t) => t.integration))).sort();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #2a2a2a', background: '#1a1a1a' }}>
        <h2 style={{ margin: '0 0 12px 0' }}>API Trace Log</h2>
        <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#808080' }}>
          Every API request (request + response) to integrations
        </p>

        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
          <input
            type="text"
            placeholder="Search traces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px',
              background: '#252525',
              border: '1px solid #2a2a2a',
              color: '#e0e0e0',
              borderRadius: '4px',
              fontSize: '13px',
            }}
          />
          <select
            value={integrationFilter}
            onChange={(e) => setIntegrationFilter(e.target.value)}
            style={{
              padding: '8px',
              background: '#252525',
              border: '1px solid #2a2a2a',
              color: '#e0e0e0',
              borderRadius: '4px',
              fontSize: '13px',
            }}
          >
            <option value="">All Integrations</option>
            {integrations.map((integration) => (
              <option key={integration} value={integration}>
                {integration}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{
              padding: '8px',
              background: '#252525',
              border: '1px solid #2a2a2a',
              color: '#e0e0e0',
              borderRadius: '4px',
              fontSize: '13px',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="success">Success (2xx-3xx)</option>
            <option value="error">Error (4xx-5xx)</option>
          </select>
          <div style={{ color: '#808080', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
            {filteredTraces.length} traces
          </div>
        </div>
      </div>

      {/* Trace list */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex' }}>
        <div style={{ flex: 1, borderRight: '1px solid #2a2a2a' }}>
          {filteredTraces.length === 0 ? (
            <div className="empty-state">No traces found</div>
          ) : (
            <div>
              {filteredTraces.map((trace) => (
                <div
                  key={trace.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #2a2a2a',
                    cursor: 'pointer',
                    background: selectedTrace?.id === trace.id ? '#252525' : 'transparent',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setSelectedTrace(trace)}
                  onMouseEnter={(e) => {
                    if (selectedTrace?.id !== trace.id) {
                      e.currentTarget.style.background = '#1a1a1a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTrace?.id !== trace.id) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: trace.error ? '#f44336' : '#4caf50',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                        <span
                          style={{
                            background: getIntegrationColor(trace.integration),
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          {trace.integration}
                        </span>
                        <span style={{ color: '#0066cc', fontWeight: 600 }}>
                          {trace.request.method}
                        </span>
                        <span style={{ fontSize: '12px', color: '#808080' }}>
                          {trace.response.status}
                        </span>
                        <span style={{ fontSize: '12px', color: '#606060' }}>
                          {formatDuration(trace.duration)}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#a0a0a0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {truncateText(trace.request.url, 70)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#606060', marginTop: '4px' }}>
                        {formatDateTime(trace.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details panel */}
        <div style={{ width: '400px', overflow: 'auto', padding: '16px', borderLeft: '1px solid #2a2a2a' }}>
          {selectedTrace ? (
            <div>
              <h3 style={{ marginBottom: '12px' }}>Trace Details</h3>

              <div className="collapsible">
                <div
                  className="collapsible-header"
                  onClick={() =>
                    setExpandedTraceId(
                      expandedTraceId === 'request' ? null : 'request'
                    )
                  }
                >
                  <span className="collapsible-arrow">▶</span>
                  Request
                </div>
                {expandedTraceId === 'request' && (
                  <div className="collapsible-content expanded">
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ color: '#808080', fontSize: '11px' }}>Method</span>
                      <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>
                        {selectedTrace.request.method}
                      </div>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ color: '#808080', fontSize: '11px' }}>URL</span>
                      <div style={{ fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {selectedTrace.request.url}
                      </div>
                    </div>
                    {selectedTrace.request.headers && (
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#808080', fontSize: '11px' }}>Headers</span>
                        <pre
                          style={{
                            background: '#0a0a0a',
                            padding: '8px',
                            borderRadius: '3px',
                            fontSize: '11px',
                            overflow: 'auto',
                            marginTop: '4px',
                          }}
                        >
                          {JSON.stringify(selectedTrace.request.headers, null, 2)}
                        </pre>
                      </div>
                    )}
                    {selectedTrace.request.body && (
                      <div>
                        <span style={{ color: '#808080', fontSize: '11px' }}>Body</span>
                        <pre
                          style={{
                            background: '#0a0a0a',
                            padding: '8px',
                            borderRadius: '3px',
                            fontSize: '11px',
                            overflow: 'auto',
                            marginTop: '4px',
                          }}
                        >
                          {typeof selectedTrace.request.body === 'string'
                            ? selectedTrace.request.body
                            : JSON.stringify(selectedTrace.request.body, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="collapsible">
                <div
                  className="collapsible-header"
                  onClick={() =>
                    setExpandedTraceId(
                      expandedTraceId === 'response' ? null : 'response'
                    )
                  }
                >
                  <span className="collapsible-arrow">▶</span>
                  Response
                </div>
                {expandedTraceId === 'response' && (
                  <div className="collapsible-content expanded">
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ color: '#808080', fontSize: '11px' }}>Status</span>
                      <div
                        style={{
                          fontSize: '13px',
                          fontFamily: 'monospace',
                          color:
                            selectedTrace.response.status >= 400
                              ? '#f44336'
                              : '#4caf50',
                          fontWeight: 600,
                        }}
                      >
                        {selectedTrace.response.status}
                      </div>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ color: '#808080', fontSize: '11px' }}>Duration</span>
                      <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>
                        {formatDuration(selectedTrace.duration)}
                      </div>
                    </div>
                    {selectedTrace.response.headers && (
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#808080', fontSize: '11px' }}>Headers</span>
                        <pre
                          style={{
                            background: '#0a0a0a',
                            padding: '8px',
                            borderRadius: '3px',
                            fontSize: '11px',
                            overflow: 'auto',
                            marginTop: '4px',
                          }}
                        >
                          {JSON.stringify(selectedTrace.response.headers, null, 2)}
                        </pre>
                      </div>
                    )}
                    {selectedTrace.response.body && (
                      <div>
                        <span style={{ color: '#808080', fontSize: '11px' }}>Body</span>
                        <pre
                          style={{
                            background: '#0a0a0a',
                            padding: '8px',
                            borderRadius: '3px',
                            fontSize: '11px',
                            overflow: 'auto',
                            marginTop: '4px',
                          }}
                        >
                          {typeof selectedTrace.response.body === 'string'
                            ? selectedTrace.response.body
                            : JSON.stringify(selectedTrace.response.body, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedTrace.error && (
                <div
                  style={{
                    background: '#3a1a1a',
                    padding: '12px',
                    borderRadius: '4px',
                    borderLeft: '3px solid #f44336',
                    marginTop: '12px',
                  }}
                >
                  <span style={{ color: '#f44336', fontWeight: 600 }}>Error</span>
                  <pre
                    style={{
                      color: '#f44336',
                      fontSize: '12px',
                      marginTop: '8px',
                      overflow: 'auto',
                    }}
                  >
                    {selectedTrace.error}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">Select a trace to view details</div>
          )}
        </div>
      </div>
    </div>
  );
}
