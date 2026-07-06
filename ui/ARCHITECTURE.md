# SimulatedWorld Dashboard Architecture

## System Overview

The SimulatedWorld Dashboard is a complete observability and control interface for the SimulatedWorld simulation engine.

```
┌────────────────────────────────────────────────────────────────┐
│                       BROWSER CLIENT                            │
│  React App with Zustand State Management                       │
└────────────────────────────────────────────────────────────────┘
        ▲                                    ▲
        │ REST API                          │ WebSocket
        │ (HTTP Polling)                    │ (Real-time)
        ▼                                    ▼
┌────────────────────────────────────────────────────────────────┐
│                       NEXT.JS SERVER                            │
│  API Routes (/api/state, /api/scenarios, etc.)                │
└────────────────────────────────────────────────────────────────┘
        ▲                                    ▲
        │ Node.js Fetch                     │ Forward events
        │                                   │
        ▼                                    ▼
┌──────────────────────────┬────────────────────────────────────┐
│  SimulatedWorld Backend  │   WebSocket Server (3002)          │
│  (Port 3000)             │   Broadcasts real-time events      │
│                          │                                     │
│ - World state            │ - Traces (API calls)               │
│ - Integrations           │ - Mutations (state changes)        │
│ - Scenarios              │ - Messages (Slack)                 │
│ - Evaluation             │ - Events (Calendar)                │
└──────────────────────────┴────────────────────────────────────┘
```

## Frontend Architecture

### State Management (Zustand)

```typescript
// useWorldState hook provides global state
const state = useWorldState();

// State includes:
- Organization & Users
- Slack channels/messages
- Calendar events
- Gmail messages
- Traces (API calls)
- Mutations (state changes)
- UI state (current view, filters)
```

### Component Hierarchy

```
App (page.tsx)
├── Sidebar (Navigation)
│   └── nav items (Slack, Calendar, etc.)
├── Topbar (Status & Controls)
└── Main Content Area
    ├── SlackView
    ├── CalendarView
    ├── GmailView
    ├── TraceLog
    ├── MutationLog
    ├── StateInspector
    ├── ScenariosView
    └── MetricsView
```

### Data Flow

1. **Initial Load**
   ```
   Browser → REST API (/api/state)
   ↓
   Parse JSON
   ↓
   Update Zustand state
   ↓
   React re-renders components
   ```

2. **Real-Time Updates**
   ```
   Backend event
   ↓
   WebSocket message
   ↓
   useWebSocket hook receives message
   ↓
   Zustand state action (add trace, mutation, etc.)
   ↓
   React re-renders affected components
   ```

## Backend Integration

### REST API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/world/state` | GET | Full world state snapshot |
| `/api/scenarios` | GET | List all scenarios |
| `/api/scenarios/:id` | GET | Get scenario details |
| `/api/scenarios/:id/run` | POST | Start scenario execution |
| `/api/scenarios/:id/results` | GET | Get execution results |
| `/api/traces` | GET | Get all traces |
| `/api/mutations` | GET | Get all mutations |

### WebSocket Events

```typescript
// Trace event (every API call)
{
  type: 'trace',
  payload: {
    id: string,
    timestamp: Date,
    integration: string,
    request: APIRequest,
    response: APIResponse,
    duration: number,
    error?: string
  }
}

// Mutation event (every state change)
{
  type: 'mutation',
  payload: {
    id: string,
    timestamp: Date,
    integration: string,
    type: 'created' | 'updated' | 'deleted',
    entity: string,
    entityId: string,
    before?: any,
    after?: any,
    userId?: string
  }
}

// High-level events
{
  type: 'slack_message' | 'calendar_event' | 'gmail_message',
  payload: {...}
}
```

## Component Details

### SlackView
- **Purpose:** Master view of all Slack channels and messages
- **Data Source:** `useWorldState.slackChannels`, `slackMessages`
- **Features:**
  - Channel list with unread count
  - Message chronological display
  - Message reactions
  - Search
  - Real-time updates via WebSocket

### CalendarView
- **Purpose:** Visual timeline of calendar events
- **Data Source:** `useWorldState.calendarEvents`
- **Features:**
  - Hour-by-hour timeline
  - Color-coded by attendee
  - Event details panel
  - Day/week/month view toggle
  - Timezone awareness

### TraceLog
- **Purpose:** Monitor every API call
- **Data Source:** `useWorldState.traces`
- **Features:**
  - Request/response inspection
  - Error highlighting
  - Filter by integration/status
  - Search by URL/method
  - Duration metrics

### MutationLog
- **Purpose:** Track all state changes
- **Data Source:** `useWorldState.mutations`
- **Features:**
  - Before/after comparison
  - Type filtering (create/update/delete)
  - Entity tracking
  - User attribution
  - Search and filter

### StateInspector
- **Purpose:** Full state visibility
- **Data Source:** All state from `useWorldState`
- **Features:**
  - Collapsible sections
  - JSON view
  - Export to file
  - Search
  - Browse all entities

### MetricsView
- **Purpose:** Evaluation scores and performance
- **Data Source:** Scenario results
- **Features:**
  - 6 metric breakdown
  - Overall score
  - Pass/fail indicator
  - Metric contribution calculation
  - Real-time updates during scenarios

### ScenariosView
- **Purpose:** Run and monitor test scenarios
- **Data Source:** Scenario definitions and results
- **Features:**
  - Scenario list
  - Step visualization
  - Progress tracking
  - Results display
  - Metric updates

