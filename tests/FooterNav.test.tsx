import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FooterNav from '@/components/FooterNav';

// Mock next/navigation
const mockUsePathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

const testColumns = [
  {
    title: 'Resources',
    items: [
      { href: '/', label: 'Home', ariaLabel: 'Go to Home page' },
      { href: '/about', label: 'About', ariaLabel: 'Go to About page' },
    ],
  },
];

describe('FooterNav Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders footer navigation columns and items correctly', () => {
    mockUsePathname.mockReturnValue('/about');
    render(<FooterNav columns={testColumns} />);

    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('correctly identifies the active page and applies active styling', () => {
    mockUsePathname.mockReturnValue('/about');
    render(<FooterNav columns={testColumns} />);

    const homeLink = screen.getByRole('link', { name: 'Go to Home page' });
    const aboutLink = screen.getByRole('link', { name: 'Go to About page' });

    expect(homeLink).not.toHaveAttribute('aria-current', 'page');
    expect(aboutLink).toHaveAttribute('aria-current', 'page');

    // Active link has font-semibold text-primary-600
    expect(aboutLink).toHaveClass('text-primary-600');
    expect(aboutLink).toHaveClass('font-semibold');
  });

  it('applies the motion-reduce:hover:transform-none class to inactive links', () => {
    mockUsePathname.mockReturnValue('/about');
    render(<FooterNav columns={testColumns} />);

    const homeLink = screen.getByRole('link', { name: 'Go to Home page' });
    expect(homeLink).toHaveClass('motion-reduce:hover:transform-none');
  });

  it('shows keyboard navigation hint with directional arrows on first focus', () => {
    mockUsePathname.mockReturnValue('/about');
    render(<FooterNav columns={testColumns} />);

    const homeLink = screen.getByRole('link', { name: 'Go to Home page' });
    act(() => {
      fireEvent.focus(homeLink);
    });

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toBeInTheDocument();
    expect(statusRegion).toHaveTextContent('Use');
    expect(statusRegion).toHaveTextContent('↑');
    expect(statusRegion).toHaveTextContent('↓');
    expect(statusRegion).toHaveTextContent('←');
    expect(statusRegion).toHaveTextContent('→');
    expect(statusRegion).toHaveTextContent('to navigate');
  });
});
