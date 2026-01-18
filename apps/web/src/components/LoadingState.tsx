import { Loader2, Check } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface LoadingStateProps {
  currentStep?: number
}

export function LoadingState({ currentStep = 2 }: LoadingStateProps) {
  const steps = [
    { label: 'Fetching session data' },
    { label: 'Loading telemetry' },
    { label: 'Computing comparisons' },
    { label: 'Rendering charts' },
  ]

  return (
    <div className="flex-1 bg-zinc-950 p-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          {/* Spinner */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white text-center mb-6">
            Analyzing Session
          </h3>

          {/* Progress Steps */}
          <div className="space-y-3">
            {steps.map((step, i) => {
              const isDone = i < currentStep
              const isCurrent = i === currentStep
              const isPending = i > currentStep

              return (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      isDone
                        ? 'bg-green-500'
                        : isCurrent
                        ? 'bg-blue-500'
                        : 'bg-zinc-800'
                    }`}
                  >
                    {isDone && <Check className="w-3 h-3 text-white" />}
                    {isCurrent && <Loader2 className="w-3 h-3 text-white animate-spin" />}
                  </div>
                  <span
                    className={`text-sm ${
                      isPending ? 'text-zinc-600' : 'text-white'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>

          <p className="text-xs text-zinc-600 text-center mt-6">
            Tip: Data is cached after first load for instant access
          </p>
        </div>

        {/* Skeleton Preview */}
        <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-48 w-full mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}
