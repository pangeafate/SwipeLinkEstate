/**
 * Common Component Mocks
 * 
 * This file provides mock implementations for commonly used components
 * across tests, reducing boilerplate and ensuring consistent behavior.
 */

import React from 'react'

/**
 * Next.js Component Mocks
 */

// Mock Next.js Image component
export const MockImage = React.forwardRef(function MockImage(props, ref) {
  const { 
    src, 
    alt, 
    width, 
    height, 
    priority, 
    fill, 
    sizes, 
    quality, 
    placeholder, 
    blurDataURL,
    loading,
    onLoad,
    onError,
    ...otherProps 
  } = props
  
  // Convert Next.js specific props to appropriate HTML attributes
  const imgProps = {
    ref,
    src,
    alt,
    width: fill ? undefined : width,
    height: fill ? undefined : height,
    'data-testid': 'next-image',
    'data-priority': String(priority || false),
    'data-fill': String(fill || false),
    sizes: sizes || undefined,
    loading: loading || undefined,
    onLoad,
    onError,
    ...otherProps
  }

  // Handle placeholder and blur data
  if (placeholder === 'blur' && blurDataURL) {
    imgProps['data-blur'] = 'true'
    imgProps['blurdataurl'] = blurDataURL  // Lowercase version for DOM
  }

  // Remove undefined props to avoid React warnings
  Object.keys(imgProps).forEach(key => {
    if (imgProps[key] === undefined) {
      delete imgProps[key]
    }
  })
  
  return <img {...imgProps} />
})

// Mock Next.js Link component
export const MockLink = React.forwardRef(function MockLink(props, ref) {
  const { href, children, replace, scroll, shallow, prefetch, ...otherProps } = props
  
  return (
    <a
      ref={ref}
      href={href}
      data-testid="next-link"
      data-replace={replace}
      data-scroll={scroll}
      data-shallow={shallow}
      data-prefetch={prefetch}
      {...otherProps}
    >
      {children}
    </a>
  )
})

// Mock Next.js Head component
export const MockHead = ({ children }) => (
  <div data-testid="next-head">
    {children}
  </div>
)

/**
 * Chart/Visualization Component Mocks
 */

// Mock Chart.js components
export const MockChart = ({ type, data, options, ...props }) => (
  <div
    data-testid="chart"
    data-chart-type={type}
    data-chart-data={JSON.stringify(data)}
    data-chart-options={JSON.stringify(options)}
    {...props}
  >
    Chart: {type}
  </div>
)

export const MockLine = (props) => <MockChart type="line" {...props} />
export const MockBar = (props) => <MockChart type="bar" {...props} />
export const MockPie = (props) => <MockChart type="pie" {...props} />
export const MockDoughnut = (props) => <MockChart type="doughnut" {...props} />

// Mock Recharts components
export const MockResponsiveContainer = ({ children, ...props }) => (
  <div data-testid="responsive-container" {...props}>
    {children}
  </div>
)

export const MockLineChart = ({ data, children, ...props }) => (
  <div data-testid="line-chart" data-chart-data={JSON.stringify(data)} {...props}>
    {children}
  </div>
)

export const MockBarChart = ({ data, children, ...props }) => (
  <div data-testid="bar-chart" data-chart-data={JSON.stringify(data)} {...props}>
    {children}
  </div>
)

export const MockXAxis = (props) => <div data-testid="x-axis" {...props} />
export const MockYAxis = (props) => <div data-testid="y-axis" {...props} />
export const MockCartesianGrid = (props) => <div data-testid="cartesian-grid" {...props} />
export const MockTooltip = (props) => <div data-testid="tooltip" {...props} />
export const MockLegend = (props) => <div data-testid="legend" {...props} />
export const MockLine2 = (props) => <div data-testid="line" {...props} />
export const MockBar2 = (props) => <div data-testid="bar" {...props} />

/**
 * Animation Component Mocks
 */

// Mock Framer Motion components
export const MockMotionDiv = React.forwardRef(function MockMotionDiv(props, ref) {
  const { animate, initial, exit, transition, whileHover, whileTap, children, ...otherProps } = props
  
  return (
    <div
      ref={ref}
      data-testid="motion-div"
      data-animate={JSON.stringify(animate)}
      data-initial={JSON.stringify(initial)}
      data-exit={JSON.stringify(exit)}
      data-transition={JSON.stringify(transition)}
      data-while-hover={JSON.stringify(whileHover)}
      data-while-tap={JSON.stringify(whileTap)}
      {...otherProps}
    >
      {children}
    </div>
  )
})

