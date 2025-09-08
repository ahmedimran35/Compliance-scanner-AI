import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Sidebar from '../Sidebar'

// Mock the useRouter hook
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/dashboard',
}))

// Mock the getApiUrl function
jest.mock('../../config/api', () => ({
  getApiUrl: () => 'http://localhost:3001',
}))

describe('Sidebar Component', () => {
  const defaultProps = {
    isOpen: false,
    onToggle: jest.fn(),
    onToggleVisibility: jest.fn(),
    isHidden: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders sidebar with navigation items', () => {
    render(<Sidebar {...defaultProps} />)

    // Check for main navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Monitoring')).toBeInTheDocument()
    expect(screen.getByText('Reports')).toBeInTheDocument()
    expect(screen.getByText('Scheduled Scans')).toBeInTheDocument()
    expect(screen.getByText('News')).toBeInTheDocument()
    expect(screen.getByText('Donate')).toBeInTheDocument()
  })

  it('renders close button for mobile', () => {
    render(<Sidebar {...defaultProps} isOpen={true} />)

    const closeButton = screen.getByLabelText('Close sidebar')
    expect(closeButton).toBeInTheDocument()
  })

  it('calls onToggle when close button is clicked', () => {
    const onToggle = jest.fn()
    render(<Sidebar {...defaultProps} isOpen={true} onToggle={onToggle} />)

    const closeButton = screen.getByLabelText('Close sidebar')
    fireEvent.click(closeButton)

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('renders user menu with user information', () => {
    render(<Sidebar {...defaultProps} />)

    // Check for user information
    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(screen.getByText('Free')).toBeInTheDocument()
  })

  it('renders notifications section', () => {
    render(<Sidebar {...defaultProps} />)

    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })

  it('renders chat with ScanBot button', () => {
    render(<Sidebar {...defaultProps} />)

    expect(screen.getByText('Chat with ScanBot')).toBeInTheDocument()
  })

  it('applies correct classes when sidebar is open', () => {
    render(<Sidebar {...defaultProps} isOpen={true} />)

    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar).toHaveAttribute('data-open', 'true')
  })

  it('applies correct classes when sidebar is hidden', () => {
    render(<Sidebar {...defaultProps} isHidden={true} />)

    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar).toHaveAttribute('data-hidden', 'true')
  })

  it('renders logo and brand name', () => {
    render(<Sidebar {...defaultProps} />)

    expect(screen.getByText('ComplianceScanner AI')).toBeInTheDocument()
    expect(screen.getByText('Alpha')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<Sidebar {...defaultProps} />)

    const sidebar = screen.getByRole('complementary')
    expect(sidebar).toBeInTheDocument()
  })
})
