import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const { googleLogin } = useAuth()
  const navigate = useNavigate()

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true)

    try {
      await googleLogin(credentialResponse.credential)
      toast.success('Welcome!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    toast.error('Google sign in failed. Please try again.')
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card-padded animate-scale-in">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-ink">Welcome to Kwizy</h1>
            <p className="text-slate-700 mt-1 text-sm">Sign in to continue learning</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <span className="spinner-lg" />
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                shape="rectangular"
                size="large"
                text="continue_with"
                width="320"
              />
            )}
          </div>

          <p className="text-center text-slate-700 text-xs mt-8">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
