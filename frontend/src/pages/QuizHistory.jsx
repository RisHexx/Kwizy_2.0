import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

const QuizHistory = () => {
  const navigate = useNavigate()
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchScores()
  }, [])

  const fetchScores = async () => {
    try {
      const response = await api.get('/user/scores')
      setScores(response.data.scores)
    } catch (error) {
      toast.error('Failed to load quiz history')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (seconds) => {
    if (!seconds) return '-'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="spinner-lg" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quiz History</h1>
          <p className="text-slate-500 mt-1">Review all your quiz attempts and scores</p>
        </div>
        <Link to="/generate" className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Take New Quiz
        </Link>
      </div>

      {scores.length === 0 ? (
        <div className="card-padded text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No quiz attempts yet</h2>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            Generate and take a quiz to see your results here
          </p>
          <Link to="/generate" className="btn btn-primary">
            Generate a Quiz
          </Link>
        </div>
      ) : (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="stat-card">
              <p className="text-sm text-slate-500 mb-1">Total Attempts</p>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">{scores.length}</p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-slate-500 mb-1">Average Score</p>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">
                {Math.round(scores.reduce((acc, s) => acc + s.percentage, 0) / scores.length)}%
              </p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-slate-500 mb-1">Best Score</p>
              <p className="text-2xl font-bold text-success-600 tabular-nums">
                {Math.max(...scores.map(s => s.percentage))}%
              </p>
            </div>
            <div className="stat-card">
              <p className="text-sm text-slate-500 mb-1">Passing Rate</p>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">
                {Math.round((scores.filter(s => s.percentage >= 70).length / scores.length) * 100)}%
              </p>
            </div>
          </div>

          {/* Scores Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Quiz</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Score</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700 hidden sm:table-cell">Questions</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Time</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scores.map((score) => (
                    <tr
                      key={score._id}
                      onClick={() => navigate(`/history/${score._id}`)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {score.quiz?.thumbnail && (
                            <img
                              src={score.quiz.thumbnail}
                              alt=""
                              className="w-12 h-8 rounded object-cover bg-slate-100 hidden sm:block"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate max-w-[200px] sm:max-w-[300px]">
                              {score.quiz?.title || 'Deleted Quiz'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-14 py-1 rounded-full text-sm font-bold ${
                          score.percentage >= 70
                            ? 'bg-success-100 text-success-700'
                            : score.percentage >= 50
                              ? 'bg-warning-100 text-warning-700'
                              : 'bg-error-100 text-error-700'
                        }`}>
                          {score.percentage}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center hidden sm:table-cell">
                        <span className="text-sm text-slate-600">
                          {score.correctAnswers}/{score.totalQuestions}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center hidden md:table-cell">
                        <span className="text-sm text-slate-500 tabular-nums">
                          {formatTime(score.timeTaken)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm text-slate-500">
                          {formatDate(score.completedAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default QuizHistory
