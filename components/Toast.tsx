'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface Toast {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'danger'
}

interface ToastContextType {
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'danger') => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'danger' = 'info') => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-24 right-8 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`bg-white rounded-lg p-4 shadow-lg min-w-[300px] border-l-4 ${
              toast.type === 'success' ? 'border-l-green-500' :
              toast.type === 'warning' ? 'border-l-yellow-500' :
              toast.type === 'danger' ? 'border-l-red-500' :
              'border-l-[#14B8A6]'
            } animate-slide-in`}
          >
            <div className="font-semibold text-gray-800">{toast.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
