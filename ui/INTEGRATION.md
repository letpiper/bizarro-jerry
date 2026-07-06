# SimulatedWorld UI Integration Guide

This document explains how to integrate the web UI with the SimulatedWorld simulation engine.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SimulatedWorld Backend                    │
│  (Node.js/TypeScript - Simulation Engine & Integrations)    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST API + WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              SimulatedWorld Dashboard UI                      │
│  (Next.js/React - Web Interface & Real-time Visualization) │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                        Web Browser
```

## Backend Integration Points

### 1. REST API Endpoints

The backend should expose the following endpoints:

#### GET /api/world/state
Returns the current complete world state.

**Response:**
```json
{
  "organization": {
    "id": "org-1",
    "name": "Ada",
    "domain": "ada.cx",
    "teams": []
  },
  "users": [
    {
      "id": "user-1",
      "name": "Alice",
      "email": "alice@ada.cx",
      "timezone": "America/Toronto",
      "status": "active"
    }
  ],
  "teams": [],
  "slackChannels": [...],
  "slackMessages": [...],
  "calendarEvents": [...],
  "gmailMessages": [...],
  "traces": [],
  "mutations": []
}
```

#### POST /api/scenarios/:id/run
Start executing a scenario.

**Request:**
```json
{
  "scenarioId": "scenario-1"
}
```

**Response:**
```json
{
  "resultId": "result-1",
  "status": "running",
  "progress": 0,
  "startTime": "2024-01-01T00:00:00Z"
}
```

#### GET /api/scenarios/:id/results
Get scenario execution result.

**Response:**
```json
{
  "id": "result-1",
  "scenarioId": "scenario-1",
  "status": "completed",
  "progress": 100,
  "metrics": {
    "availability": 0.95,
    "timezone": 0.85,
    "conflict": 0.9,
    "workingHours": 0.88,
    "communication": 0.92,
    "performance": 0.94,
    "overallScore": 0.909,
    "passed": true
  },
  "startTime": "2024-01-01T00:00:00Z",
  "endTime": "2024-01-01T00:05:00Z"
}
```

### 2. WebSocket Server

The backend should run a WebSocket server on a separate port (default: 3002).

**Events Sent:**

```typescript
// API call trace
{
  type: 'trace',
  payload: {
    id: 'trace-1',
    timestamp: '2024-01-01T00:00:00Z',
    integration: 'slack',
    request: {
      method: 'GET',
      url: 'https://slack.com/api/conversations.list',
      headers: { ... },
      body: null
    },
    response: {
      status: 200,
      headers: { ... },
      body: { ok: true, channels: [...] },
      duration: 150
    }
  }
}

// State mutation
{
  type: 'mutation',
  payload: {
    id: 'mutation-1',
    timestamp: '2024-01-01T00:00:00Z',
    integration: 'slack',
    type: 'created',
    entity: 'SlackMessage',
    entityId: 'msg-123',
    before: null,
    after: { id: 'msg-123', text: 'Hello', ... },
    userId: 'user-1'
  }
}

// Real-time message
{
  type: 'slack_message',
  payload: { id: 'msg-1', channelId: '...', userId: '...', text: '...' }
}

// Calendar event
{
  type: 'calendar_event',
  payload: { id: 'event-1', title: '...', startTime: '...', endTime: '...' }
}

// Email message
{
  type: 'gmail_message',
  payload: { id: 'msg-1', from: '...', to: [...], subject: '...' }
}
```

## Backend Implementation

### Setting Up the WebSocket Server

```typescript
// server.ts in SimulatedWorld
import WebSocket from 'ws';
import http from 'http';
import { SimulatedWorld, Tracer, MutationLog } from './src/index';

const PORT = 3002;
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Initialize SimulatedWorld
const world = new SimulatedWorld({ ... });
const tracer = world.tracer;
const mutations = world.mutations;

// Forward traces to WebSocket clients
tracer.on('trace', (trace) => {
  broadcast({
    type: 'trace',
    payload: trace
  });
});

// Forward mutations to WebSocket clients
mutations.on('mutation', (mutation) => {
  broadcast({
    type: 'mutation',
    payload: mutation
  });
});

// Also forward high-level events
world.on('slack_message', (message) => {
  broadcast({
    type: 'slack_message',
    payload: message
  });
});

world.on('calendar_event', (event) => {
  broadcast({
    type: 'calendar_event',
    payload: event
  });
});

