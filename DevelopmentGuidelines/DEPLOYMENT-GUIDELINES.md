
# Deployments should be done via CI/CD pipeline in the github 

## CRITICAL RULES - NEVER VIOLATE

1. **NEVER skip tests without explicit human confirmation** - If tests fail, fix them or ask for permission
2. **NEVER deploy directly to production** - Always follow: Dev → Staging → Canary → Production
3. **NEVER modify production without PR approval** - All changes must go through pull requests
4. **NEVER store secrets in code** - Use GitHub Secrets or environment variables
5. **ALWAYS monitor deployments** - Watch CI/CD logs and fix issues immediately

## Deployment Decision Tree

```
START
│
├─ Is this a hotfix?
│  ├─ YES → Create hotfix branch → Run full test suite → Get approval → Deploy
│  └─ NO → Continue
│
├─ Are all tests passing?
│  ├─ NO → Fix tests → Re-run → Still failing? → Ask human for guidance
│  └─ YES → Continue
│
├─ Is this for production?
│  ├─ YES → Has staging been tested? 
│  │  ├─ NO → Deploy to staging first
│  │  └─ YES → Request human approval → Deploy canary → Monitor → Full deploy
│  └─ NO → Deploy to staging → Run smoke tests
│
└─ END
```

## Step-by-Step Deployment Process

### 1. Pre-Deployment Checklist

```bash
# Before ANY deployment, verify:
echo "=== Pre-Deployment Checklist ==="

# Check current branch
git branch --show-current
# MUST be 'main' for production, 'develop' for staging

# Check for uncommitted changes
git status --porcelain
# MUST be empty

# Verify tests pass locally
npm test
# MUST show 100% passing

# Check for security vulnerabilities
npm audit
# MUST show 0 high/critical vulnerabilities

# Verify Docker builds
docker build -t test-build .
# MUST complete successfully

# Check environment variables
env | grep -E "AWS_|GITHUB_|NODE_ENV"
# MUST NOT show any secrets, only references like ${{ secrets.NAME }}
```

### 2. Creating GitHub Actions Workflow

When creating or modifying `.github/workflows/` files:

```yaml
name: Deploy-[Environment]  # Always use clear naming

# MANDATORY sections for every workflow:
on:
  workflow_dispatch:  # Always allow manual trigger
    inputs:
      confirm_tests:
        type: boolean
        description: 'I confirm all tests are passing'
        required: true
      
permissions:
  contents: read      # Minimum required permissions
  id-token: write    # Only if using OIDC

env:
  # NEVER hardcode these:
  # - API keys
  # - Passwords  
  # - Connection strings
  # - AWS credentials
  
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Confirm tests
        if: ${{ !inputs.confirm_tests }}
        run: |
          echo "ERROR: Test confirmation required"
          exit 1
```

### 3. Test Execution Rules

```bash
# ALWAYS run tests in this order:

# Stage 1: Fast checks (< 2 min)
npm run lint
npm run type-check
npm run security-scan

# If ANY fail → FIX before continuing

# Stage 2: Unit tests (< 5 min)  
npm run test:unit -- --coverage
# Coverage MUST be > 80%

# Stage 3: Integration tests (< 10 min)
npm run test:integration
# ALL must pass

# Stage 4: E2E tests (only for production)
if [ "$TARGET_ENV" == "production" ]; then
  npm run test:e2e
fi
```

### 4. Deployment Commands by Environment

#### Staging Deployment

```bash
# ONLY after ALL tests pass
helm upgrade --install app-staging ./charts \
  --namespace staging \
  --values ./charts/values.staging.yaml \
  --set image.tag=${GIT_SHA} \
  --wait --timeout 10m \
  --dry-run  # ALWAYS dry-run first

# If dry-run succeeds:
helm upgrade --install app-staging ./charts \
  --namespace staging \
  --values ./charts/values.staging.yaml \
  --set image.tag=${GIT_SHA} \
  --wait --timeout 10m

# MUST verify:
curl -f https://staging.example.com/health || exit 1
```

#### Production Deployment

