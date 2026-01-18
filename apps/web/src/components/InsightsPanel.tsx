import { MetricCard } from '@/components/ui/MetricCard'

interface InsightsPanelProps {
  insights: string[]
  metrics?: Array<{
    label: string
    value: string | number
    unit?: string
  }>
}

export function InsightsPanel({ insights, metrics }: InsightsPanelProps) {
  return (
    <div className="space-y-4">
      {/* Key Takeaways */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">Key Takeaways</h3>
        {insights.length > 0 ? (
          <ul className="space-y-3">
            {insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                <span className="text-blue-400 mt-0.5">&#8226;</span>
                {insight}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">
            Run analysis to see insights
          </p>
        )}
      </div>

      {/* Metric Cards */}
      {metrics && metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric, i) => (
            <MetricCard
              key={i}
              label={metric.label}
              value={metric.value}
              unit={metric.unit}
            />
          ))}
        </div>
      )}
    </div>
  )
}
