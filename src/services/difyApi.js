import axios from 'axios'

// 判断是否配置了真实 API Key（通过代理模式）
// 前端不再持有任何 API Key，统一走 /api/proxy
const USE_PROXY = import.meta.env.VITE_USE_PROXY === 'true'

// 上传文件到 Dify，返回 file_id
export async function uploadFile(workflowType, file) {
  if (!USE_PROXY) return null

  const formData = new FormData()
  formData.append('file', file)
  formData.append('user', 'demo-user')
  formData.append('workflowType', workflowType)

  const response = await axios.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data.id
}

// 通用工作流调用（非流式）
async function runWorkflow(workflowType, inputs, userId = 'demo-user') {
  if (!USE_PROXY) {
    return getMockResponse(workflowType, inputs)
  }

  const response = await axios.post(
    '/api/proxy',
    {
      workflowType,
      path: '/workflows/run',
      body: {
        inputs,
        response_mode: 'blocking',
        user: userId,
      },
    },
    { timeout: 300000 }
  )

  const data = response.data
  const status = data.data?.status
  const outputs = data.data?.outputs || {}
  console.log('[Dify status]', status, '[outputs]', outputs)

  if (status === 'failed') {
    throw new Error(data.data?.error || '工作流执行失败')
  }

  // 遍历所有输出字段，尝试解析 JSON 字符串
  const parsed = {}
  for (const [key, val] of Object.entries(outputs)) {
    if (typeof val === 'string') {
      try { parsed[key] = JSON.parse(val) } catch { parsed[key] = val }
    } else {
      parsed[key] = val
    }
  }
  return parsed
}

// ─── Agent 1：商品理解 ────────────────────────────────────────────
export async function analyzeProduct(params) {
  const data = await runWorkflow('product', {
    product_name: params.productName,
    product_category: params.category,
    product_features: params.features,
    target_audience: params.audience,
    price_range: params.priceRange || '',
    usage_scenario: params.scenario || '',
  })
  // Dify 代码节点将结果包在 result 键中，展开为平铺结构
  return (data.result && typeof data.result === 'object') ? data.result : data
}

// ─── Agent 2：内容生成 ────────────────────────────────────────────
export async function generateContent(params) {
  const data = await runWorkflow('content', {
    product_analysis: JSON.stringify(params.productAnalysis),
    content_goal: params.contentGoal,
    content_type: params.contentType,
    style_preference: params.style || '自然真实',
  })
  return (data.result && typeof data.result === 'object') ? data.result : data
}

// ─── Agent 3：图片优化 ────────────────────────────────────────────
export async function optimizeImage(params) {
  let imageValue
  if (params.fileId) {
    imageValue = { transfer_method: 'local_file', upload_file_id: params.fileId, type: 'image' }
  } else {
    imageValue = { transfer_method: 'remote_url', url: params.imageUrl, type: 'image' }
  }
  const raw = await runWorkflow('image', {
    image_url: imageValue,
    product_name: params.productName,
    style_preference: params.style,
    image_purpose: params.purpose || '商品主图',
  })
  // 将工作流实际输出 (score, issues, suggestions, image_url_1/2/3) 转换为前端格式
  const issues = Array.isArray(raw.issues) ? raw.issues : (typeof raw.issues === 'string' ? JSON.parse(raw.issues) : [])
  const suggestions = Array.isArray(raw.suggestions) ? raw.suggestions : (typeof raw.suggestions === 'string' ? JSON.parse(raw.suggestions) : [])
  const candidateImages = [raw.image_url_1, raw.image_url_2, raw.image_url_3]
    .filter(Boolean)
    .map((url, i) => ({ url, style: ['极简白底', '生活场景', '高质感'][i] || `候选图${i + 1}`, description: '' }))
  return {
    score: parseInt(raw.score) || raw.score,
    issues,
    suggestions,
    candidate_images: candidateImages,
  }
}

// ─── Agent 4：内容诊断 ────────────────────────────────────────────
export async function diagnoseContent(params) {
  const data = await runWorkflow('diagnose', {
    content_text: params.contentText,
    platform: params.platform,
    product_name: params.productName,
    performance_data: params.performanceData || '',
  })
  return (data.result && typeof data.result === 'object') ? data.result : data
}

