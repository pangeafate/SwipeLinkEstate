# Debug Components

Development and debugging utilities for troubleshooting and development assistance.

## Components

### PropertyDebug
**File**: `PropertyDebug.tsx` (201 lines - ⚠️ At limit threshold)  
**Purpose**: Debug utility for inspecting property data and state  
**Status**: ✅ Active development tool  

**Features**:
- Property data inspection
- JSON pretty-printing
- State visualization
- Development-only functionality

**Usage**:
```tsx
import PropertyDebug from '@/components/debug/PropertyDebug'

// Only in development
{process.env.NODE_ENV === 'development' && (
  <PropertyDebug property={selectedProperty} />
)}
```

## Architecture Notes

### File Size Compliance
- PropertyDebug.tsx: 201 lines (101% of limit) - **Monitor closely, consider refactoring**

### Development Only
All debug components should be:
- Excluded from production builds
- Wrapped in development environment checks
- Optimized away during build process

### Security Considerations
- Never expose sensitive data in debug output
- Sanitize displayed information
- Implement proper access controls for debug features

## Planned Components

### SwipeDebugger
**Purpose**: Debug swipe interactions and state changes
**Planned Features**:
- Swipe event logging
- State transition visualization
- Performance metrics display
- Touch/gesture debugging

### StateInspector  
**Purpose**: Generic React state debugging utility
**Planned Features**:
- Component state visualization
- Props inspection
- Re-render tracking
- Performance profiling

### NetworkDebugger
**Purpose**: API call monitoring and debugging
**Planned Features**:
- Request/response logging
- Network timing analysis
- Error tracking
- Cache inspection

### TestDataGenerator
**Purpose**: Generate test data for development
**Planned Features**:
- Mock property generation
- User session simulation
- Edge case data creation
- Performance test data

## Best Practices

### Component Design
- Keep debug components simple and focused
- Use clear, descriptive interfaces
- Implement proper error boundaries
- Follow the 200-line limit strictly

### Performance
- Debug components should not impact production performance
- Use conditional rendering for development-only features
- Implement lazy loading for heavy debug utilities
- Minimize bundle size impact

### Code Organization
```
debug/
├── PropertyDebug.tsx
├── SwipeDebugger.tsx (planned)
├── StateInspector.tsx (planned)
├── NetworkDebugger.tsx (planned)
├── TestDataGenerator.tsx (planned)
├── utils/
│   ├── debugHelpers.ts
│   └── mockDataGenerators.ts
└── __tests__/
    └── PropertyDebug.test.tsx
```

## Environment Configuration

### Development Only
```tsx
// Proper usage pattern
{process.env.NODE_ENV === 'development' && (
  <DebugComponent />
)}
```

### Build Exclusion
Configure webpack to exclude debug components from production builds:
```javascript
// next.config.js
module.exports = {
  webpack: (config, { dev }) => {
    if (!dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@/components/debug': false,
      }
    }
    return config
  }
}
```

## Testing Strategy
- Unit tests for debug utilities
- Integration tests for data accuracy
- Performance impact testing
- Build size impact monitoring

## Dependencies
- React DevTools integration
- JSON pretty-printing libraries
- Development-only utilities
- Console logging enhancements

---
**Last Updated**: 2025-08-19  
**Status**: Active development tools  
**Compliance**: ⚠️ Monitor PropertyDebug.tsx (201 lines)