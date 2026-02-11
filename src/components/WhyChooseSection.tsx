export default function WhyChooseSection() {
  return (
    <section
      className="mt-16 bg-gray-50 rounded-lg p-8"
      aria-labelledby="why-choose-heading"
    >
      <h2
        id="why-choose-heading"
        className="text-2xl font-bold text-gray-900 mb-6 text-center"
      >
        Why Choose IdeaFlow for Project Planning?
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        <article className="flex items-start space-x-3">
          <div
            className="bg-green-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1"
            aria-hidden="true"
          >
            <svg
              className="w-4 h-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              AI-Powered Intelligence
            </h3>
            <p className="text-gray-700 text-sm">
              Advanced AI algorithms analyze your ideas and generate
              comprehensive project plans
            </p>
          </div>
        </article>
        <article className="flex items-start space-x-3">
          <div
            className="bg-green-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1"
            aria-hidden="true"
          >
            <svg
              className="w-4 h-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Time-Saving Automation
            </h3>
            <p className="text-gray-700 text-sm">
              Reduce planning time by 80% with automated task breakdown and
              timeline generation
            </p>
          </div>
        </article>
        <article className="flex items-start space-x-3">
          <div
            className="bg-green-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1"
            aria-hidden="true"
          >
            <svg
              className="w-4 h-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Developer-Friendly
            </h3>
            <p className="text-gray-700 text-sm">
              Export plans to GitHub, Notion, and other tools your team already
              uses
            </p>
          </div>
        </article>
        <article className="flex items-start space-x-3">
          <div
            className="bg-green-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1"
            aria-hidden="true"
          >
            <svg
              className="w-4 h-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Collaborative Planning
            </h3>
            <p className="text-gray-700 text-sm">
              Share blueprints with your team and iterate on plans in real-time
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
