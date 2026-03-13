import React, { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import LoadingState from '../components/LoadingState'
import CopyButton from '../components/CopyButton'
import { generateContent } from '../services/difyApi'

const GOALS = ['种草推荐', '带货转化', '品牌宣传', '活动预热']
const TYPES = ['图文文案', '短视频脚本', '直播话术', '封面标题']

const TYPE_ICON = { scene: '🌟', feature: '⚡', promo: '🔥' }

export default function ContentGeneration() {
  const [form, setForm] = useState({
    contentGoal: '带货转化',
    contentType: '图文文案',
    style: '',
    productName: '',
  })
  const [productAnalysis, setProductAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const saved = sessionStorage.getItem('productAnalysis')
    const name = sessionStorage.getItem('productName')
    if (saved) setProductAnalysis(JSON.parse(saved))
    if (name) setForm(f => ({ ...f, productName: name }))
  }, [])

  const handleSubmit = async () => {
    if (!productAnalysis && !form.productName) {
      setError('请先完成「商品理解」，或至少填写商品名称')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await generateContent({
        productAnalysis: productAnalysis || { core_value: form.productName },
        contentGoal: form.contentGoal,
        contentType: form.contentType,
        style: form.style,
      })
      setResult(data)
      setActiveTab(0)
    } catch (e) {
      setError('生成失败：' + (e.message || ''))
    } finally {
      setLoading(false)
    }
  }

  const versions = result?.versions || []

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="内容生成" subtitle="一键生成 3 个差异化带货版本" />

      <div className="px-4 py-4 space-y-4">
        {/* Product context hint */}
        {productAnalysis ? (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
            <span className="text-green-500">✅</span>
            <p className="text-xs text-green-700">已载入商品分析结果：{form.productName}</p>
          </div>
        ) : (
          <div className="card p-3">
            <label className="text-xs text-gray-500 mb-1.5 block">商品名称（未完成商品理解时手动填写）</label>
            <input
              className="input-field"
              placeholder="例：便携式榨汁杯"
              value={form.productName}
              onChange={e => setForm({ ...form, productName: e.target.value })}
            />
          </div>
        )}

        <div className="card p-4 space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-2 block">内容目标</label>
            <div className="flex flex-wrap gap-2">
              {GOALS.map(g => (
                <button
                  key={g}
                  onClick={() => setForm({ ...form, contentGoal: g })}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all
                    ${form.contentGoal === g ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">内容形式</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, contentType: t })}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all
                    ${form.contentType === t ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-200'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">风格偏好（可选）</label>
            <input
              className="input-field"
              placeholder="例：接地气、轻松活泼、专业测评风"
              value={form.style}
              onChange={e => setForm({ ...form, style: e.target.value })}
            />
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        </div>

        <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
          {loading ? '生成中...' : '✍️ 生成 3 个版本内容'}
        </button>

        {loading && <LoadingState message="AI 正在创作差异化内容版本..." />}

        {/* Results */}
        {versions.length > 0 && (
          <div className="space-y-3 animate-slide-up">
            {/* Tab switcher */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {versions.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all
                    ${activeTab === i ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                >
                  {TYPE_ICON[v.type] || '📝'} {v.label}
                </button>
              ))}
            </div>

            {/* Active content */}
            {versions[activeTab] && (
              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{TYPE_ICON[versions[activeTab].type]}</span>
                    <span className="font-semibold text-gray-800">{versions[activeTab].label}</span>
                  </div>
                  <CopyButton text={versions[activeTab].content} />
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-3">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {versions[activeTab].content}
                  </p>
                </div>

                {versions[activeTab].hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {versions[activeTab].hashtags.map((tag, i) => (
                      <span key={i} className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button onClick={() => setResult(null)} className="btn-secondary w-full">
              重新生成
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
