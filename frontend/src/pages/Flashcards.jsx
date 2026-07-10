import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

const Flashcards = () => {
  const [flashcardSets, setFlashcardSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, title: '' })

  useEffect(() => {
    fetchFlashcardSets()
  }, [])

  const fetchFlashcardSets = async () => {
    try {
      const response = await api.get('/flashcards')
      setFlashcardSets(response.data.flashcardSets)
    } catch (error) {
      toast.error('Failed to load flashcard sets')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/flashcards/${id}`)
      setFlashcardSets(flashcardSets.filter(set => set._id !== id))
      toast.success('Flashcard set deleted')
    } catch (error) {
      toast.error('Failed to delete flashcard set')
    } finally {
      setDeleteModal({ open: false, id: null, title: '' })
    }
  }

  const openDeleteModal = (id, title) => {
    setDeleteModal({ open: true, id, title })
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="spinner-lg" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Flashcards</h1>
          <p className="text-slate-500 mt-1">Generate and study your flashcard sets</p>
        </div>
        <Link to="/flashcards/generate" className="btn btn-primary">
          Create Flashcards
        </Link>
      </div>

      {flashcardSets.length === 0 ? (
        <div className="card-padded text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No flashcard sets yet</h2>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            Generate flashcards from a YouTube video or uploaded video to get started
          </p>
          <Link to="/flashcards/generate" className="btn btn-primary">
            Create Flashcards
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {flashcardSets.map((set) => (
            <div key={set._id} className="card overflow-hidden group">
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 mb-1 truncate group-hover:text-primary-600 transition-colors">
                  {set.title}
                </h3>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="badge-neutral">{set.cardCount} cards</span>
                  <span className="badge-neutral">{set.sourceType === 'video_upload' ? 'Upload' : 'YouTube'}</span>
                </div>

                <div className="flex items-center justify-end gap-1 mt-3">
                  <Link
                    to={`/flashcards/${set._id}`}
                    className="btn-icon btn-ghost p-1.5"
                    title="Study"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => openDeleteModal(set._id, set.title)}
                    className="btn-icon p-1.5 text-slate-400 hover:text-error-500 hover:bg-error-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteModal({ open: false, id: null, title: '' })}
          />
          <div className="relative bg-slate-50 rounded-sm shadow-soft-xl border-2 border-ink max-w-sm w-full p-6 animate-scale-in">
            <div className="w-12 h-12 bg-error-200 border-2 border-ink rounded-sm flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-ink text-center mb-2">Delete Flashcard Set?</h3>
            <p className="text-xs text-slate-700 text-center mb-6">
              Are you sure you want to delete "<span className="font-semibold text-ink">{deleteModal.title}</span>"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, id: null, title: '' })}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.id)}
                className="btn flex-1 bg-error-500 hover:bg-error-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Flashcards
