# Dify 工作流配置完整指南

> 电商 AIGC 内容经营助手 · Dify Agent 配置文档
> 版本：v1.0 · 日期：2026-03-13

---

## 一、Dify 平台准备

### 1.1 注册 / 部署

**方式 A：云端版（推荐新手）**
1. 访问 https://cloud.dify.ai 注册账号
2. 免费版每月含 200 次 Claude 调用额度
3. 直接在工作空间创建应用，无需部署

**方式 B：本地 Docker 部署**
```bash
git clone https://github.com/langgenius/dify.git
cd dify/docker
cp .env.example .env
docker compose up -d
# 浏览器访问 http://localhost/install 完成初始化
```

### 1.2 配置模型 API Key

在 Dify 后台 → 设置 → 模型供应商 中添加：

| 供应商 | 用途 | 获取地址 |
|--------|------|----------|
| Anthropic (Claude) | 所有 LLM 节点 | https://console.anthropic.com |
| 阿里云 DashScope | 图像生成 | 阿里云控制台 → 模型服务灵积 |
| 快手可灵 (Kling) | 视频生成 | https://klingai.kuaishou.com |

推荐模型：`claude-sonnet-4-6`（性价比最优）或 `claude-opus-4-6`（质量最高）

---

## 二、6 个工作流配置详情

### Agent 1：商品理解工作流

**应用类型**：Workflow（工作流应用）

**输入变量配置**：

| 变量名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| product_name | String | ✅ | 商品名称 |
| product_category | String | ✅ | 品类（服装/食品/数码等） |
| product_features | String | ✅ | 用户填写的核心卖点 |
| target_audience | String | ❌ | 目标人群描述 |
| price_range | String | ❌ | 价格带 |
| usage_scenario | String | ❌ | 使用场景 |

**工作流节点**：

```
[开始] → [LLM 节点：商品卖点分析] → [代码节点：格式化输出] → [结束]
```

**LLM 节点配置**：
- 模型：claude-sonnet-4-6
- 温度：0.7
- 最大 Token：1000

**System Prompt**：
```
你是一位有 10 年经验的电商内容策划专家，精通抖音、小红书、淘宝等平台的内容运营规律，
擅长提炼商品核心卖点并制定差异化内容方向。

请根据用户提供的商品信息，完成以下分析并严格按照 JSON 格式输出，
不要有任何额外文字、Markdown 代码块或解释：

{
  "core_value": "商品核心价值主张（一句话，20字以内）",
  "key_selling_points": ["卖点1", "卖点2", "卖点3"],
  "content_angles": [
    {"angle": "场景共鸣型", "description": "针对目标人群的情感触发点和场景描述"},
    {"angle": "功效展示型", "description": "产品核心效果和使用前后对比方向"},
    {"angle": "促销转化型", "description": "价格优势、促销信息和紧迫感营造方向"}
  ],
  "suggested_style": "建议内容表达风格（例：接地气真实感、专业测评风等）",
  "avoid": ["需要避免的表达1（如极限词）", "需要避免的表达2（如虚假宣传）"]
}
```

**User Prompt 模板**：
```
商品名称：{{product_name}}
品类：{{product_category}}
核心卖点：{{product_features}}
目标人群：{{target_audience}}
价格带：{{price_range}}
使用场景：{{usage_scenario}}

请帮我分析这个商品的内容方向。
```

**代码节点**（格式化/验证 JSON）：
```python
import json

def main(llm_output: str) -> dict:
    try:
        result = json.loads(llm_output.strip())
        return {"result": json.dumps(result, ensure_ascii=False)}
    except:
        return {"result": llm_output}
```

---

### Agent 2：内容生成工作流

**应用类型**：Workflow

**输入变量**：

| 变量名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| product_analysis | String | ✅ | 商品理解结果（JSON 字符串） |
| content_goal | String | ✅ | 内容目标（种草/带货/宣传/预热） |
| content_type | String | ✅ | 内容形式（图文文案/短视频脚本/直播话术） |
| style_preference | String | ❌ | 风格偏好 |

**工作流节点**：

```
[开始]
  ↓
[LLM节点A：场景共鸣型内容]
[LLM节点B：卖点功效型内容]  ← 三个并行节点
[LLM节点C：转化促销型内容]
  ↓
[代码节点：合并三版本为 JSON]
  ↓
[结束]
```

