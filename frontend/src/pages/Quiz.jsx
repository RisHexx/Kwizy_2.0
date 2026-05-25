import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

const Quiz = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [startTime] = useState(Date.now())

  const fetchQuiz = useCallback(async () => {
    try {
      const response = await api.get(`/quiz/${id}`)
      setQuiz(response.data.quiz)
      setAnswers(new Array(response.data.quiz.questions.length).fill(null))
    } catch (error) {
      toast.error('Failed to load quiz')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    fetchQuiz()
  }, [fetchQuiz])

  const handleAnswer = (answer) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answer
    setAnswers(newAnswers)
  }

  const handleSubmit = async () => {
    const unanswered = answers.filter(a => a === null).length
    if (unanswered > 0) {
      toast.error(`Please answer all questions (${unanswered} remaining)`)
      return
    }

    setSubmitting(true)
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)

    try {
      const response = await api.post(`/quiz/${id}/submit`, {
        answers,
        timeTaken
      })
      navigate(`/quiz/${id}/results`, { state: response.data })
    } catch (error) {
      toast.error('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="spinner-lg" />
      </div>
    )
  }

  if (!quiz) return null

  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100
  const answeredCount = answers.filter(a => a !== null).length

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-slate-900 truncate pr-4">{quiz.title}</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Question</span>
            <span className="font-semibold text-slate-900 tabular-nums">
              {currentQuestion + 1}/{quiz.questions.length}
            </span>
          </div>
        </div>
        <div className="progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>{answeredCount} answered</span>
          <span>{quiz.questions.length - answeredCount} remaining</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="card-padded mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className={`badge ${question.type === 'mcq' ? 'badge-info' : 'badge-warning'}`}>
            {question.type === 'mcq' ? 'Multiple Choice' : 'True / False'}
          </span>
        </div>

        <h2 className="text-lg font-medium text-slate-900 mb-6 leading-relaxed">
          {question.question}
        </h2>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = answers[currentQuestion] === option
            return (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className={`w-full p-4 rounded-xl text-left transition-all border ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-slate-300'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${isSelected ? 'text-slate-900 font-medium' : 'text-slate-700'}`}>
                    {option}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="btn btn-secondary"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <div className="hidden sm:flex gap-1.5">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                index === currentQuestion
                  ? 'bg-primary-500 text-white shadow-soft'
                  : answers[index] !== null
                    ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? (
              <>
                <span className="spinner-sm border-white/30 border-t-white" />
                Submitting
              </>
            ) : (
              'Submit Quiz'
            )}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            className="btn btn-primary"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default Quiz
