'use client';

import { useEffect, useCallback, useState } from 'react';

interface KeyboardNavigationOptions<T> {
  items: readonly T[];
  getItemId: (item: T, index: number) => string;
  cardSelector: string;
  onFocusChange?: (index: number | null) => void;
  onAnnounce?: (text: string) => void;
  getAnnouncement?: (item: T, index: number, total: number) => string;
}

interface KeyboardNavigationResult {
  focusedIndex: number | null;
  handleFocus: (index: number) => void;
  handleBlur: () => void;
}

/**
 * Shared keyboard navigation hook for card-based components.
 * Supports Arrow keys, Home/End navigation with consistent UX.
 */
export function useKeyboardNavigation<T>({
  items,
  getItemId,
  cardSelector,
  onFocusChange,
  onAnnounce,
  getAnnouncement,
}: KeyboardNavigationOptions<T>): KeyboardNavigationResult {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isCardFocused = target.closest(cardSelector);
      if (!isCardFocused) return;

      const currentIndex = items.findIndex((item, index) => {
        const id = getItemId(item, index);
        return (
          id === target.dataset.articleId || id === target.dataset.featureStep
        );
      });
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = Math.min(currentIndex + 1, items.length - 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = items.length - 1;
          break;
        default:
          return;
      }

      if (nextIndex !== currentIndex) {
        const nextCard = document.querySelector(
          `[data-article-id="${getItemId(items[nextIndex], nextIndex)}"], ` +
            `[data-feature-step="${getItemId(items[nextIndex], nextIndex)}"]`
        ) as HTMLElement;

        if (nextCard) {
          nextCard.focus();
          setFocusedIndex(nextIndex);
          onFocusChange?.(nextIndex);

          if (getAnnouncement && onAnnounce) {
            const text = getAnnouncement(
              items[nextIndex],
              nextIndex,
              items.length
            );
            onAnnounce(text);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    items,
    getItemId,
    cardSelector,
    onFocusChange,
    onAnnounce,
    getAnnouncement,
  ]);

  const handleFocus = useCallback(
    (index: number) => {
      setFocusedIndex(index);
      onFocusChange?.(index);

      if (getAnnouncement && onAnnounce) {
        const text = getAnnouncement(items[index], index, items.length);
        onAnnounce(text);
      }
    },
    [items, onFocusChange, onAnnounce, getAnnouncement]
  );

  const handleBlur = useCallback(() => {
    setFocusedIndex(null);
    onFocusChange?.(null);
  }, [onFocusChange]);

  return {
    focusedIndex,
    handleFocus,
    handleBlur,
  };
}

export default useKeyboardNavigation;
