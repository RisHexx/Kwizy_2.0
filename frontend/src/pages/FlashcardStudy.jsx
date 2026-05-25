import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

const FlashcardStudy = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [flashcardSet, setFlashcardSet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentCard, setCurrentCard] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [studied, setStudied] = useState(new Set())

  const fetchFlashcardSet = useCallback(async () => {
    try {
      const response = await api.get(`/flashcards/${id}`)
      setFlashcardSet(response.data.flashcardSet)
    } catch (error) {
      toast.error('Failed to load flashcards')
      navigate('/flashcards')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    fetchFlashcardSet()
  }, [fetchFlashcardSet])

  const handleNext = useCallback(() => {
    if (!flashcardSet) return
    setIsFlipped(false)
    setStudied(prev => new Set([...prev, currentCard]))
    setTimeout(() => {
      setCurrentCard((prev) => (prev + 1) % flashcardSet.cards.length)
    }, 150)
  }, [flashcardSet, currentCard])

  const handlePrev = useCallback(() => {
    if (!flashcardSet) return
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentCard((prev) => (prev - 1 + flashcardSet.cards.length) % flashcardSet.cards.length)
    }, 150)
  }, [flashcardSet])

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev)
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleFlip()
    } else if (e.key === 'ArrowRight') {
      handleNext()
    } else if (e.key === 'ArrowLeft') {
      handlePrev()
    }
  }, [handleFlip, handleNext, handlePrev])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="spinner-lg" />
      </div>
    )
  }

  if (!flashcardSet) return null

  const card = flashcardSet.cards[currentCard]
  const progress = ((studied.size) / flashcardSet.cards.length) * 100

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/flashcards"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <span className="text-sm font-medium text-slate-600 tabular-nums">
          {currentCard + 1} / {flashcardSet.cards.length}
        </span>
      </div>

      <h1 className="text-xl font-bold text-slate-900 mb-2 text-center">{flashcardSet.title}</h1>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>{studied.size} studied</span>
          <span>{flashcardSet.cards.length - studied.size} remaining</span>
        </div>
        <div className="progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Flashcard */}
      <div
        className="relative h-72 sm:h-80 mb-6 cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <div
          className="relative w-full h-full transform-style-3d transition-transform duration-500 ease-out"
          style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-slate-50 rounded-sm border-2 border-ink shadow-soft p-8 flex flex-col items-center justify-center">
            <span className="badge-neutral mb-4">Question</span>
            <p className="text-lg font-medium text-slate-900 text-center leading-relaxed">{card.front}</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 backface-hidden bg-primary-100 border-2 border-ink rounded-sm p-8 flex flex-col items-center justify-center"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <span className="badge-primary mb-4">Answer</span>
            <p className="text-lg font-medium text-slate-900 text-center leading-relaxed">{card.back}</p>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-slate-400 mb-8">
        Click card or press Space to flip
      </p>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-3">
        <button onClick={handlePrev} className="btn btn-secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        <button onClick={handleNext} className="btn btn-primary">
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Card Navigation Dots */}
      <div className="flex justify-center gap-1.5 mt-8 flex-wrap">
        {flashcardSet.cards.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsFlipped(false)
              setCurrentCard(index)
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentCard
                ? 'bg-primary-500 scale-125'
                : studied.has(index)
                  ? 'bg-primary-200'
                  : 'bg-slate-200 hover:bg-slate-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default FlashcardStudy
