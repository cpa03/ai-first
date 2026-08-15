import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WhyChooseSection from '@/components/WhyChooseSection';

describe('WhyChooseSection', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    window.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  it('renders benefit items with complete aria-label including description', () => {
    render(<WhyChooseSection />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBeGreaterThan(0);

    listItems.forEach((item) => {
      const ariaLabel = item.getAttribute('aria-label');
      expect(ariaLabel).toBeDefined();
      expect(ariaLabel).toContain(': ');
    });
  });
});
