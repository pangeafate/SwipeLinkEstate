# Claude Code TDD Instructions

## MANDATORY RULES - NEVER VIOLATE

1. **NEVER write code without a test first** - Test must exist and fail before implementation
2. **NEVER skip tests** - If a test is broken, fix it, don't skip it
3. **NEVER commit with failing tests** - All tests must pass before git commit
4. **NEVER write more code than needed to pass the test** - Minimal implementation only
5. **ALWAYS run tests after every change** - Even small changes can break things

## TDD Decision Tree

```
START: Need to implement a feature?
│
├─ Does a test file exist for this module?
│  ├─ NO → Create test file first
│  └─ YES → Continue
│
├─ Write FAILING test
│  ├─ Does test fail? 
│  │  ├─ NO → Test is wrong, fix it
│  │  └─ YES → Continue
│  └─ 
│
├─ Write MINIMAL code to pass
│  ├─ Does test pass?
│  │  ├─ NO → Fix implementation
│  │  └─ YES → Continue
│  └─
│
├─ Are all tests still passing?
│  ├─ NO → Fix what broke
│  └─ YES → Continue
│
├─ Can code be improved?
│  ├─ YES → Refactor (keep running tests)
│  └─ NO → Complete
│
└─ END: Commit changes
```

## Step-by-Step TDD Process

### STEP 1: RED - Write Failing Test First

```bash
# 1. Create test file if it doesn't exist
# Naming convention: [module].test.js or [module].spec.js

# For backend feature (Node.js/Express)
touch src/services/__tests__/user.service.test.js

# For frontend component (React)
touch src/components/__tests__/Button.test.jsx

# For API endpoint
touch tests/api/users.test.js
```

#### Backend Test Template

```javascript
// ALWAYS start with this template for backend tests

describe('UserService', () => {
  // SETUP - Run before tests
  beforeEach(() => {
    // Reset database/mocks
  });

  afterEach(() => {
    // Cleanup
  });

  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      // ARRANGE - Setup test data
      const userData = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      // ACT - Execute the function (THIS WILL FAIL - GOOD!)
      const result = await UserService.createUser(userData);

      // ASSERT - Check expectations
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(result.id).toBeDefined();
    });

    it('should throw error with invalid email', async () => {
      // ARRANGE
      const userData = {
        email: 'invalid-email',
        password: 'Password123!'
      };

      // ACT & ASSERT
      await expect(UserService.createUser(userData))
        .rejects
        .toThrow('Invalid email format');
    });
  });
});
```

#### Frontend Test Template

```javascript
// ALWAYS start with this template for React components

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Button from '../Button';

describe('Button Component', () => {
  it('should render with text', () => {
    // ARRANGE & ACT
    render(<Button>Click me</Button>);
    
    // ASSERT
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    // ARRANGE
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    // ACT
    fireEvent.click(screen.getByText('Click me'));
    
    // ASSERT
    await waitFor(() => {
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
```

#### API Endpoint Test Template

```javascript
// ALWAYS start with this template for API tests

const request = require('supertest');
const app = require('../app');

describe('POST /api/users', () => {
  it('should create user with valid data', async () => {
    // ARRANGE
    const userData = {
      email: 'test@example.com',
      password: 'Password123!'
    };

    // ACT
    const response = await request(app)
      .post('/api/users')
      .send(userData);

    // ASSERT
    expect(response.status).toBe(201);
    expect(response.body.email).toBe(userData.email);
    expect(response.body.id).toBeDefined();
  });

  it('should return 400 with invalid data', async () => {
    // ARRANGE
    const invalidData = {
      email: 'not-an-email'
    };

    // ACT
    const response = await request(app)
      .post('/api/users')
      .send(invalidData);

    // ASSERT
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});
```

### STEP 2: Run Test to Confirm It Fails

```bash
# MUST see RED (failing) test before proceeding

# For Jest/React
npm test -- --testPathPattern=Button.test

# For Mocha
npm test -- --grep "Button Component"

# For specific file
npm test src/components/__tests__/Button.test.jsx

# Expected output should show FAILURE:
# FAIL src/components/__tests__/Button.test.jsx
# ✕ should render with text (5ms)
# Error: Button is not defined

# If test PASSES without implementation, the test is WRONG
# Fix the test to ensure it fails first
```

### STEP 3: GREEN - Write Minimal Code to Pass

```javascript
// ONLY write enough code to make the test pass
// DO NOT add extra features

// BAD - Too much code
class UserService {
  async createUser(data) {
    // ❌ Don't add validation if test doesn't check for it
    if (!data.email.includes('@')) {
      throw new Error('Invalid email');
    }
    
    // ❌ Don't add logging if test doesn't expect it
    console.log('Creating user...');
    
    // ❌ Don't add extra fields not in test
    return {
      id: generateId(),
      email: data.email,
      createdAt: new Date(),  // ❌ Not in test
      status: 'active'         // ❌ Not in test
    };
  }
}

// GOOD - Minimal code
class UserService {
  async createUser(data) {
    // ✅ Only what's needed to pass test
    return {
      id: Math.random().toString(),
      email: data.email
    };
  }
}
```

### STEP 4: Run Tests to Confirm Green

```bash
# ALL tests must pass before continuing

# Run all tests
npm test

# Check coverage
npm test -- --coverage

# Output should show:
# PASS src/services/__tests__/user.service.test.js
# ✓ should create a new user with valid data (3ms)

# If any test fails, STOP and fix
```

### STEP 5: REFACTOR - Improve Code Quality

