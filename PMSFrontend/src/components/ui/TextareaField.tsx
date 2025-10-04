import type { TextareaHTMLAttributes } from 'react'

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: string
  error?: string
}

function TextareaField({ id, label, hint, error, className = '', ...props }: TextareaFieldProps) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-600" htmlFor={id}>
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <textarea
        id={id}
        className={`w-full rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-70 ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
        } ${className}`}
        {...props}
      />
      {hint && !error && <span className="text-xs font-medium text-slate-400">{hint}</span>}
      {error && <span className="text-xs font-semibold text-red-500">{error}</span>}
    </label>
  )
}

export default TextareaField