// ─── Agent 5：视频候选 ────────────────────────────────────────────
export async function generateVideo(params) {
  let imageValue
  if (params.fileId) {
    imageValue = { transfer_method: 'local_file', upload_file_id: params.fileId, type: 'image' }
  } else {
    imageValue = { transfer_method: 'remote_url', url: params.imageUrl, type: 'image' }
  }
  const data = await runWorkflow('video', {
    action_type: 'submit',
    image_url: imageValue,
    product_name: params.productName,
    video_style: params.style || '简洁展示',
  })
  return (data.result && typeof data.result === 'object') ? data.result : data
}

export async function queryVideo(taskId) {
  const data = await runWorkflow('video', {
    action_type: 'query',
    task_id: taskId,
  })
  return (data.result && typeof data.result === 'object') ? data.result : data
}

// ─── Agent 6：复盘优化 ────────────────────────────────────────────
export async function reviewOptimization(params) {
  const data = await runWorkflow('review', {
    published_content: params.publishedContent,
    performance_data: params.performanceData,
    product_name: params.productName,
    diagnosis_history: params.diagnosisHistory || '',
  })
  return (data.result && typeof data.result === 'object') ? data.result : data
}

// ─── Mock 数据（未配置 API Key 时返回） ──────────────────────────
function getMockResponse(type, inputs) {
  // 根据 content_goal 生成差异化 Mock 内容
  const goalMap = {
    '种草推荐': {
      scene: '🌿 真的被种草了！\n\n朋友安利了好久，终于入手了，一用就后悔没早买！\n\n不夸张，真实体验就是这么好，评论区问我用哪款我都告诉你们～',
      feature: '🔬 测评来了！种草前先看数据！\n\n这款产品成分党可以放心，关键成分含量够，效果经得起验证。\n\n用了两周真实反馈：效果有，没夸大！',
      promo: '📣 这款真的不踩雷！\n\n种草无数商品，这是少数让我觉得"值回票价"的，性价比比想象中高！\n\n有同款的姐妹评论聊聊～',
    },
    '带货转化': {
      scene: '✨ 姐妹们！上班族的救星来了～\n\n每天通勤包里这个神器已经用了3个月了，真的太好用了！\n\n👉 早上8点出门，晚上9点到家，这一天下来就靠它撑着\n\n不用纠结要不要买，直接冲！评论区告诉我你们用了多久了～',
      feature: '⚡ 实测对比！用了这个后真的不一样！\n\n【使用前】每次都要折腾半天，效果还不稳定\n【使用后】一键搞定，效果超稳定，省时省力\n\n点击购物车，今天下单立减20元 👇',
      promo: '🔥 别犹豫了！今天最后一天活动价！\n\n原价199，今天只要99，直降100元！\n\n已经有2000+人下单，不抢就没了！\n点左下角购物车 ⬇️',
    },
    '品牌宣传': {
      scene: '💫 有些品质，值得被认真对待。\n\n不是所有产品都经得起时间考验，但这一款，用了越久越喜欢。\n\n真正好的东西，不需要夸大，它自己会说话。',
      feature: '🏆 十年工艺，只做一件事。\n\n每一个细节都经过严格品控，每一次使用都是品质承诺的体现。\n\n这就是我们对用户说的：用过就知道。',
      promo: '🌟 品牌直营，品质保障。\n\n官方渠道，正品保证，7天无理由退换。\n\n选择我们，就是选择对自己好一点。',
    },
    '活动预热': {
      scene: '⏰ 倒计时3天！姐妹们准备好了吗！\n\n这次活动是真的力度大，已经加购了，就等开抢！\n\n评论区留下你的心愿单，活动当天提醒你！',
      feature: '📅 大促预告！这几款必须提前看！\n\n活动期间直降50%，限量库存，先到先得！\n\n提前加购锁定！别到时候买不到！',
      promo: '🚀 X月X日！全年最大力度来了！\n\n所有商品直降+额外叠加优惠券，封顶优惠不设上限！\n\n先收藏本文！活动开始第一时间通知！',
    },
  }

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
    content: (() => {
      const goal = inputs.content_goal || '带货转化'
      const g = goalMap[goal] || goalMap['带货转化']
      return {
      versions: [
        {
          type: 'scene',
          label: '场景共鸣型',
          content: g.scene,
          hashtags: ['#真实好评', '#好物推荐', `#${goal}`],
        },
        {
          type: 'feature',
          label: '卖点功效型',
          content: g.feature,
          hashtags: ['#实测对比', '#好物分享', '#值得买'],
        },
        {
          type: 'promo',
          label: '转化促销型',
          content: g.promo,
          hashtags: ['#限时优惠', '#今日必买', '#超值好物'],
        },
      ],
    }
    })(),
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
