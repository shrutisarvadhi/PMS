import type { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  widthClassName?: string
}

function Modal({ isOpen, title, onClose, children, footer, widthClassName = 'max-w-2xl' }: ModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8 backdrop-blur-sm">
      <div className={`relative w-full ${widthClassName} overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 text-slate-600">{children}</div>
        {footer && <div className="border-t border-slate-200/70 bg-slate-50 px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export default Modal
