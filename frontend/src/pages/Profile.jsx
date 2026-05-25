import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/user/profile')
      setProfile(response.data)
      setName(response.data.user.name)
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await api.put('/user/profile', { name })
      toast.success('Profile updated')
      setEditing(false)
      updateUser(response.data.user)
      fetchProfile()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="spinner-lg" />
      </div>
    )
  }

  const stats = profile?.stats || {}

  const statItems = [
    { label: 'Quizzes Created', value: stats.quizCount || 0 },
    { label: 'Flashcard Sets', value: stats.flashcardSetCount || 0 },
    { label: 'Quizzes Taken', value: stats.totalQuizzesTaken || 0 },
    { label: 'Average Score', value: `${stats.averageScore || 0}%`, highlight: true }
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Profile</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="card-padded">
            <div className="flex items-center gap-4 mb-6">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="avatar-xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{user?.name}</h2>
                <p className="text-slate-500 text-sm">{user?.email}</p>
              </div>
            </div>

            {editing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={user?.email}
                    className="input bg-slate-50 text-slate-500 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-slate-400 mt-1">Email is managed by your Google account</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="btn btn-primary">
                    {saving ? (
                      <>
                        <span className="spinner-sm border-white/30 border-t-white" />
                        Saving
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false)
                      setName(user?.name || '')
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="btn btn-secondary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>

          {/* Account Info Card */}
          <div className="card-padded">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Account</h3>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Signed in with Google</span>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          {statItems.map((stat, index) => (
            <div
              key={index}
              className={`stat-card ${
                stat.highlight
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-0'
                  : ''
              }`}
            >
              <p className={`text-sm mb-1 ${stat.highlight ? 'text-primary-100' : 'text-slate-500'}`}>
                {stat.label}
              </p>
              <p className={`text-2xl font-bold tabular-nums ${stat.highlight ? 'text-white' : 'text-slate-900'}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Profile
