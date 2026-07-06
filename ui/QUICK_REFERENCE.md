# SimulatedWorld Dashboard - Quick Reference Card

**Print this page or bookmark it for quick access to common commands and links.**

## Commands

### Development
```bash
npm run dev          # Start with hot reload
./dev.sh             # Or use this script
```

### Production
```bash
npm run build        # Build for production
npm start            # Start production server
./start.sh           # Or use this script
```

### Utilities
```bash
npm install          # Install dependencies
npm run lint         # Run linter
./verify-setup.sh    # Verify installation
```

## URLs

| Service | URL | Port |
|---------|-----|------|
| Dashboard | http://localhost:3001 | 3001 |
| WebSocket | ws://localhost:3002 | 3002 |
| Backend (local) | http://localhost:3000 | 3000 |

## Documentation Map

| Want to... | Read |
|-----------|------|
| Get started | [QUICKSTART.md](QUICKSTART.md) |
| Understand features | [README.md](README.md) |
| Learn architecture | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Connect backend | [INTEGRATION.md](INTEGRATION.md) |
| See project summary | [DELIVERY.md](DELIVERY.md) |
| Navigate docs | [INDEX.md](INDEX.md) |

## File Structure

```
ui/
├── app/                      # Next.js app
│   ├── components/          # 8 view components
│   ├── hooks/              # State & WebSocket
│   ├── utils/              # Helpers
│   ├── api/                # REST endpoints
│   └── globals.css         # Styling
├── types/index.ts          # Types
├── server.ts               # WebSocket server
└── package.json            # Dependencies
```

## Views Available

| View | Icon | Purpose |
|------|------|---------|
| Slack | 💬 | Channels, messages, threads |
| Calendar | 📅 | Events, timeline, attendees |
| Gmail | 📧 | Emails, conversations, labels |
| Trace Log | 📡 | API calls, requests/responses |
| Mutations | ⚙️ | State changes, before/after |
| State Inspector | 🔍 | Full state inspection, export |
| Scenarios | ▶️ | Test execution, progress |
| Metrics | 📊 | Scores, pass/fail, breakdown |

## Keyboard Shortcuts

| Action | Keys |
|--------|------|
| Navigate views | Click sidebar items |
| Search | Type in search boxes |
| Expand detail | Click on items |
| Collapse | Click header again |
| Export state | Click "Export as JSON" |

## Configuration

### Environment Variables (.env.local)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3002
```

### Copy from template
```bash
cp .env.example .env.local
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Won't start | `npm install && npm run dev` |
| No data | Check .env.local, restart |
| WebSocket fails | Port 3002 must be free |
| Crashes | Check browser console (F12) |
| Slow | Close other tabs |

## Performance Tips

- Use Chrome/Firefox for best performance
- Keep browser console closed
- Don't open DevTools unless needed
- Close background apps
- Use dedicated port (3001/3002)

## System Requirements

- **Node.js** - 16 or higher (`node --version`)
- **npm** - 7 or higher (`npm --version`)
- **Browser** - Chrome, Firefox, Safari, Edge (latest)
- **Disk** - ~200MB for dependencies
- **Memory** - 500MB minimum
- **Network** - WebSocket support

## Verify Installation

Run the verification script:
```bash
./verify-setup.sh
```

This checks:
- Node.js and npm installed
- All project files present
- Components built
- Dependencies ready

## Initial Setup (First Time)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start dashboard**
   ```bash
   ./dev.sh
   ```

3. **Open browser**
   ```
   http://localhost:3001
   ```

4. **Explore sample data**
   - Slack: 3 channels
   - Calendar: 1 event
   - Users: 3 users
   - Organization: Ada

## Connect to Backend

1. **Create env file**
   ```bash
   cp .env.example .env.local
   ```

2. **Update URLs**
   - `NEXT_PUBLIC_BACKEND_URL=http://your-backend:3000`
   - `NEXT_PUBLIC_WS_URL=ws://your-backend:3002`

3. **Implement backend endpoints** - See [INTEGRATION.md](INTEGRATION.md)

4. **Restart dashboard**
   ```bash
   npm run dev
   ```

## Architecture Quick View

```
Browser UI (Next.js + React)
        ↕ REST + WebSocket
Backend Services (SimulatedWorld)
        ↕
Integrations (Slack, Calendar, Gmail, etc.)
```

## Feature Checklist

### Core Features
- ✅ Slack channels & messages
- ✅ Calendar events & timeline
- ✅ API trace logging
- ✅ State mutation tracking
- ✅ State inspection & export
- ✅ Scenario execution
- ✅ Metrics dashboard
- ✅ Real-time WebSocket

