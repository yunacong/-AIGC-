import React, { useState, useRef, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import LoadingState from '../components/LoadingState'
import { generateVideo, queryVideo, uploadFile } from '../services/difyApi'

const VIDEO_STYLES = ['简洁展示', '场景展示', '强动感', '温馨生活']

const STORAGE_KEY = 'aigc_video_result'

export default function VideoGeneration() {
  const [inputMode, setInputMode] = useState('upload') // 'upload' | 'url'
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [productName, setProductName] = useState('')
  const [style, setStyle] = useState('简洁展示')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null }
  })
  const [error, setError] = useState('')
  const [polling, setPolling] = useState(false)
  const pollRef = useRef(null)
  const fileRef = useRef()

  // 有 task_id 但没有 video_url 时自动轮询
  useEffect(() => {
    if (result?.task_id && !result?.video_url) {
      startPolling(result.task_id)
    }
    return () => clearInterval(pollRef.current)
  }, [result?.task_id])

  const startPolling = (taskId) => {
    clearInterval(pollRef.current)
    setPolling(true)
    pollRef.current = setInterval(async () => {
      try {
        const data = await queryVideo(taskId)
        if (data?.video_url) {
          clearInterval(pollRef.current)
          setPolling(false)
          const updated = { ...result, ...data }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
          setResult(updated)
        }
      } catch {
        // 轮询失败静默忽略，继续轮询
      }
    }, 15000) // 每 15 秒查一次
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (inputMode === 'upload' && !imageFile) {
      setError('请上传商品图片')
      return
    }
    if (inputMode === 'url' && !imageUrl) {
      setError('请填写图片 URL')
      return
    }
    setError('')
    setLoading(true)
    try {
      let params = { productName, style }
      if (inputMode === 'upload') {
        params.fileId = await uploadFile('video', imageFile)
      } else {
        params.imageUrl = imageUrl
      }
      const data = await generateVideo(params)
      const saved = { ...data, _savedAt: Date.now(), _productName: productName, _style: style }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
      setResult(saved)
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
            {/* Image input */}
            <div className="card p-4">
              <div className="flex gap-2 mb-3">
                <button onClick={() => setInputMode('upload')}
                  className={`flex-1 text-xs py-1.5 rounded-lg border transition-all
                    ${inputMode === 'upload' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                  本地上传
                </button>
                <button onClick={() => setInputMode('url')}
                  className={`flex-1 text-xs py-1.5 rounded-lg border transition-all
                    ${inputMode === 'url' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-200'}`}>
                  图片 URL
                </button>
              </div>

              {inputMode === 'upload' ? (
                <>
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
                  {imagePreview && (
                    <button onClick={() => { setImagePreview(''); setImageFile(null) }}
                      className="mt-2 w-full text-xs text-gray-400 py-2">重新上传</button>
                  )}
                </>
              ) : (
                <>
                  <input className="input-field"
                    placeholder="请输入商品图片的网络地址，例：https://example.com/product.jpg"
                    value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                  {imageUrl && (
                    <img src={imageUrl} alt="preview" className="mt-3 w-full max-h-48 object-contain rounded-xl bg-gray-50"
                      onError={e => { e.target.style.display = 'none' }} />
                  )}
                </>
              )}
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

            {loading && <LoadingState message="AI 正在生成视频，请耐心等待..." estimatedSeconds={150} />}
          </>
        ) : (
          <div className="space-y-4 animate-slide-up">
            {result._savedAt && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-2 flex items-center gap-2">
                <span className="text-yellow-500 text-sm">📌</span>
                <p className="text-xs text-yellow-700">
                  提交于 {new Date(result._savedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {result._productName && ` · ${result._productName}`}
                </p>
              </div>
            )}

            {result.video_url ? (
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🎬</span>
                  <h3 className="font-semibold text-gray-900">视频已生成</h3>
                </div>
                <video src={result.video_url} controls className="w-full rounded-xl" />
                <a href={result.video_url} download
                  className="mt-3 btn-primary w-full text-center block">下载视频</a>
              </div>
            ) : (
              <div className="card p-6 text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-red-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-400"
                    style={{ animation: polling ? 'spin 1s linear infinite' : 'none' }} />
                  <div className="absolute inset-0 flex items-center justify-center text-2xl">🎬</div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {polling ? '视频生成中...' : '等待视频生成'}
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  {polling ? '每 15 秒自动检查一次，完成后自动展示' : '视频生成约需 2-5 分钟'}
                </p>
                {result._style && (
                  <div className="bg-gray-50 rounded-xl px-4 py-2 inline-block">
                    <span className="text-xs text-gray-500">风格：</span>
                    <span className="text-xs font-medium text-gray-700">{result._style}</span>
                  </div>
                )}
              </div>
            )}

            <button onClick={() => {
              localStorage.removeItem(STORAGE_KEY)
              setResult(null)
            }} className="btn-secondary w-full">清除记录，重新提交</button>
          </div>
        )}
      </div>
    </div>
  )
}
