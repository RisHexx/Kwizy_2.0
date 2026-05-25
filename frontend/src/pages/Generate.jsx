import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import GenerationLoader from '../components/GenerationLoader'

const Generate = () => {
  const [videoUrl, setVideoUrl] = useState('')
  const [mode, setMode] = useState('quiz')
  const [difficulty, setDifficulty] = useState('medium')
  const [numItems, setNumItems] = useState(10)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!videoUrl.trim()) {
      toast.error('Please enter a video URL')
      return
    }

    setLoading(true)

    try {
      if (mode === 'quiz') {
        const response = await api.post('/quiz/generate', {
          videoUrl,
          difficulty,
          numQuestions: numItems
        })
        toast.success('Quiz generated!')
        navigate(`/quiz/${response.data.quiz.id}`)
      } else {
        const response = await api.post('/flashcards/generate', {
          videoUrl,
          numCards: numItems
        })
        toast.success('Flashcards generated!')
        navigate(`/flashcards/${response.data.flashcardSet.id}`)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate content')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading && <GenerationLoader mode={mode} />}

      <div className="max-w-2xl mx-auto px-4 py-5 animate-fade-in">
        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold text-slate-900">Generate Learning Content</h1>
          <p className="text-slate-500 text-sm">Paste a YouTube video URL to create quizzes or flashcards</p>
        </div>

        <div className="card-padded">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Video URL */}
            <div>
              <label className="label">YouTube Video URL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="input pl-11"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Mode Selection */}
            <div>
              <label className="label">What would you like to generate?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('quiz')}
                  disabled={loading}
                  className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                    mode === 'quiz'
                      ? 'border-primary-500 bg-primary-50 ring-4 ring-primary-500/10'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                    mode === 'quiz' ? 'bg-primary-100' : 'bg-slate-100'
                  }`}>
                    <svg className={`w-5 h-5 ${mode === 'quiz' ? 'text-primary-600' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <span className={`font-medium text-sm ${mode === 'quiz' ? 'text-primary-700' : 'text-slate-700'}`}>Quiz</span>
                  <p className={`text-xs mt-0.5 ${mode === 'quiz' ? 'text-primary-600' : 'text-slate-500'}`}>Multiple choice questions</p>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('flashcards')}
                  disabled={loading}
                  className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                    mode === 'flashcards'
                      ? 'border-primary-500 bg-primary-50 ring-4 ring-primary-500/10'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                    mode === 'flashcards' ? 'bg-primary-100' : 'bg-slate-100'
                  }`}>
                    <svg className={`w-5 h-5 ${mode === 'flashcards' ? 'text-primary-600' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className={`font-medium text-sm ${mode === 'flashcards' ? 'text-primary-700' : 'text-slate-700'}`}>Flashcards</span>
                  <p className={`text-xs mt-0.5 ${mode === 'flashcards' ? 'text-primary-600' : 'text-slate-500'}`}>For quick revision</p>
                </button>
              </div>
            </div>

            {/* Difficulty (Quiz only) */}
            {mode === 'quiz' && (
              <div className="animate-slide-down">
                <label className="label">Difficulty Level</label>
                <div className="flex gap-2">
                  {[
                    { value: 'easy', label: 'Easy', color: 'text-success-600' },
                    { value: 'medium', label: 'Medium', color: 'text-warning-600' },
                    { value: 'hard', label: 'Hard', color: 'text-error-600' }
                  ].map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setDifficulty(level.value)}
                      disabled={loading}
                      className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                        difficulty === level.value
                          ? 'bg-slate-900 text-white shadow-soft'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Number of Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">
                  Number of {mode === 'quiz' ? 'Questions' : 'Cards'}
                </label>
                <span className="text-sm font-semibold text-primary-600 tabular-nums">{numItems}</span>
              </div>
              <input
                type="range"
                min="5"
                max="20"
                value={numItems}
                onChange={(e) => setNumItems(parseInt(e.target.value))}
                disabled={loading}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-soft [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1.5">
                <span>5</span>
                <span>20</span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3.5 text-base"
            >
              {loading ? (
                <>
                  <span className="spinner-sm border-white/30 border-t-white" />
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate {mode === 'quiz' ? 'Quiz' : 'Flashcards'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default Generate
