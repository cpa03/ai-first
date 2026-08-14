import { render, screen, fireEvent } from '@testing-library/react';
import SectionIndicator from '@/components/SectionIndicator';

// Mock scrollY and scrollIntoView
beforeEach(() => {
  Object.defineProperty(window, 'scrollY', {
    value: 500,
    writable: true,
  });
});

describe('SectionIndicator', () => {
  const mockSections = [
    { id: 'section-1', label: 'Section One', shortcut: '1' },
    { id: 'section-2', label: 'Section Two', shortcut: '2' },
  ];

  it('renders section navigation when scroll position exceeds threshold', () => {
    render(<SectionIndicator sections={mockSections} />);

    const nav = screen.getByRole('navigation', { name: /section navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it('includes focus-visible:scale-125 class for enhanced keyboard accessibility', () => {
    render(<SectionIndicator sections={mockSections} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveClass('focus-visible:scale-125');
  });

  it('triggers scrollIntoView when section dot is clicked', () => {
    const mockScrollIntoView = jest.fn();
    const sectionEl = document.createElement('div');
    sectionEl.id = 'section-1';
    sectionEl.scrollIntoView = mockScrollIntoView;
    document.body.appendChild(sectionEl);

    render(<SectionIndicator sections={mockSections} />);

    const button = screen.getByRole('button', { name: /jump to section one section/i });
    fireEvent.click(button);

    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });

    document.body.removeChild(sectionEl);
  });
});
