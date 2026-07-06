# SimulatedWorld Setup & Deployment Guide

## For Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone or navigate to simulated-world
cd simulated-world

# Install UI dependencies
cd ui
npm install

# Start development server
npm run dev
```

Dashboard runs at `http://localhost:3001`

### Development Workflow

1. **Dashboard**
   - Open http://localhost:3001
   - Toggle between personas (top right avatar)
   - View their calendar, Slack, email, etc.

2. **Scenarios**
   - Run executable tests:
   ```bash
   cd ..
   node ada-core-5-scenarios.js
   ```
   - Output shows all 5 scenarios with rubrics + expected outcomes

3. **Make Changes**
   - Modify UI components in `ui/app/components/`
   - Update personas in `ui/app/api/state/route.ts`
   - Changes hot-reload in development

4. **Test**
   - Dashboard reflects new personas immediately
   - Scenarios always show canonical definitions

---

## For Publishing to Piper Repo

### Step 1: Prepare Repository

```bash
# Navigate to Piper repo root
cd /path/to/piper

# Create simulated-world directory
mkdir -p simulated-world

# Copy files
cp -r /tmp/simulated-world/* simulated-world/

# Verify structure
ls -la simulated-world/
# Should show: README.md, .gitignore, ada-core-5-scenarios.js, ui/, etc.
```

### Step 2: Create Root Package (Optional)

Create `simulated-world/package.json` for npm scripts:

```json
{
  "name": "@piper/simulated-world",
  "version": "1.0.0",
  "description": "Piper Test Harness - SimulatedWorld",
  "scripts": {
    "dev": "cd ui && npm run dev",
    "build": "cd ui && npm run build",
    "start": "cd ui && npm run start",
    "test": "node ada-core-5-scenarios.js",
    "test:full": "npm run test && npm run build && npm run start"
  }
}
```

### Step 3: Commit to Git

```bash
cd piper
git add simulated-world/
git commit -m "Add SimulatedWorld: Core 5 personas test harness

- 5 executable scenarios (Mike, Goz, Jason, Judy, Long)
- Next.js dashboard with persona selector
- Grounded in real Ada workflows (from Slack data)
- Production-ready for Piper validation

Run locally: npm run dev
Run scenarios: npm test
See README.md for details"

git push origin main
```

### Step 4: Deploy

#### Option A: AdaCities (Ada Internal)

```bash
cd simulated-world

# Install AdaCities MCP if needed
claude mcp add adacities

# Deploy dashboard
npx adacities deploy --site simulated-world-piper \
  --entry "ui/app/page.tsx" \
  --build "npm run build"
```

Then access: `https://simulated-world-piper.adacities.com`

#### Option B: Vercel (Recommended)

```bash
cd simulated-world/ui

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel deploy --prod --name simulated-world-piper
```

Then access: `https://simulated-world-piper.vercel.app`

#### Option C: Self-Hosted (Docker)

Create `simulated-world/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy root package
COPY package.json .
RUN npm install

# Copy ui
COPY ui ./ui
WORKDIR /app/ui
RUN npm install && npm run build

EXPOSE 3000 3001

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t simulated-world .
docker run -p 3000:3000 -p 3001:3001 simulated-world
```

Access: `http://localhost:3001`

---

## For Continuous Integration

Add to Piper CI/CD pipeline:

```yaml
# .github/workflows/test-simulated-world.yml
name: SimulatedWorld Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Run SimulatedWorld scenarios
        run: |
          cd simulated-world
          npm test
          
      - name: Build dashboard
        run: |
          cd simulated-world
          npm run build
```

---

## Integration with Piper Improvements

### Workflow

1. **Make a change to Piper**
   ```bash
   # e.g., improve timezone awareness
   # Edit Piper code
   # Commit
   ```

2. **Test against SimulatedWorld**
   ```bash
   cd simulated-world
   npm test
   # Review which scenarios improved/regressed
   ```

3. **If improvement, commit**
   ```bash
   git add simulated-world/
   git commit -m "Timezone awareness: Judy scenario +15% (35%→50%)"
   ```

4. **Track progress**
   - Keep a `PROGRESS.md` with before/after scores
   - Update weekly or per major change

### Example PROGRESS.md

```markdown
# SimulatedWorld Progress Tracking

## Baseline (2026-07-05)
- Mike: 35% (action approval bottleneck)
- Goz: 42% (product clarity adequate)
- Jason: 38% (customer loop incomplete)
- Judy: 18% (calendar coordination weak)
- Long: 52% (board prep partial)
**Overall: 37%**

## After Timezone Fix (2026-07-12)
- Mike: 35% (unchanged)
- Goz: 42% (unchanged)
- Jason: 38% (unchanged)
- Judy: 33% (+15) ← Timezone awareness helps scheduling
- Long: 52% (unchanged)
**Overall: 42% (+5)**

## Next: Action execution improvements
- Target: Mike → 60%+ (unblock decision approval)
```

---

## Maintenance

### Adding New Scenarios

1. Create function in `ada-core-5-scenarios.js`:
   ```javascript
   function scenarioNewWorkflow() {
     return {
       name: 'Scenario X: [Persona] [Workflow]',
       persona: 'Mike',
       description: 'Brief description',
       input: { /* ... */ },
       rubric: { /* ... */ },
       expectedOutput: { /* ... */ },
     };
   }
   ```

2. Add to `runScenarios()` array:
   ```javascript
   const scenarios = [
     scenario1_mikeDecisionBatch(),
     scenario2_judyScheduling(),
     // ... add new one
     scenarioNewWorkflow(),
   ];
   ```

3. Test:
   ```bash
   npm test
   ```

### Updating Personas

1. Edit `/ui/app/api/state/route.ts` to change user data
2. Dashboard reflects changes immediately
3. Commit:
   ```bash
   git add simulated-world/ui/app/api/state/route.ts
   git commit -m "Update personas: add [New Person]"
   ```

### Dashboard Enhancements

UI components are in `/ui/app/components/`:
- `UserPersonaSelector.tsx` — Persona dropdown
- `SlackView.tsx` — Message interface
- `CalendarView.tsx` — Meeting scheduling
- `ScenariosView.tsx` — Run scenarios

Modify to improve UX, test locally with `npm run dev`.

---

## Troubleshooting

### Port already in use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Then restart
npm run dev
```

### Build fails

```bash
# Clean and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### Scenarios won't run

```bash
# Verify Node.js 18+
node --version

# Run with debug output
node --trace-uncaught ada-core-5-scenarios.js
```

---

## Success Checklist

- [ ] Cloned to Piper repo (simulated-world/)
- [ ] Dependencies installed (`npm install` works)
- [ ] Dashboard runs locally (`npm run dev`)
- [ ] Persona selector works (can toggle between Core 5)
- [ ] Scenarios run (`npm test`)
- [ ] All 5 scenarios output correctly
- [ ] Deployed to production (AdaCities or Vercel)
- [ ] Accessible via public URL
- [ ] Git history shows improvements over time

---

## Questions?

See:
- `README.md` — Project overview
- `ADA_CORE_PERSONAS.md` — Detailed persona definitions
- `ADA_ORGANIZATION_ACTUAL.md` — Real Ada workflows
- `/ui/README.md` — Dashboard-specific docs (if exists)

---

Ready to measure Piper's impact? Let's go!
