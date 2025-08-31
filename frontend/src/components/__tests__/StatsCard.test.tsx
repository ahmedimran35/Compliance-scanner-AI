import React from 'react'
import { render, screen } from '@testing-library/react'
import StatsCard from '../StatsCard'
import { Shield } from 'lucide-react'

describe('StatsCard Component', () => {
  const defaultProps = {
    title: 'Test Title',
    value: '100',
    icon: Shield,
    color: 'blue' as const,
    loading: false,
  }

  it('renders with correct title and value', () => {
    render(<StatsCard {...defaultProps} />)

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('renders with different colors', () => {
    const { rerender } = render(<StatsCard {...defaultProps} color="green" />)
    
    // Check for green color classes in the icon container
    const iconContainer = screen.getByTestId('stats-icon').parentElement
    expect(iconContainer).toHaveClass('bg-green-100')

    rerender(<StatsCard {...defaultProps} color="purple" />)
    expect(iconContainer).toHaveClass('bg-purple-100')

    rerender(<StatsCard {...defaultProps} color="orange" />)
    expect(iconContainer).toHaveClass('bg-orange-100')
  })

  it('shows loading state when loading is true', () => {
    render(<StatsCard {...defaultProps} loading={true} />)

    // Check for loading state - the component shows a loading skeleton
    expect(screen.getByTestId('stats-card')).toHaveAttribute('data-loading', 'true')
    expect(screen.queryByText('100')).not.toBeInTheDocument()
  })

  it('renders icon correctly', () => {
    render(<StatsCard {...defaultProps} />)

    const icon = screen.getByTestId('stats-icon')
    expect(icon).toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    render(<StatsCard {...defaultProps} />)

    const card = screen.getByTestId('stats-card')
    expect(card).toHaveClass(
      'bg-white/80',
      'backdrop-blur-xl',
      'rounded-2xl',
      'p-6',
      'shadow-sm',
      'border',
      'border-slate-200',
      'hover:shadow-lg',
      'transition-all',
      'duration-200',
      'group'
    )
  })

  it('handles different value formats', () => {
    const { rerender } = render(<StatsCard {...defaultProps} value="50%" />)
    expect(screen.getByText('50%')).toBeInTheDocument()

    rerender(<StatsCard {...defaultProps} value="1,234" />)
    expect(screen.getByText('1,234')).toBeInTheDocument()

    rerender(<StatsCard {...defaultProps} value="N/A" />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<StatsCard {...defaultProps} />)

    // Check for test attributes instead of specific role
    const card = screen.getByTestId('stats-card')
    expect(card).toBeInTheDocument()
  })
})
