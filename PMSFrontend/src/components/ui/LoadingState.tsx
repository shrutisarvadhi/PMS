import React from 'react'

interface LoadingStateProps {
  message?: string
  className?: string
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-10 text-slate-600 ${className}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      <p className="mt-3 text-sm font-medium">{message}</p>
    </div>
  )
}

export default LoadingState
