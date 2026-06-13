import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import GenerationLoader from '../components/GenerationLoader'

const VideoUploads = () => {
  const [file, setFile] = useState(null)
  const [difficulty, setDifficulty] = useState('medium')
  const [numQuestions, setNumQuestions] = useState(10)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null
    setFile(nextFile)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!file) {
      toast.error('Please choose a video file to upload')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('difficulty', difficulty)
    formData.append('numQuestions', String(numQuestions))

    setLoading(true)

    try {
      const response = await api.post('/videos/quiz', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('Quiz generated!')
      navigate(`/quiz/${response.data.quiz.id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate quiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading && <GenerationLoader mode="quiz" />}

      <div className="max-w-2xl mx-auto px-4 py-5 animate-fade-in">
        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold text-slate-900">Video Uploads</h1>
          <p className="text-slate-500 text-sm">
            Upload a video to generate a quiz from its transcript
          </p>
        </div>

        <div className="card-padded">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Upload video file</label>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="input"
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-2">
                Upload a video file. We extract audio and generate a quiz from the transcript.
              </p>
            </div>

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

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Number of Questions</label>
                <span className="text-sm font-semibold text-primary-600 tabular-nums">{numQuestions}</span>
              </div>
              <input
                type="range"
                min="5"
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                disabled={loading}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-soft [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1.5">
                <span>5</span>
                <span>20</span>
              </div>
            </div>

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
                  Generate Quiz
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default VideoUploads
