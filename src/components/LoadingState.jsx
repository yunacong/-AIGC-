import React from 'react'

export default function LoadingState({ message = 'AI 分析中，请稍候...' }) {
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
