# SimulatedWorld Dashboard UI

A comprehensive web UI for observing and controlling the SimulatedWorld simulation engine. Provides real-time visibility into all integrations, perfect observability of state changes, and scenario execution monitoring.

## Features

### Core Dashboard Views

- **Slack Integration** - View all channels (public, private, DMs), messages, reactions, and threads in one place
- **Calendar Integration** - Visual timeline of events with attendees, timezone conversion, and conflict detection
- **Gmail Integration** - Email inbox, threads, drafts, and labels
- **Trace Log** - Every API request to integrations with full request/response details
- **Mutation Log** - Every state change across all integrations with before/after comparison
- **State Inspector** - Complete current state of all entities in JSON format
- **Scenarios** - Pre-built test scenarios with real-time execution and metrics
- **Metrics Dashboard** - Evaluation scores and performance metrics

### Real-Time Features

- WebSocket connection for live updates
- Real-time trace logging as API calls happen
- Live mutation tracking
- Scenario progress tracking
- Message streaming as Slack posts
- Event creation notifications

### Observability

- Master user perspective (can see ALL channels/events/messages)
- Full JSON inspection of any entity
- Request/response body inspection
- Error highlighting and filtering
- Timeline scrubbing (pause/play/step)
- Export state as JSON

## Installation

```bash
cd ui
npm install
```

## Development

```bash
npm run dev
```

This starts:
- Next.js app on http://localhost:3001
- WebSocket server on ws://localhost:3002

The dashboard will be available at http://localhost:3001

## Building for Production

```bash
npm run build
npm start
```

## Architecture

### Frontend (Next.js + React)
- `/app/page.tsx` - Main dashboard component
- `/app/components/` - View components (SlackView, CalendarView, etc.)
- `/app/hooks/` - Custom hooks (useWorldState, useWebSocket)
- `/app/utils/` - Utility functions (formatting, filtering)
- `/app/api/` - REST endpoints

### Backend (WebSocket Server)
- `/server.ts` - Standalone WebSocket server
- Broadcasts real-time updates to connected clients
- Connects to SimulatedWorld for live data

## Component Details

### SlackView
- List all channels (public, private, DMs, group DMs)
- Show messages in chronological order
- User profiles with avatars and timezones
- Message reactions and thread conversations
- User presence status
- Real-time message updates

### CalendarView
- Visual timeline with hour-by-hour breakdown
- Color-coded events by attendee
- Busy/free blocks and conflict visualization
- Event details with attendees and organizer
- Timezone conversion
- Multiple view modes (day, week, month)

### TraceLog
- Every API request with method, URL, status
- Request/response bodies (collapsible)
- Error highlighting and search
- Filter by integration and status
- Request duration metrics
- Live stream as requests happen

### MutationLog
- Every state change (created, updated, deleted)
- Before/after state comparison
- Integration and entity filtering
- Timestamp and user tracking
- Type-based filtering

### StateInspector
- Current state of all integrations
- User list with profiles
- Team structure
- Full JSON view (collapsible)
- Export state as JSON download

### MetricsView
- Real-time metric updates during scenario execution
- Six evaluation metrics:
  - Availability
  - Timezone
  - Conflict Resolution
  - Working Hours
  - Communication
  - Performance
- Overall score and pass/fail indicator
- Metric breakdown with weights

## State Management

Uses Zustand for state management:
- `useWorldState()` - Global state for all world data
- Automatically synced with WebSocket updates
- Persists across navigation

## API Endpoints

### GET /api/state
Returns current world state snapshot:
- Organization info
- Users
- Teams
- Slack channels
- Calendar events
- Gmail messages
- etc.

### WebSocket ws://localhost:3002
Real-time updates:
- `type: 'trace'` - API calls
- `type: 'mutation'` - State changes
- `type: 'slack_message'` - New messages
- `type: 'calendar_event'` - New events
- `type: 'gmail_message'` - New emails

## Styling

Dark theme with:
- Dark gray background (#0f0f0f)
- Light text (#e0e0e0)
- Accent colors by integration
- Smooth transitions
- Responsive layout

## Key Files

- `app/globals.css` - Global styles and layout
- `app/hooks/useWorldState.ts` - State management
- `app/hooks/useWebSocket.ts` - WebSocket connection
- `types/index.ts` - TypeScript types
- `app/utils/formatting.ts` - Helper functions

## Performance

- Virtual scrolling for large lists (future optimization)
- Batch WebSocket messages every 100ms
- Efficient React re-renders with Zustand
- Responsive design for large screens
- Lazy loading of components

## Future Enhancements

- [ ] Timeline/replay functionality
- [ ] Advanced filtering and search
- [ ] Metric trending and comparisons
- [ ] Export scenarios and results
- [ ] API client for controlling scenarios
- [ ] WebSocket reconnection with message buffering
- [ ] Dark/light theme toggle
- [ ] Customizable dashboard layout
- [ ] Integration with all 12 integration types
- [ ] Performance optimization (virtualization, pagination)

## Troubleshooting

### WebSocket connection fails
- Ensure WebSocket server is running on port 3002
- Check firewall settings
- Verify localhost is accessible

### Components not updating
- Check browser console for errors
- Verify WebSocket connection status (green dot in topbar)
- Clear browser cache and reload

### Performance issues
- Monitor Network tab in DevTools
- Check for large message payloads
- Reduce update frequency if needed

## Contributing

When adding new views:
1. Create component in `/app/components/`
2. Add state updates to `useWorldState` if needed
3. Update navigation in `Sidebar.tsx`
4. Add new view case to `page.tsx`

## License

MIT
