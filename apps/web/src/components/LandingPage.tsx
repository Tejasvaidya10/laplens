import { Zap, BarChart3, BookOpen, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
            <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition">
              How It Works
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
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-white text-center mb-10">What You Can Do</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <BarChart3 className="w-5 h-5" />,
              title: 'Telemetry Compare',
              desc: 'Speed, throttle, brake, and gear data visualized lap-by-lap. See exactly where drivers gain or lose time.',
            },
            {
              icon: <Zap className="w-5 h-5" />,
              title: 'Race Pace',
              desc: 'Stint analysis with tire degradation and pit strategy insights. Understand how strategy shapes the race.',
            },
            {
              icon: <BookOpen className="w-5 h-5" />,
              title: 'Race Story',
              desc: 'Narrative timeline explaining what happened and why. Key moments highlighted with data.',
            },
          ].map((f, i) => (
            <div
              key={i}
              onClick={onOpenApp}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-blue-500/50 hover:bg-zinc-900/80 transition cursor-pointer"
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

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-white text-center mb-10">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { num: 1, title: 'Pick a Race', desc: 'Select any F1 season and Grand Prix' },
            { num: 2, title: 'Choose Session', desc: 'Practice, Qualifying, or Race' },
            { num: 3, title: 'Select Drivers', desc: 'Pick two drivers to compare' },
            { num: 4, title: 'Explore Data', desc: 'Interactive charts with insights' },
          ].map((step) => (
            <div key={step.num} className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                {step.num}
              </div>
              <h3 className="font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-zinc-500">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button size="lg" onClick={onOpenApp} className="gap-2">
            Try It Now
            <ArrowRight className="w-4 h-4" />
          </Button>
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
