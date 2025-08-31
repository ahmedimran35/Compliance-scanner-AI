import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import RecentScans from '../RecentScans'

const mockScans = [
  {
    _id: 'scan-1',
    urlId: 'url-1',
    projectId: 'project-1',
    status: 'completed' as const,
    results: { issues: 2, warnings: 1 },
    createdAt: '2024-01-15T10:00:00Z',
    completedAt: '2024-01-15T10:05:00Z',
  },
  {
    _id: 'scan-2',
    urlId: 'url-2',
    projectId: 'project-1',
    status: 'failed' as const,
    createdAt: '2024-01-15T09:00:00Z',
  },
  {
    _id: 'scan-3',
    urlId: 'url-3',
    projectId: 'project-2',
    status: 'scanning' as const,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    _id: 'scan-4',
    urlId: 'url-4',
    projectId: 'project-2',
    status: 'pending' as const,
    createdAt: '2024-01-15T07:00:00Z',
  },
  {
    _id: 'scan-5',
    urlId: 'url-5',
    projectId: 'project-3',
    status: 'completed' as const,
    results: { issues: 0, warnings: 0 },
    createdAt: '2024-01-15T06:00:00Z',
    completedAt: '2024-01-15T06:03:00Z',
  },
  {
    _id: 'scan-6',
    urlId: 'url-6',
    projectId: 'project-3',
    status: 'completed' as const,
    results: { issues: 5, warnings: 2 },
    createdAt: '2024-01-15T05:00:00Z',
    completedAt: '2024-01-15T05:08:00Z',
  },
]

describe('RecentScans Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component title', () => {
    render(<RecentScans scans={mockScans} loading={false} />)

    expect(screen.getByText('Recent Scans')).toBeInTheDocument()
  })

  it('shows loading state when loading is true', () => {
    render(<RecentScans scans={[]} loading={true} />)

    expect(screen.getByText('Loading scans...')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument() // Loading spinner
  })

  it('shows empty state when no scans are available', () => {
    render(<RecentScans scans={[]} loading={false} />)

    expect(screen.getByText('No scans yet')).toBeInTheDocument()
    expect(screen.getByText('Start your first scan to see results here.')).toBeInTheDocument()
  })

  it('renders scan items correctly', () => {
    render(<RecentScans scans={mockScans.slice(0, 3)} loading={false} />)

    // Check for scan statuses
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
    expect(screen.getByText('Scanning')).toBeInTheDocument()
  })

  it('displays correct status icons', () => {
    render(<RecentScans scans={mockScans.slice(0, 4)} loading={false} />)

    // Check for status icons (they are SVG elements with aria-hidden)
    const statusIcons = screen.getAllByRole('img', { hidden: true })
    expect(statusIcons.length).toBeGreaterThan(0)
  })

  it('shows pagination when there are more than 5 scans', () => {
    render(<RecentScans scans={mockScans} loading={false} />)

    // Should show pagination controls
    expect(screen.getByText('Previous')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  it('does not show pagination when there are 5 or fewer scans', () => {
    render(<RecentScans scans={mockScans.slice(0, 5)} loading={false} />)

    // Should not show pagination controls
    expect(screen.queryByText('Previous')).not.toBeInTheDocument()
    expect(screen.queryByText('Next')).not.toBeInTheDocument()
  })

  it('handles pagination navigation', () => {
    render(<RecentScans scans={mockScans} loading={false} />)

    // Click next page button
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    // Should show page 2
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('disables previous button on first page', () => {
    render(<RecentScans scans={mockScans} loading={false} />)

    const prevButton = screen.getByText('Previous')
    expect(prevButton).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(<RecentScans scans={mockScans} loading={false} />)

    // Go to last page
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    // Next button should be disabled
    expect(nextButton).toBeDisabled()
  })

  it('shows correct number of scans per page', () => {
    render(<RecentScans scans={mockScans} loading={false} />)

    // Should show 5 scans on first page
    const scanItems = screen.getAllByText(/Completed|Failed|Scanning|Pending/)
    expect(scanItems.length).toBe(5)
  })

  it('formats dates correctly', () => {
    const now = new Date()
    const recentScans = [
      {
        ...mockScans[0],
        createdAt: now.toISOString(), // Just now
      },
      {
        ...mockScans[1],
        createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      },
      {
        ...mockScans[2],
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
    ]

    render(<RecentScans scans={recentScans} loading={false} />)

    // Check for formatted dates
    expect(screen.getAllByText(/m ago/).length).toBeGreaterThan(0) // minutes ago
    expect(screen.getByText(/h ago/)).toBeInTheDocument() // hours ago
  })

  it('handles different scan statuses correctly', () => {
    const statusScans = [
      { ...mockScans[0], status: 'completed' as const },
      { ...mockScans[1], status: 'failed' as const },
      { ...mockScans[2], status: 'scanning' as const },
      { ...mockScans[3], status: 'pending' as const },
    ]

    render(<RecentScans scans={statusScans} loading={false} />)

    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
    expect(screen.getByText('Scanning')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    render(<RecentScans scans={mockScans.slice(0, 2)} loading={false} />)

    const container = screen.getByText('Recent Scans').closest('div')
    expect(container).toHaveClass(
      'p-6',
      'border-b',
      'border-slate-200'
    )
  })

  it('has proper accessibility attributes', () => {
    render(<RecentScans scans={mockScans.slice(0, 2)} loading={false} />)

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Recent Scans')

    // Check for navigation buttons
    const navButtons = screen.getAllByRole('button')
    expect(navButtons.length).toBeGreaterThan(0)
  })

  it('handles edge case with exactly 5 scans', () => {
    const exactlyFiveScans = mockScans.slice(0, 5)
    render(<RecentScans scans={exactlyFiveScans} loading={false} />)

    // Should not show pagination
    expect(screen.queryByText('Previous')).not.toBeInTheDocument()
    expect(screen.queryByText('Next')).not.toBeInTheDocument()
  })

  it('handles scans without results', () => {
    const scansWithoutResults = [
      {
        ...mockScans[0],
        results: undefined,
      },
    ]

    render(<RecentScans scans={scansWithoutResults} loading={false} />)

    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('handles scans without completedAt', () => {
    const scansWithoutCompletedAt = [
      {
        ...mockScans[0],
        completedAt: undefined,
      },
    ]

    render(<RecentScans scans={scansWithoutCompletedAt} loading={false} />)

    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('maintains proper layout structure', () => {
    render(<RecentScans scans={mockScans.slice(0, 2)} loading={false} />)

    // Check for header section
    const header = screen.getByText('Recent Scans').closest('div')
    expect(header).toHaveClass('p-6', 'border-b', 'border-slate-200')

    // Check for content section
    const content = screen.getByText('Completed').closest('div')
    expect(content).toBeInTheDocument()
  })
})
