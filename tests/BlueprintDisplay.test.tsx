import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlueprintDisplay from '@/components/BlueprintDisplay';

describe('BlueprintDisplay', () => {
  it('shows loading state initially', () => {
    const idea = 'Test idea';
    const answers = { target_audience: 'Developers' };

    render(<BlueprintDisplay idea={idea} answers={answers} />);

    expect(screen.getByText(/generating your blueprint/i)).toBeInTheDocument();
    expect(
      screen.getByText(/our ai is analyzing your answers/i)
    ).toBeInTheDocument();
  });

  it('displays blueprint after loading', async () => {
    const idea = 'Test idea';
    const answers = {
      target_audience: 'Developers',
      timeline: '2 weeks',
      budget: '$1000',
      technical_skills: 'JavaScript',
      main_goal: 'Build MVP',
    };

    render(<BlueprintDisplay idea={idea} answers={answers} />);

    await waitFor(
      () => {
        expect(screen.getByText(/your project blueprint/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText(/test idea/i)).toBeInTheDocument();
    expect(screen.getByText(/developers/i)).toBeInTheDocument();
    expect(screen.getByText(/2 weeks/i)).toBeInTheDocument();
    expect(screen.getByText(/\$1000/i)).toBeInTheDocument();
    expect(screen.getByText(/javascript/i)).toBeInTheDocument();
    expect(screen.getByText(/build mvp/i)).toBeInTheDocument();
  });

  it('handles missing answers gracefully', async () => {
    const idea = 'Test idea';
    const answers = {};

    render(<BlueprintDisplay idea={idea} answers={answers} />);

    await waitFor(
      () => {
        expect(screen.getByText(/your project blueprint/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText(/not specified/i)).toBeInTheDocument();
  });

  it('has download button after loading', async () => {
    const idea = 'Test idea';
    const answers = { target_audience: 'Developers' };

    render(<BlueprintDisplay idea={idea} answers={answers} />);

    await waitFor(
      () => {
        expect(screen.getByText(/download markdown/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const downloadButton = screen.getByText(/download markdown/i);
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton.closest('button')).toBeEnabled();
  });
});
