import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

const ScoreDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchScoreDetails()
  }, [id])

  const fetchScoreDetails = async () => {
    try {
      const response = await api.get(`/user/scores/${id}`)
      setData(response.data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load results')
      navigate('/history')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    if (!seconds) return '-'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="spinner-lg" />
      </div>
    )
  }

  if (!data) return null

  const { score, quiz, results } = data
  const isPassing = score.percentage >= 70

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      {/* Back Button */}
      <Link
        to="/history"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to History
      </Link>

      {/* Score Card */}
      <div className={`card-padded mb-8 text-center border ${
        isPassing
          ? 'bg-gradient-to-br from-success-50 to-success-100/50 border-success-200'
          : 'bg-gradient-to-br from-error-50 to-error-100/50 border-error-200'
      }`}>
        <div className="py-4">
          <h1 className="text-lg font-semibold text-slate-900 mb-4">{quiz.title}</h1>

          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
            isPassing ? 'bg-success-100' : 'bg-error-100'
          }`}>
            {isPassing ? (
              <svg className="w-10 h-10 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>

          <div className={`text-5xl font-bold mb-2 tabular-nums ${isPassing ? 'text-success-600' : 'text-error-600'}`}>
            {score.percentage}%
          </div>
          <p className="text-slate-600 mb-3">
            {score.correctAnswers} out of {score.totalQuestions} correct
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(score.timeTaken)}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(score.completedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-10">
        <Link to={`/quiz/${quiz.id}`} className="btn btn-primary">
          Retake Quiz
        </Link>
        <Link to="/youtube" className="btn btn-secondary">
          Generate New Quiz
        </Link>
      </div>

      {/* Results Review */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Review Your Answers</h2>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-sm text-success-600 font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {results.filter(r => r.isCorrect).length} correct
            </span>
            <span className="flex items-center gap-1.5 text-sm text-error-600 font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {results.filter(r => !r.isCorrect).length} incorrect
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {results.map((result, index) => (
          <div
            key={index}
            className="card overflow-hidden"
          >
            {/* Question Header */}
            <div className={`px-6 py-4 border-b ${
              result.isCorrect
                ? 'bg-gradient-to-r from-success-50 to-white border-success-100'
                : 'bg-gradient-to-r from-error-50 to-white border-error-100'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    result.isCorrect
                      ? 'bg-success-100 text-success-700'
                      : 'bg-error-100 text-error-700'
                  }`}>
                    {index + 1}
                  </span>
                  <span className={`text-sm font-semibold ${
                    result.isCorrect ? 'text-success-700' : 'text-error-700'
                  }`}>
                    {result.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  result.isCorrect ? 'bg-success-500' : 'bg-error-500'
                }`}>
                  {result.isCorrect ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Question Content */}
            <div className="p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-5 leading-relaxed">{result.question}</h3>

              <div className="space-y-2.5">
                {result.options.map((option, optIndex) => {
                  const isCorrectAnswer = option === result.correctAnswer
                  const isUserWrongAnswer = option === result.userAnswer && !result.isCorrect
                  const optionLetter = String.fromCharCode(65 + optIndex)

                  return (
                    <div
                      key={optIndex}
                      className={`flex items-center gap-3 p-3.5 rounded-lg transition-all ${
                        isCorrectAnswer
                          ? 'bg-success-50 border-2 border-success-300 shadow-sm'
                          : isUserWrongAnswer
                            ? 'bg-error-50 border-2 border-error-300 shadow-sm'
                            : 'bg-slate-50 border border-slate-200'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        isCorrectAnswer
                          ? 'bg-success-500 text-white'
                          : isUserWrongAnswer
                            ? 'bg-error-500 text-white'
                            : 'bg-slate-200 text-slate-600'
                      }`}>
                        {optionLetter}
                      </span>
                      <span className={`flex-1 text-sm ${
                        isCorrectAnswer
                          ? 'text-success-800 font-medium'
                          : isUserWrongAnswer
                            ? 'text-error-800 font-medium'
                            : 'text-slate-700'
                      }`}>
                        {option}
                      </span>
                      {isCorrectAnswer && (
                        <span className="text-xs font-semibold text-success-600 bg-success-100 px-2 py-1 rounded-full">
                          Correct Answer
                        </span>
                      )}
                      {isUserWrongAnswer && (
                        <span className="text-xs font-semibold text-error-600 bg-error-100 px-2 py-1 rounded-full">
                          Your Answer
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {result.explanation && (
                <div className="mt-5 bg-gradient-to-br from-info-50 to-info-100/50 border border-info-200 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-info-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-info-700 uppercase tracking-wider mb-1">Explanation</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{result.explanation}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ScoreDetails
