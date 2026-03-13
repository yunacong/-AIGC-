import React, { useState } from 'react'
import PageHeader from '../components/PageHeader'
import LoadingState from '../components/LoadingState'
import { reviewOptimization } from '../services/difyApi'

const PRIORITY_CONFIG = {
  high: { label: '高优先', cls: 'bg-red-100 text-red-600', icon: '🔴' },
  medium: { label: '中优先', cls: 'bg-yellow-100 text-yellow-600', icon: '🟡' },
  low: { label: '低优先', cls: 'bg-green-100 text-green-600', icon: '🟢' },
}

export default function ReviewOptimization() {
  const [form, setForm] = useState({
    productName: '',
    publishedContent: '',
    performanceData: '',
    diagnosisHistory: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.publishedContent.trim()) {
      setError('请填写已发布的内容')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await reviewOptimization(form)
      setResult(data)
    } catch (e) {
      setError('复盘失败：' + (e.message || ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="复盘优化" subtitle="总结规律 · 指导下一条内容" />

      <div className="px-4 py-4 space-y-4">
        {!result ? (
          <>
            <div className="card p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">商品名称</label>
                <input className="input-field" placeholder="例：便携式榨汁杯"
                  value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })} />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">已发布内容 *</label>
                <textarea className="textarea-field" rows={4}
                  placeholder="粘贴你已经发布的带货文案或脚本..."
                  value={form.publishedContent}
                  onChange={e => setForm({ ...form, publishedContent: e.target.value })} />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">数据表现</label>
                <input className="input-field"
                  placeholder="例：播放1200，点赞45，评论8，转化3单"
                  value={form.performanceData}
                  onChange={e => setForm({ ...form, performanceData: e.target.value })} />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">历史问题记录（可选）</label>
                <textarea className="textarea-field" rows={3}
                  placeholder="例：上次内容开头吸引力不足，卖点靠后..."
                  value={form.diagnosisHistory}
                  onChange={e => setForm({ ...form, diagnosisHistory: e.target.value })} />
              </div>

              {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            </div>

            <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
              {loading ? '复盘中...' : '📊 开始复盘分析'}
            </button>

            {loading && <LoadingState message="AI 正在分析内容表现并生成复盘报告..." />}
          </>
        ) : (
          <div className="space-y-4 animate-slide-up">
            {/* Performance analysis */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📈</span>
                <h3 className="font-semibold text-gray-900">数据表现分析</h3>
              </div>
              <p className="text-sm text-gray-700 bg-blue-50 rounded-xl px-4 py-3 leading-relaxed">
                {result.performance_analysis}
              </p>
            </div>

            {/* Strengths */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">✅</span>
                <h3 className="font-semibold text-gray-900">做得好的地方</h3>
              </div>
              <div className="space-y-2">
                {result.strengths?.map((s, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-green-400 shrink-0 mt-0.5">●</span>
                    <p className="text-sm text-gray-700">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🔧</span>
                <h3 className="font-semibold text-gray-900">需要改进的地方</h3>
              </div>
              <div className="space-y-2">
                {result.weaknesses?.map((w, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-orange-400 shrink-0 mt-0.5">●</span>
                    <p className="text-sm text-gray-700">{w}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Next suggestions */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🚀</span>
                <h3 className="font-semibold text-gray-900">下一条内容建议</h3>
              </div>
              <div className="space-y-3">
                {result.next_suggestions?.map((sug, i) => {
                  const cfg = PRIORITY_CONFIG[sug.priority] || PRIORITY_CONFIG.low
                  return (
                    <div key={i} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span>{cfg.icon}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>{cfg.label}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 mb-1">{sug.action}</p>
                      <p className="text-xs text-gray-500">{sug.reason}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setResult(null)} className="btn-secondary">重新复盘</button>
              <button onClick={() => window.history.back()} className="btn-primary">返回首页</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
