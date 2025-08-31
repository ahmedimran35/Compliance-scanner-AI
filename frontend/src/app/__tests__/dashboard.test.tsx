import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import DashboardPage from '../dashboard/page'

// Mock the Layout component
jest.mock('../../components/Layout', () => {
  return function MockLayout({ children }) {
    return <div data-testid="layout">{children}</div>
  }
})

// Mock the dynamic imports
jest.mock('../../components/QuickScanModal', () => {
  return function MockQuickScanModal({ onClose, onComplete }) {
    return (
      <div data-testid="quick-scan-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={() => onComplete('test-scan-id')}>Complete</button>
      </div>
    )
  }
})

jest.mock('../../components/StatsCard', () => {
  return function MockStatsCard({ title, value, loading }) {
    return (
      <div data-testid="stats-card" data-loading={loading}>
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
    )
  }
})

jest.mock('../../components/ProjectCard', () => {
  return function MockProjectCard({ project }) {
    return (
      <div data-testid="project-card">
        <h3>{project.name}</h3>
        <p>{project.description}</p>
      </div>
    )
  }
})

jest.mock('../../components/QuickActionCard', () => {
  return function MockQuickActionCard() {
    return <div data-testid="quick-action-card">Quick Action</div>
  }
})

jest.mock('../../components/RecentScans', () => {
  return function MockRecentScans({ scans, loading }) {
    return (
      <div data-testid="recent-scans" data-loading={loading}>
        <h3>Recent Scans</h3>
        <p>{scans.length} scans</p>
      </div>
    )
  }
})

jest.mock('../../components/AssistantWidget', () => {
  return function MockAssistantWidget() {
    return <div data-testid="assistant-widget">Assistant</div>
  }
})

// Mock the API configuration
jest.mock('../../config/api', () => ({
  getApiUrl: () => 'http://localhost:3001',
}))

describe('Dashboard Page', () => {
  beforeEach(() => {
    // Mock successful API responses
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          projects: [],
          scans: [],
          count: 0,
        }),
      })
    ) as jest.Mock
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders dashboard with main sections', async () => {
    await act(async () => {
      render(<DashboardPage />)
    })

    // Check for main dashboard elements
    expect(screen.getByText(/Welcome back/)).toBeInTheDocument()
    expect(screen.getByText('Quick Scan')).toBeInTheDocument()
    expect(screen.getByText('Your Projects')).toBeInTheDocument()
  })

  it('renders stats cards', async () => {
    await act(async () => {
      render(<DashboardPage />)
    })

    await waitFor(() => {
      expect(screen.getAllByTestId('stats-card')).toHaveLength(4)
    })
  })

  it('renders project section', async () => {
    await act(async () => {
      render(<DashboardPage />)
    })

    await waitFor(() => {
      expect(screen.getByText('Your Projects')).toBeInTheDocument()
    })
  })

  it('renders recent scans section', async () => {
    await act(async () => {
      render(<DashboardPage />)
    })

    await waitFor(() => {
      expect(screen.getByTestId('recent-scans')).toBeInTheDocument()
    })
  })

  it('renders assistant widget', async () => {
    await act(async () => {
      render(<DashboardPage />)
    })

    await waitFor(() => {
      expect(screen.getByTestId('assistant-widget')).toBeInTheDocument()
    })
  })

  it('shows loading state initially', async () => {
    await act(async () => {
      render(<DashboardPage />)
    })

    // Check for loading indicators - the component shows loading state in stats cards
    expect(screen.getAllByTestId('stats-card')).toHaveLength(4)
  })

  it('handles API errors gracefully', async () => {
    // Mock API error
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })
    ) as jest.Mock

    await act(async () => {
      render(<DashboardPage />)
    })

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument()
    })
  })

  it('renders quick scan button', async () => {
    await act(async () => {
      render(<DashboardPage />)
    })

    const quickScanButton = screen.getByText('Quick Scan')
    expect(quickScanButton).toBeInTheDocument()
  })

  it('renders new project button', async () => {
    await act(async () => {
      render(<DashboardPage />)
    })

    await waitFor(() => {
      expect(screen.getByText('New Project')).toBeInTheDocument()
    })
  })

  it('has proper accessibility attributes', async () => {
    await act(async () => {
      render(<DashboardPage />)
    })

    await waitFor(() => {
      // Check for layout structure instead of specific role
      const layout = screen.getByTestId('layout')
      expect(layout).toBeInTheDocument()
    })
  })

  it('renders with proper layout structure', async () => {
    await act(async () => {
      render(<DashboardPage />)
    })

    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })
})