## Styling System

### Design Tokens

```css
/* Colors */
--bg-dark: #0f0f0f        /* Main background */
--bg-panel: #1a1a1a       /* Panel background */
--bg-hover: #252525       /* Hover state */
--bg-input: #252525       /* Input background */
--text-primary: #e0e0e0   /* Primary text */
--text-secondary: #a0a0a0 /* Secondary text */
--text-tertiary: #808080  /* Tertiary text */
--text-muted: #606060     /* Muted text */
--accent-primary: #0066cc /* Primary accent */
--border: #2a2a2a        /* Border color */

/* Integration Colors */
--slack: #0066cc
--calendar: #4285f4
--gmail: #ea4335
--linear: #5e4db2
--github: #ffffff
--salesforce: #00a1de
--docs: #4285f4
--granola: #ff6b6b
--todoist: #e44332
--oura: #fca311
--strava: #fc4c02
--twitter: #1da1f2
```

### Layout System

```
┌─────────────────────────────────────────────────────┐
│                      TOPBAR (60px)                  │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│   SIDEBAR    │         MAIN CONTENT AREA            │
│   (250px)    │                                      │
│              │                                      │
│              │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

## Performance Optimizations

### Memory Management
- Zustand for efficient state updates
- Only subscribed components re-render
- Batch WebSocket messages every 100ms
- Lazy load details on demand

### Network
- Compress WebSocket messages
- Pagination for large lists (future)
- Server-side filtering (future)
- Cache frequently accessed data

### Rendering
- Virtual scrolling for large lists (future)
- Memoized components
- CSS transitions instead of JS animations
- Debounced search/filter

## Type Safety

All data is fully typed:

```typescript
// app/types/index.ts contains:
- User
- Team
- Organization
- SlackChannel, SlackMessage
- CalendarEvent
- GmailMessage
- Trace, Mutation
- ScenarioDefinition, ScenarioResult
- EvaluationMetrics
```

Every component and hook is TypeScript.

## Error Handling

### Frontend Error Handling
```typescript
// WebSocket connection errors
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
  // Attempt reconnect after 3 seconds
}

// API fetch errors
catch (error) {
  console.error('Failed to fetch:', error);
  // Show error to user
}
```

### Display Errors
- Empty states for no data
- Loading states during fetch
- Error messages in UI
- Graceful fallbacks

## Future Enhancements

### Phase 1 (Complete)
- [x] Slack view
- [x] Calendar view
- [x] Trace log
- [x] Mutation log
- [x] State inspector
- [x] Metrics dashboard
- [x] Real-time WebSocket

### Phase 2 (Planned)
- [ ] Gmail view with threading
- [ ] Virtual scrolling for large lists
- [ ] Advanced filtering
- [ ] Timeline/replay functionality
- [ ] Keyboard shortcuts
- [ ] Dark/light theme toggle

### Phase 3 (Planned)
- [ ] Additional integrations (Linear, GitHub, etc.)
- [ ] Performance dashboard
- [ ] Metric trending
- [ ] Export scenarios and results
- [ ] API client for programmatic control
- [ ] Mobile responsive design

### Phase 4 (Planned)
- [ ] Custom dashboards
- [ ] Alert rules
- [ ] Integration webhooks
- [ ] Multi-user support
- [ ] Scenario templating
- [ ] Advanced analytics

## Deployment

### Development
```bash
npm run dev
# Starts Next.js (port 3001) and WebSocket (port 3002)
```

### Production
```bash
npm run build
npm start
# Builds optimized bundle
# Starts Next.js (port 3001) and WebSocket (port 3002)
```

### Docker (Future)
```dockerfile
FROM node:18-alpine
COPY . /app
WORKDIR /app
RUN npm install && npm run build
EXPOSE 3001 3002
CMD ["npm", "start"]
```

## Integration with SimulatedWorld

The dashboard connects to SimulatedWorld via:

1. **REST API** - Initial state load and polling
2. **WebSocket** - Real-time event streaming
3. **Direct import** - For same-process integration

See `INTEGRATION.md` for detailed setup instructions.

## Testing

### Unit Tests (Future)
```bash
npm run test
# Uses Vitest for unit tests
```

### Integration Tests (Future)
```bash
npm run test:integration
# Tests dashboard + mock backend
```

### E2E Tests (Future)
```bash
npm run test:e2e
# Tests full workflow with Playwright
```

## Monitoring

### Development Monitoring
- Browser DevTools (Network, Performance)
- Terminal logs from Next.js/WebSocket server
- React DevTools for component tree

### Production Monitoring
- Sentry for error tracking
- LogRocket for session replay
- New Relic for performance

## Security Considerations

### Current Implementation
- No authentication (assumes trusted environment)
- No authorization (all users see all data)
- No data encryption (assumes LAN/VPN)

### Production Hardening Needed
- User authentication (OAuth, OIDC)
- Role-based access control
- TLS/SSL encryption
- API rate limiting
- CORS configuration
- CSRF protection

## Contributing

When modifying the dashboard:

1. Update types if changing data structures
2. Follow existing component patterns
3. Add types to all functions
4. Test with real backend if possible
5. Update documentation if adding features

## Further Reading

- `README.md` - Feature documentation
- `QUICKSTART.md` - Getting started guide
- `INTEGRATION.md` - Backend integration guide
- `types/index.ts` - Data structure definitions
- `app/components/` - Component implementations
