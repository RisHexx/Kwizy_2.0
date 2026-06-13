import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`relative px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all border-2 ${
        isActive(to)
          ? 'text-ink bg-primary-200 border-ink shadow-soft'
          : 'text-ink border-transparent hover:border-ink hover:bg-slate-100'
      }`}
    >
      {children}
    </Link>
  )

  return (
    <nav className="bg-slate-50 border-b-2 border-ink sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="text-[25px] font-bold text-ink font-display">Kwizy</span>
          </Link>

          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/youtube">YouTube</NavLink>
                <NavLink to="/videos">Video Uploads</NavLink>
                <NavLink to="/history">History</NavLink>
                <NavLink to="/flashcards">Flashcards</NavLink>

                <div className="flex items-center gap-2 ml-4 pl-4 border-l-2 border-ink/20">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-sm border-2 border-transparent hover:border-ink hover:bg-slate-100 transition-colors"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="avatar-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-ink hidden sm:block">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-sm border-2 border-transparent text-ink/60 hover:text-ink hover:border-ink hover:bg-error-100 transition-colors"
                    title="Sign out"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="btn btn-primary btn-sm"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
