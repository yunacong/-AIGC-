import axios from 'axios'

const BASE_URL = import.meta.env.VITE_DIFY_BASE_URL || 'https://api.dify.ai/v1'

const WORKFLOW_KEYS = {
  product: import.meta.env.VITE_DIFY_KEY_PRODUCT,
  content: import.meta.env.VITE_DIFY_KEY_CONTENT,
  image: import.meta.env.VITE_DIFY_KEY_IMAGE,
  diagnose: import.meta.env.VITE_DIFY_KEY_DIAGNOSE,
  video: import.meta.env.VITE_DIFY_KEY_VIDEO,
  review: import.meta.env.VITE_DIFY_KEY_REVIEW,
}

// 通用工作流调用（非流式）
async function runWorkflow(workflowType, inputs, userId = 'demo-user') {
  const apiKey = WORKFLOW_KEYS[workflowType]
  if (!apiKey || apiKey.startsWith('your-')) {
    return getMockResponse(workflowType, inputs)
  }

  const response = await axios.post(
    `${BASE_URL}/workflows/run`,
    {
      inputs,
      response_mode: 'blocking',
      user: userId,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const data = response.data
  if (data.data?.outputs?.result) {
    try {
      return JSON.parse(data.data.outputs.result)
    } catch {
      return data.data.outputs.result
    }
  }
  return data.data?.outputs || data
}

// ─── Agent 1：商品理解 ────────────────────────────────────────────
export async function analyzeProduct(params) {
  return runWorkflow('product', {
    product_name: params.productName,
    product_category: params.category,
    product_features: params.features,
    target_audience: params.audience,
    price_range: params.priceRange || '',
    usage_scenario: params.scenario || '',
  })
}

// ─── Agent 2：内容生成 ────────────────────────────────────────────
export async function generateContent(params) {
  return runWorkflow('content', {
    product_analysis: JSON.stringify(params.productAnalysis),
    content_goal: params.contentGoal,
    content_type: params.contentType,
    style_preference: params.style || '自然真实',
  })
}

// ─── Agent 3：图片优化 ────────────────────────────────────────────
export async function optimizeImage(params) {
  return runWorkflow('image', {
    image_url: params.imageUrl,
    product_name: params.productName,
    style_preference: params.style,
    image_purpose: params.purpose || '商品主图',
  })
}

// ─── Agent 4：内容诊断 ────────────────────────────────────────────
export async function diagnoseContent(params) {
  return runWorkflow('diagnose', {
    content_text: params.contentText,
    platform: params.platform,
    product_name: params.productName,
    performance_data: params.performanceData || '',
  })
}

// ─── Agent 5：视频候选 ────────────────────────────────────────────
export async function generateVideo(params) {
  return runWorkflow('video', {
    image_url: params.imageUrl,
    product_name: params.productName,
    video_style: params.style || '简洁展示',
  })
}

// ─── Agent 6：复盘优化 ────────────────────────────────────────────
export async function reviewOptimization(params) {
  return runWorkflow('review', {
    published_content: params.publishedContent,
    performance_data: params.performanceData,
    product_name: params.productName,
    diagnosis_history: params.diagnosisHistory || '',
  })
}

// ─── Mock 数据（未配置 API Key 时返回） ──────────────────────────
function getMockResponse(type, inputs) {
  const mocks = {
    product: {
      core_value: `${inputs.product_name || '该商品'}的核心价值：高性价比、使用便捷、效果显著`,
      key_selling_points: ['卖点一：品质升级，材质优选', '卖点二：使用简单，一键操作', '卖点三：效果直观，用户好评率高'],
      content_angles: [
        { angle: '场景共鸣型', description: '展示真实使用场景，引发目标用户情感共鸣' },
        { angle: '功效展示型', description: '直观展示使用前后对比，突出产品效果' },
        { angle: '促销转化型', description: '强调优惠力度和限时活动，刺激即时下单' },
      ],
      suggested_style: '生活化、真实感强，避免过度营销感',
      avoid: ['避免使用极限词（最好、第一等）', '避免虚假宣传和夸大效果'],
    },
    content: {
      versions: [
        {
          type: 'scene',
          label: '场景共鸣型',
          content: '✨ 姐妹们！上班族的救星来了～\n\n每天通勤包里这个神器已经用了3个月了，真的太好用了！\n\n👉 早上8点出门，晚上9点到家，这一天下来就靠它撑着\n\n不用纠结要不要买，直接冲！评论区告诉我你们用了多久了～',
          hashtags: ['#上班族必备', '#好物推荐', '#真实好评'],
        },
        {
          type: 'feature',
          label: '卖点功效型',
          content: '⚡ 实测对比！用了这个后真的不一样！\n\n【使用前】每次都要折腾半天，效果还不稳定\n【使用后】一键搞定，效果超稳定，省时省力\n\n核心技术加持，品质有保障。已经回购3次了，性价比超高！\n\n点击购物车，今天下单立减20元 👇',
          hashtags: ['#实测对比', '#好物分享', '#值得买'],
        },
        {
          type: 'promo',
          label: '转化促销型',
          content: '🔥 别犹豫了！今天最后一天活动价！\n\n原价199，今天只要99，直降100元！\n\n❶ 品质有保障，官方正品\n❷ 7天无理由退换\n❸ 买就送配套周边\n\n已经有2000+人下单了，不抢就没了！\n点左下角购物车 ⬇️',
          hashtags: ['#限时优惠', '#今日必买', '#超值好物'],
        },
      ],
    },
    image: {
      score: 5,
      issues: [
        { priority: 'high', tag: '背景杂乱', detail: '图片背景颜色杂乱，干扰商品主体视觉呈现' },
        { priority: 'medium', tag: '主体偏小', detail: '商品在画面中占比较小，建议裁剪突出主体' },
        { priority: 'low', tag: '光线偏暗', detail: '整体曝光略显不足，建议提亮处理' },
      ],
      suggestions: [
        { for_issue: '背景杂乱', suggestion: '使用纯白或渐变浅色背景，突出商品质感' },
        { for_issue: '主体偏小', suggestion: '将商品主体裁剪至占画面70%以上' },
        { for_issue: '光线偏暗', suggestion: '提升整体亮度约20%，补偿主体光线' },
      ],
      candidate_images: [
        { style: '极简白底', url: 'https://via.placeholder.com/400x400/ffffff/FF6B35?text=极简白底候选图', description: '干净极简，适合平台主图和搜索展示' },
        { style: '生活场景', url: 'https://via.placeholder.com/400x400/f0f8ff/4682B4?text=生活场景候选图', description: '真实场景感，适合图文内容和种草' },
        { style: '高质感风', url: 'https://via.placeholder.com/400x400/1a1a2e/FF6B35?text=高质感候选图', description: '品质高级感，适合品牌宣传和高端定价' },
      ],
    },
    diagnose: {
      overall_score: 6,
      dimension_scores: { hook: 5, selling_point: 6, emotion: 7, conversion: 4, compliance: 9 },
      issues: [
        { priority: 'high', dimension: 'hook', tag: '开头吸引力不足', detail: '前两句没有制造悬念或触发情绪，用户容易划走' },
        { priority: 'high', dimension: 'conversion', tag: '缺少行动指令', detail: '结尾没有明确引导用户点击购物车或评论互动' },
        { priority: 'medium', dimension: 'selling_point', tag: '卖点靠后', detail: '核心卖点出现在文案中段，建议前置' },
      ],
      suggestions: [
        { for_issue: '开头吸引力不足', rewrite: '建议开头改为：「姐妹们这个真的绝了！用了一周我已经回购3次了」' },
        { for_issue: '缺少行动指令', rewrite: '建议结尾加上：「点左下角购物车，今天下单包邮送礼袋～」' },
        { for_issue: '卖点靠后', rewrite: '建议第二段直接说核心效果，让用户快速get产品价值' },
      ],
    },
    video: {
      status: 'pending',
      task_id: 'mock-task-' + Date.now(),
      message: '视频生成中，约需 2-3 分钟，请稍候...',
      estimated_time: 120,
      preview_info: {
        style: '简洁展示',
        duration: '5秒',
        format: 'MP4',
        resolution: '1080x1920',
      },
    },
    review: {
      performance_analysis: '本阶段内容整体表现中等，点赞率偏低说明内容共鸣不够强，评论数尚可说明有一定话题性，但转化率需要提升。',
      strengths: ['内容发布频率稳定，账号活跃度良好', '评论区互动较好，有用户主动询问购买', '视觉风格统一，账号辨识度在提升'],
      weaknesses: ['开头钩子设计偏弱，完播率较低', '卖点表达不够直接，用户转化路径长', '缺少促销信息，复购引导不足'],
      next_suggestions: [
        { action: '下一条内容用问句开头，制造悬念', reason: '有效提升前3秒完播率和互动欲望', priority: 'high' },
        { action: '卖点前置，第一段就说核心效果', reason: '减少用户理解成本，加速决策转化', priority: 'high' },
        { action: '结尾加限时优惠信息', reason: '创造紧迫感，提升即时转化率', priority: 'medium' },
      ],
    },
  }
  return Promise.resolve(mocks[type] || { error: '未知工作流类型' })
}
