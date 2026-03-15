/**
 * Vercel Serverless Function - Dify API 代理
 * - API Key 安全存储在 Vercel 环境变量，不暴露给前端
 * - IP 每日限流，防止额度被大量消耗
 */

// 简单内存限流（Vercel Function 是无状态的，重启后重置，但对 demo 够用）
const ipRequestCount = new Map()
const DAILY_LIMIT_PER_IP = 10 // 每个 IP 每次冷启动最多 10 次请求

const WORKFLOW_KEYS = {
  product: process.env.DIFY_KEY_PRODUCT,
  content: process.env.DIFY_KEY_CONTENT,
  image: process.env.DIFY_KEY_IMAGE,
  diagnose: process.env.DIFY_KEY_DIAGNOSE,
  video: process.env.DIFY_KEY_VIDEO,
  review: process.env.DIFY_KEY_REVIEW,
}

const BASE_URL = process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1'

export default async function handler(req, res) {
  // 只允许 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // IP 限流
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown'
  const count = ipRequestCount.get(ip) || 0
  if (count >= DAILY_LIMIT_PER_IP) {
    return res.status(429).json({ error: '请求次数已达上限，感谢体验！如需完整演示请联系作者。' })
  }
  ipRequestCount.set(ip, count + 1)

  const { workflowType, path, body: requestBody } = req.body

  // 文件上传走单独逻辑
  if (path === '/files/upload') {
    return res.status(400).json({ error: '文件上传请使用 /api/upload 接口' })
  }

  const apiKey = WORKFLOW_KEYS[workflowType]
  if (!apiKey) {
    return res.status(400).json({ error: `未知的 workflowType: ${workflowType}` })
  }

  try {
    const difyRes = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      // Vercel Function 默认超时 10s（免费版），付费版可到 300s
      // Dify workflow 可能较慢，建议在 Vercel 项目设置里调整
    })

    const data = await difyRes.json()
    return res.status(difyRes.status).json(data)
  } catch (err) {
    console.error('[proxy error]', err)
    return res.status(500).json({ error: '代理请求失败', detail: err.message })
  }
}
