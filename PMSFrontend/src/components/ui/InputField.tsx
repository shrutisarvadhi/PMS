import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
  startIcon?: ReactNode
}

function InputField({ id, label, hint, error, startIcon, className = '', ...props }: InputFieldProps) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-600" htmlFor={id}>
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <div className="relative flex items-center">
        {startIcon && <span className="absolute left-3 inline-flex h-4 w-4 items-center justify-center text-slate-400">{startIcon}</span>}
        <input
          id={id}
          className={`w-full rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-70 ${startIcon ? 'pl-9' : ''} ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {hint && !error && <span className="text-xs font-medium text-slate-400">{hint}</span>}
      {error && <span className="text-xs font-semibold text-red-500">{error}</span>}
    </label>
  )
}

export default InputField
