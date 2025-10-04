import { Link } from 'react-router-dom'

function Unauthorized() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="rounded-3xl border border-slate-200/70 bg-white/90 px-8 py-10 shadow-md backdrop-blur">
        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-sm font-semibold uppercase tracking-wider text-amber-600">
          Restricted
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">You do not have access to this area</h1>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Please contact your administrator if you believe this is unexpected. You can continue working from your dashboard.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-md focus:outline-none focus:ring-4 focus:ring-primary-500/30"
        >
          Return to dashboard
        </Link>
      </div>
    </div>
  )
}

export default Unauthorized
