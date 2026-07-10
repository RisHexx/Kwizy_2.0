import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-28 lg:py-36 px-4 overflow-hidden min-h-[70vh] flex items-center">
        <div className="absolute inset-0 bg-pixel-sky" />
        <div className="absolute inset-0 bg-pixel-grid bg-pixel opacity-60" />

        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 bg-primary-200 border-2 border-ink px-4 py-1.5 rounded-sm mb-6">
              <span className="w-2 h-2 bg-primary-400 border border-ink" />
              <span className="text-ink font-semibold text-xs uppercase tracking-wider">AI-Powered Learning</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink leading-tight mb-5">
              Turn Videos into
              <span className="text-primary-600"> Interactive Quizzes</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-700 max-w-xl mb-8 leading-relaxed">
              Paste any YouTube video URL or upload an offline video and let AI generate quizzes and flashcards.
              Learn smarter with instant feedback and progress tracking.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={isAuthenticated ? "/youtube" : "/login"}
                className="btn btn-primary btn-lg"
              >
                Get Started
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a href="#features" className="btn btn-secondary btn-lg">
                Learn More
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-slate-700">
              <a
                href="https://github.com/RisHexx"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 border-2 border-ink rounded-sm bg-warning-200 hover:-translate-y-0.5 transition"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/rishabhhkanojiya/"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 border-2 border-ink rounded-sm bg-info-200 hover:-translate-y-0.5 transition"
              >
                LinkedIn
              </a>
              <a
                href="https://rishabhkanojiya.in/"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 border-2 border-ink rounded-sm bg-success-200 hover:-translate-y-0.5 transition"
              >
                Portfolio
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="border-2 border-ink rounded-sm bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-ink">Kwizy Learning Platform</span>
                <span className="badge-warning">Rishabh Kanojiya</span>
              </div>
              <div className="space-y-3">
                <div className="border-2 border-ink rounded-sm p-3 bg-info-100">
                  <div className="text-xs text-ink mb-1">Quiz: Machine Learning Basics</div>
                  <div className="progress">
                    <div className="progress-bar" style={{ width: '60%' }} />
                  </div>
                </div>
                <div className="border-2 border-ink rounded-sm p-3 bg-warning-100">
                  <div className="text-xs text-ink mb-2">Flashcards queued</div>
                  <div className="flex gap-2">
                    <span className="badge-primary">12 cards</span>
                    <span className="badge-info">3 min</span>
                  </div>
                </div>
                <div className="border-2 border-ink rounded-sm p-3 bg-success-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink">Score</span>
                    <span className="font-semibold text-ink">100%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 border-2 border-ink rounded-sm bg-primary-100 p-3 hidden sm:block">
              <div className="text-[11px] font-semibold text-ink">AI Generated</div>
              <div className="text-xs text-ink">12 Q • 6 Cards</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-slate-50 border-t-2 border-ink/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything You Need to Learn Better
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Powerful AI tools to transform YouTube links and offline videos into effective study materials.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center border-2 border-ink rounded-sm p-6 bg-white">
              <div className="w-14 h-14 bg-primary-200 rounded-sm border-2 border-ink flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Quiz Generation</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Automatically create quizzes with multiple choice and true/false questions from any YouTube or offline video.
              </p>
            </div>

            <div className="text-center border-2 border-ink rounded-sm p-6 bg-white">
              <div className="w-14 h-14 bg-primary-200 rounded-sm border-2 border-ink flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Smart Flashcards</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Generate flashcards that extract key concepts from online or offline videos for quick revision and memorization.
              </p>
            </div>

            <div className="text-center border-2 border-ink rounded-sm p-6 bg-white">
              <div className="w-14 h-14 bg-primary-200 rounded-sm border-2 border-ink flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h3m-3-8h6m2 10l2 2 4-4M7 3h10l4 4v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Quiz Explanations & Progress</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                See clear explanations for each quiz answer and monitor your learning progress over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-slate-100 border-t-2 border-ink/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              How Kwizy Works
            </h2>
            <p className="text-slate-600">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-300 text-ink rounded-sm border-2 border-ink flex items-center justify-center text-lg font-bold mx-auto mb-5 shadow-soft">
                1
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Paste Video Link</h3>
              <p className="text-slate-600 text-sm">
                Copy any YouTube link or upload an offline video file into Kwizy.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-300 text-ink rounded-sm border-2 border-ink flex items-center justify-center text-lg font-bold mx-auto mb-5 shadow-soft">
                2
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Generates Content</h3>
              <p className="text-slate-600 text-sm">
                Our AI analyzes the video source and creates quizzes or flashcards.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-300 text-ink rounded-sm border-2 border-ink flex items-center justify-center text-lg font-bold mx-auto mb-5 shadow-soft">
                3
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Learn & Track</h3>
              <p className="text-slate-600 text-sm">
                Take quizzes, study flashcards, and monitor your progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary-300 border-t-2 border-ink">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-4">
            Ready to Learn Smarter?
          </h2>
          <p className="text-ink text-base sm:text-lg">
            Start transforming YouTube and offline videos into interactive learning materials today.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-ink border-t-2 border-ink">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-paper font-semibold font-display">Kwizy</span>
          </div>
          <p className="text-paper/80 text-xs">
            &copy; {new Date().getFullYear()} Kwizy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home
