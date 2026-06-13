import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Generate from './pages/Generate'
import VideoUploads from './pages/Uploads'
import Quiz from './pages/Quiz'
import QuizResults from './pages/QuizResults'
import QuizHistory from './pages/QuizHistory'
import ScoreDetails from './pages/ScoreDetails'
import Flashcards from './pages/Flashcards'
import FlashcardStudy from './pages/FlashcardStudy'
import Profile from './pages/Profile'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" />
}

const App = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={<Navigate to="/login" />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/youtube" element={<ProtectedRoute><Generate /></ProtectedRoute>} />
        <Route path="/videos" element={<ProtectedRoute><VideoUploads /></ProtectedRoute>} />
        <Route path="/quiz/:id" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/quiz/:id/results" element={<ProtectedRoute><QuizResults /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><QuizHistory /></ProtectedRoute>} />
        <Route path="/history/:id" element={<ProtectedRoute><ScoreDetails /></ProtectedRoute>} />
        <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
        <Route path="/flashcards/:id" element={<ProtectedRoute><FlashcardStudy /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default App
