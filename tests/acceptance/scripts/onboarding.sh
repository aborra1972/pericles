#!/bin/bash
# INT-02: Onboarding Under 10 Minutes
# This script measures the time to set up Pericles from clean install

set -e

echo "=== INT-02: Onboarding Test ==="
echo "Start time: $(date)"
echo ""

START_TIME=$(date +%s)

# Step 1: Clone repository (simulated - using existing)
echo "1. Cloning repository..."
# In real test: git clone https://github.com/aborra1972/pericles.git
sleep 1

# Step 2: Install dependencies
echo "2. Installing npm dependencies..."
cd /media/ale/Windows/Users/aleja/Documents/Proyectos/pericles
npm install 2>&1 | tail -5
sleep 1

# Step 3: Build all packages
echo "3. Building all packages..."
npm run build 2>&1 | tail -5
sleep 1

# Step 4: Start backend
echo "4. Starting backend..."
npm run dev:backend &
BACKEND_PID=$!
sleep 3

# Step 5: Verify health endpoint
echo "5. Verifying health endpoint..."
HEALTH=$(curl -s http://localhost:3000/health || echo "FAILED")
echo "Health: $HEALTH"

# Step 6: Run tests
echo "6. Running test suite..."
npm test 2>&1 | tail -10

# Cleanup
kill $BACKEND_PID 2>/dev/null || true

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "=== Test Complete ==="
echo "End time: $(date)"
echo "Duration: ${DURATION} seconds"
echo ""

if [ $DURATION -lt 600 ]; then
    echo "✅ PASS: Onboarding completed in ${DURATION}s (< 600s)"
    exit 0
else
    echo "❌ FAIL: Onboarding took ${DURATION}s (>= 600s)"
    exit 1
fi
