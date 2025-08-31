import React from 'react'
import { render, screen } from '@testing-library/react'
import Layout from '../Layout'

// Mock the Sidebar component
jest.mock('../Sidebar', () => {
  return function MockSidebar({ isOpen, onToggle }) {
    return (
      <div data-testid="sidebar" data-open={isOpen}>
        <button onClick={onToggle} data-testid="sidebar-toggle">
          Toggle Sidebar
        </button>
      </div>
    )
  }
})

// Mock the AssistantWidget component
jest.mock('../AssistantWidget', () => {
  return function MockAssistantWidget() {
    return <div data-testid="assistant-widget">Assistant Widget</div>
  }
})

describe('Layout Component', () => {
  it('renders children correctly', () => {
    render(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    )

    expect(screen.getByTestId('test-content')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders sidebar component', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('renders assistant widget', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    // The assistant widget is dynamically imported, so we check for the dynamic component
    expect(screen.getByText('Dynamic Component')).toBeInTheDocument()
  })

  it('renders mobile header on mobile viewport', () => {
    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    // Check for mobile header elements
    expect(screen.getByText('ComplianceScanner AI')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
  })
})
