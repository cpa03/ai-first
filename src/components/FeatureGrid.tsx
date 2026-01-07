export default function FeatureGrid() {
  return (
    <section className="mt-16 grid md:grid-cols-3 gap-8">
      <article className="text-center">
        <div
          className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
          aria-hidden="true"
        >
          <span className="text-primary-600 text-2xl font-bold">1</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Input Your Idea
        </h3>
        <p className="text-gray-600">
          Share your concept in natural language - no technical knowledge
          required
        </p>
      </article>
      <article className="text-center">
        <div
          className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
          aria-hidden="true"
        >
          <span className="text-primary-600 text-2xl font-bold">2</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          AI Analysis
        </h3>
        <p className="text-gray-600">
          Our AI clarifies requirements and breaks down complex projects into
          manageable tasks
        </p>
      </article>
      <article className="text-center">
        <div
          className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
          aria-hidden="true"
        >
          <span className="text-primary-600 text-2xl font-bold">3</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Action Plan
        </h3>
        <p className="text-gray-600">
          Receive detailed blueprints, timelines, and prioritized task lists
          ready for execution
        </p>
      </article>
    </section>
  );
}