function broadcast(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

server.listen(PORT);
```

### Exposing State via REST API

```typescript
// api/world/state.ts
import { world } from './server';

export async function GET() {
  return {
    organization: world.organization,
    users: world.users,
    teams: world.teams,
    slackChannels: world.slack.channels,
    slackMessages: world.slack.messages,
    calendarEvents: world.calendar.events,
    gmailMessages: world.gmail.messages,
    traces: world.tracer.getTraces(),
    mutations: world.mutations.getMutations(),
  };
}
```

## Frontend Configuration

### 1. Update API Endpoint

Edit `app/api/state/route.ts` to point to your backend:

```typescript
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export async function GET() {
  const response = await fetch(`${BACKEND_URL}/api/world/state`);
  return response.json();
}
```

### 2. Update WebSocket URL

Edit `app/hooks/useWebSocket.ts`:

```typescript
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3002';
wsRef.current = new WebSocket(WS_URL);
```

### 3. Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3002
```

For production:

```bash
NEXT_PUBLIC_BACKEND_URL=https://api.example.com
NEXT_PUBLIC_WS_URL=wss://api.example.com
```

## Running Together

### Development

```bash
# Terminal 1: Start SimulatedWorld backend
cd /tmp/simulated-world
npm run dev

# Terminal 2: Start Dashboard UI
cd /tmp/simulated-world/ui
npm run dev
```

Dashboard will be available at http://localhost:3001

### Production

```bash
# Build both
cd /tmp/simulated-world
npm run build

cd /tmp/simulated-world/ui
npm run build

# Run both
concurrently "npm start" "cd ui && npm start"
```

## Data Flow Example

### Scenario Execution Flow

1. **User clicks "Run Scenario" in UI**
2. **UI sends request:** POST /api/scenarios/1/run
3. **Backend starts scenario execution:**
   - Creates mutation for scenario start
   - Begins scenario steps
4. **Backend broadcasts mutations:**
   - WebSocket: mutation event
   - UI receives and updates state
5. **Backend executes Slack API calls:**
   - HTTP interceptor captures trace
   - WebSocket: trace event
   - UI updates Trace Log
6. **Backend posts Slack message:**
   - Mutation recorded
   - Message added to state
   - WebSocket: slack_message event
   - UI updates Slack view in real-time
7. **Backend calculates metrics:**
   - WebSocket: metrics event
   - UI updates metrics dashboard
8. **Scenario completes:**
   - Final status broadcasted
   - Results available via GET /api/scenarios/1/results

## Testing Integration

### Mock WebSocket Server

For testing without the full backend, use the included mock server:

```bash
node /tmp/simulated-world/ui/server.ts
```

This broadcasts sample traces and mutations.

### Test with cURL

```bash
# Test REST API
curl http://localhost:3000/api/world/state

# Test WebSocket
wscat -c ws://localhost:3002
```

## Troubleshooting

### WebSocket Connection Refused
- Ensure WebSocket server is running on port 3002
- Check firewall settings
- Verify CORS headers if using different domain

### Missing Data in UI
- Check backend is exporting all required fields
- Verify REST API response format matches types
- Check browser console for parsing errors

### Traces Not Appearing
- Verify tracer is hooked into HTTP client
- Check WebSocket is broadcasting trace events
- Monitor network tab for WebSocket messages

### Mutations Not Updating
- Verify mutation log is recording changes
- Check mutation event is being broadcast
- Verify UI is handling mutation events

## Performance Considerations

### High-Volume Scenarios

For scenarios generating many traces/mutations:

1. **Batch WebSocket messages** - Combine multiple events before sending
2. **Compress data** - Consider gzip compression
3. **Pagination** - Limit initial load of old traces/mutations
4. **Filtering** - Allow server-side filtering to reduce payload

### Large Message Payloads

If request/response bodies are large:

1. **Truncate in UI** - Show only first 1KB
2. **Lazy load** - Fetch full body on demand
3. **Compression** - Compress request/response bodies
4. **Streaming** - Stream large responses

## Next Steps

1. Implement WebSocket server in SimulatedWorld backend
2. Expose REST API endpoints
3. Deploy both services
4. Configure environment variables
5. Test end-to-end scenario execution

## API Reference

For complete API documentation, see:
- `src/core/types.ts` - Type definitions
- `src/observability/` - Tracing and mutation types
- `src/scenarios/` - Scenario execution types

## Support

For issues or questions:
1. Check browser console for errors
2. Monitor WebSocket connection status
3. Review network tab for failed requests
4. Check backend logs for errors
