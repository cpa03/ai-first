import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReferralLink from '../src/components/ReferralLink';

const mockSelectNodeContents = jest.fn();
const mockRemoveAllRanges = jest.fn();
const mockAddRange = jest.fn();

const mockSelection = {
  removeAllRanges: mockRemoveAllRanges,
  addRange: mockAddRange,
} as unknown as Selection;

const mockRange = {
  selectNodeContents: mockSelectNodeContents,
} as unknown as Range;

window.getSelection = jest.fn().mockReturnValue(mockSelection);
document.createRange = jest.fn().mockReturnValue(mockRange);

describe('ReferralLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the referral title, description, and link correctly', () => {
    render(<ReferralLink referralCode="testcode123" />);

    expect(screen.getByText(/Share Your Referral Link/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Invite friends and earn rewards when they sign up!/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/signup\?ref=testcode123/i)).toBeInTheDocument();
  });

  it('selects the entire code container content on click', () => {
    render(<ReferralLink referralCode="testcode123" />);

    const codeElement = screen.getByText(/signup\?ref=testcode123/i);
    fireEvent.click(codeElement);

    expect(window.getSelection).toHaveBeenCalled();
    expect(document.createRange).toHaveBeenCalled();
    expect(mockSelectNodeContents).toHaveBeenCalledWith(codeElement);
    expect(mockRemoveAllRanges).toHaveBeenCalled();
    expect(mockAddRange).toHaveBeenCalledWith(mockRange);
  });

  it('selects the entire code container content on Enter press', () => {
    render(<ReferralLink referralCode="testcode123" />);

    const codeElement = screen.getByText(/signup\?ref=testcode123/i);
    fireEvent.keyDown(codeElement, { key: 'Enter' });

    expect(window.getSelection).toHaveBeenCalled();
    expect(document.createRange).toHaveBeenCalled();
    expect(mockSelectNodeContents).toHaveBeenCalledWith(codeElement);
    expect(mockRemoveAllRanges).toHaveBeenCalled();
    expect(mockAddRange).toHaveBeenCalledWith(mockRange);
  });

  it('selects the entire code container content on Space press', () => {
    render(<ReferralLink referralCode="testcode123" />);

    const codeElement = screen.getByText(/signup\?ref=testcode123/i);
    fireEvent.keyDown(codeElement, { key: ' ' });

    expect(window.getSelection).toHaveBeenCalled();
    expect(document.createRange).toHaveBeenCalled();
    expect(mockSelectNodeContents).toHaveBeenCalledWith(codeElement);
    expect(mockRemoveAllRanges).toHaveBeenCalled();
    expect(mockAddRange).toHaveBeenCalledWith(mockRange);
  });

  it('does not select content on tab or other keys', () => {
    render(<ReferralLink referralCode="testcode123" />);

    const codeElement = screen.getByText(/signup\?ref=testcode123/i);
    fireEvent.keyDown(codeElement, { key: 'Tab' });

    expect(window.getSelection).not.toHaveBeenCalled();
    expect(document.createRange).not.toHaveBeenCalled();
  });
});
