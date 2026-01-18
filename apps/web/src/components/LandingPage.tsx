import { useState } from 'react'
import { Zap, BarChart3, BookOpen, ArrowRight, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LandingPageProps {
  onOpenApp: () => void
}

function FlipCard({ 
  icon, 
  title, 
  desc, 
  backContent 
}: { 
  icon: React.ReactNode
  title: string
  desc: string
  backContent: string[]
}) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div 
      className="h-72 cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div 
          className="absolute w-full h-full bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-blue-500/50 transition backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-zinc-500 mb-4">{desc}</p>
          <p className="text-xs text-blue-400 mt-auto">Click to learn more</p>
        </div>

        {/* Back */}
        <div 
          className="absolute w-full h-full bg-zinc-900 border border-blue-500/50 rounded-xl p-6 backface-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <RotateCcw className="w-4 h-4 text-zinc-500" />
          </div>
          <ul className="space-y-2">
            {backContent.map((item, i) => (
              <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                <span className="text-blue-400 mt-1">&#8226;</span>
                {item}
              </li>
            ))}
          </ul>
          
        </div>
      </div>
    </div>
  )
}

export function LandingPage({ onOpenApp }: LandingPageProps) {
  const features = [
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Telemetry Compare',
      desc: 'Speed, throttle, brake, and gear data visualized lap-by-lap.',
      backContent: [
        'Compare two drivers side-by-side on their fastest laps',
        'Speed trace shows km/h at every meter of the track',
        'Throttle/brake overlay reveals driving style differences',
        'Gear chart shows shifting patterns through corners',
        'Delta chart pinpoints exactly where time is gained or lost',
      ],
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Race Pace',
      desc: 'Stint analysis with tire degradation and pit strategy insights.',
      backContent: [
        'View lap times for the entire race, not just fastest lap',
        'Color-coded by tire compound (Soft, Medium, Hard)',
        'See degradation rate - how much slower each lap gets',
        'Compare pit stop timing between drivers',
        'Identify undercuts, overcuts, and strategy calls',
      ],
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: 'Race Story',
      desc: 'Narrative timeline explaining what happened and why.',
      backContent: [
        'Chronological breakdown of key race moments',
        'Start analysis - who gained or lost positions',
        'Pit window battles and strategy decisions',
        'Pace comparison through different phases',
        'Final result with gap analysis',
      ],
    },
  ]

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

      {/* Features Grid - Flip Cards */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-white text-center mb-4">What You Can Do</h2>
        <p className="text-zinc-500 text-center mb-10">Click each card to learn more</p>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FlipCard
              key={i}
              icon={f.icon}
              title={f.title}
              desc={f.desc}
              backContent={f.backContent}
            />
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
