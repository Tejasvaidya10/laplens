import { glossaryTerms, quickStarts } from '@/lib/design-tokens'

interface EmptyStateProps {
  onQuickStart?: (preset: { season: number; event: string; session: string; driverA?: string; driverB?: string }) => void
}

export function EmptyState({ onQuickStart }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="max-w-2xl w-full">
        {/* Welcome Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="LapLens" className="w-10 h-10 rounded-lg" />
            <h2 className="text-xl font-bold text-white">Welcome to LapLens</h2>
          </div>
          <p className="text-zinc-400 mb-6">Get started in 3 simple steps:</p>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { num: 1, title: 'Choose your data', desc: 'Select a season, event, and session' },
              { num: 2, title: 'Pick two drivers', desc: 'Select drivers to compare head-to-head' },
              { num: 3, title: 'Explore insights', desc: 'View charts with plain explanations' },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center mx-auto mb-2">
                  {step.num}
                </div>
                <h4 className="font-medium text-white mb-1">{step.title}</h4>
                <p className="text-xs text-zinc-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Start Tiles */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">
            Quick Start
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {quickStarts.map((item, i) => (
              <button
                key={i}
                onClick={() => onQuickStart?.(item.preset)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-left hover:border-zinc-700 transition"
              >
                <div className="text-sm font-medium text-white">{item.race}</div>
                <div className="text-xs text-zinc-500">{item.session}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Glossary Preview */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">
            Glossary
          </h3>
          <div className="space-y-2">
            {glossaryTerms.slice(0, 3).map((item, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className="text-blue-400 font-medium">{item.term}:</span>
                <span className="text-zinc-400">{item.definition}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
