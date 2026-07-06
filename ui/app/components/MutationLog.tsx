'use client';

import { useState, useMemo } from 'react';
import { useWorldState } from '../hooks/useWorldState';
import { formatDateTime, getIntegrationColor } from '../utils/formatting';
import type { Mutation } from '../../types';

export function MutationLog() {
  const { mutations, selectedMutation, setSelectedMutation } = useWorldState();
  const [integrationFilter, setIntegrationFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'created' | 'updated' | 'deleted'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMutationId, setExpandedMutationId] = useState<string | null>(null);

  const filteredMutations = useMemo(() => {
    let filtered = mutations;

    if (integrationFilter) {
      filtered = filtered.filter((m) => m.integration === integrationFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((m) => m.type === typeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.entity.toLowerCase().includes(query) ||
          m.entityId.toLowerCase().includes(query) ||
          m.integration.toLowerCase().includes(query) ||
          (m.userId && m.userId.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [mutations, integrationFilter, typeFilter, searchQuery]);

  const integrations = Array.from(new Set(mutations.map((m) => m.integration))).sort();

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'created':
        return '#4caf50';
      case 'updated':
        return '#ff9800';
      case 'deleted':
        return '#f44336';
      default:
        return '#808080';
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'created':
        return '✚';
      case 'updated':
        return '⟳';
      case 'deleted':
        return '✕';
      default:
        return '•';
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #2a2a2a', background: '#1a1a1a' }}>
        <h2 style={{ margin: '0 0 12px 0' }}>Mutation Log</h2>
        <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#808080' }}>
          Every state change across all integrations
        </p>

        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
          <input
            type="text"
            placeholder="Search mutations..."
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            style={{
              padding: '8px',
              background: '#252525',
              border: '1px solid #2a2a2a',
              color: '#e0e0e0',
              borderRadius: '4px',
              fontSize: '13px',
            }}
          >
            <option value="all">All Types</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="deleted">Deleted</option>
          </select>
          <div style={{ color: '#808080', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
            {filteredMutations.length} mutations
          </div>
        </div>
      </div>

      {/* Mutation list */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex' }}>
        <div style={{ flex: 1, borderRight: '1px solid #2a2a2a' }}>
          {filteredMutations.length === 0 ? (
            <div className="empty-state">No mutations found</div>
          ) : (
            <div>
              {filteredMutations.map((mutation) => (
                <div
                  key={mutation.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #2a2a2a',
                    cursor: 'pointer',
                    background: selectedMutation?.id === mutation.id ? '#252525' : 'transparent',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setSelectedMutation(mutation)}
                  onMouseEnter={(e) => {
                    if (selectedMutation?.id !== mutation.id) {
                      e.currentTarget.style.background = '#1a1a1a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedMutation?.id !== mutation.id) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: getTypeColor(mutation.type),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '12px',
                        flexShrink: 0,
                      }}
                    >
                      {getTypeIcon(mutation.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                        <span
                          style={{
                            background: getIntegrationColor(mutation.integration),
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          {mutation.integration}
                        </span>
                        <span style={{ fontSize: '12px', color: '#0066cc', fontWeight: 600 }}>
                          {mutation.entity}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>
                        {mutation.entityId}
                      </div>
                      <div style={{ fontSize: '11px', color: '#606060' }}>
                        {formatDateTime(mutation.timestamp)}
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
          {selectedMutation ? (
            <div>
              <h3 style={{ marginBottom: '12px' }}>Mutation Details</h3>

              <div style={{ background: '#252525', padding: '12px', borderRadius: '4px', marginBottom: '12px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ color: '#808080', fontSize: '11px' }}>Type</span>
                  <div style={{ marginTop: '4px', fontSize: '14px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        background: getTypeColor(selectedMutation.type),
                        borderRadius: '3px',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    >
                      {getTypeIcon(selectedMutation.type)}
                      {selectedMutation.type}
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <span style={{ color: '#808080', fontSize: '11px' }}>Entity</span>
                  <div style={{ marginTop: '4px', fontSize: '14px' }}>
                    {selectedMutation.entity} ({selectedMutation.entityId})
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <span style={{ color: '#808080', fontSize: '11px' }}>Integration</span>
                  <div style={{ marginTop: '4px', fontSize: '14px' }}>
                    {selectedMutation.integration}
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <span style={{ color: '#808080', fontSize: '11px' }}>Timestamp</span>
                  <div style={{ marginTop: '4px', fontSize: '13px' }}>
                    {formatDateTime(selectedMutation.timestamp)}
                  </div>
                </div>

                {selectedMutation.userId && (
                  <div>
                    <span style={{ color: '#808080', fontSize: '11px' }}>User</span>
                    <div style={{ marginTop: '4px', fontSize: '14px' }}>
                      {selectedMutation.userId}
                    </div>
                  </div>
                )}
              </div>

              {(selectedMutation.before || selectedMutation.after) && (
                <>
                  <div className="collapsible">
                    <div
                      className="collapsible-header"
                      onClick={() =>
                        setExpandedMutationId(
                          expandedMutationId === 'before' ? null : 'before'
                        )
                      }
                    >
                      <span className="collapsible-arrow">▶</span>
                      Before State
                    </div>
                    {expandedMutationId === 'before' && selectedMutation.before && (
                      <div className="collapsible-content expanded">
                        <pre
                          style={{
                            background: '#0a0a0a',
                            padding: '8px',
                            borderRadius: '3px',
                            fontSize: '11px',
                            overflow: 'auto',
                          }}
                        >
                          {JSON.stringify(selectedMutation.before, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>

                  <div className="collapsible">
                    <div
                      className="collapsible-header"
                      onClick={() =>
                        setExpandedMutationId(
                          expandedMutationId === 'after' ? null : 'after'
                        )
                      }
                    >
                      <span className="collapsible-arrow">▶</span>
                      After State
                    </div>
                    {expandedMutationId === 'after' && selectedMutation.after && (
                      <div className="collapsible-content expanded">
                        <pre
                          style={{
                            background: '#0a0a0a',
                            padding: '8px',
                            borderRadius: '3px',
                            fontSize: '11px',
                            overflow: 'auto',
                          }}
                        >
                          {JSON.stringify(selectedMutation.after, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="empty-state">Select a mutation to view details</div>
          )}
        </div>
      </div>
    </div>
  );
}
