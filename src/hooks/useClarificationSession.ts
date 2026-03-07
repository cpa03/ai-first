'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchWithTimeout } from '@/lib/api-client';
import { createLogger } from '@/lib/logger';
import { UI_CONFIG, CLARIFIER_CONFIG, MESSAGES } from '@/lib/config';

const logger = createLogger('useClarificationSession');

export interface Question {
  readonly id: string;
  readonly question: string;
  readonly type: 'text' | 'textarea' | 'select';
  readonly options?: readonly string[];
}

interface APIQuestion {
  readonly id: string;
  readonly question: string;
  readonly type: 'open' | 'multiple_choice' | 'yes_no';
  readonly options?: readonly string[];
  readonly required: boolean;
}

export interface Step {
  readonly id: string;
  readonly label: string;
  readonly completed: boolean;
  readonly current: boolean;
}

export interface UseClarificationSessionReturn {
  loading: boolean;
  error: string | null;
  questions: Question[];
  currentStep: number;
  currentQuestion: Question | undefined;
  progress: number;
  steps: Step[];
  answers: Record<string, string>;
  currentAnswer: string;
  showCelebration: boolean;
  isSubmitting: boolean;
  isMac: boolean;
  textInputRef: React.RefObject<HTMLInputElement>;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  selectRef: React.RefObject<HTMLSelectElement>;
  setCurrentAnswer: (value: string) => void;
  handleNext: () => Promise<void>;
  handlePrevious: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

const FALLBACK_QUESTIONS: readonly Question[] =
  CLARIFIER_CONFIG.FALLBACK_QUESTIONS.map(
    (q): Question => ({
      id: q.id,
      question: q.question,
      type:
        q.type === 'multiple_choice'
          ? 'select'
          : q.type === 'open'
            ? 'textarea'
            : 'text',
      ...('options' in q && q.options && { options: [...q.options] }),
    })
  ) as Question[];

function formatQuestions(questionsData: readonly APIQuestion[]): Question[] {
  return questionsData.map((q, index) => ({
    id: q.id || `question_${index}`,
    question: q.question,
    type:
      q.type === 'open'
        ? 'textarea'
        : q.type === 'multiple_choice'
          ? 'select'
          : 'text',
    options: q.options,
  }));
}

export function useClarificationSession(
  idea: string,
  ideaId: string | undefined,
  onComplete: (answers: Record<string, string>) => Promise<void>
): UseClarificationSessionReturn {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const textInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const stepTransitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMac(
      typeof window !== 'undefined' && navigator.platform.includes('Mac')
    );
  }, []);

  const currentQuestion = useMemo(
    () => questions[currentStep],
    [questions, currentStep]
  );

  const progress = useMemo(
    () => ((currentStep + 1) / questions.length) * 100,
    [currentStep, questions.length]
  );

  const steps = useMemo(
    () =>
      questions.map((q, index) => ({
        id: q.id,
        label: `Question ${index + 1}`,
        completed: index < currentStep,
        current: index === currentStep,
      })),
    [questions, currentStep]
  );

  const handleNext = useCallback(async () => {
    if (showCelebration || isSubmitting || !currentAnswer.trim()) return;
    if (!currentQuestion?.id) return;

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: currentAnswer.trim(),
    };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      const nextStep = currentStep + 1;
      setShowCelebration(true);
      stepTransitionTimeoutRef.current = setTimeout(() => {
        setCurrentStep(nextStep);
        setCurrentAnswer('');
      }, 300);
    } else {
      setIsSubmitting(true);
      try {
        await onComplete(newAnswers);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [
    showCelebration,
    isSubmitting,
    currentAnswer,
    answers,
    currentQuestion?.id,
    currentStep,
    questions.length,
    onComplete,
  ]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const previousQuestion = questions[currentStep - 1];
      setCurrentAnswer(answers[previousQuestion.id] || '');
    }
  }, [currentStep, questions, answers]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === 'Enter' &&
        currentAnswer.trim()
      ) {
        e.preventDefault();
        handleNext();
      }
    },
    [currentAnswer, handleNext]
  );

  useEffect(() => {
    if (!currentQuestion || questions.length === 0) return;

    const timeoutId = setTimeout(() => {
      const ref =
        currentQuestion.type === 'textarea'
          ? textareaRef
          : currentQuestion.type === 'select'
            ? selectRef
            : textInputRef;
      ref.current?.focus();
    }, UI_CONFIG.FOCUS.DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [currentStep, currentQuestion, questions.length]);

  useEffect(() => {
    return () => {
      if (stepTransitionTimeoutRef.current) {
        clearTimeout(stepTransitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetchWithTimeout('/api/clarify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idea, ideaId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || MESSAGES.CLARIFICATION.ERROR_FETCH_QUESTIONS
          );
        }

        const data = await response.json();
        const rawQuestions = data?.data?.questions ?? data?.questions;
        const questionsData = Array.isArray(rawQuestions) ? rawQuestions : [];

        let formattedQuestions = formatQuestions(questionsData);

        if (formattedQuestions.length === 0) {
          formattedQuestions = [...FALLBACK_QUESTIONS];
        }

        setQuestions(formattedQuestions);
      } catch (err) {
        logger.errorWithContext('Failed to fetch clarifying questions', {
          component: 'ClarificationFlow',
          action: 'fetchQuestions',
          metadata: {
            ideaId,
            ideaLength: idea.length,
            error: err instanceof Error ? err.message : 'Unknown error',
          },
        });
        setError(
          err instanceof Error ? err.message : MESSAGES.ERRORS.UNKNOWN_ERROR
        );
        setQuestions([...FALLBACK_QUESTIONS]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [idea, ideaId]);

  return {
    loading,
    error,
    questions,
    currentStep,
    currentQuestion,
    progress,
    steps,
    answers,
    currentAnswer,
    showCelebration,
    isSubmitting,
    isMac,
    textInputRef,
    textareaRef,
    selectRef,
    setCurrentAnswer,
    handleNext,
    handlePrevious,
    handleKeyDown,
  };
}
