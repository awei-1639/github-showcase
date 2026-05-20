import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'GitHub Showcase | 优秀开源项目精选',
  description: '精心筛选的优质实用 GitHub 开源项目集合',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className="antialiased">
        <div className="scanline-overlay" />
        <div className="scanline-beam" />
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  )
}