```bash
# STOP - Confirm with human:
echo "CONFIRMATION REQUIRED: Deploy to production?"
echo "- All staging tests passed? [y/n]"
echo "- Rollback plan ready? [y/n]"  
echo "- Team notified? [y/n]"
# WAIT for explicit 'yes' to all

# Step 1: Canary (5% traffic)
kubectl apply -f canary-deployment.yaml
kubectl set image deployment/app app=${IMAGE_TAG} -n production

# Step 2: Monitor for 5 minutes
for i in {1..10}; do
  ERROR_RATE=$(curl -s https://api.metrics.com/error-rate)
  if [ "$ERROR_RATE" -gt "1" ]; then
    echo "ERROR RATE TOO HIGH - ROLLING BACK"
    kubectl rollout undo deployment/app -n production
    exit 1
  fi
  sleep 30
done

# Step 3: Full deployment (only if canary succeeds)
kubectl scale deployment/app --replicas=10 -n production
```

### 5. Monitoring During Deployment

```bash
# CONTINUOUSLY monitor these metrics during ANY deployment:

while true; do
  # Check pod status
  kubectl get pods -n $NAMESPACE | grep -v Running
  
  # Check error logs
  kubectl logs -n $NAMESPACE -l app=myapp --tail=50 | grep ERROR
  
  # Check metrics
  curl -s https://monitoring.example.com/api/metrics | jq '.error_rate, .p95_latency'
  
  # If issues detected:
  if [ ERRORS_DETECTED ]; then
    echo "ISSUES DETECTED - Taking action:"
    echo "1. Capturing logs for debugging"
    kubectl logs -n $NAMESPACE --all-containers=true > debug-logs.txt
    echo "2. Initiating rollback"
    kubectl rollout undo deployment/app -n $NAMESPACE
    echo "3. Notifying team"
    # Send alert
    break
  fi
  
  sleep 10
done
```

### 6. Rollback Procedures

```bash
# AUTOMATIC rollback triggers:
if [ "$ERROR_RATE" -gt "5" ] || [ "$P95_LATENCY" -gt "1000" ]; then
  echo "AUTOMATIC ROLLBACK TRIGGERED"
  
  # Step 1: Immediate rollback
  kubectl rollout undo deployment/app -n $NAMESPACE
  
  # Step 2: Verify rollback
  kubectl rollout status deployment/app -n $NAMESPACE
  
  # Step 3: Document incident
  cat > incident-$(date +%s).md << EOF
  Incident Report
  Time: $(date)
  Environment: $NAMESPACE
  Trigger: Automatic (metrics threshold)
  Error Rate: $ERROR_RATE
  Latency: $P95_LATENCY
  Action: Rolled back to previous version
  EOF
  
  # Step 4: Notify humans
  echo "ROLLBACK COMPLETE - Human intervention required"
fi
```

### 7. Common Issues and Fixes

```bash
# Issue: Tests failing
# Fix: 
if [ "$TEST_FAILURE" ]; then
  echo "Tests failing - attempting fixes:"
  
  # Clear cache and reinstall
  rm -rf node_modules package-lock.json
  npm install
  npm test
  
  # Still failing?
  echo "HUMAN HELP NEEDED: Tests still failing after cache clear"
  echo "Failing tests:"
  npm test 2>&1 | grep "FAIL"
  exit 1
fi

# Issue: Docker build failing
# Fix:
if ! docker build -t test .; then
  echo "Docker build failed - checking common issues:"
  
  # Check Dockerfile exists
  [ ! -f Dockerfile ] && echo "ERROR: Dockerfile missing"
  
  # Check base image
  grep "^FROM" Dockerfile
  
  # Try with no cache
  docker build --no-cache -t test .
  
  # Still failing?
  echo "HUMAN HELP NEEDED: Docker build failing"
  exit 1
fi

# Issue: Deployment stuck
# Fix:
if [ "$(kubectl rollout status deployment/app -n $NAMESPACE --timeout=5m)" != "0" ]; then
  echo "Deployment stuck - investigating:"
  
  # Check pod events
  kubectl describe pods -n $NAMESPACE | grep -A 5 "Events:"
  
  # Check resource limits
  kubectl top nodes
  kubectl top pods -n $NAMESPACE
  
  # Force rollback if needed
  kubectl rollout undo deployment/app -n $NAMESPACE
  echo "HUMAN HELP NEEDED: Deployment was stuck and rolled back"
fi
```

