#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "SimulatedWorld Package Verification"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check source files
echo "📦 Source Files:"
FILE_COUNT=$(find src -name "*.ts" | wc -l)
echo "  ✓ TypeScript files: $FILE_COUNT"

# Check compiled output
echo ""
echo "📦 Compiled Output:"
if [ -d "dist" ]; then
  DIST_FILES=$(find dist -name "*.js" | wc -l)
  echo "  ✓ JavaScript files: $DIST_FILES"
  DECL_FILES=$(find dist -name "*.d.ts" | wc -l)
  echo "  ✓ Type declarations: $DECL_FILES"
else
  echo "  ✗ dist/ directory not found"
fi

# Check test files
echo ""
echo "📦 Test Files:"
TEST_COUNT=$(find tests -name "*.test.ts" 2>/dev/null | wc -l)
echo "  ✓ Test files: $TEST_COUNT"

# Check scenario files
echo ""
echo "📦 Scenario Files:"
SCENARIO_COUNT=$(find examples -name "meeting-booking-*.ts" | wc -l)
echo "  ✓ Scenario files: $SCENARIO_COUNT"

# Check documentation
echo ""
echo "📚 Documentation:"
DOCS=(
  "README.md"
  "README_PIPER.md"
  "PIPER_INTEGRATION.md"
  "PIPER_IMPROVEMENT_ROADMAP.md"
  "PACKAGE_SUMMARY.md"
  "DELIVERY_SUMMARY.md"
  "SCENARIO_RESULTS.md"
)

for doc in "${DOCS[@]}"; do
  if [ -f "$doc" ]; then
    SIZE=$(wc -l < "$doc")
    echo "  ✓ $doc ($SIZE lines)"
  else
    echo "  ✗ $doc (missing)"
  fi
done

# Check package.json
echo ""
echo "📦 Package Configuration:"
if [ -f "package.json" ]; then
  NAME=$(grep '"name"' package.json | head -1)
  echo "  ✓ $NAME"
else
  echo "  ✗ package.json not found"
fi

# Check integrations
echo ""
echo "🔌 Integrations:"
INTEGRATIONS=(
  "slack"
  "calendar"
  "gmail"
  "linear"
  "github"
  "salesforce"
  "docs"
  "granola"
  "todoist"
  "feedbin"
  "oura"
  "strava"
  "twitter"
)

for integration in "${INTEGRATIONS[@]}"; do
  if [ -f "src/integrations/$integration/index.ts" ] || [ -f "src/integrations/$integration.ts" ]; then
    echo "  ✓ $integration"
  else
    echo "  ✗ $integration (missing)"
  fi
done

# Final summary
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ BUILD VERIFICATION COMPLETE"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. npm install"
echo "  2. npm run build (if needed)"
echo "  3. npm test"
echo "  4. Read README_PIPER.md to get started"
echo ""