**LLM 节点 A（场景共鸣型）System Prompt**：
```
你是一位擅长生活化叙事的带货达人，风格真实接地气，善于通过日常场景引发目标用户共鸣。

请根据商品信息，生成一条【场景共鸣型】带货内容。要求：
1. 开头用场景或痛点抓住注意力（不超过 15 字）
2. 中间通过真实使用场景展示商品价值
3. 结尾有自然的互动引导
4. 整体 150-200 字
5. 附 3 个相关话题标签

输出格式（严格 JSON，不加任何额外文字）：
{
  "type": "scene",
  "label": "场景共鸣型",
  "content": "完整文案内容",
  "hashtags": ["#标签1", "#标签2", "#标签3"]
}
```

**LLM 节点 B（卖点功效型）System Prompt**：
```
你是一位专业的产品测评博主，风格客观专业，善于用数据和对比展示产品核心价值。

请根据商品信息，生成一条【卖点功效型】带货内容。要求：
1. 开头直接点出核心效果或使用前后对比
2. 中间用数字、对比或具体细节支撑卖点
3. 结尾有明确购买引导
4. 整体 150-200 字
5. 附 3 个相关话题标签

输出格式（严格 JSON，不加任何额外文字）：
{
  "type": "feature",
  "label": "卖点功效型",
  "content": "完整文案内容",
  "hashtags": ["#标签1", "#标签2", "#标签3"]
}
```

**LLM 节点 C（转化促销型）System Prompt**：
```
你是一位经验丰富的电商运营，擅长用价格锚点、稀缺感和行动指令快速促成购买决策。

请根据商品信息，生成一条【转化促销型】带货内容。要求：
1. 开头制造紧迫感或价格惊喜
2. 中间快速列出核心卖点（3 点以内）
3. 结尾有强力行动指令（点购物车/抢购等）
4. 整体 120-150 字
5. 附 3 个相关话题标签

输出格式（严格 JSON，不加任何额外文字）：
{
  "type": "promo",
  "label": "转化促销型",
  "content": "完整文案内容",
  "hashtags": ["#标签1", "#标签2", "#标签3"]
}
```

**代码节点（合并三版本）**：
```python
import json

def main(version_a: str, version_b: str, version_c: str) -> dict:
    versions = []
    for v in [version_a, version_b, version_c]:
        try:
            versions.append(json.loads(v.strip()))
        except:
            versions.append({"type": "unknown", "label": "版本", "content": v, "hashtags": []})

    result = {"versions": versions}
    return {"result": json.dumps(result, ensure_ascii=False)}
```

---

### Agent 3：图片优化工作流

**应用类型**：Workflow

**输入变量**：

| 变量名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| image_url | String | ✅ | 商品图片 URL |
| product_name | String | ❌ | 商品名称 |
| style_preference | String | ✅ | 风格偏好 |
| image_purpose | String | ✅ | 图片用途 |

**工作流节点**：

```
[开始]
  ↓
[LLM Vision节点：图片诊断分析]
  ↓
[HTTP请求节点A：调用通义万象生成候选图1]
[HTTP请求节点B：调用通义万象生成候选图2]  ← 并行
[HTTP请求节点C：调用通义万象生成候选图3]
  ↓
[代码节点：合并诊断 + 候选图结果]
  ↓
[结束]
```

**LLM Vision 节点配置**：
- 模型：claude-sonnet-4-6（支持 Vision）
- 输入：图片 URL + 文字提示

**Vision System Prompt**：
```
你是专注于电商视觉优化的专家顾问，擅长从平台首屏吸引力、商品主体突出度、
背景干净度、光线质量等维度诊断商品图片问题。

请分析用户提供的商品图片，严格按照以下 JSON 格式输出诊断结果，
不要有任何额外文字：

{
  "score": 5,
  "issues": [
    {"priority": "high", "tag": "问题标签", "detail": "具体说明（20字以内）"}
  ],
  "suggestions": [
    {"for_issue": "对应问题标签", "suggestion": "具体优化建议"}
  ],
  "image_prompt": "用于生成优化版商品图的英文提示词，包含：商品名称 + 白色纯净背景/指定场景 + 专业摄影风格 + 高清细节"
}

评分标准：
- 10分：完美，直接可用
- 7-9分：良好，小改即可
- 4-6分：中等，需要优化
- 1-3分：差，需要重拍或大改
```

