import React from 'react';
import { render, screen } from '@testing-library/react';
import WhyChooseSection from '../src/components/WhyChooseSection';

describe('WhyChooseSection', () => {
  it('should render the heading', () => {
    render(<WhyChooseSection />);
    expect(
      screen.getByText('Why Choose IdeaFlow for Project Planning?')
    ).toBeInTheDocument();
  });

  it('should have the group class on all articles', () => {
    const { container } = render(<WhyChooseSection />);
    const articles = container.querySelectorAll('article');
    expect(articles.length).toBe(4);
    articles.forEach((article) => {
      expect(article).toHaveClass('group');
    });
  });

  it('should have group-hover classes on icon containers', () => {
    const { container } = render(<WhyChooseSection />);
    const iconContainers = container.querySelectorAll('.group-hover\\:bg-green-200');
    expect(iconContainers.length).toBe(4);
  });
});
