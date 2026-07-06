#!/bin/bash

echo "🔍 SimulatedWorld Dashboard Setup Verification"
echo "=============================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counter
PASSED=0
FAILED=0

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js installed: $VERSION"
    PASSED=$((PASSED+1))
else
    echo -e "${RED}✗${NC} Node.js not installed"
    FAILED=$((FAILED+1))
fi

# Check npm
echo "Checking npm..."
if command -v npm &> /dev/null; then
    VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm installed: $VERSION"
    PASSED=$((PASSED+1))
else
    echo -e "${RED}✗${NC} npm not installed"
    FAILED=$((FAILED+1))
fi

# Check project files
echo ""
echo "Checking project files..."

FILES=(
    "package.json"
    "tsconfig.json"
    "next.config.js"
    "app/page.tsx"
    "app/layout.tsx"
    "app/globals.css"
    "types/index.ts"
    "server.ts"
    "README.md"
    "QUICKSTART.md"
    "INTEGRATION.md"
    "ARCHITECTURE.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
        PASSED=$((PASSED+1))
    else
        echo -e "${RED}✗${NC} $file missing"
        FAILED=$((FAILED+1))
    fi
done

# Check components
echo ""
echo "Checking components..."

COMPONENTS=(
    "app/components/Sidebar.tsx"
    "app/components/SlackView.tsx"
    "app/components/CalendarView.tsx"
    "app/components/TraceLog.tsx"
    "app/components/MutationLog.tsx"
    "app/components/StateInspector.tsx"
    "app/components/ScenariosView.tsx"
    "app/components/MetricsView.tsx"
)

for component in "${COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        echo -e "${GREEN}✓${NC} $component"
        PASSED=$((PASSED+1))
    else
        echo -e "${RED}✗${NC} $component missing"
        FAILED=$((FAILED+1))
    fi
done

# Check hooks
echo ""
echo "Checking hooks..."

HOOKS=(
    "app/hooks/useWorldState.ts"
    "app/hooks/useWebSocket.ts"
)

for hook in "${HOOKS[@]}"; do
    if [ -f "$hook" ]; then
        echo -e "${GREEN}✓${NC} $hook"
        PASSED=$((PASSED+1))
    else
        echo -e "${RED}✗${NC} $hook missing"
        FAILED=$((FAILED+1))
    fi
done

# Check node_modules
echo ""
echo "Checking dependencies..."

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules directory exists"
    PASSED=$((PASSED+1))
else
    echo -e "${YELLOW}!${NC} node_modules not installed (run: npm install)"
    FAILED=$((FAILED+1))
fi

# Summary
echo ""
echo "=============================================="
echo "Summary"
echo "=============================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Setup is complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Install dependencies: npm install"
    echo "2. Start development: npm run dev"
    echo "3. Open browser: http://localhost:3001"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}✗ Setup incomplete. Fix errors above.${NC}"
    echo ""
    exit 1
fi
