'use client';

import { useState, useMemo } from 'react';
import { useWorldState } from '../hooks/useWorldState';
import { formatDateTime, formatTime } from '../utils/formatting';
import type { CalendarEvent } from '../../types';

export function CalendarView() {
  const { calendarEvents, users } = useWorldState();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  const dayStart = new Date(selectedDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(selectedDate);
  dayEnd.setHours(23, 59, 59, 999);

  const todayEvents = useMemo(() => {
    return calendarEvents.filter((event) => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      return eventStart <= dayEnd && eventEnd >= dayStart;
    });
  }, [calendarEvents, dayStart, dayEnd]);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventPosition = (event: CalendarEvent) => {
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);
    const dayStartTime = new Date(dayStart).getTime();
    const startMinutes = (eventStart.getTime() - dayStartTime) / (1000 * 60);
    const durationMinutes = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60);

    return {
      top: `${(startMinutes / 60) * 100}%`,
      height: `${(durationMinutes / 1440) * 100}%`,
    };
  };

  const getUserName = (userId: string): string => {
    const user = users.find((u) => u.id === userId);
    return user?.name || userId;
  };

  const getEventColor = (index: number): string => {
    const colors = [
      '#4285f4', '#ea4335', '#34a853', '#fbbc04',
      '#ab47bc', '#00acc1', '#ff7043', '#7cb342'
    ];
    return colors[index % colors.length];
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar */}
      <div style={{ padding: '16px', borderBottom: '1px solid #2a2a2a', background: '#1a1a1a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ margin: 0 }}>Calendar</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn-secondary btn-small ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
            <button
              className={`btn-secondary btn-small ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button
              className={`btn-secondary btn-small ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            className="btn-secondary btn-small"
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - 1);
              setSelectedDate(newDate);
            }}
          >
            ← Previous
          </button>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            style={{
              padding: '6px 8px',
              background: '#252525',
              border: '1px solid #2a2a2a',
              color: '#e0e0e0',
              borderRadius: '4px',
            }}
          />
          <button
            className="btn-secondary btn-small"
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + 1);
              setSelectedDate(newDate);
            }}
          >
            Next →
          </button>
          <button
            className="btn-secondary btn-small"
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Calendar grid */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Timeline header */}
          <div style={{ display: 'flex', minHeight: '40px', borderBottom: '1px solid #2a2a2a' }}>
            <div style={{ width: '60px', flexShrink: 0, padding: '8px', fontSize: '12px', color: '#606060', borderRight: '1px solid #2a2a2a' }}>
              Time
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)' }}>
              {hours.map((hour) => (
                <div
                  key={hour}
                  style={{
                    padding: '8px',
                    fontSize: '11px',
                    color: '#606060',
                    borderRight: '1px solid #2a2a2a',
                    textAlign: 'center',
                  }}
                >
                  {hour}:00
                </div>
              ))}
            </div>
          </div>

          {/* Timeline content */}
          <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
            <div style={{ width: '60px', flexShrink: 0, borderRight: '1px solid #2a2a2a' }}>
              {hours.map((hour) => (
                <div
                  key={hour}
                  style={{
                    height: '60px',
                    borderBottom: '1px solid #2a2a2a',
                    fontSize: '11px',
                    color: '#606060',
                    padding: '4px',
                    textAlign: 'right',
                  }}
                >
                  {hour}:00
                </div>
              ))}
            </div>

            <div style={{ flex: 1, position: 'relative', borderLeft: '1px solid #2a2a2a' }}>
              {hours.map((hour) => (
                <div
                  key={`bg-${hour}`}
                  style={{
                    height: '60px',
                    borderBottom: '1px solid #2a2a2a',
                    background: hour % 2 === 0 ? 'transparent' : '#0a0a0a',
                  }}
                />
              ))}

              {/* Events */}
              {todayEvents.map((event, index) => (
                <div
                  key={event.id}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    right: '10px',
                    top: getEventPosition(event).top,
                    height: getEventPosition(event).height,
                    background: getEventColor(index),
                    borderRadius: '4px',
                    padding: '8px',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    minHeight: '40px',
                  }}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>
                    {event.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Event details sidebar */}
        <div style={{ width: '300px', borderLeft: '1px solid #2a2a2a', overflow: 'auto', padding: '16px' }}>
          {selectedEvent ? (
            <div>
              <h3 style={{ marginBottom: '12px' }}>{selectedEvent.title}</h3>
              <div style={{ background: '#252525', padding: '12px', borderRadius: '4px', marginBottom: '12px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#808080', fontSize: '12px' }}>Date & Time</span>
                  <div style={{ marginTop: '4px', fontSize: '14px' }}>
                    {formatDateTime(selectedEvent.startTime)} →
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    {formatDateTime(selectedEvent.endTime)}
                  </div>
                </div>

                {selectedEvent.location && (
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: '#808080', fontSize: '12px' }}>Location</span>
                    <div style={{ marginTop: '4px', fontSize: '14px' }}>
                      {selectedEvent.location}
                    </div>
                  </div>
                )}

                {selectedEvent.timezone && (
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: '#808080', fontSize: '12px' }}>Timezone</span>
                    <div style={{ marginTop: '4px', fontSize: '14px' }}>
                      {selectedEvent.timezone}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: '8px' }}>
                  <span style={{ color: '#808080', fontSize: '12px' }}>Attendees</span>
                  <div style={{ marginTop: '8px' }}>
                    {selectedEvent.attendees.map((attendeeId) => (
                      <div
                        key={attendeeId}
                        style={{
                          padding: '6px 8px',
                          background: '#1a1a1a',
                          marginBottom: '4px',
                          borderRadius: '3px',
                          fontSize: '13px',
                        }}
                      >
                        {getUserName(attendeeId)}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedEvent.organizer && (
                  <div>
                    <span style={{ color: '#808080', fontSize: '12px' }}>Organizer</span>
                    <div style={{ marginTop: '4px', fontSize: '14px' }}>
                      {getUserName(selectedEvent.organizer)}
                    </div>
                  </div>
                )}
              </div>

              {selectedEvent.conferenceUrl && (
                <a
                  href={selectedEvent.conferenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ width: '100%', textAlign: 'center', display: 'block' }}
                >
                  Join Conference
                </a>
              )}
            </div>
          ) : (
            <div className="empty-state">
              Select an event to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
