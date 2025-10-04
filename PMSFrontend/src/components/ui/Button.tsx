import type { ButtonHTMLAttributes, ReactNode } from 'react'

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-primary-500 to-accent-500 text-white focus:ring-primary-500/40',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:border-primary-500 focus:ring-primary-500/30',
  outline: 'border border-slate-300 bg-transparent text-slate-700 hover:border-primary-500 focus:ring-primary-500/30',
  ghost: 'text-primary-600 hover:bg-primary-500/10 focus:ring-primary-500/30',
  danger: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-600/40',
}

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
  startIcon?: ReactNode
  endIcon?: ReactNode
}

function Button({ variant = 'primary', loading = false, startIcon, endIcon, children, className = '', ...props }: ButtonProps) {
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {startIcon && <span className="inline-flex h-4 w-4 items-center justify-center">{startIcon}</span>}
      <span>{loading ? 'Please wait...' : children}</span>
      {endIcon && <span className="inline-flex h-4 w-4 items-center justify-center">{endIcon}</span>}
      {loading && (
        <span className="inline-flex h-4 w-4 items-center justify-center">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
        </span>
      )}
    </button>
  )
}

export default Button
