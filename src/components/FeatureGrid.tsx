interface Feature {
  step: number;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    step: 1,
    title: 'Input Your Idea',
    description:
      'Share your concept in natural language - no technical knowledge required',
  },
  {
    step: 2,
    title: 'AI Analysis',
    description:
      'Our AI clarifies requirements and breaks down complex projects into manageable tasks',
  },
  {
    step: 3,
    title: 'Action Plan',
    description:
      'Receive detailed blueprints, timelines, and prioritized task lists ready for execution',
  },
];

export default function FeatureGrid() {
  return (
    <section className="mt-16 grid md:grid-cols-3 gap-8">
      {features.map((feature) => (
        <article key={feature.step} className="text-center">
          <div
            className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
            aria-hidden="true"
          >
            <span className="text-primary-600 text-2xl font-bold">
              {feature.step}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {feature.title}
          </h3>
          <p className="text-gray-800">{feature.description}</p>
        </article>
      ))}
    </section>
  );
}
