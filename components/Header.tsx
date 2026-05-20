'use client'

import { Github, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 glass border-b border-border-light">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-lg shadow-accent/20">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-primary tracking-tight">GitHub Showcase</span>
            <div className="text-xs text-muted -mt-0.5">优秀开源项目精选</div>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-secondary hover:text-primary hover:bg-elevated transition-all"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            关于
          </Link>
        </nav>
      </div>
    </header>
  )
}
