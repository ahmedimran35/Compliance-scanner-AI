import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Search, Plus, Settings, AlertTriangle } from 'lucide-react'
import QuickActionCard from '../QuickActionCard'

describe('QuickActionCard Component', () => {
  const defaultProps = {
    title: 'Quick Scan',
    description: 'Scan a single URL for compliance issues',
    icon: Search,
    color: 'blue' as const,
    onClick: jest.fn(),
    buttonText: 'Start Scan',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with all required information', () => {
    render(<QuickActionCard {...defaultProps} />)

    expect(screen.getByText('Quick Scan')).toBeInTheDocument()
    expect(screen.getByText('Scan a single URL for compliance issues')).toBeInTheDocument()
    expect(screen.getByText('Start Scan')).toBeInTheDocument()
  })

  it('calls onClick when button is clicked', () => {
    const mockOnClick = jest.fn()
    render(<QuickActionCard {...defaultProps} onClick={mockOnClick} />)

    const button = screen.getByText('Start Scan')
    fireEvent.click(button)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('renders with blue color theme', () => {
    render(<QuickActionCard {...defaultProps} color="blue" />)

    const card = screen.getByText('Quick Scan').closest('div')
    expect(card).toHaveClass('border-blue-200')
  })

  it('renders with green color theme', () => {
    render(<QuickActionCard {...defaultProps} color="green" />)

    const card = screen.getByText('Quick Scan').closest('div')
    expect(card).toHaveClass('border-green-200')
  })

  it('renders with purple color theme', () => {
    render(<QuickActionCard {...defaultProps} color="purple" />)

    const card = screen.getByText('Quick Scan').closest('div')
    expect(card).toHaveClass('border-purple-200')
  })

  it('renders with orange color theme', () => {
    render(<QuickActionCard {...defaultProps} color="orange" />)

    const card = screen.getByText('Quick Scan').closest('div')
    expect(card).toHaveClass('border-orange-200')
  })

  it('renders with red color theme', () => {
    render(<QuickActionCard {...defaultProps} color="red" />)

    const card = screen.getByText('Quick Scan').closest('div')
    expect(card).toHaveClass('border-red-200')
  })

  it('renders with slate color theme', () => {
    render(<QuickActionCard {...defaultProps} color="slate" />)

    const card = screen.getByText('Quick Scan').closest('div')
    expect(card).toHaveClass('border-slate-200')
  })

  it('renders different icons correctly', () => {
    const { rerender } = render(<QuickActionCard {...defaultProps} icon={Search} />)
    
    // Check for search icon
    const searchIcon = screen.getByRole('img', { hidden: true })
    expect(searchIcon).toBeInTheDocument()

    // Test with different icon
    rerender(<QuickActionCard {...defaultProps} icon={Plus} />)
    const plusIcon = screen.getByRole('img', { hidden: true })
    expect(plusIcon).toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    render(<QuickActionCard {...defaultProps} />)

    const card = screen.getByText('Quick Scan').closest('div')
    expect(card).toHaveClass(
      'bg-white/80',
      'backdrop-blur-xl',
      'rounded-2xl',
      'p-6',
      'shadow-sm',
      'border',
      'hover:shadow-lg',
      'transition-all',
      'duration-200',
      'group'
    )
  })

  it('renders button with correct styling', () => {
    render(<QuickActionCard {...defaultProps} color="blue" />)

    const button = screen.getByText('Start Scan')
    expect(button).toHaveClass(
      'w-full',
      'bg-blue-500',
      'hover:bg-blue-600',
      'text-white',
      'py-3',
      'rounded-xl',
      'font-medium',
      'transition-all',
      'duration-200',
      'shadow-sm',
      'hover:shadow-md',
      'transform',
      'hover:scale-[1.02]'
    )
  })

  it('renders button with green styling when color is green', () => {
    render(<QuickActionCard {...defaultProps} color="green" />)

    const button = screen.getByText('Start Scan')
    expect(button).toHaveClass('bg-green-500', 'hover:bg-green-600')
  })

  it('renders button with purple styling when color is purple', () => {
    render(<QuickActionCard {...defaultProps} color="purple" />)

    const button = screen.getByText('Start Scan')
    expect(button).toHaveClass('bg-purple-500', 'hover:bg-purple-600')
  })

  it('renders button with orange styling when color is orange', () => {
    render(<QuickActionCard {...defaultProps} color="orange" />)

    const button = screen.getByText('Start Scan')
    expect(button).toHaveClass('bg-orange-500', 'hover:bg-orange-600')
  })

  it('renders button with red styling when color is red', () => {
    render(<QuickActionCard {...defaultProps} color="red" />)

    const button = screen.getByText('Start Scan')
    expect(button).toHaveClass('bg-red-500', 'hover:bg-red-600')
  })

  it('renders button with slate styling when color is slate', () => {
    render(<QuickActionCard {...defaultProps} color="slate" />)

    const button = screen.getByText('Start Scan')
    expect(button).toHaveClass('bg-slate-500', 'hover:bg-slate-600')
  })

  it('has proper accessibility attributes', () => {
    render(<QuickActionCard {...defaultProps} />)

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 3 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Quick Scan')

    // Check for button role
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Start Scan')
  })

  it('handles long titles and descriptions', () => {
    const longProps = {
      ...defaultProps,
      title: 'This is a very long title that might wrap to multiple lines',
      description: 'This is a very long description that contains a lot of text and might also wrap to multiple lines to test how the component handles longer content.',
    }

    render(<QuickActionCard {...longProps} />)

    expect(screen.getByText(longProps.title)).toBeInTheDocument()
    expect(screen.getByText(longProps.description)).toBeInTheDocument()
  })

  it('handles special characters in text', () => {
    const specialProps = {
      ...defaultProps,
      title: 'Special & Characters < > " \'',
      description: 'Description with special chars: & < > " \'',
      buttonText: 'Click & Go!',
    }

    render(<QuickActionCard {...specialProps} />)

    expect(screen.getByText(specialProps.title)).toBeInTheDocument()
    expect(screen.getByText(specialProps.description)).toBeInTheDocument()
    expect(screen.getByText(specialProps.buttonText)).toBeInTheDocument()
  })

  it('renders with different button text', () => {
    render(<QuickActionCard {...defaultProps} buttonText="Custom Button" />)

    expect(screen.getByText('Custom Button')).toBeInTheDocument()
    expect(screen.queryByText('Start Scan')).not.toBeInTheDocument()
  })

  it('maintains proper spacing and layout', () => {
    render(<QuickActionCard {...defaultProps} />)

    const card = screen.getByText('Quick Scan').closest('div')
    expect(card).toHaveClass('p-6')

    const button = screen.getByText('Start Scan')
    expect(button).toHaveClass('w-full')
  })
})
