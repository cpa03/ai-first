export default function WhyChooseSection() {
  return (
    <div className="mt-16 bg-gray-50 rounded-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Why Choose IdeaFlow for Project Planning?
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="flex items-start space-x-3">
          <div className="bg-green-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
            <span className="text-green-600 text-sm">✓</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              AI-Powered Intelligence
            </h3>
            <p className="text-gray-600 text-sm">
              Advanced AI algorithms analyze your ideas and generate
              comprehensive project plans
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="bg-green-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
            <span className="text-green-600 text-sm">✓</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Time-Saving Automation
            </h3>
            <p className="text-gray-600 text-sm">
              Reduce planning time by 80% with automated task breakdown and
              timeline generation
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="bg-green-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
            <span className="text-green-600 text-sm">✓</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Developer-Friendly
            </h3>
            <p className="text-gray-600 text-sm">
              Export plans to GitHub, Notion, and other tools your team already
              uses
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="bg-green-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
            <span className="text-green-600 text-sm">✓</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Collaborative Planning
            </h3>
            <p className="text-gray-600 text-sm">
              Share blueprints with your team and iterate on plans in real-time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
