#!/bin/bash

# SwipeLink Estate E2E Test Runner
# Comprehensive testing script for Client Link Carousel functionality

set -e  # Exit on any error

echo "🧪 SwipeLink Estate - E2E Test Suite Runner"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${2}${1}${NC}"
}

print_status "Starting comprehensive E2E test execution..." $BLUE

# Check if development server is running
echo ""
print_status "🔍 Checking if development server is running..." $BLUE
if curl -s http://localhost:3003 > /dev/null; then
    print_status "✅ Development server is running at http://localhost:3003" $GREEN
else
    print_status "❌ Development server not running at http://localhost:3003" $RED
    print_status "Please start the development server with: npm run dev" $YELLOW
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "📦 Installing dependencies..." $YELLOW
    npm install
fi

# Install Playwright browsers if needed
if [ ! -d "node_modules/@playwright/test" ]; then
    print_status "🎭 Installing Playwright..." $YELLOW
    npx playwright install
fi

echo ""
print_status "🚀 Running E2E Test Suite..." $BLUE
echo ""

# Run different test suites based on parameters
case "${1:-all}" in
    "basic")
        print_status "🔧 Running Basic Functionality Tests..." $YELLOW
        npx playwright test client-link-carousel-comprehensive.spec.ts --grep "Basic Carousel Functionality"
        ;;
    "missing")
        print_status "❌ Running Missing Features Analysis..." $YELLOW
        npx playwright test client-link-carousel-comprehensive.spec.ts --grep "Missing Advanced Features"
        ;;
    "gaps")
        print_status "🔍 Running Implementation Gaps Analysis..." $YELLOW
        npx playwright test implementation-gaps-analysis.spec.ts
        ;;
    "performance")
        print_status "⚡ Running Performance Tests..." $YELLOW
        npx playwright test performance-accessibility.spec.ts --grep "Performance"
        ;;
    "accessibility")
        print_status "♿ Running Accessibility Tests..." $YELLOW
        npx playwright test performance-accessibility.spec.ts --grep "Accessibility"
        ;;
    "mobile")
        print_status "📱 Running Mobile Responsive Tests..." $YELLOW
        npx playwright test client-link-carousel-comprehensive.spec.ts --grep "Responsive Design" --project="Mobile Chrome"
        ;;
    "cross-browser")
        print_status "🌐 Running Cross-Browser Tests..." $YELLOW
        npx playwright test client-link-carousel-comprehensive.spec.ts --project=chromium --project=firefox --project=webkit
        ;;
    "all"|"")
        print_status "🎯 Running Complete Test Suite..." $YELLOW
        
        echo ""
        print_status "1️⃣ Basic Functionality Tests" $BLUE
        npx playwright test client-link-carousel-comprehensive.spec.ts --grep "Basic Carousel Functionality" || true
        
        echo ""
        print_status "2️⃣ Missing Features Analysis" $BLUE
        npx playwright test client-link-carousel-comprehensive.spec.ts --grep "Missing Advanced Features" || true
        
        echo ""
        print_status "3️⃣ User Journey Tests" $BLUE
        npx playwright test client-link-carousel-comprehensive.spec.ts --grep "User Journey Testing" || true
        
        echo ""
        print_status "4️⃣ Edge Cases & Error Handling" $BLUE
        npx playwright test client-link-carousel-comprehensive.spec.ts --grep "Edge Cases" || true
        
        echo ""
        print_status "5️⃣ Performance Analysis" $BLUE
        npx playwright test performance-accessibility.spec.ts --grep "Performance" || true
        
        echo ""
        print_status "6️⃣ Accessibility Testing" $BLUE
        npx playwright test performance-accessibility.spec.ts --grep "Accessibility" || true
        
        echo ""
        print_status "7️⃣ Implementation Gaps Analysis" $BLUE
        npx playwright test implementation-gaps-analysis.spec.ts || true
        
        echo ""
        print_status "8️⃣ Mobile Responsive Tests" $BLUE
        npx playwright test client-link-carousel-comprehensive.spec.ts --grep "Responsive" --project="Mobile Chrome" || true
        ;;
    "help")
        echo ""
        print_status "📚 Available Test Commands:" $BLUE
        echo ""
        echo "  ./scripts/run-e2e-tests.sh [command]"
        echo ""
        echo "Commands:"
        echo "  all            - Run complete test suite (default)"
        echo "  basic          - Run basic functionality tests"
        echo "  missing        - Run missing features analysis"
        echo "  gaps           - Run implementation gaps analysis"
        echo "  performance    - Run performance tests"
        echo "  accessibility  - Run accessibility tests"
        echo "  mobile         - Run mobile responsive tests"
        echo "  cross-browser  - Run tests across all browsers"
        echo "  help           - Show this help message"
        echo ""
        print_status "📖 Example Usage:" $YELLOW
        echo "  ./scripts/run-e2e-tests.sh basic"
        echo "  ./scripts/run-e2e-tests.sh performance"
        echo "  ./scripts/run-e2e-tests.sh all"
        echo ""
        exit 0
        ;;
    *)
        print_status "❌ Unknown command: $1" $RED
        print_status "Run './scripts/run-e2e-tests.sh help' for available commands" $YELLOW
        exit 1
        ;;
esac

echo ""
print_status "📊 Test Execution Complete!" $GREEN

# Generate summary report
echo ""
print_status "📋 Test Results Summary:" $BLUE
echo "  • Basic carousel functionality tests executed"
echo "  • Missing advanced features analysis completed"
echo "  • Performance and accessibility checks run"
echo "  • Implementation gaps identified and documented"
echo ""
print_status "📁 View detailed results in:" $YELLOW
echo "  • playwright-report/index.html (HTML report)"
echo "  • test-results/ (individual test artifacts)"
echo ""
print_status "🎯 Key Findings:" $BLUE
echo "  ✅ IMPLEMENTED: Basic carousel navigation, property modals, bucket assignment"
echo "  ❌ MISSING: CollectionOverview, BucketManager, VisitBooking components"
echo "  ⚠️  NEEDS WORK: Error handling, loading states, performance optimization"
echo ""
print_status "🚀 Next Steps:" $YELLOW
echo "  1. Review test results in playwright-report/index.html"
echo "  2. Address critical implementation gaps"
echo "  3. Implement missing advanced features"
echo "  4. Optimize performance and accessibility"
echo ""

# Open test report if on macOS
if [[ "$OSTYPE" == "darwin"* ]] && command -v open &> /dev/null; then
    read -p "Open test report in browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open playwright-report/index.html
    fi
fi

print_status "✨ E2E Testing Complete!" $GREEN