import React, { useState } from 'react'
import PageHeader from '../components/PageHeader'
import LoadingState from '../components/LoadingState'
import { analyzeProduct } from '../services/difyApi'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = ['服装/配饰', '食品/饮料', '数码/3C', '美妆/护肤', '家居/家电', '母婴/儿童', '运动/户外', '其他']

export default function ProductUnderstanding() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ productName: '', category: '', features: '', audience: '', priceRange: '', scenario: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.productName || !form.category || !form.features) {
      setError('请填写商品名称、品类和核心卖点')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await analyzeProduct(form)
      setResult(data)
    } catch (e) {
      setError('分析失败，请稍后重试：' + (e.message || ''))
    } finally {
      setLoading(false)
    }
  }

  const handleUseForContent = () => {
    sessionStorage.setItem('productAnalysis', JSON.stringify(result))
    sessionStorage.setItem('productName', form.productName)
    navigate('/content')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="商品理解" subtitle="AI 帮你提炼卖点和内容方向" />

      <div className="px-4 py-4 space-y-4">
        {!result ? (
          <>
            <div className="card p-4 space-y-4">
              <h2 className="text-sm font-semibold text-gray-700">填写商品信息</h2>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">商品名称 *</label>
                <input
                  className="input-field"
                  placeholder="例：便携式榨汁杯"
                  value={form.productName}
                  onChange={e => setForm({ ...form, productName: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">商品品类 *</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150
                        ${form.category === cat
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-600 border-gray-200'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">核心卖点 *</label>
                <textarea
                  className="textarea-field"
                  rows={3}
                  placeholder="例：容量500ml，USB充电，随时随地榨新鲜果汁，轻巧好携带"
                  value={form.features}
                  onChange={e => setForm({ ...form, features: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">目标人群</label>
                <input
                  className="input-field"
                  placeholder="例：25-35岁上班族女性，注重健康生活"
                  value={form.audience}
                  onChange={e => setForm({ ...form, audience: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">价格带</label>
                  <input
                    className="input-field"
                    placeholder="例：99元"
                    value={form.priceRange}
                    onChange={e => setForm({ ...form, priceRange: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">使用场景</label>
                  <input
                    className="input-field"
                    placeholder="例：通勤/健身"
                    value={form.scenario}
                    onChange={e => setForm({ ...form, scenario: e.target.value })}
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? '分析中...' : '🔍 开始分析商品'}
            </button>

            {loading && <LoadingState message="AI 正在分析商品卖点和内容方向..." />}
          </>
        ) : (
          <div className="space-y-4 animate-slide-up">
            {/* Core value */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💡</span>
                <h3 className="font-semibold text-gray-900">核心价值主张</h3>
              </div>
              <p className="text-sm text-gray-700 bg-orange-50 rounded-xl px-4 py-3 leading-relaxed">
                {result.core_value}
              </p>
            </div>

            {/* Key selling points */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🎯</span>
                <h3 className="font-semibold text-gray-900">核心卖点拆解</h3>
              </div>
              <div className="space-y-2">
                {result.key_selling_points?.map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs flex items-center justify-center shrink-0 font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Content angles */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📐</span>
                <h3 className="font-semibold text-gray-900">内容方向建议</h3>
              </div>
              <div className="space-y-3">
                {result.content_angles?.map((angle, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-orange-500 mb-1">{angle.angle}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{angle.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Style and avoid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card p-3">
                <p className="text-xs font-semibold text-gray-500 mb-2">推荐风格</p>
                <p className="text-xs text-gray-700">{result.suggested_style}</p>
              </div>
              <div className="card p-3">
                <p className="text-xs font-semibold text-red-500 mb-2">⚠️ 注意避免</p>
                <ul className="space-y-1">
                  {result.avoid?.map((item, i) => (
                    <li key={i} className="text-xs text-gray-600">• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setResult(null)}
                className="btn-secondary"
              >
                重新分析
              </button>
              <button
                onClick={handleUseForContent}
                className="btn-primary"
              >
                去生成内容 →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
