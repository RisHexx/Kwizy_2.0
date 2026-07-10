import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import GenerationLoader from '../components/GenerationLoader'

const GenerateFlashcards = () => {
  const [sourceType, setSourceType] = useState('youtube')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [numCards, setNumCards] = useState(10)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (sourceType === 'youtube' && !videoUrl.trim()) {
      toast.error('Please enter a YouTube video URL')
      return
    }

    if (sourceType === 'upload' && !videoFile) {
      toast.error('Please choose a video file to upload')
      return
    }

    setLoading(true)

    try {
      const response = sourceType === 'upload'
        ? await api.post('/flashcards/generate', (() => {
            const formData = new FormData()
            formData.append('file', videoFile)
            formData.append('numCards', String(numCards))
            return formData
          })(), {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        : await api.post('/flashcards/generate', {
            videoUrl,
            numCards
          })

      toast.success('Flashcards generated!')
      navigate(`/flashcards/${response.data.flashcardSet.id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate flashcards')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading && <GenerationLoader mode="flashcards" />}

      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create Flashcards</h1>
            <p className="text-slate-500 mt-1">Generate a new flashcard set from YouTube or an uploaded video.</p>
          </div>
          <Link to="/flashcards" className="btn btn-secondary">
            Back to Flashcards
          </Link>
        </div>

        <div className="card-padded">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label mb-2 block">Source Type</label>
              <div className="flex gap-2">
                {[
                  { value: 'youtube', label: 'YouTube URL' },
                  { value: 'upload', label: 'Uploaded Video' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSourceType(option.value)}
                    disabled={loading}
                    className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                      sourceType === option.value
                        ? 'bg-slate-900 text-white shadow-soft'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">{sourceType === 'youtube' ? 'YouTube Video URL' : 'Upload video file'}</label>
              {sourceType === 'youtube' ? (
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(event) => setVideoUrl(event.target.value)}
                  className="input"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                  disabled={loading}
                />
              ) : (
                <>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
                    className="input"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Upload a video file and Kwizy will transcribe it before generating flashcards.
                  </p>
                </>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Number of Cards</label>
                <span className="text-sm font-semibold text-primary-600 tabular-nums">{numCards}</span>
              </div>
              <input
                type="range"
                min="5"
                max="20"
                value={numCards}
                onChange={(event) => setNumCards(parseInt(event.target.value))}
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
              {loading ? 'Generating...' : 'Generate Flashcards'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default GenerateFlashcards