## GitHub Actions Template for Claude Code

```yaml
name: Claude-Code-Safe-Deploy

on:
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [staging, production]
        required: true
      skip_tests:
        type: boolean
        description: 'Skip tests (REQUIRES HUMAN APPROVAL)'
        default: false
      confirmed:
        type: boolean  
        description: 'I confirm this deployment is safe'
        required: true

jobs:
  safety-checks:
    runs-on: ubuntu-latest
    steps:
      - name: Enforce confirmation
        if: ${{ !inputs.confirmed }}
        run: |
          echo "ERROR: Deployment confirmation required"
          echo "Please confirm this deployment is safe"
          exit 1
      
      - name: Check skip tests
        if: ${{ inputs.skip_tests }}
        run: |
          echo "WARNING: Tests will be skipped"
          echo "This requires human approval"
          echo "Waiting for approval in PR comments..."
          # Check for approval comment
          exit 1  # Fail unless explicit approval
  
  test:
    needs: safety-checks
    if: ${{ !inputs.skip_tests }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run all tests
        run: |
          npm ci
          npm run test:all
          
      - name: Verify coverage
        run: |
          COVERAGE=$(npm run coverage --silent | grep "All files" | awk '{print $10}' | sed 's/%//')
          if [ "$COVERAGE" -lt "80" ]; then
            echo "ERROR: Coverage is $COVERAGE%, minimum is 80%"
            exit 1
          fi
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy with monitoring
        run: |
          # Start monitoring in background
          ./monitor.sh &
          MONITOR_PID=$!
          
          # Deploy
          ./deploy.sh --env ${{ inputs.environment }}
          
          # Check monitoring results
          kill $MONITOR_PID
          if [ -f "deployment-errors.log" ]; then
            echo "Errors detected during deployment:"
            cat deployment-errors.log
            ./rollback.sh --env ${{ inputs.environment }}
            exit 1
          fi
```

## Special Instructions for Claude Code

### When Writing Deployment Code:

1. **Always add safety checks:**

```bash
# Before ANY destructive operation
read -p "This will modify production. Continue? (yes/no): " confirm
[ "$confirm" != "yes" ] && exit 1
```

2. **Always use dry-run first:**

```bash
# For kubectl
kubectl apply --dry-run=client -f deployment.yaml

# For helm  
helm upgrade --dry-run --debug

# For terraform
terraform plan
```

3. **Always capture rollback information:**

```bash
# Before deployment
PREVIOUS_VERSION=$(kubectl get deployment/app -o jsonpath='{.spec.template.spec.containers[0].image}')
echo "Previous version: $PREVIOUS_VERSION" > rollback-info.txt
```

4. **Always verify after deployment:**

```bash
# Don't assume success
DEPLOYMENT_SUCCESS=false
for i in {1..30}; do
  if curl -f https://${ENVIRONMENT}.example.com/health; then
    DEPLOYMENT_SUCCESS=true
    break
  fi
  sleep 10
done

if [ "$DEPLOYMENT_SUCCESS" = false ]; then
  echo "Deployment failed health checks"
  ./rollback.sh
  exit 1
fi
```

### Error Handling Requirements:

```bash
# ALWAYS use error handling
set -euo pipefail  # Exit on error, undefined variable, pipe failure
trap 'echo "Error on line $LINENO"' ERR

# ALWAYS log what you're doing
echo "[$(date)] Starting deployment to $ENVIRONMENT" | tee -a deployment.log

# ALWAYS provide rollback on failure
trap rollback_on_error EXIT
```

### Questions to Ask Humans:

Before production deployments, ALWAYS ask:

1. "Have the changes been reviewed and approved in a PR?"
2. "Has this been tested in staging?"
3. "Is there a rollback plan if something goes wrong?"
4. "Should I proceed with the deployment?"

If tests are failing, ask:

1. "Tests are failing. Should I try to fix them automatically?"
2. "Would you like me to skip specific tests? (requires your explicit approval)"
3. "Should I investigate the test failures in more detail?"

## Summary for Claude Code

- **Never** skip tests without asking
- **Always** deploy to staging before production
- **Always** monitor during deployment
- **Always** be ready to rollback
- **Ask for help** when unsure
- **Document** everything you do
- **Test** everything before applying