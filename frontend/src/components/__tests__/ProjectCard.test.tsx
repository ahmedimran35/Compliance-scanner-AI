import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProjectCard from '../ProjectCard'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
}))

// Mock Clerk authentication
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: jest.fn().mockResolvedValue('test-token'),
  }),
}))

// Mock the API configuration
jest.mock('../../config/api', () => ({
  getApiUrl: () => 'http://localhost:3001',
}))

// Mock fetch
global.fetch = jest.fn()

const mockProject = {
  _id: 'test-project-id',
  name: 'Test Project',
  description: 'A test project description',
  urlCount: 5,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
}

const mockOnDelete = jest.fn()

describe('ProjectCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock successful fetch response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    ) as jest.Mock
  })

  it('renders project information correctly', () => {
    render(<ProjectCard project={mockProject} />)

    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('A test project description')).toBeInTheDocument()
    expect(screen.getByText('5 URLs')).toBeInTheDocument()
  })

  it('displays project creation date', () => {
    render(<ProjectCard project={mockProject} />)

    // Should show the formatted date
    expect(screen.getByText(/Created/)).toBeInTheDocument()
  })

  it('renders project icon', () => {
    render(<ProjectCard project={mockProject} />)

    // Check for the folder icon container
    const iconContainer = screen.getByRole('img', { hidden: true })
    expect(iconContainer).toBeInTheDocument()
  })

  it('shows action buttons when showActions is true', () => {
    render(<ProjectCard project={mockProject} showActions={true} />)

    // Check for action buttons by their titles
    expect(screen.getByTitle('View Details')).toBeInTheDocument()
    expect(screen.getByTitle('Delete Project')).toBeInTheDocument()
  })

  it('hides action buttons when showActions is false', () => {
    render(<ProjectCard project={mockProject} showActions={false} />)

    expect(screen.queryByTitle('View Details')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Delete Project')).not.toBeInTheDocument()
  })

  it('calls onDelete when delete button is clicked and confirmed', async () => {
    render(<ProjectCard project={mockProject} onDelete={mockOnDelete} />)

    // Click delete button
    const deleteButton = screen.getByTitle('Delete Project')
    fireEvent.click(deleteButton)

    // Should show delete confirmation
    await waitFor(() => {
      expect(screen.getByText('Delete Project')).toBeInTheDocument()
    })

    // Click confirm delete (the button, not the heading)
    const confirmButtons = screen.getAllByText('Delete Project')
    const confirmButton = confirmButtons.find(button => button.tagName === 'BUTTON')
    fireEvent.click(confirmButton!)

    // Should call onDelete
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('test-project-id')
    })
  })

  it('shows loading state during deletion', async () => {
    // Mock a slow fetch response
    global.fetch = jest.fn(() =>
      new Promise((resolve) =>
        setTimeout(() =>
          resolve({
            ok: true,
            json: () => Promise.resolve({}),
          }),
          100
        )
      )
    ) as jest.Mock

    render(<ProjectCard project={mockProject} onDelete={mockOnDelete} />)

    // Click delete button
    const deleteButton = screen.getByTitle('Delete Project')
    fireEvent.click(deleteButton)

    // Click confirm delete
    const confirmButton = screen.getByText('Delete Project')
    fireEvent.click(confirmButton)

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Deleting...')).toBeInTheDocument()
    })
  })

  it('handles delete API errors gracefully', async () => {
    // Mock API error
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' }),
      })
    ) as jest.Mock

    // Mock alert
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {})

    render(<ProjectCard project={mockProject} onDelete={mockOnDelete} />)

    // Click delete button
    const deleteButton = screen.getByTitle('Delete Project')
    fireEvent.click(deleteButton)

    // Click confirm delete
    const confirmButton = screen.getByText('Delete Project')
    fireEvent.click(confirmButton)

    // Should show error alert
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Failed to delete project. Please try again.')
    })

    mockAlert.mockRestore()
  })

  it('cancels delete confirmation when cancel is clicked', async () => {
    render(<ProjectCard project={mockProject} onDelete={mockOnDelete} />)

    // Click delete button
    const deleteButton = screen.getByTitle('Delete Project')
    fireEvent.click(deleteButton)

    // Should show delete confirmation
    await waitFor(() => {
      expect(screen.getByText('Delete Project')).toBeInTheDocument()
    })

    // Click cancel (close button)
    const closeButton = screen.getByTitle('Close')
    fireEvent.click(closeButton)

    // Should hide confirmation and not call onDelete
    await waitFor(() => {
      expect(screen.queryByText('Delete Project')).not.toBeInTheDocument()
    })

    expect(mockOnDelete).not.toHaveBeenCalled()
  })

  it('does not show delete confirmation when onDelete is not provided', () => {
    render(<ProjectCard project={mockProject} />)

    // Delete button should not be present when onDelete is not provided
    expect(screen.queryByTitle('Delete Project')).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<ProjectCard project={mockProject} />)

    // Check for proper heading structure
    const heading = screen.getByRole('heading', { level: 3 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Test Project')
  })

  it('applies correct styling classes', () => {
    render(<ProjectCard project={mockProject} />)

    const card = screen.getByText('Test Project').closest('div')
    expect(card).toHaveClass(
      'bg-white/90',
      'backdrop-blur-sm',
      'rounded-2xl',
      'border',
      'border-gray-100',
      'shadow-sm',
      'hover:shadow-lg',
      'transition-all',
      'duration-300',
      'hover:-translate-y-1',
      'h-full',
      'flex',
      'flex-col'
    )
  })

  it('handles projects without description', () => {
    const projectWithoutDescription = {
      ...mockProject,
      description: undefined,
    }

    render(<ProjectCard project={projectWithoutDescription} />)

    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.queryByText('A test project description')).not.toBeInTheDocument()
  })

  it('formats different date scenarios correctly', () => {
    const today = new Date().toISOString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { rerender } = render(<ProjectCard project={{ ...mockProject, createdAt: today }} />)
    expect(screen.getByText('Created Today')).toBeInTheDocument()

    rerender(<ProjectCard project={{ ...mockProject, createdAt: yesterday }} />)
    expect(screen.getByText('Created Yesterday')).toBeInTheDocument()

    rerender(<ProjectCard project={{ ...mockProject, createdAt: weekAgo }} />)
    expect(screen.getByText(/Created \d+ days ago/)).toBeInTheDocument()
  })
})
