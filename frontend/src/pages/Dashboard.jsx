import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const Dashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/user/dashboard')
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="spinner-lg" />
      </div>
    )
  }

  const stats = data?.stats || {}
  const recentQuizzes = data?.recentQuizzes || []
  const recentFlashcards = data?.recentFlashcards || []
  const recentScores = data?.recentScores || []

  const statItems = [
    { label: 'Quizzes Created', value: stats.quizCount || 0, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )},
    { label: 'Flashcard Sets', value: stats.flashcardSetCount || 0, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )},
    { label: 'Quizzes Taken', value: stats.totalQuizzesTaken || 0, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { label: 'Average Score', value: `${stats.averageScore || 0}%`, highlight: true, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )},
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Your learning progress at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statItems.map((stat, index) => (
          <div
            key={index}
            className={`stat-card ${stat.highlight ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-0' : ''}`}
          >
            <div className={`flex items-center gap-3 mb-3 ${stat.highlight ? 'text-primary-100' : 'text-slate-400'}`}>
              {stat.icon}
              <span className={`text-sm font-medium ${stat.highlight ? 'text-primary-100' : 'text-slate-500'}`}>
                {stat.label}
              </span>
            </div>
            <p className={`text-2xl font-bold tabular-nums ${stat.highlight ? 'text-white' : 'text-slate-900'}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/generate" className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Generate New
        </Link>
        <Link to="/history" className="btn btn-secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Quiz History
        </Link>
        <Link to="/flashcards" className="btn btn-secondary">
          View Flashcards
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Quizzes */}
        <div className="card-padded">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Quizzes</h2>
          {recentQuizzes.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">No quizzes yet</p>
              <Link to="/generate" className="text-primary-600 text-sm font-medium hover:text-primary-700 mt-1 inline-block">
                Generate your first quiz
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentQuizzes.map((quiz) => (
                <Link
                  key={quiz._id}
                  to={`/quiz/${quiz._id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <img
                    src={quiz.thumbnail || '/placeholder.png'}
                    alt={quiz.title}
                    className="w-16 h-10 object-cover rounded-lg bg-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 truncate group-hover:text-primary-600 transition-colors">
                      {quiz.title}
                    </h3>
                    <span className="badge-neutral mt-1">{quiz.difficulty}</span>
                  </div>
                  <svg className="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Scores */}
        <div className="card-padded">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Scores</h2>
            {recentScores.length > 0 && (
              <Link to="/history" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                View all
              </Link>
            )}
          </div>
          {recentScores.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">No scores yet</p>
              <p className="text-slate-400 text-sm mt-1">Take a quiz to see your results</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentScores.map((score) => (
                <div
                  key={score._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-slate-900 truncate">{score.quiz?.title}</h3>
                    <p className="text-sm text-slate-500">
                      {score.correctAnswers}/{score.totalQuestions} correct
                    </p>
                  </div>
                  <div className={`text-xl font-bold tabular-nums ${
                    score.percentage >= 70 ? 'text-success-500' :
                    score.percentage >= 50 ? 'text-warning-500' : 'text-error-500'
                  }`}>
                    {score.percentage}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Flashcards */}
        <div className="card-padded lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Flashcard Sets</h2>
          {recentFlashcards.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">No flashcard sets yet</p>
              <Link to="/generate" className="text-primary-600 text-sm font-medium hover:text-primary-700 mt-1 inline-block">
                Generate flashcards from a video
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentFlashcards.map((set) => (
                <Link
                  key={set._id}
                  to={`/flashcards/${set._id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-soft transition-all group"
                >
                  <img
                    src={set.thumbnail || '/placeholder.png'}
                    alt={set.title}
                    className="w-14 h-14 object-cover rounded-lg bg-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 truncate group-hover:text-primary-600 transition-colors">
                      {set.title}
                    </h3>
                    <p className="text-sm text-slate-500">{set.cardCount} cards</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