export const MockAnimatePresence = ({ children, ...props }) => (
  <div data-testid="animate-presence" {...props}>
    {children}
  </div>
)

// Mock React Spring components
export const MockSpring = ({ children, ...props }) => (
  <div data-testid="spring" data-spring-props={JSON.stringify(props)}>
    {children}
  </div>
)

export const MockTransition = ({ items, children, ...props }) => (
  <div data-testid="transition" data-transition-items={JSON.stringify(items)}>
    {typeof children === 'function' ? children() : children}
  </div>
)

/**
 * UI Library Component Mocks
 */

// Mock Modal/Dialog components
export const MockModal = ({ isOpen, onClose, children, ...props }) => {
  if (!isOpen) return null
  
  return (
    <div data-testid="modal" data-is-open={isOpen} {...props}>
      <div data-testid="modal-backdrop" onClick={onClose} />
      <div data-testid="modal-content">
        <button data-testid="modal-close" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  )
}

// Mock Toast/Notification components
export const MockToast = ({ message, type, onClose, ...props }) => (
  <div data-testid="toast" data-toast-type={type} {...props}>
    <span>{message}</span>
    <button data-testid="toast-close" onClick={onClose}>×</button>
  </div>
)

// Mock Dropdown/Select components
export const MockDropdown = ({ options, value, onChange, placeholder, ...props }) => (
  <select
    data-testid="dropdown"
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    {...props}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options?.map((option, index) => (
      <option key={option.value || index} value={option.value}>
        {option.label || option}
      </option>
    ))}
  </select>
)

// Mock Date Picker components
export const MockDatePicker = ({ value, onChange, placeholder, ...props }) => (
  <input
    type="date"
    data-testid="date-picker"
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    placeholder={placeholder}
    {...props}
  />
)

/**
 * Form Component Mocks
 */

// Mock File Upload components
export const MockFileUpload = ({ onFileSelect, multiple, accept, ...props }) => {
  const handleChange = (e) => {
    const files = Array.from(e.target.files)
    onFileSelect?.(multiple ? files : files[0])
  }
  
  return (
    <input
      type="file"
      data-testid="file-upload"
      multiple={multiple}
      accept={accept}
      onChange={handleChange}
      {...props}
    />
  )
}

// Mock Rich Text Editor
export const MockRichTextEditor = ({ value, onChange, ...props }) => (
  <textarea
    data-testid="rich-text-editor"
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    {...props}
  />
)

/**
 * Layout Component Mocks
 */

// Mock Grid components
export const MockGrid = ({ children, columns, gap, ...props }) => (
  <div
    data-testid="grid"
    data-columns={columns}
    data-gap={gap}
    style={{ display: 'grid', gridTemplateColumns: `repeat(${columns || 1}, 1fr)`, gap }}
    {...props}
  >
    {children}
  </div>
)

export const MockGridItem = ({ children, ...props }) => (
  <div data-testid="grid-item" {...props}>
    {children}
  </div>
)

// Mock Flex components
export const MockFlex = ({ children, direction, justify, align, wrap, gap, ...props }) => (
  <div
    data-testid="flex"
    style={{
      display: 'flex',
      flexDirection: direction,
      justifyContent: justify,
      alignItems: align,
      flexWrap: wrap,
      gap
    }}
    {...props}
  >
    {children}
  </div>
)

/**
 * Loading Component Mocks
 */

// Mock Spinner/Loader components
export const MockSpinner = ({ size, color, ...props }) => (
  <div
    data-testid="spinner"
    data-size={size}
    data-color={color}
    {...props}
  >
    Loading...
  </div>
)

export const MockSkeleton = ({ width, height, ...props }) => (
  <div
    data-testid="skeleton"
    style={{ width, height, backgroundColor: '#f0f0f0' }}
    {...props}
  />
)

/**
 * Data Display Component Mocks
 */

