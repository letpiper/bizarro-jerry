# Quick Start Guide - SimulatedWorld Dashboard

Get the dashboard running in 5 minutes.

## Prerequisites

- Node.js 16+ (`node --version`)
- npm 7+ (`npm --version`)

## Installation

### 1. Navigate to the UI directory

```bash
cd /tmp/simulated-world/ui
```

### 2. Install dependencies

```bash
npm install
```

This will install:
- Next.js (React framework)
- Zustand (state management)
- TypeScript
- WebSocket support
- All other dependencies

## Running the Dashboard

### Development Mode

```bash
./dev.sh
```

or manually:

```bash
npm run dev
```

This starts two servers:
- **Next.js:** http://localhost:3001 (main dashboard)
- **WebSocket:** ws://localhost:3002 (real-time updates)

The dashboard will open automatically in your browser. If not, navigate to:
```
http://localhost:3001
```

### Production Mode

```bash
./start.sh
```

or manually:

```bash
npm run build
npm start
```

## First Look

Once the dashboard loads, you'll see:

1. **Left Sidebar** - Navigation menu
   - Click on different views (Slack, Calendar, etc.)
   
2. **Main Content Area** - The selected view
   - Slack: Browse channels and messages
   - Calendar: View events and timeline
   - Trace Log: See all API calls
   - Mutations: Track state changes
   
3. **Topbar** - Dashboard status
   - Shows connection status (🟢 = connected)

## Viewing Sample Data

The dashboard comes with sample data:

- **Slack:** 3 channels with sample messages
- **Calendar:** 1 sample event
- **Users:** 3 sample users
- **Organization:** Ada

To see real data from SimulatedWorld:

### Option A: Connect to Real Backend

1. Make sure your SimulatedWorld backend is running (port 3000)
2. In a new terminal:
   ```bash
   cd /tmp/simulated-world
   npm run dev
   ```
3. Dashboard will automatically connect and load real data

### Option B: Mock WebSocket Server

The included mock server broadcasts sample updates:

```bash
# Terminal 2
cd /tmp/simulated-world/ui
node server.ts
```

This simulates API traces and mutations.

## Key Features to Try

### 1. Slack View
- Click on different channels in the left panel
- See messages in chronological order
- Search for specific messages
- View message reactions

### 2. Calendar View
- View events in day/week/month mode
- Click on events to see details
- See attendee information
- Check timezone info

### 3. Trace Log
- Watch API calls in real-time
- Filter by integration (Slack, Calendar, etc.)
- Inspect request/response bodies
- See response times

### 4. Mutation Log
- Track all state changes
- See before/after values
- Filter by mutation type
- Search by entity

### 5. State Inspector
- Browse all entities (Users, Teams, etc.)
- Export full state as JSON
- Inspect raw data structures

### 6. Scenarios
- Pre-built test scenarios
- Run scenarios with one click
- Watch execution in real-time
- See metrics as they update

### 7. Metrics Dashboard
- View evaluation scores
- Track 6 key metrics
- See overall pass/fail status
- Export results

## Connecting to Your Backend

To connect to your own SimulatedWorld backend:

1. Create `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local`:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
   NEXT_PUBLIC_WS_URL=ws://localhost:3002
   ```

3. Restart the dashboard:
   ```bash
   npm run dev
   ```

For production deployment, update `NEXT_PUBLIC_BACKEND_URL` to your production API URL.

## Troubleshooting

### Dashboard won't start

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### WebSocket connection fails

1. Check if server is running on port 3002:
   ```bash
   lsof -i :3002
   ```

2. Check firewall settings

3. Ensure backend exports WebSocket server

### No data showing

1. Check browser console (F12) for errors
2. Verify API endpoint is correct in `.env.local`
3. Check if backend is actually running
4. Monitor Network tab to see API responses

### Performance issues

1. Reduce message history (Trace Log/Mutation Log)
2. Close other tabs/applications
3. Check browser console for memory leaks
4. Try a different browser

## Command Reference

```bash
# Development
npm run dev              # Start with hot reload
./dev.sh                # Quick start script

# Production
npm run build           # Build for production
npm start               # Start production server
./start.sh              # Quick start script

# Cleanup
rm -rf .next            # Clear Next.js cache
rm -rf node_modules     # Remove dependencies
npm install             # Reinstall dependencies
```

## Project Structure

```
ui/
├── app/
│   ├── components/     # React components (views)
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Helper functions
│   ├── api/            # REST API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main page
├── types/              # TypeScript types
├── server.ts           # WebSocket server
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
├── next.config.js      # Next.js config
├── README.md           # Full documentation
├── INTEGRATION.md      # Backend integration guide
└── QUICKSTART.md       # This file
```

## Next Steps

1. **Read INTEGRATION.md** to connect your backend
2. **Check README.md** for detailed feature documentation
3. **Run scenarios** to see real-time updates
4. **Explore different views** to understand the data
5. **Export state** to understand data structures

## Tips & Tricks

### Dark Theme (Default)
The dashboard uses a dark theme by default. To customize:
- Edit `app/globals.css`
- Change color variables
- Restart the server

### Keyboard Navigation
- Use sidebar to jump between views
- Click on entities to expand details
- Search boxes are keyboard-accessible

### Real-Time Updates
- Watch the trace log update as API calls are made
- See mutations appear instantly as state changes
- Messages appear in Slack view in real-time

### Export Data
- In State Inspector, click "Export as JSON"
- Download current world state for analysis
- Useful for debugging or backups

## Getting Help

1. **Check browser console** (F12 → Console tab)
   - Look for error messages
   - Check network requests

2. **Review logs**
   - Check terminal where `npm run dev` runs
   - Look for error messages

3. **Read documentation**
   - INTEGRATION.md - Backend setup
   - README.md - Feature reference
   - types/index.ts - Data structures

4. **Test with sample data**
   - Verify sample data loads correctly
   - Use mock server for testing
   - Run sample scenarios

## What's Next?

Once you're comfortable with the dashboard:

1. **Integrate your backend** - Follow INTEGRATION.md
2. **Run real scenarios** - Execute tests against real integrations
3. **Monitor performance** - Track metrics and API calls
4. **Export results** - Save scenario results for analysis
5. **Customize views** - Add your own integration views

Enjoy exploring SimulatedWorld!
