import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CopyButton from '@/components/CopyButton';

// Mock clipboard API
const mockWriteText = jest.fn();
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
});

describe('CopyButton Keyboard Shortcuts & Functionality', () => {
  beforeEach(() => {
    mockWriteText.mockClear();
  });

  it('renders CopyButton with default label', () => {
    render(<CopyButton textToCopy="Hello World" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Copy');
  });

  it('copies text to clipboard on click', async () => {
    render(<CopyButton textToCopy="Hello World" />);
    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(mockWriteText).toHaveBeenCalledWith('Hello World');
  });

  it('copies text to clipboard when focused and pressing Ctrl+C', async () => {
    render(<CopyButton textToCopy="Hello World" />);
    const button = screen.getByRole('button');
    button.focus();

    await act(async () => {
      fireEvent.keyDown(button, { key: 'c', ctrlKey: true });
    });

    expect(mockWriteText).toHaveBeenCalledWith('Hello World');
  });

  it('copies text to clipboard when focused and pressing Cmd+C (metaKey)', async () => {
    render(<CopyButton textToCopy="Hello World" />);
    const button = screen.getByRole('button');
    button.focus();

    await act(async () => {
      fireEvent.keyDown(button, { key: 'c', metaKey: true });
    });

    expect(mockWriteText).toHaveBeenCalledWith('Hello World');
  });

  it('does not copy text if pressing C without modifier keys', async () => {
    render(<CopyButton textToCopy="Hello World" />);
    const button = screen.getByRole('button');
    button.focus();

    await act(async () => {
      fireEvent.keyDown(button, { key: 'c' });
    });

    expect(mockWriteText).not.toHaveBeenCalled();
  });
});
