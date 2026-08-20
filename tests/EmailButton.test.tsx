import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmailButton from '@/components/EmailButton';

// Mock window.open
const mockOpen = jest.fn();
const originalOpen = window.open;

describe('EmailButton Keyboard Shortcuts & Functionality', () => {
  beforeAll(() => {
    window.open = mockOpen;
  });

  afterAll(() => {
    window.open = originalOpen;
  });

  beforeEach(() => {
    mockOpen.mockClear();
  });

  it('renders EmailButton with default label', () => {
    render(<EmailButton ideaTitle="My Idea" ideaContent="Flow Content" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Email to Self');
  });

  it('opens email client with mailto link on click', async () => {
    render(<EmailButton ideaTitle="My Idea" ideaContent="Flow Content" />);
    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(mockOpen).toHaveBeenCalled();
    const mailtoUrl = mockOpen.mock.calls[0][0];
    expect(mailtoUrl).toContain('mailto:');

    const decodedUrl = decodeURIComponent(mailtoUrl);
    expect(decodedUrl).toContain('subject=My IdeaFlow Blueprint: My Idea');
    expect(decodedUrl).toContain('Summary:\nFlow Content');
  });

  it('opens email client via Ctrl+Shift+E keyboard shortcut when not in input', async () => {
    render(<EmailButton ideaTitle="My Idea" ideaContent="Flow Content" />);

    await act(async () => {
      fireEvent.keyDown(document, { key: 'e', ctrlKey: true, shiftKey: true });
    });

    expect(mockOpen).toHaveBeenCalled();
  });

  it('opens email client via Cmd+Shift+E keyboard shortcut when not in input', async () => {
    render(<EmailButton ideaTitle="My Idea" ideaContent="Flow Content" />);

    await act(async () => {
      fireEvent.keyDown(document, { key: 'e', metaKey: true, shiftKey: true });
    });

    expect(mockOpen).toHaveBeenCalled();
  });

  it('does not open email client via Ctrl+E when typing in an input element', async () => {
    render(
      <div>
        <input data-testid="test-input" type="text" />
        <EmailButton ideaTitle="My Idea" ideaContent="Flow Content" />
      </div>
    );

    const input = screen.getByTestId('test-input');
    input.focus();

    await act(async () => {
      fireEvent.keyDown(input, { key: 'e', ctrlKey: true });
    });

    expect(mockOpen).not.toHaveBeenCalled();
  });

  it('does not open email client via Ctrl+E when typing in a textarea element', async () => {
    render(
      <div>
        <textarea data-testid="test-textarea" />
        <EmailButton ideaTitle="My Idea" ideaContent="Flow Content" />
      </div>
    );

    const textarea = screen.getByTestId('test-textarea');
    textarea.focus();

    await act(async () => {
      fireEvent.keyDown(textarea, { key: 'e', ctrlKey: true });
    });

    expect(mockOpen).not.toHaveBeenCalled();
  });

  it('calls the onEmailSent callback on successful trigger', async () => {
    const onEmailSentMock = jest.fn();
    render(
      <EmailButton
        ideaTitle="My Idea"
        ideaContent="Flow Content"
        onEmailSent={onEmailSentMock}
      />
    );
    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(onEmailSentMock).toHaveBeenCalled();
  });

  it('renders platform-aware tooltip keyboard shortcut hints', () => {
    const { container } = render(
      <EmailButton ideaTitle="My Idea" ideaContent="Flow Content" />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // Verify tooltip or aria-keyshortcuts has shortcuts
    expect(button).toHaveAttribute(
      'aria-keyshortcuts',
      'Control+Shift+E, Meta+Shift+E'
    );
  });
});
