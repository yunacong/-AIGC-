import React from 'react'
import { useNavigate } from 'react-router-dom'

const TASKS = [
  {
    id: 'product',
    path: '/product',
    emoji: '🔍',
    title: '商品理解',
    subtitle: '提炼卖点 · 明确内容方向',
    desc: '输入商品信息，AI 帮你分析核心卖点和内容策略',
    color: 'from-orange-400 to-amber-300',
    bg: 'bg-orange-50',
    badge: 'P0',
  },
  {
    id: 'content',
    path: '/content',
    emoji: '✍️',
    title: '内容生成',
    subtitle: '文案 · 脚本 · 话术',
    desc: '一键生成 3 个差异化版本带货文案，选你最想要的',
    color: 'from-blue-400 to-cyan-300',
    bg: 'bg-blue-50',
    badge: 'P0',
  },
  {
    id: 'image',
    path: '/image',
    emoji: '🖼️',
    title: '图片优化',
    subtitle: '诊断问题 · 生成候选图',
    desc: '上传商品图，AI 诊断问题并生成 3 张风格化候选图',
    color: 'from-purple-400 to-pink-300',
    bg: 'bg-purple-50',
    badge: 'P0',
  },
  {
    id: 'diagnose',
    path: '/diagnose',
    emoji: '🩺',
    title: '内容诊断',
    subtitle: '找问题 · 给建议',
    desc: '粘贴你的文案，AI 帮你找出问题并给出优化建议',
    color: 'from-green-400 to-teal-300',
    bg: 'bg-green-50',
    badge: 'P0',
  },
  {
    id: 'video',
    path: '/video',
    emoji: '🎬',
    title: '视频候选',
    subtitle: '5秒展示视频生成',
    desc: '基于商品图生成 5 秒电商展示候选视频，轻量素材',
    color: 'from-red-400 to-orange-300',
    bg: 'bg-red-50',
    badge: 'NEW',
  },
  {
    id: 'review',
    path: '/review',
    emoji: '📊',
    title: '复盘优化',
    subtitle: '总结规律 · 指导下一条',
    desc: '基于历史内容数据，AI 帮你总结高频问题和优化方向',
    color: 'from-indigo-400 to-violet-300',
    bg: 'bg-indigo-50',
    badge: 'P1',
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🛍️</span>
          <h1 className="text-xl font-bold text-gray-900">AIGC 内容经营助手</h1>
        </div>
        <p className="text-sm text-gray-500 ml-9">面向中小商家/达人的 AI 内容工作流</p>

        {/* Status bar */}
        <div className="mt-4 flex items-center gap-2 bg-orange-50 rounded-xl px-3 py-2.5">
          <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" style={{ animation: 'pulse 2s infinite' }} />
          <p className="text-xs text-orange-700">
            Demo 模式已就绪 · 配置 Dify API Key 后即可真实调用 AI
          </p>
        </div>
      </div>

      {/* Task cards */}
      <div className="px-4 py-4 space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">选择你当前要完成的任务</p>
        {TASKS.map(task => (
          <button
            key={task.id}
            onClick={() => navigate(task.path)}
            className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left
                       active:scale-98 transition-all duration-150 hover:shadow-md hover:border-gray-200"
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-xl ${task.bg} flex items-center justify-center text-2xl shrink-0`}>
                {task.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-gray-900 text-base">{task.title}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium
                    ${task.badge === 'P0' ? 'bg-orange-100 text-orange-600' :
                      task.badge === 'NEW' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-500'}`}>
                    {task.badge}
                  </span>
                </div>
                <p className="text-xs text-orange-500 font-medium mb-1">{task.subtitle}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{task.desc}</p>
              </div>
              <svg className="w-4 h-4 text-gray-300 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-6 text-center">
        <p className="text-xs text-gray-300">Powered by Claude · Dify · 通义万象 · 可灵 AI</p>
      </div>
    </div>
  )
}
