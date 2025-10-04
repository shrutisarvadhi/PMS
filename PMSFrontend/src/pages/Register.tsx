import { ChangeEvent, FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

interface FormState {
  username: string
  password: string
}

const initialState: FormState = {
  username: '',
  password: '',
}

function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerAccount } = useAuth()
  const [formData, setFormData] = useState<FormState>(initialState)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }))
    if (error) {
      setError(null)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedUsername = formData.username.trim()
    const trimmedPassword = formData.password.trim()

    if (!trimmedUsername || !trimmedPassword) {
      setError('Please enter both a username and password.')
      return
    }

    setIsLoading(true)

    try {
      await registerAccount({ username: trimmedUsername, password: trimmedPassword })
      setError(null)
      setFormData(initialState)
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : 'Registration failed. Please try again.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
          <div className="h-72 w-[36rem] rounded-full bg-primary-500/40 blur-3xl" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
          <div className="h-64 w-[28rem] rounded-full bg-accent-500/40 blur-3xl" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-slate-200/40 bg-white/90 p-8 shadow-2xl backdrop-blur">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Create your account</h1>
            <p className="mt-2 text-sm text-slate-500">Join the PMS platform to stay on top of your projects.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                className="w-full rounded-2xl border border-slate-200/60 bg-slate-50/80 px-4 py-3 text-base text-slate-800 shadow-sm transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                value={formData.username}
                onChange={handleChange('username')}
                placeholder="Choose a username"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-2xl border border-slate-200/60 bg-slate-50/80 px-4 py-3 text-base text-slate-800 shadow-sm transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                value={formData.password}
                onChange={handleChange('password')}
                placeholder="Create a password"
                disabled={isLoading}
                required
              />
            </div>

            <button
              className="mt-3 w-full rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-3 text-base font-semibold text-white shadow-lg transition focus:outline-none focus:ring-4 focus:ring-primary-500/30 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link className="font-semibold text-primary-600 hover:text-primary-500" to="/login">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