**HTTP 请求节点（通义万象图像生成）**：
```
URL: https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis
Method: POST
Headers:
  Authorization: Bearer {{DASHSCOPE_API_KEY}}
  Content-Type: application/json
  X-DashScope-Async: disable

Body:
{
  "model": "wanx-v1",
  "input": {
    "prompt": "{{image_prompt}} style: {{style_preference}}, commercial product photography, 4K quality",
    "negative_prompt": "blurry, low quality, watermark, text overlay",
    "ref_mode": "repaint"
  },
  "parameters": {
    "style": "<auto>",
    "size": "1024*1024",
    "n": 1
  }
}
```

---

### Agent 4：内容诊断工作流

**应用类型**：Chatflow（支持多轮对话追问）

**输入变量**：

| 变量名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| content_text | String | ✅ | 待诊断的文案内容 |
| platform | String | ✅ | 发布平台 |
| product_name | String | ❌ | 商品名称 |
| performance_data | String | ❌ | 数据表现（播放/点赞/转化） |

**System Prompt**：
```
你是专注于抖音电商内容优化的资深顾问，拥有对平台算法、用户心理和内容转化规律的深度理解。

诊断维度（每项满分 10 分）：
1. hook（首屏钩子）：前 3 秒/开头两句能否留住用户
2. selling_point（卖点表达）：核心价值是否清晰、靠前、有说服力
3. emotion（情感共鸣）：是否触发目标用户情感共鸣
4. conversion（转化引导）：是否有明确行动指令引导购买
5. compliance（平台规范）：是否有违禁词、极限词等合规风险

请分析用户提供的内容，严格按照以下 JSON 格式输出，不要有任何额外文字或 Markdown：

{
  "overall_score": 7,
  "dimension_scores": {
    "hook": 8,
    "selling_point": 6,
    "emotion": 7,
    "conversion": 5,
    "compliance": 9
  },
  "issues": [
    {
      "priority": "high",
      "dimension": "conversion",
      "tag": "缺少行动指令",
      "detail": "文案结尾没有引导用户点击购物车或评论"
    }
  ],
  "suggestions": [
    {
      "for_issue": "缺少行动指令",
      "rewrite": "建议结尾改为：点击左下角购物车，今天下单包邮送礼袋～"
    }
  ]
}
```

---

### Agent 5：视频候选生成工作流

**应用类型**：Workflow（异步任务）

**输入变量**：

| 变量名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| image_url | String | ✅ | 商品图片 URL |
| product_name | String | ❌ | 商品名称 |
| video_style | String | ✅ | 视频风格 |

**工作流节点**：

```
[开始]
  ↓
[HTTP请求节点：调用可灵 API 提交视频生成任务]
  ↓
[代码节点：格式化返回 task_id 和状态]
  ↓
[结束]
```

**HTTP 请求节点（可灵 API）**：
```
URL: https://klingai.kuaishou.com/api/v1/videos/image2video
Method: POST
Headers:
  Authorization: Bearer {{KLING_API_KEY}}
  Content-Type: application/json

Body:
{
  "model": "kling-v1",
  "image_url": "{{image_url}}",
  "prompt": "{{product_name}} product showcase, {{video_style}} style, 5 seconds, smooth motion, commercial quality",
  "duration": "5",
  "aspect_ratio": "9:16"
}
```

**代码节点（处理异步响应）**：
```python
import json

def main(api_response: str) -> dict:
    try:
        data = json.loads(api_response)
        task_id = data.get("data", {}).get("task_id", "unknown")
        return {
            "result": json.dumps({
                "status": "pending",
                "task_id": task_id,
                "message": "视频生成中，约需 2-3 分钟，请稍候...",
                "estimated_time": 120,
                "preview_info": {
                    "style": "简洁展示",
                    "duration": "5秒",
                    "format": "MP4",
                    "resolution": "1080x1920"
                }
            }, ensure_ascii=False)
        }
    except:
        return {"result": api_response}
```

---

### Agent 6：复盘优化工作流

**应用类型**：Workflow

**输入变量**：

| 变量名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| published_content | String | ✅ | 已发布的内容文本 |
| performance_data | String | ❌ | 数据指标 |
| product_name | String | ❌ | 商品名称 |
| diagnosis_history | String | ❌ | 历史诊断记录 |

