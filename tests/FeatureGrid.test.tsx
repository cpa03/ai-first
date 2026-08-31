import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FeatureGrid from '@/components/FeatureGrid';
import { FEATURE_GRID_LABELS } from '@/lib/config/component-labels';

describe('FeatureGrid', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    window.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  it('renders feature steps with ARIA labels and list attributes', () => {
    render(<FeatureGrid />);

    const stepsList = screen.getByRole('list', {
      name: FEATURE_GRID_LABELS.STEPS_LIST_ARIA_LABEL,
    });
    expect(stepsList).toBeInTheDocument();

    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(3);

    listItems.forEach((item) => {
      const ariaLabel = item.getAttribute('aria-label');
      expect(ariaLabel).toBeDefined();
      expect(ariaLabel).toMatch(/^Step \d+: .+/);
    });
  });

  it('renders keyboard navigation hint with proper ARIA label', () => {
    render(<FeatureGrid />);

    const navHintContainer = screen.getByLabelText(
      FEATURE_GRID_LABELS.KEYBOARD_NAV_ARIA_LABEL
    );
    expect(navHintContainer).toBeInTheDocument();
    expect(navHintContainer).toHaveTextContent(
      FEATURE_GRID_LABELS.KEYBOARD_NAV_HINT
    );
    expect(navHintContainer).toHaveTextContent(
      FEATURE_GRID_LABELS.KEYBOARD_JUMP_HINT
    );
  });
});
