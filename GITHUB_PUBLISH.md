# Bizarro Jerry: Publishing to Piper GitHub

Ready to publish Bizarro Jerry to the Piper repo and share with Rinoc.

---

## Quick Publish (5 minutes)

### Prerequisites
- Access to Piper GitHub repo
- Git configured
- Node.js 18+

### Steps

#### 1. Navigate to Piper repo
```bash
cd /path/to/letpiper/jetpack  # or wherever Piper repo is
# or
cd ~/ada-workspace/piper
```

#### 2. Copy Bizarro Jerry
```bash
# From your local machine
cp -r /tmp/simulated-world bizarro-jerry

# Or if cloning:
git clone <piper-repo-url>
cd piper
cp -r /tmp/simulated-world bizarro-jerry
cd bizarro-jerry
```

#### 3. Verify it works
```bash
# Test locally first
npm install  # install root + ui dependencies

npm test
# Should output: 5 scenarios (Mike, Judy, Jason, Goz, Long)

npm run dev
# Opens http://localhost:3001
# Toggle personas → see Mike, Goz, Jason, Judy, Long
```

#### 4. Commit to Piper
```bash
cd piper
git add bizarro-jerry/
git commit -m "Add Bizarro Jerry: Piper Test Harness

Named after the Seinfeld episode 'The Opposite' - measures Piper quality
against real Ada organization workflows.

Features:
- 5 Core personas (Mike, Goz, Jason, Judy, Long)
- 5 executable test scenarios with weighted rubrics
- Next.js dashboard with persona selector
- Grounded in real Ada org (150+ people, real projects)
- Production-ready

Run locally: npm install && npm run dev
Run scenarios: npm test
See README.md for details"

git push origin main
```

#### 5. Deploy to Production
Pick one option:

**Option A: Vercel (Recommended - 1 click)**
```bash
cd bizarro-jerry/ui
vercel deploy --prod --name bizarro-jerry-piper
# Returns: https://bizarro-jerry-piper.vercel.app
```

**Option B: AdaCities (Ada Internal)**
```bash
cd bizarro-jerry
npx adacities deploy --site bizarro-jerry-piper \
  --entry "ui/app/page.tsx" --build "npm run build"
# Returns: https://bizarro-jerry-piper.adacities.com
```

**Option C: Within Piper CI/CD**
```bash
# Add to .github/workflows/deploy.yml
# (if Piper has existing CI/CD)
```

---

## Share with Rinoc

### Message Template

```
Hey Rinoc,

Check out Bizarro Jerry - a new test harness for Piper named after the 
Seinfeld episode "The Opposite". 

It simulates 5 key personas from Ada's actual org:
- Mike (CEO) - Decision approval
- Judy (EA) - Calendar coordination  
- Jason (AE) - Customer calls
- Goz (CPTO) - Product planning
- Long (CFO) - Board prep

Each has a test scenario with weighted rubrics. Measures how well Piper
handles real workflows.

Try it:
- Live: [insert URL from deployment above]
- Repo: piper/bizarro-jerry/
- README: piper/bizarro-jerry/README.md
- Scenarios: npm test

The insight: Judy (EA) is the leverage point most tools miss. If Piper
helps her coordinate calendars + track actions, the whole org accelerates.

Let me know what you think!
```

---

## File Checklist

Before committing to GitHub, verify:

- [x] README.md (Seinfeld-themed, complete)
- [x] package.json (root level)
- [x] .gitignore (Node/Next.js)
- [x] ada-core-5-scenarios.js (5 scenarios executable)
- [x] ADA_CORE_PERSONAS.md (persona definitions)
- [x] ADA_ORGANIZATION_ACTUAL.md (real org analysis)
- [x] SETUP.md (detailed setup guide)
- [x] ui/ directory (Next.js app complete)
- [x] ui/app/api/state/route.ts (Core 5 personas + roles)
- [x] ui/app/components/UserPersonaSelector.tsx (persona picker)

---

## After Publishing

### For Rinoc (and your team):

1. **Try locally**
   ```bash
   cd piper/bizarro-jerry
   npm install
   npm run dev
   # Opens http://localhost:3001
   ```

2. **Run scenarios**
   ```bash
   npm test
   # See all 5 test cases with rubrics
   ```

3. **View deployed version**
   - Share the Vercel/AdaCities URL

4. **Understand the concept**
   - Read README.md (Seinfeld theme explains it)
   - Check ADA_CORE_PERSONAS.md for details
   - Review ada-core-5-scenarios.js for test definitions

### For You (Product Improvement):

1. **Measure baseline**
   - Run scenarios
   - Record current Piper scores
   - Create PROGRESS.md

2. **Make improvements**
   - Update Piper code
   - Re-run scenarios
   - Track improvement

3. **Share progress**
   - Commit scores to git
   - Show Rinoc/team the improvement trajectory

---

## GitHub Links (After Publishing)

These will work once in Piper repo:

- **Repo:** `https://github.com/letpiper/jetpack/tree/main/bizarro-jerry`
- **README:** `https://github.com/letpiper/jetpack/tree/main/bizarro-jerry#readme`
- **Scenarios:** `https://github.com/letpiper/jetpack/blob/main/bizarro-jerry/ada-core-5-scenarios.js`
- **Dashboard:** `https://github.com/letpiper/jetpack/tree/main/bizarro-jerry/ui`

---

## Troubleshooting

### "npm install fails"
```bash
rm -rf node_modules ui/node_modules .next
npm install
cd ui && npm install
```

### "Port 3001 already in use"
```bash
lsof -ti:3001 | xargs kill -9
npm run dev
```

### "Deployment fails"
- Check Node.js version: `node --version` (should be 18+)
- Check npm: `npm --version`
- Check Vercel/AdaCities credentials

---

## Done!

Once deployed:
1. You have a live, shareable test harness
2. Rinoc can see Core 5 personas + test scenarios
3. You can measure Piper improvements over time
4. Your team has a baseline for "good enough"

The magic: When you improve Piper on these scenarios, your actual team 
works better. That's the whole point.

---

**"It's like looking in a mirror, but everything is opposite."** 🎬

Now go make the opposite world a reality.
