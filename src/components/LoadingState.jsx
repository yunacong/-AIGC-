import React, { useState, useEffect } from 'react'

export default function LoadingState({ message = 'AI 分析中，请稍候...', estimatedSeconds = 0 }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const fmt = s => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500"
          style={{ animation: 'spin 0.8s linear infinite' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl">🤖</span>
        </div>
      </div>
      <p className="text-gray-600 text-sm font-medium">{message}</p>
      <p className="text-orange-500 text-lg font-mono font-bold mt-2">{fmt(elapsed)}</p>
      {estimatedSeconds > 0 && elapsed < estimatedSeconds && (
        <p className="text-xs text-gray-400 mt-1">预计还需 {fmt(estimatedSeconds - elapsed)}</p>
      )}
      <div className="flex gap-1 mt-3">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-orange-400"
            style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  )
}
