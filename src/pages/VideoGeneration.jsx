import React, { useState, useRef } from 'react'
import PageHeader from '../components/PageHeader'
import LoadingState from '../components/LoadingState'
import { generateVideo } from '../services/difyApi'

const VIDEO_STYLES = ['简洁展示', '场景展示', '强动感', '温馨生活']

export default function VideoGeneration() {
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [productName, setProductName] = useState('')
  const [style, setStyle] = useState('简洁展示')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setImagePreview(ev.target.result)
      setImageUrl('https://via.placeholder.com/400x400/cccccc/999999?text=已上传')
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
      const data = await generateVideo({
        imageUrl: imageUrl || 'https://via.placeholder.com/400x400',
        productName,
        style,
      })
      setResult(data)
    } catch (e) {
      setError('提交失败：' + (e.message || ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="视频候选生成" subtitle="基于商品图生成 5 秒展示视频" />

      <div className="px-4 py-4 space-y-4">
        {/* Preview banner */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-red-500">🎬</span>
            <div>
              <p className="text-xs font-semibold text-red-700">预览功能</p>
              <p className="text-xs text-red-500">视频生成约需 2-3 分钟，异步返回结果</p>
            </div>
          </div>
        </div>

        {!result ? (
          <>
            {/* Upload */}
            <div className="card p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">上传商品图片</h2>
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer active:bg-gray-50">
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-40 h-40 object-cover rounded-xl" />
                ) : (
                  <>
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-2xl">🎬</div>
                    <p className="text-sm font-medium text-gray-700">点击上传商品图</p>
                    <p className="text-xs text-gray-400">建议使用已优化的商品图，效果更佳</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="card p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">商品名称</label>
                <input className="input-field" placeholder="例：便携式榨汁杯"
                  value={productName} onChange={e => setProductName(e.target.value)} />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">视频风格</label>
                <div className="flex flex-wrap gap-2">
                  {VIDEO_STYLES.map(s => (
                    <button key={s} onClick={() => setStyle(s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all
                        ${style === s ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            </div>

            <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full">
              {loading ? '提交中...' : '🎬 提交视频生成任务'}
            </button>

            {loading && <LoadingState message="提交视频生成任务中..." />}
          </>
        ) : (
          <div className="space-y-4 animate-slide-up">
            {/* Task submitted */}
            <div className="card p-6 text-center">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                ⏳
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">视频生成任务已提交</h3>
              <p className="text-sm text-gray-500 mb-4">{result.message}</p>
              <div className="bg-gray-50 rounded-xl p-3 text-left space-y-2">
                <p className="text-xs text-gray-500">任务 ID：<span className="font-mono text-gray-700">{result.task_id}</span></p>
                {result.preview_info && (
                  <>
                    <p className="text-xs text-gray-500">风格：<span className="text-gray-700">{result.preview_info.style}</span></p>
                    <p className="text-xs text-gray-500">时长：<span className="text-gray-700">{result.preview_info.duration}</span></p>
                    <p className="text-xs text-gray-500">格式：<span className="text-gray-700">{result.preview_info.format} · {result.preview_info.resolution}</span></p>
                  </>
                )}
              </div>
            </div>

            {/* Polling hint */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p className="text-xs text-blue-700 leading-relaxed">
                💡 视频生成约需 2-3 分钟。实际产品中，前端会每隔 10 秒轮询任务状态，完成后自动展示视频。
                当前为 Demo 演示模式。
              </p>
            </div>

            <button onClick={() => setResult(null)} className="btn-secondary w-full">重新提交</button>
          </div>
        )}
      </div>
    </div>
  )
}
