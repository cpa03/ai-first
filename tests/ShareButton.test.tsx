import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ShareButton from '@/components/ShareButton';

// Mock clipboard API
const mockWriteText = jest.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
});

// Mock haptic feedback
jest.mock('@/lib/utils', () => {
  const original = jest.requireActual('@/lib/utils');
  return {
    ...original,
    triggerHapticFeedback: jest.fn(),
  };
});

// Mock toast system
const mockShowToast = jest.fn();
if (typeof window !== 'undefined') {
  (window as unknown as { showToast: typeof mockShowToast }).showToast =
    mockShowToast;
}

describe('ShareButton Micro-UX & Keyboard Shortcuts', () => {
  let originalShare: ((data?: ShareData) => Promise<void>) | undefined;
  let originalCanShare: ((data?: ShareData) => boolean) | undefined;

  beforeAll(() => {
    originalShare = navigator.share;
    originalCanShare = navigator.canShare;
  });

  afterAll(() => {
    Object.defineProperty(navigator, 'share', {
      value: originalShare,
      writable: true,
    });
    Object.defineProperty(navigator, 'canShare', {
      value: originalCanShare,
      writable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset navigator share to undefined (desktop mode fallback)
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, 'canShare', {
      value: undefined,
      configurable: true,
      writable: true,
    });
  });

  it('renders standard ShareButton correctly with default labels', () => {
    render(<ShareButton />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Share');
  });

  it('renders icon-only variant correctly', () => {
    render(<ShareButton variant="icon-only" ariaLabel="Share link" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Share link');
  });

  it('falls back to Clipboard API and copies url to clipboard on desktop', async () => {
    render(
      <ShareButton
        shareUrl="https://example.com/ref"
        toastMessage="Link copied!"
      />
    );
    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(mockWriteText).toHaveBeenCalledWith('https://example.com/ref');
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        message: 'Link copied!',
      })
    );
  });

  it('uses Web Share API if available on mobile/supported platforms', async () => {
    const mockShare = jest.fn().mockResolvedValue(undefined);
    const mockCanShare = jest.fn().mockReturnValue(true);

    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(navigator, 'canShare', {
      value: mockCanShare,
      configurable: true,
      writable: true,
    });

    render(
      <ShareButton
        shareUrl="https://example.com/ref"
        shareTitle="My Title"
        shareText="Some text"
      />
    );
    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(mockShare).toHaveBeenCalledWith({
      title: 'My Title',
      text: 'Some text',
      url: 'https://example.com/ref',
    });
    expect(mockWriteText).not.toHaveBeenCalled();
  });

  it('triggers custom onShare callback after sharing', async () => {
    const mockOnShare = jest.fn();
    render(<ShareButton onShare={mockOnShare} />);
    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(mockOnShare).toHaveBeenCalled();
  });

  it('supports Ctrl+Shift+S (lowercase) and Ctrl+Shift+S (uppercase) global keyboard shortcuts', async () => {
    const mockOnShare = jest.fn();
    render(<ShareButton onShare={mockOnShare} />);

    // Test lowercase 's' with Shift + Ctrl
    await act(async () => {
      fireEvent.keyDown(document, {
        key: 's',
        shiftKey: true,
        ctrlKey: true,
      });
    });

    expect(mockOnShare).toHaveBeenCalledTimes(1);

    // Test uppercase 'S' with Shift + Cmd (metaKey)
    await act(async () => {
      fireEvent.keyDown(document, {
        key: 'S',
        shiftKey: true,
        metaKey: true,
      });
    });

    expect(mockOnShare).toHaveBeenCalledTimes(2);
  });

  it('ignores the keyboard shortcut if focus is on an input or textarea element', async () => {
    const mockOnShare = jest.fn();
    render(<ShareButton onShare={mockOnShare} />);

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    await act(async () => {
      fireEvent.keyDown(input, {
        key: 's',
        shiftKey: true,
        ctrlKey: true,
      });
    });

    expect(mockOnShare).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it('renders platform-aware keyboard shortcut in tooltip', async () => {
    const originalPlatform = navigator.platform;

    // Simulate Mac platform
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
      writable: true,
    });

    const { unmount } = render(<ShareButton />);
    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.focus(button);
    });

    expect(await screen.findByText('⌘')).toBeInTheDocument();
    expect(screen.getByText('⇧')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();

    unmount();

    // Simulate Windows platform
    Object.defineProperty(navigator, 'platform', {
      value: 'Win32',
      configurable: true,
      writable: true,
    });

    render(<ShareButton />);
    const buttonWin = screen.getByRole('button');

    await act(async () => {
      fireEvent.focus(buttonWin);
    });

    expect(await screen.findByText('Ctrl')).toBeInTheDocument();
    expect(screen.getByText('⇧')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();

    Object.defineProperty(navigator, 'platform', {
      value: originalPlatform,
      configurable: true,
      writable: true,
    });
  });
});
