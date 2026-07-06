'use client';

import { useState } from 'react';
import { useWorldState } from '../hooks/useWorldState';
import { formatJSON } from '../utils/formatting';

export function StateInspector() {
  const {
    organization,
    users,
    teams,
    slackChannels,
    slackMessages,
    calendarEvents,
    gmailMessages,
  } = useWorldState();

  const [expandedSection, setExpandedSection] = useState<string>('organization');
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    {
      id: 'organization',
      name: 'Organization',
      icon: '',
      count: organization ? 1 : 0,
      data: organization,
    },
    {
      id: 'users',
      name: 'Users',
      icon: '',
      count: users.length,
      data: users,
    },
    {
      id: 'teams',
      name: 'Teams',
      icon: '',
      count: teams.length,
      data: teams,
    },
    {
      id: 'slack-channels',
      name: 'Slack Channels',
      icon: '',
      count: slackChannels.length,
      data: slackChannels,
    },
    {
      id: 'slack-messages',
      name: 'Slack Messages',
      icon: '',
      count: slackMessages.length,
      data: slackMessages,
    },
    {
      id: 'calendar-events',
      name: 'Calendar Events',
      icon: '',
      count: calendarEvents.length,
      data: calendarEvents,
    },
    {
      id: 'gmail-messages',
      name: 'Gmail Messages',
      icon: '',
      count: gmailMessages.length,
      data: gmailMessages,
    },
  ];

  const exportState = () => {
    const state = {
      organization,
      users,
      teams,
      slackChannels,
      slackMessages,
      calendarEvents,
      gmailMessages,
      exportedAt: new Date().toISOString(),
    };

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(formatJSON(state)));
    element.setAttribute('download', `world-state-${Date.now()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #2a2a2a', background: '#1a1a1a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ margin: 0 }}>State Inspector</h2>
          <button className="btn-primary btn-small" onClick={exportState}>
            ⬇️ Export as JSON
          </button>
        </div>
        <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#808080' }}>
          Current state of all integrations and entities
        </p>

        <input
          type="text"
          placeholder="Search state..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            background: '#252525',
            border: '1px solid #2a2a2a',
            color: '#e0e0e0',
            borderRadius: '4px',
            fontSize: '13px',
          }}
        />
      </div>

      {/* State sections */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {sections.map((section) => (
          <div key={section.id} className="collapsible">
            <div
              className="collapsible-header"
              onClick={() =>
                setExpandedSection(
                  expandedSection === section.id ? '' : section.id
                )
              }
            >
              <span className="collapsible-arrow">▶</span>
              <span style={{ marginRight: '8px' }}>{section.icon}</span>
              <span>{section.name}</span>
              <span
                style={{
                  marginLeft: 'auto',
                  background: '#2a2a2a',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  color: '#808080',
                }}
              >
                {section.count}
              </span>
            </div>
            {expandedSection === section.id && section.data && (
              <div className="collapsible-content expanded">
                <pre
                  style={{
                    background: '#0a0a0a',
                    padding: '12px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    overflow: 'auto',
                    maxHeight: '600px',
                    color: '#a0a0a0',
                  }}
                >
                  {formatJSON(section.data)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
