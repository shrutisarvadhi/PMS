interface ErrorContext {
  [key: string]: unknown
}

const LOG_ENDPOINT = typeof import.meta !== 'undefined' ? (import.meta as { env?: Record<string, string> }).env?.VITE_LOG_ENDPOINT : undefined

async function sendToBackend(message: string, context?: ErrorContext) {
  if (!LOG_ENDPOINT) {
    return
  }

  try {
    await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, context, timestamp: new Date().toISOString() }),
    })
  } catch (loggingError) {
    console.debug('Skipping remote error logging', loggingError)
  }
}

export async function logError(message: string, context?: ErrorContext) {
  console.error(message, context)
  await sendToBackend(message, context)
}

export function handleApiError(error: unknown, fallbackMessage: string, context?: ErrorContext): Error {
  let message = fallbackMessage

  if (error instanceof Error && error.message) {
    message = error.message
  } else if (typeof error === 'string') {
    message = error
  } else if (error && typeof error === 'object' && 'message' in error && typeof (error as Record<string, unknown>).message === 'string') {
    message = (error as Record<string, unknown>).message as string
  }

  void logError(message, context)
  const err = new Error(message)
  if (context) {
    ;(err as Error & { context?: ErrorContext }).context = context
  }
  return err
}