// Mock Table components
export const MockTable = ({ data, columns, onRowClick, ...props }) => (
  <table data-testid="table" {...props}>
    <thead>
      <tr>
        {columns?.map((col, index) => (
          <th key={col.key || index} data-testid={`table-header-${col.key || index}`}>
            {col.title || col.header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data?.map((row, rowIndex) => (
        <tr key={row.id || rowIndex} onClick={() => onRowClick?.(row)}>
          {columns?.map((col, colIndex) => (
            <td key={col.key || colIndex} data-testid={`table-cell-${rowIndex}-${col.key || colIndex}`}>
              {row[col.key] || row[col.dataIndex]}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
)

// Mock Pagination components
export const MockPagination = ({ current, total, pageSize, onChange, ...props }) => (
  <div data-testid="pagination" {...props}>
    <button
      data-testid="pagination-prev"
      disabled={current <= 1}
      onClick={() => onChange?.(current - 1)}
    >
      Previous
    </button>
    <span data-testid="pagination-info">
      Page {current} of {Math.ceil(total / pageSize)}
    </span>
    <button
      data-testid="pagination-next"
      disabled={current >= Math.ceil(total / pageSize)}
      onClick={() => onChange?.(current + 1)}
    >
      Next
    </button>
  </div>
)

/**
 * Mock Component Factory
 * Creates custom mock components on demand
 */
export const MockComponentFactory = {
  /**
   * Creates a simple mock component with props logging
   * @param {string} name - Component name
   * @param {Object} defaultProps - Default props
   * @returns {React.Component} Mock component
   */
  create(name, defaultProps = {}) {
    const MockComponent = React.forwardRef(function MockComponent(props, ref) {
      return (
        <div
          ref={ref}
          data-testid={`mock-${name.toLowerCase()}`}
          data-props={JSON.stringify({ ...defaultProps, ...props })}
          {...props}
        >
          {name} Component
          {props.children}
        </div>
      )
    })
    
    MockComponent.displayName = `Mock${name}`
    return MockComponent
  },

  /**
   * Creates a mock component that throws an error
   * @param {string} name - Component name
   * @param {string} errorMessage - Error message to throw
   * @returns {React.Component} Error-throwing mock component
   */
  createErrorComponent(name, errorMessage = 'Test error') {
    const ErrorComponent = () => {
      throw new Error(errorMessage)
    }
    
    ErrorComponent.displayName = `MockError${name}`
    return ErrorComponent
  },

  /**
   * Creates a mock component that renders asynchronously
   * @param {string} name - Component name
   * @param {number} delay - Delay in milliseconds
   * @returns {React.Component} Async mock component
   */
  createAsyncComponent(name, delay = 100) {
    const AsyncComponent = ({ children, ...props }) => {
      const [isLoading, setIsLoading] = React.useState(true)
      
      React.useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), delay)
        return () => clearTimeout(timer)
      }, [])
      
      if (isLoading) {
        return <div data-testid={`mock-${name.toLowerCase()}-loading`}>Loading {name}...</div>
      }
      
      return (
        <div data-testid={`mock-${name.toLowerCase()}`} {...props}>
          {name} Component
          {children}
        </div>
      )
    }
    
    AsyncComponent.displayName = `MockAsync${name}`
    return AsyncComponent
  }
}

/**
 * Mock module mappings for common libraries
 */
export const mockModules = {
  // Next.js
  'next/image': MockImage,
  'next/link': MockLink,
  'next/head': MockHead,
  
  // Chart.js
  'react-chartjs-2': {
    Line: MockLine,
    Bar: MockBar,
    Pie: MockPie,
    Doughnut: MockDoughnut,
  },
  
  // Recharts
  'recharts': {
    ResponsiveContainer: MockResponsiveContainer,
    LineChart: MockLineChart,
    BarChart: MockBarChart,
    XAxis: MockXAxis,
    YAxis: MockYAxis,
    CartesianGrid: MockCartesianGrid,
    Tooltip: MockTooltip,
    Legend: MockLegend,
    Line: MockLine2,
    Bar: MockBar2,
  },
  
  // Framer Motion
  'framer-motion': {
    motion: {
      div: MockMotionDiv,
    },
    AnimatePresence: MockAnimatePresence,
  },
  
  // React Spring
  '@react-spring/web': {
    useSpring: () => ({}),
    animated: {
      div: MockSpring,
    },
    useTransition: MockTransition,
  }
}

export default {
  // Next.js mocks
  MockImage,
  MockLink,
  MockHead,
  
  // Chart mocks
  MockChart,
  MockLine,
  MockBar,
  MockPie,
  MockDoughnut,
  MockResponsiveContainer,
  MockLineChart,
  MockBarChart,
  MockXAxis,
  MockYAxis,
  MockCartesianGrid,
  MockTooltip,
  MockLegend,
  
  // Animation mocks
  MockMotionDiv,
  MockAnimatePresence,
  MockSpring,
  MockTransition,
  
  // UI mocks
  MockModal,
  MockToast,
  MockDropdown,
  MockDatePicker,
  MockFileUpload,
  MockRichTextEditor,
  
  // Layout mocks
  MockGrid,
  MockGridItem,
  MockFlex,
  
  // Loading mocks
  MockSpinner,
  MockSkeleton,
  
  // Data display mocks
  MockTable,
  MockPagination,
  
  // Factory and utilities
  MockComponentFactory,
  mockModules
}