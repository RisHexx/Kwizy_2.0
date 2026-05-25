import { useState, useEffect } from 'react'

const GenerationLoader = ({ mode }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [dots, setDots] = useState('')

  const quizSteps = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      text: "Fetching video content",
      subtext: "Connecting to YouTube"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      text: "Extracting transcript",
      subtext: "Processing audio content"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      text: "Analyzing content",
      subtext: "AI is processing the material"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: "Generating questions",
      subtext: "Creating challenging assessments"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: "Finalizing quiz",
      subtext: "Almost ready"
    }
  ]

  const flashcardSteps = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      text: "Fetching video content",
      subtext: "Connecting to YouTube"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      text: "Converting to text",
      subtext: "Processing transcript"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      text: "Identifying key concepts",
      subtext: "AI is analyzing the content"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      text: "Creating flashcards",
      subtext: "Building your study set"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      text: "Finalizing cards",
      subtext: "Almost ready"
    }
  ]

  const steps = mode === 'quiz' ? quizSteps : flashcardSteps

  const tips = [
    "Active recall with quizzes improves retention by up to 50%",
    "Taking breaks between study sessions helps memory consolidation",
    "Your brain forms new neural connections when you learn",
    "Teaching others what you learn doubles your understanding",
    "Spaced repetition is one of the most effective learning methods"
  ]

  const [currentTip, setCurrentTip] = useState(0)

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 3500)

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 400)

    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length)
    }, 7000)

    return () => {
      clearInterval(stepInterval)
      clearInterval(dotsInterval)
      clearInterval(tipInterval)
    }
  }, [steps.length])

  const step = steps[currentStep]
  const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100)

  return (
    <div className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50">
      <div className="bg-slate-50 rounded-sm p-8 max-w-md w-full mx-4 shadow-soft-xl border-2 border-ink animate-scale-in">
        {/* Progress Ring */}
        <div className="flex justify-center mb-8">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="48"
                stroke="#1B1A17"
                strokeWidth="8"
                fill="none"
                opacity="0.15"
              />
              <circle
                cx="56"
                cy="56"
                r="48"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${((currentStep + 1) / steps.length) * 301.6} 301.6`}
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4C6FFF" />
                  <stop offset="100%" stopColor="#9FB8FF" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-10 h-10 bg-primary-200 border-2 border-ink rounded-sm flex items-center justify-center text-ink mb-1">
                {step.icon}
              </div>
              <span className="text-sm font-bold text-ink tabular-nums">
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center mb-6">
          <h3 className="text-base font-semibold text-ink mb-1">
            {step.text}{dots}
          </h3>
          <p className="text-xs text-slate-700">{step.subtext}</p>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-1.5 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentStep
                  ? 'w-6 bg-primary-400 border-2 border-ink'
                  : index < currentStep
                    ? 'w-1.5 bg-primary-200 border-2 border-ink'
                    : 'w-1.5 bg-slate-200 border-2 border-ink'
              }`}
            />
          ))}
        </div>

        {/* Tip */}
        <div className="bg-slate-100 border-2 border-ink rounded-sm p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-primary-200 border-2 border-ink rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-ink" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {tips[currentTip]}
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-700 mt-6">
          Please keep this page open while we generate your content
        </p>
      </div>
    </div>
  )
}

export default GenerationLoader
