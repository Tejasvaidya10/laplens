import { Zap, BarChart3, BookOpen, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/Badge'

interface LandingPageProps {
  onOpenApp: () => void
}

export function LandingPage({ onOpenApp }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navbar */}
      <nav className="border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold text-white">LapLens</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition">
              Features
            </a>
            <a href="#glossary" className="text-sm text-zinc-400 hover:text-white transition">
              Glossary
            </a>
            <a href="#about" className="text-sm text-zinc-400 hover:text-white transition">
              About
            </a>
          </div>
          <Button onClick={onOpenApp}>Open App</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          See the lap,
          <br />
          <span className="text-blue-500">not just the result</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-8">
          Compare F1 drivers with real telemetry data. Understand every braking zone,
          throttle application, and racing line through interactive charts and plain-language insights.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={onOpenApp} className="gap-2">
            Start Analyzing
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="lg" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            Watch Demo
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <BarChart3 className="w-5 h-5" />,
              title: 'Telemetry Compare',
              desc: 'Speed, throttle, brake, and gear data visualized lap-by-lap',
            },
            {
              icon: <Zap className="w-5 h-5" />,
              title: 'Race Pace',
              desc: 'Stint analysis with tire degradation and pit strategy insights',
            },
            {
              icon: <BookOpen className="w-5 h-5" />,
              title: 'Race Story',
              desc: 'Narrative timeline explaining what happened and why',
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Preview Card */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <Badge variant="blue">Live Preview</Badge>
            <span className="text-sm text-zinc-500">2024 Bahrain GP - Qualifying</span>
          </div>
          <div className="h-48 bg-zinc-950 rounded-xl flex items-center justify-center border border-zinc-800">
            <span className="text-zinc-600">Chart Preview</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white">
              <Zap className="w-3 h-3" />
            </div>
            <span className="font-semibold text-white">LapLens</span>
          </div>
          <p className="text-sm text-zinc-600">
            Built with FastF1 - Not affiliated with Formula 1
          </p>
        </div>
      </footer>
    </div>
  )
}
