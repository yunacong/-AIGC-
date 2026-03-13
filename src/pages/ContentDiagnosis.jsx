import React, { useState } from 'react'
import PageHeader from '../components/PageHeader'
import LoadingState from '../components/LoadingState'
import ScoreBar from '../components/ScoreBar'
import CopyButton from '../components/CopyButton'
import { diagnoseContent } from '../services/difyApi'

const PLATFORMS = ['抖音', '小红书', '淘宝', '快手', '视频号']

const DIM_LABELS = {
  hook: '首屏钩子',
  selling_point: '卖点表达',
  emotion: '情感共鸣',
  conversion: '转化引导',
  compliance: '平台规范',
}

const PRIORITY_CONFIG = {
  high: { label: '高优先级', cls: 'tag-high', icon: '🔴' },
  medium: { label: '中优先级', cls: 'tag-medium', icon: '🟡' },
  low: { label: '低优先级', cls: 'tag-low', icon: '🟢' },
}

export default function ContentDiagnosis() {
  const [form, setForm] = useState({ contentText: '', platform: '抖音', productName: '', performanceData: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.contentText.trim()) {
      setError('请粘贴需要诊断的文案内容')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await diagnoseContent(form)
      setResult(data)
    } catch (e) {
      setError('诊断失败：' + (e.message || ''))
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = (s) => s >= 7 ? 'text-green-500' : s >= 5 ? 'text-yellow-500' : 'text-red-500'

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="内容诊断" subtitle="找问题 · 给优化建议" />

      <div className="px-4 py-4 space-y-4">
        {!result ? (
          <>
            <div className="card p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">粘贴需要诊断的内容 *</label>
                <textarea
                  className="textarea-field"
                  rows={6}
                  placeholder="将你的带货文案、短视频脚本或标题粘贴到这里..."
                  value={form.contentText}
                  onChange={e => setForm({ ...form, contentText: e.target.value })}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.contentText.length} 字</p>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">发布平台</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => (
                    <button key={p} onClick={() => setForm({ ...form, platform: p })}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all
                        ${form.platform === p ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">商品名称（可选）</label>
                <input className="input-field" placeholder="例：便携式榨汁杯"
                  value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })} />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">数据表现（可选，帮助更准确诊断）</label>
                <input className="input-field" placeholder="例：播放800，点赞12，转化0"
                  value={form.performanceData} onChange={e => setForm({ ...form, performanceData: e.target.value })} />
              </div>

              {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            </div>

            <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
              {loading ? '诊断中...' : '🩺 开始内容诊断'}
            </button>

            {loading && <LoadingState message="AI 正在诊断内容问题..." />}
          </>
        ) : (
          <div className="space-y-4 animate-slide-up">
            {/* Overall score */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">综合评分</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{form.platform} · {form.contentText.slice(0, 20)}...</p>
                </div>
                <div className="text-center">
                  <span className={`text-4xl font-bold ${scoreColor(result.overall_score)}`}>
                    {result.overall_score}
                  </span>
                  <span className="text-sm text-gray-400">/10</span>
                </div>
              </div>

              <div className="space-y-2">
                {Object.entries(result.dimension_scores || {}).map(([key, val]) => (
                  <ScoreBar key={key} label={DIM_LABELS[key] || key} score={val} />
                ))}
              </div>
            </div>

            {/* Issues */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">⚠️</span>
                <h3 className="font-semibold text-gray-900">发现 {result.issues?.length || 0} 个问题</h3>
              </div>
              <div className="space-y-3">
                {result.issues?.map((issue, i) => {
                  const cfg = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.low
                  return (
                    <div key={i} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span>{cfg.icon}</span>
                        <span className={cfg.cls}>{cfg.label}</span>
                        <span className="text-xs font-semibold text-gray-700">{issue.tag}</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{issue.detail}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Suggestions */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💊</span>
                <h3 className="font-semibold text-gray-900">优化建议</h3>
              </div>
              <div className="space-y-3">
                {result.suggestions?.map((s, i) => (
                  <div key={i} className="border border-orange-100 rounded-xl p-3">
                    <p className="text-xs font-semibold text-orange-600 mb-1.5">针对：{s.for_issue}</p>
                    <p className="text-xs text-gray-700 leading-relaxed bg-orange-50 rounded-lg p-2">
                      {s.rewrite}
                    </p>
                    <div className="flex justify-end mt-2">
                      <CopyButton text={s.rewrite} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setResult(null)} className="btn-secondary w-full">诊断新内容</button>
          </div>
        )}
      </div>
    </div>
  )
}
