/**
 * Vercel Serverless Function - Dify 文件上传代理
 */
export const config = {
  api: { bodyParser: false },
}

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 直接将请求体转发给 Dify，需要从 FormData 中取出 workflowType
  // 使用 raw-body 读取流
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const rawBody = Buffer.concat(chunks)

  // 从 Content-Type 提取 boundary
  const contentType = req.headers['content-type']
  const boundaryMatch = contentType?.match(/boundary=(.+)$/)
  if (!boundaryMatch) {
    return res.status(400).json({ error: '无效的 multipart 请求' })
  }

  // 简单解析 workflowType 字段
  const bodyStr = rawBody.toString()
  const workflowTypeMatch = bodyStr.match(/name="workflowType"\r\n\r\n([^\r\n]+)/)
  const workflowType = workflowTypeMatch?.[1]
  const apiKey = WORKFLOW_KEYS[workflowType]

  if (!apiKey) {
    return res.status(400).json({ error: `未知的 workflowType: ${workflowType}` })
  }

  try {
    const difyRes = await fetch(`${BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': contentType,
      },
      body: rawBody,
    })

    const data = await difyRes.json()
    return res.status(difyRes.status).json(data)
  } catch (err) {
    return res.status(500).json({ error: '文件上传失败', detail: err.message })
  }
}