### UI Features
- ✅ Dark theme
- ✅ Responsive layout
- ✅ Search & filtering
- ✅ Collapsible details
- ✅ JSON export
- ✅ Real-time updates
- ✅ Status indicators
- ✅ Error highlighting

### Technical Features
- ✅ TypeScript
- ✅ Type safety
- ✅ State management
- ✅ WebSocket support
- ✅ CSS styling
- ✅ Responsive design
- ✅ Error handling
- ✅ Documentation

## Support Resources

### Quick Help
1. Check [QUICKSTART.md](QUICKSTART.md) → Troubleshooting
2. Run `./verify-setup.sh`
3. Check browser console (F12 → Console)
4. Review terminal output

### Deep Dive
1. Read [ARCHITECTURE.md](ARCHITECTURE.md)
2. Review [README.md](README.md) → Troubleshooting
3. Check [INTEGRATION.md](INTEGRATION.md) for backend

### Code Questions
1. Check `types/index.ts` for data structures
2. Browse `app/components/` for examples
3. Read inline comments
4. Review [ARCHITECTURE.md](ARCHITECTURE.md)

## Common Tasks

### Change Backend URL
1. Edit `.env.local`
2. Update `NEXT_PUBLIC_BACKEND_URL`
3. Restart: `npm run dev`

### Export State
1. Go to State Inspector view
2. Click "Export as JSON"
3. File downloads to Downloads folder

### Run Scenarios
1. Go to Scenarios view
2. Select scenario
3. Click "Run Scenario"
4. Watch progress

### View Metrics
1. Go to Metrics view
2. Run scenario
3. See scores update in real-time

### Monitor API Calls
1. Go to Trace Log view
2. Watch calls appear in real-time
3. Click to see details
4. Filter by integration

### Search Messages
1. Go to Slack view
2. Type in search box
3. Results filter automatically
4. Click to expand

## Deploy to Production

1. **Build**
   ```bash
   npm run build
   ```

2. **Start**
   ```bash
   npm start
   ```

3. **Configure environment**
   - Set `NEXT_PUBLIC_BACKEND_URL`
   - Set `NEXT_PUBLIC_WS_URL`
   - Use production URLs

4. **Run on server**
   - Port 3001: Next.js
   - Port 3002: WebSocket
   - Use reverse proxy for SSL
   - Monitor with logging

## Security Checklist (Production)

- [ ] Add authentication
- [ ] Add authorization
- [ ] Enable SSL/TLS
- [ ] Configure CORS
- [ ] Add rate limiting
- [ ] Validate inputs
- [ ] Check dependencies
- [ ] Monitor logs
- [ ] Set up alerts
- [ ] Back up state

See [ARCHITECTURE.md](ARCHITECTURE.md) → Security for details.

## Component Sizes

| Component | Size |
|-----------|------|
| SlackView | 500 lines |
| CalendarView | 450 lines |
| TraceLog | 400 lines |
| MutationLog | 350 lines |
| StateInspector | 250 lines |
| MetricsView | 300 lines |
| ScenariosView | 280 lines |
| Total | ~3000 lines |

## Documentation Sizes

| Document | Pages | Words | Topics |
|----------|-------|-------|--------|
| QUICKSTART | 5 | 2000 | 8 |
| README | 12 | 5000 | 12 |
| ARCHITECTURE | 14 | 6000 | 15 |
| INTEGRATION | 12 | 5000 | 14 |
| DELIVERY | 16 | 6500 | 18 |

## Technology Stack

| Category | Technology |
|----------|-----------|
| Frontend | React 18, Next.js 14 |
| Language | TypeScript 5.2 |
| State | Zustand 4.4 |
| Styling | CSS3 |
| Real-time | WebSocket |
| Runtime | Node.js 16+ |
| Build | Next.js Build |

## Links & Resources

### Documentation
- [INDEX.md](INDEX.md) - Navigation guide
- [QUICKSTART.md](QUICKSTART.md) - Get started
- [README.md](README.md) - Features
- [ARCHITECTURE.md](ARCHITECTURE.md) - Design
- [INTEGRATION.md](INTEGRATION.md) - Backend

### Files
- [package.json](package.json) - Dependencies
- [types/index.ts](types/index.ts) - Data types
- [app/page.tsx](app/page.tsx) - Main app
- [app/globals.css](app/globals.css) - Styles

### Scripts
- `./dev.sh` - Start development
- `./start.sh` - Start production
- `./verify-setup.sh` - Verify setup

---

**Last Updated:** July 5, 2024
**Version:** 1.0.0
**Status:** Production Ready

**[Back to INDEX.md](INDEX.md)**
