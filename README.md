# 电商 AIGC 内容经营助手

> 面向中小商家/达人的任务式 AI 内容工作流产品

[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-purple)](https://vitejs.dev)
[![Dify](https://img.shields.io/badge/Dify-Agent-orange)](https://dify.ai)
[![Claude](https://img.shields.io/badge/Claude-Sonnet_4.6-green)](https://anthropic.com)

---

## 功能模块

| 模块 | 功能说明 | AI 技术 | 优先级 |
|------|----------|---------|--------|
| 🔍 商品理解 | 提炼卖点、分析内容方向 | Claude LLM | P0 |
| ✍️ 内容生成 | 3个差异化版本文案/脚本 | Claude LLM × 3 Prompts | P0 |
| 🖼️ 图片优化 | 诊断问题 + 生成候选图 | Claude Vision + 通义万象 | P0 |
| 🩺 内容诊断 | 5维度评分 + 优化建议 | Claude LLM | P0 |
| 🎬 视频候选 | 5秒商品展示视频生成 | 可灵 AI（异步） | NEW |
| 📊 复盘优化 | 总结规律 + 指导下一条 | Claude LLM | P1 |

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 填入你的 Dify API Keys
```

### 3. 本地开发

```bash
npm run dev
# 访问 http://localhost:3000
```

> **注意**：未配置 API Key 时，自动使用 Mock 数据，可完整体验所有功能界面。

### 4. 生产构建

```bash
npm run build
```

---

## Dify 工作流配置

详见 [docs/dify-workflow-config.md](./docs/dify-workflow-config.md)

包含：
- 6 个 Agent 工作流的完整配置
- 所有 System Prompt 原文
- HTTP 节点（图像/视频 API）配置
- 前端对接方式

---

## 技术架构

```
手机 H5（React + Vite + Tailwind）
         ↓ HTTPS
    Dify Agent 框架
         ↓ 调用
┌─────────────────────────┐
│ Claude API (LLM+Vision) │ ← 语言/视觉理解
│ 通义万象 API (图像生成)  │ ← 候选图生成
│ 可灵 AI API (视频生成)  │ ← 5秒展示视频
└─────────────────────────┘
```

## 技术选型说明

详见 [docs/tech-summary.md](./docs/tech-summary.md)

包含：
- 为什么选 Dify（对比 Coze / n8n / 纯代码）
- 为什么选 Claude（对比 GPT-4o / 通义 / 文心）
- 完整 AI 技术栈拆解
- 面试高频 Q&A

---

## 部署到 Vercel

1. Fork 本仓库
2. 在 [vercel.com](https://vercel.com) 导入项目
3. 在 Settings → Environment Variables 填写所有 `VITE_DIFY_KEY_*`
4. 部署完成后，手机访问即可添加到主屏幕使用
5. https://aigc-demo-three.vercel.app

---

## 成本

| 服务 | 免费额度 |
|------|----------|
| Dify 云端 | 200次/月 |
| 通义万象 | 500张/月 |
| Vercel | 个人项目免费 |
| **合计** | **0成本可完整体验** |

---

## 技术文档索引

- [Dify 工作流配置指南](./docs/dify-workflow-config.md)
- [AI 技术总结与面试准备](./docs/tech-summary.md)
