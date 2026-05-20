'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Heart } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-void grid-bg">
      <div className="max-w-3xl mx-auto px-4 py-20">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-jetbrains text-text-muted hover:text-neon-cyan transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-orbitron text-4xl font-bold mb-8"
        >
          <span className="neon-text-cyan">关于</span>
        </motion.h1>

        {/* Neon divider */}
        <div className="h-px bg-gradient-to-r from-neon-cyan/50 via-neon-pink/30 to-transparent mb-12" />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6 font-jetbrains text-text-muted leading-relaxed"
        >
          <p>
            GitHub Showcase 是一个精心策划的开源项目精选平台。我们相信优质的开源工具能够显著提升开发效率，因此致力于将真正有价值、经过社区验证的项目呈现给开发者。
          </p>

          <p>
            所有推荐项目均为真实可用的生产级工具，收录标准包括：
          </p>

          <ul className="list-none space-y-3 ml-4">
            {[
              '活跃维护（有近期更新）',
              '文档完善，易于上手',
              '社区活跃，用户基础良好',
              '功能实用，解决真实问题',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-neon-cyan">▸</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p>
            平台完全开源，欢迎贡献你的推荐项目。
          </p>
        </motion.div>

        {/* Tech stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <h2 className="font-orbitron text-lg font-bold text-text-primary mb-4">技术栈</h2>
          <div className="flex flex-wrap gap-3">
            {['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Fuse.js'].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 rounded-lg border border-neon-cyan/20 bg-neon-cyan/5 font-jetbrains text-sm text-neon-cyan"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-text-muted/10 text-center">
          <div className="flex items-center justify-center gap-2 font-jetbrains text-sm text-text-muted/50">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-neon-pink animate-pulse" />
            <span>using Next.js + Tailwind CSS</span>
          </div>
        </div>
      </div>
    </main>
  )
}