```javascript
// ONLY refactor if all tests are green
// Run tests after EVERY change

// Before refactoring - ugly but works
async createUser(data) {
  return {
    id: Math.random().toString(),
    email: data.email
  };
}

// After refactoring - cleaner, same behavior
async createUser(data) {
  const user = {
    id: generateUUID(),
    email: data.email.toLowerCase().trim()
  };
  
  return user;
}

// Run tests after EACH change:
// npm test -- --watch
```

## Test Coverage Requirements

```bash
# Check coverage after writing tests
npm test -- --coverage

# Coverage thresholds (MUST MEET):
# - Statements: 80%
# - Branches: 75%
# - Functions: 80%
# - Lines: 80%

# If coverage is below threshold:
echo "ERROR: Coverage too low"
echo "Missing tests for:"
npm test -- --coverage --verbose 2>&1 | grep "Uncovered"

# Add tests for uncovered code
```

## Test Organization Structure

```
project/
├── src/
│   ├── components/
│   │   ├── Button.jsx
│   │   └── __tests__/
│   │       └── Button.test.jsx
│   ├── services/
│   │   ├── user.service.js
│   │   └── __tests__/
│   │       └── user.service.test.js
│   └── utils/
│       ├── validators.js
│       └── __tests__/
│           └── validators.test.js
├── tests/
│   ├── api/
│   │   └── users.test.js
│   ├── e2e/
│   │   └── user-flow.test.js
│   └── integration/
│       └── database.test.js
```

## Common Test Scenarios

### Testing Async Code

```javascript
// ALWAYS use async/await for async tests
it('should fetch user data', async () => {
  // Mock the API call
  jest.spyOn(api, 'getUser').mockResolvedValue({ id: 1, name: 'John' });
  
  // Test the async function
  const user = await fetchUserData(1);
  
  // Assert
  expect(user.name).toBe('John');
  expect(api.getUser).toHaveBeenCalledWith(1);
});
```

### Testing Errors

```javascript
// ALWAYS test both success AND failure
it('should handle network error', async () => {
  // Mock failure
  jest.spyOn(api, 'getUser').mockRejectedValue(new Error('Network error'));
  
  // Test error handling
  await expect(fetchUserData(1)).rejects.toThrow('Network error');
});
```

### Testing Database Operations

```javascript
// ALWAYS use test database
beforeEach(async () => {
  // Setup test database
  await db.migrate.latest();
  await db.seed.run();
});

afterEach(async () => {
  // Clean up
  await db('users').truncate();
});

it('should save user to database', async () => {
  // Test database operation
  const user = await UserModel.create({ email: 'test@test.com' });
  
  // Verify in database
  const found = await db('users').where({ id: user.id }).first();
  expect(found.email).toBe('test@test.com');
});
```

## Playwright E2E Testing (After Deployment)

```bash
# After deploying frontend, test with real browser

# 1. Install Playwright if needed
npm install -D @playwright/test

# 2. Create E2E test
cat > tests/e2e/app.spec.js << 'EOF'
const { test, expect } = require('@playwright/test');

test('user can login and see dashboard', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:3000');
  
  // Check page loads
  await expect(page).toHaveTitle(/My App/);
  
  // Fill login form
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  
  // Submit form
  await page.click('[data-testid="login-button"]');
  
  // Verify navigation to dashboard
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator('h1')).toContainText('Dashboard');
  
  // Take screenshot for verification
  await page.screenshot({ path: 'tests/screenshots/dashboard.png' });
});
EOF

# 3. Run Playwright tests
npx playwright test

# 4. If tests fail, fix the UI
if [ $? -ne 0 ]; then
  echo "UI tests failed - fixing issues..."
  
  # Check for common issues
  npx playwright test --debug
  
  # Generate report
  npx playwright show-report
  
  # Fix identified issues in code
  # Re-run tests until passing
fi
```

## Quick Command Reference

```bash
# Create test file
touch src/services/__tests__/[name].test.js

# Run specific test file
npm test -- [filename]

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run only changed files
npm test -- -o

# Debug test
node --inspect-brk node_modules/.bin/jest --runInBand

# Run E2E tests
npx playwright test

# Update snapshots
npm test -- -u
```

## Test Checklist for Claude Code

Before implementing ANY feature:

- [ ] Test file exists
- [ ] Test is written and failing
- [ ] Test follows AAA pattern (Arrange, Act, Assert)
- [ ] Both success and failure cases covered

Before writing implementation:

- [ ] Test is running and RED (failing)
- [ ] Failure message makes sense
- [ ] Test will detect if feature breaks

After implementation:

- [ ] Test is GREEN (passing)
- [ ] No other tests broke
- [ ] Coverage is above 80%
- [ ] Code is minimal (no extra features)

Before committing:

- [ ] All tests pass
- [ ] Coverage meets thresholds
- [ ] No tests are skipped
- [ ] E2E tests pass (if frontend)

## Error Messages to Watch For

```bash
# If you see these, STOP and fix:

"Cannot find module" → Create the module file
"undefined is not a function" → Function doesn't exist yet (good in RED phase)
"Expected 1 but received undefined" → Implementation incomplete
"Test suite failed to run" → Syntax error in test
"Coverage threshold not met" → Add more tests
```

## When to Ask for Human Help

Ask for help if:

1. Test passes without implementation (test is wrong)
2. Can't make test fail in RED phase
3. Coverage below 80% after adding all logical tests
4. E2E tests fail but unit tests pass
5. Unsure what to test for a feature

NEVER:

- Skip writing tests to "save time"
- Disable failing tests
- Reduce coverage thresholds
- Write implementation before tests