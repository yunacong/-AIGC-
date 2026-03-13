import React, { useState, useRef } from 'react'
import PageHeader from '../components/PageHeader'
import LoadingState from '../components/LoadingState'
import { optimizeImage } from '../services/difyApi'

const STYLES = ['极简白底', '生活场景', '高质感', '活力促销']
const PURPOSES = ['商品主图', '图文首图', '封面图', '详情图']
const PRIORITY_CONFIG = {
  high: { label: '高优先', cls: 'tag-high' },
  medium: { label: '中优先', cls: 'tag-medium' },
  low: { label: '低优先', cls: 'tag-low' },
}

export default function ImageOptimization() {
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [productName, setProductName] = useState('')
  const [style, setStyle] = useState('极简白底')
  const [purpose, setPurpose] = useState('商品主图')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [selectedImg, setSelectedImg] = useState(0)
  const fileRef = useRef()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImagePreview(ev.target.result)
      // In a real app you'd upload to CDN and get URL
      setImageUrl('https://via.placeholder.com/400x400/cccccc/999999?text=商品图已上传')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!imageUrl && !imagePreview) {
      setError('请上传商品图片')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await optimizeImage({
        imageUrl: imageUrl || 'https://via.placeholder.com/400x400',
        productName,
        style,
        purpose,
      })
      setResult(data)
      setSelectedImg(0)
    } catch (e) {
      setError('优化失败：' + (e.message || ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="图片优化" subtitle="AI 诊断图片问题并生成候选图" />

      <div className="px-4 py-4 space-y-4">
        {!result ? (
          <>
            {/* Upload area */}
            <div className="card p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">上传商品图片</h2>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-3
                           active:bg-gray-50 cursor-pointer transition-colors"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-40 h-40 object-cover rounded-xl" />
                ) : (
                  <>
                    <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-2xl">🖼️</div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">点击上传商品图</p>
                      <p className="text-xs text-gray-400 mt-1">支持 JPG / PNG，建议 800×800 以上</p>
                    </div>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

              {imagePreview && (
                <button
                  onClick={() => { setImagePreview(''); setImageUrl('') }}
                  className="mt-2 w-full text-xs text-gray-400 py-2"
                >
                  重新上传
                </button>
              )}
            </div>

            <div className="card p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">商品名称（可选）</label>
                <input className="input-field" placeholder="例：便携式榨汁杯" value={productName}
                  onChange={e => setProductName(e.target.value)} />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">期望风格</label>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map(s => (
                    <button key={s} onClick={() => setStyle(s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all
                        ${style === s ? 'bg-purple-500 text-white border-purple-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">图片用途</label>
                <div className="flex flex-wrap gap-2">
                  {PURPOSES.map(p => (
                    <button key={p} onClick={() => setPurpose(p)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all
                        ${purpose === p ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            </div>

            <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
              {loading ? '分析中...' : '🖼️ 诊断并生成候选图'}
            </button>

            {loading && <LoadingState message="AI 正在分析图片问题并生成候选图..." />}
          </>
        ) : (
          <div className="space-y-4 animate-slide-up">
            {/* Diagnosis */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🩺</span>
                  <h3 className="font-semibold text-gray-900">图片诊断报告</h3>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">评分</span>
                  <span className="text-lg font-bold text-orange-500">{result.score}</span>
                  <span className="text-xs text-gray-400">/10</span>
                </div>
              </div>

              <div className="space-y-2">
                {result.issues?.map((issue, i) => {
                  const cfg = PRIORITY_CONFIG[issue.priority] || PRIORITY_CONFIG.low
                  return (
                    <div key={i} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cfg.cls}>{cfg.label}</span>
                        <span className="text-xs font-semibold text-gray-700">{issue.tag}</span>
                      </div>
                      <p className="text-xs text-gray-500">{issue.detail}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Suggestions */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💡</span>
                <h3 className="font-semibold text-gray-900">优化建议</h3>
              </div>
              <div className="space-y-2">
                {result.suggestions?.map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-orange-400 mt-0.5">→</span>
                    <div>
                      <p className="text-xs font-medium text-gray-700">{s.for_issue}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidate images */}
            {result.candidate_images?.length > 0 && (
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🎨</span>
                  <h3 className="font-semibold text-gray-900">候选优化图</h3>
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                  {result.candidate_images.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImg(i)}
                      className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all
                        ${selectedImg === i ? 'border-orange-500' : 'border-transparent'}`}>
                      <img src={img.url} alt={img.style} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                {/* Selected image detail */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-orange-500 mb-1">
                    {result.candidate_images[selectedImg]?.style}
                  </p>
                  <p className="text-xs text-gray-500">
                    {result.candidate_images[selectedImg]?.description}
                  </p>
                </div>
              </div>
            )}

            <button onClick={() => setResult(null)} className="btn-secondary w-full">重新上传图片</button>
          </div>
        )}
      </div>
    </div>
  )
}
