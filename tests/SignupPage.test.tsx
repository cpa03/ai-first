import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignupPage from '@/app/signup/page';
import { PLATFORM } from '@/lib/dom-utils';
import { KeyboardShortcutsProvider } from '@/components/KeyboardShortcutsProvider';

// Mock Next.js router
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock haptic feedback while keeping other utils (like cn)
jest.mock('@/lib/utils', () => {
  const actual = jest.requireActual('@/lib/utils');
  return {
    ...actual,
    triggerHapticFeedback: jest.fn(),
  };
});

// Mock platform module
jest.mock('@/lib/dom-utils', () => {
  const actual = jest.requireActual('@/lib/dom-utils');
  return {
    ...actual,
    PLATFORM: {
      isMac: jest.fn().mockReturnValue(false),
    },
    isFocusedOnInput: jest.fn().mockReturnValue(false),
  };
});

// Mock Supabase client
const mockSignUp = jest.fn().mockResolvedValue({ data: {}, error: null });
jest.mock('@/lib/db', () => ({
  supabaseClient: {
    auth: {
      signUp: (..._args: unknown[]) => mockSignUp(..._args),
    },
  },
}));

describe('SignupPage Keyboard Submission and Platform-aware UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignUp.mockResolvedValue({ data: {}, error: null });
    (PLATFORM.isMac as jest.Mock).mockReturnValue(false);
    (require('@/lib/dom-utils').isFocusedOnInput as jest.Mock).mockReturnValue(
      false
    );
  });

  it('renders correct keyboard shortcut help hint for Windows/Linux when isMac is false', () => {
    render(
      <KeyboardShortcutsProvider>
        <SignupPage />
      </KeyboardShortcutsProvider>
    );

    // Check for "Ctrl" + "Enter" helper text elements
    const kbdElements = screen.getAllByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === 'kbd' &&
        (content === 'Ctrl' || content === 'Enter')
      );
    });
    expect(kbdElements[0]).toHaveTextContent('Ctrl');
    expect(kbdElements[1]).toHaveTextContent('Enter');
  });

  it('renders correct keyboard shortcut help hint for macOS when isMac is true', () => {
    (PLATFORM.isMac as jest.Mock).mockReturnValue(true);
    render(
      <KeyboardShortcutsProvider>
        <SignupPage />
      </KeyboardShortcutsProvider>
    );

    const kbdElements = screen.getAllByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === 'kbd' &&
        (content === '⌘' || content === 'Enter')
      );
    });
    expect(kbdElements[0]).toHaveTextContent('⌘');
    expect(kbdElements[1]).toHaveTextContent('Enter');
  });

  it('submits form via global Ctrl+Enter key press', async () => {
    const { container } = render(
      <KeyboardShortcutsProvider>
        <SignupPage />
      </KeyboardShortcutsProvider>
    );

    // Fill the email and password fields using container selectors
    const emailInput = container.querySelector('#email') as HTMLInputElement;
    const passwordInput = container.querySelector(
      '#password'
    ) as HTMLInputElement;
    const confirmPasswordInput = container.querySelector(
      '#confirmPassword'
    ) as HTMLInputElement;

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPassword1!' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'ValidPassword1!' },
    });

    // Dispatch Ctrl+Enter keydown event globally inside act
    await act(async () => {
      fireEvent.keyDown(container, { key: 'Enter', ctrlKey: true });
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'ValidPassword1!',
      options: {
        emailRedirectTo: expect.any(String),
      },
    });
  });

  it('submits form via global Cmd+Enter key press', async () => {
    (PLATFORM.isMac as jest.Mock).mockReturnValue(true);
    const { container } = render(
      <KeyboardShortcutsProvider>
        <SignupPage />
      </KeyboardShortcutsProvider>
    );

    const emailInput = container.querySelector('#email') as HTMLInputElement;
    const passwordInput = container.querySelector(
      '#password'
    ) as HTMLInputElement;
    const confirmPasswordInput = container.querySelector(
      '#confirmPassword'
    ) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidPassword1!' } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'ValidPassword1!' },
    });

    await act(async () => {
      fireEvent.keyDown(container, { key: 'Enter', metaKey: true });
    });

    expect(mockSignUp).toHaveBeenCalled();
  });

  it('does not submit form via global Ctrl+Enter when typing in other elements and inputs are not focused', async () => {
    (require('@/lib/dom-utils').isFocusedOnInput as jest.Mock).mockReturnValue(
      true
    );
    const { container } = render(
      <KeyboardShortcutsProvider>
        <SignupPage />
      </KeyboardShortcutsProvider>
    );

    await act(async () => {
      fireEvent.keyDown(container, { key: 'Enter', ctrlKey: true });
    });

    expect(mockSignUp).not.toHaveBeenCalled();
  });
});
