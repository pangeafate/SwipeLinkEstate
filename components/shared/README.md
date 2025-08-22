# Shared Components

Reusable components and utilities used across multiple features and modules.

## Overview

This directory contains components, hooks, and utilities that are shared across different parts of the application. These components follow strict reusability principles and maintain consistency across the entire codebase.

## Status

🚧 **Under Development**

This directory is currently being organized to house shared components extracted from feature-specific modules.

## Planned Components

### UI Components

#### Button
**Purpose**: Standardized button component with consistent styling
**Planned Features**:
- Multiple variants (primary, secondary, danger, ghost)
- Size options (sm, md, lg)
- Loading states
- Disabled states
- Icon support

#### FormField
**Purpose**: Reusable form field wrapper with validation
**Planned Features**:
- Label and error message handling
- Required field indicators
- Consistent spacing and styling
- Accessibility compliance

#### Modal
**Purpose**: Reusable modal/dialog component
**Planned Features**:
- Backdrop click handling
- ESC key support
- Focus management
- Size variants
- Animation support

#### LoadingSpinner
**Purpose**: Consistent loading indicator
**Planned Features**:
- Multiple sizes
- Color variants
- Overlay support
- Accessible announcements

### Layout Components

#### Container
**Purpose**: Consistent page/section container
**Planned Features**:
- Responsive max-widths
- Padding variants
- Centered alignment options

#### Grid
**Purpose**: Responsive grid system
**Planned Features**:
- Flexible column layouts
- Gap controls
- Breakpoint-aware

#### Card
**Purpose**: Generic card container
**Planned Features**:
- Shadow variants
- Padding options
- Border styles
- Hover effects

### Form Components

#### Input
**Purpose**: Standardized input fields
**Planned Features**:
- Text, email, password, number types
- Validation state styling
- Icon support
- Size variants

#### Select
**Purpose**: Dropdown selection component
**Planned Features**:
- Multi-select support
- Search functionality
- Custom option rendering
- Keyboard navigation

#### Textarea
**Purpose**: Multi-line text input
**Planned Features**:
- Auto-resize options
- Character count
- Validation support

## Utility Components

### ErrorBoundary
**Purpose**: Generic error boundary for component error handling
**Planned Features**:
- Fallback UI customization
- Error reporting integration
- Development error display
- Production error logging

### LazyLoader
**Purpose**: Component lazy loading wrapper
**Planned Features**:
- Loading state display
- Error state handling
- Retry functionality
- Intersection observer support

## Custom Hooks

### useDebounce
**Purpose**: Debounce hook for search inputs and API calls
**Features**:
- Configurable delay
- TypeScript support
- Cleanup handling

### useLocalStorage
**Purpose**: Persistent local storage state management
**Features**:
- JSON serialization
- SSR-safe implementation
- Change event handling

### useMediaQuery
**Purpose**: Responsive design hook
**Features**:
- Breakpoint detection
- SSR compatibility
- Performance optimized

### useOnClickOutside
**Purpose**: Handle clicks outside component
**Features**:
- Multiple ref support
- Escape key handling
- Touch event support

## Architecture Principles

### Reusability First
- Components must be usable across multiple features
- No feature-specific business logic
- Flexible prop interfaces
- Sensible defaults

### Consistency
- Follow established design patterns
- Use consistent naming conventions
- Maintain uniform styling approach
- Standardize prop interfaces

### Performance
- Minimize bundle size impact
- Implement proper memoization
- Use React.lazy for large components
- Optimize re-render patterns

### Accessibility
- WCAG compliance for all components
- Proper ARIA attributes
- Keyboard navigation support
- Screen reader compatibility

## File Structure (Planned)

```
shared/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── __tests__/
│   ├── layout/
│   │   ├── Container.tsx
│   │   ├── Grid.tsx
│   │   ├── Card.tsx
│   │   └── __tests__/
│   ├── forms/
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── FormField.tsx
│   │   └── __tests__/
│   └── utility/
│       ├── ErrorBoundary.tsx
│       ├── LazyLoader.tsx
│       └── __tests__/
├── hooks/
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useMediaQuery.ts
│   ├── useOnClickOutside.ts
│   └── __tests__/
├── utils/
│   ├── formatting.ts
│   ├── validation.ts
│   ├── constants.ts
│   └── __tests__/
└── types/
    ├── common.ts
    └── ui.ts
```

## Usage Guidelines

### Component Import
```tsx
// Preferred import pattern
import { Button, Modal } from '@/components/shared/ui'
import { useDebounce } from '@/components/shared/hooks'
```

### Props Interface
```tsx
// Standard prop interface pattern
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: (event: React.MouseEvent) => void
}
```

## Testing Strategy
- Comprehensive unit tests for all components
- Visual regression testing with Storybook
- Accessibility testing with jest-axe
- Cross-browser compatibility testing

## Storybook Integration
All shared components will include Storybook stories:
- Component documentation
- Interactive prop controls  
- Usage examples
- Design system showcase

## Migration Strategy
1. **Audit existing components** for reusability potential
2. **Extract common patterns** from feature components
3. **Create shared versions** with enhanced APIs
4. **Migrate existing usage** to shared components
5. **Remove duplicate code** from feature modules

---
**Last Updated**: 2025-08-19  
**Status**: Planned for development  
**Compliance**: All components will follow 200-line limits