**System Prompt**：
```
你是电商内容经营教练，擅长根据历史内容和数据表现总结规律，并给出可立即执行的优化建议。

请分析用户提供的内容和数据，输出复盘报告。严格按照以下 JSON 格式输出，不要有任何额外文字：

{
  "performance_analysis": "数据表现综合分析（3-5句话）",
  "strengths": [
    "做得好的地方1（具体、可复用）",
    "做得好的地方2"
  ],
  "weaknesses": [
    "需要改进的地方1（具体问题）",
    "需要改进的地方2"
  ],
  "next_suggestions": [
    {
      "action": "具体可执行的改进动作",
      "reason": "为什么这样改",
      "priority": "high"
    },
    {
      "action": "第二条建议",
      "reason": "原因",
      "priority": "medium"
    }
  ]
}
```

---

## 三、前端对接配置

### 3.1 获取 API 信息

每个工作流创建完成后，在 Dify 后台：
1. 进入应用 → 左侧菜单「访问 API」
2. 复制 API URL 和 API Key

### 3.2 前端环境变量（.env）

```bash
VITE_DIFY_BASE_URL=https://api.dify.ai/v1
VITE_DIFY_KEY_PRODUCT=app-xxxxxxxxxxxxxxxx
VITE_DIFY_KEY_CONTENT=app-xxxxxxxxxxxxxxxx
VITE_DIFY_KEY_IMAGE=app-xxxxxxxxxxxxxxxx
VITE_DIFY_KEY_DIAGNOSE=app-xxxxxxxxxxxxxxxx
VITE_DIFY_KEY_VIDEO=app-xxxxxxxxxxxxxxxx
VITE_DIFY_KEY_REVIEW=app-xxxxxxxxxxxxxxxx
```

### 3.3 API 调用格式

所有工作流均使用 Blocking 模式（同步等待结果）：

```javascript
POST {DIFY_BASE_URL}/workflows/run
Authorization: Bearer {API_KEY}
Content-Type: application/json

{
  "inputs": {
    "product_name": "便携式榨汁杯",
    // ... 其他输入变量
  },
  "response_mode": "blocking",
  "user": "user-123"
}
```

---

## 四、部署上线步骤

### Step 1：Dify 配置（约 1-2 小时）
1. 注册 Dify 云端账号
2. 配置 Claude API Key
3. 按顺序创建 6 个工作流（建议先测试 Agent 1）
4. 记录每个工作流的 API Key

### Step 2：前端配置（约 30 分钟）
```bash
# 克隆项目
git clone https://github.com/yunacong/-AIGC-.git
cd -AIGC-

# 安装依赖
npm install

# 配置 API Key
cp .env.example .env
# 编辑 .env 填入实际的 Dify API Keys

# 本地测试
npm run dev
```

### Step 3：Vercel 部署（约 15 分钟）
1. 在 https://vercel.com 导入 GitHub 仓库
2. 在 Vercel 后台 Settings → Environment Variables 填写所有 `VITE_DIFY_KEY_*` 变量
3. 重新部署，获取 https://xxx.vercel.app 访问链接
4. 手机浏览器访问，点「添加到主屏幕」即可像 App 一样使用

---

## 五、成本估算

| 服务 | 免费额度 | 超出费用 | 备注 |
|------|----------|----------|------|
| Dify 云端 | 200次/月 Claude调用 | 专业版 $59/月 | 建议 MVP 阶段用免费版 |
| Claude API | 按 Token 计费 | Sonnet约$0.003/1K tokens | 每次对话约¥0.02 |
| 通义万象 | 500张/月 | ¥0.04/张 | 图像生成 |
| 可灵 AI | 赠送积分 | 按次计费 | 视频生成 |
| Vercel | 个人项目免费 | - | 前端托管 |
| **合计** | **0成本可跑通** | **高频约¥50-200/月** | |

---

## 六、常见问题

**Q：如何在不配置 API Key 的情况下演示？**
A：项目内置了 Mock 数据，所有功能在未配置 Key 时自动返回模拟数据，可完整演示界面和交互流程。

**Q：视频生成为什么是异步的？**
A：视频生成通常需要 30 秒到 3 分钟，不适合同步等待。生产环境需实现轮询机制：提交任务 → 每隔 10 秒查询状态 → 完成后展示。

**Q：如何替换图像生成服务？**
A：在 Dify 工作流中找到 HTTP 请求节点，将 URL 和参数格式替换为目标 API 规格即可。支持 DALL-E 3、Stable Diffusion API 等任何图像生成服务。

**Q：如何提升内容生成质量？**
A：主要通过优化 System Prompt 实现。建议：① 增加示例（Few-shot）② 针对特定品类定制角色描述 ③ 在 Prompt 中加入平台爆款规律。
