'use client'

import { motion } from 'framer-motion'
import { Hash } from 'lucide-react'

interface Tag {
  name: string
  count: number
  color?: 'cyan' | 'pink' | 'purple'
}

interface TagCloudProps {
  tags: Tag[]
  selectedTags: string[]
  onToggleTag: (tag: string) => void
  onClearTags: () => void
}

const getColor = (tag: Tag, index: number): 'cyan' | 'pink' | 'purple' => {
  if (tag.color) return tag.color
  const colors: ('cyan' | 'pink' | 'purple')[] = ['cyan', 'pink', 'purple']
  return colors[index % 3]
}

export default function TagCloud({ tags, selectedTags, onToggleTag, onClearTags }: TagCloudProps) {
  const colorMap = {
    cyan: 'border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan/50',
    pink: 'border-neon-pink/30 text-neon-pink hover:bg-neon-pink/10 hover:border-neon-pink/50',
    purple: 'border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10 hover:border-neon-purple/50',
  }

  const activeMap = {
    cyan: 'bg-neon-cyan/20 border-neon-cyan/60 text-neon-cyan shadow-[0_0_15px_rgba(0,245,255,0.3)]',
    pink: 'bg-neon-pink/20 border-neon-pink/60 text-neon-pink shadow-[0_0_15px_rgba(255,45,106,0.3)]',
    purple: 'bg-neon-purple/20 border-neon-purple/60 text-neon-purple shadow-[0_0_15px_rgba(191,90,242,0.3)]',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap justify-center gap-3 px-4 py-6"
    >
      {/* All button */}
      <motion.button
        onClick={onClearTags}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-full border font-jetbrains text-sm
          transition-all duration-300
          ${selectedTags.length === 0
            ? 'bg-neon-cyan/20 border-neon-cyan/60 text-neon-cyan shadow-[0_0_15px_rgba(0,245,255,0.3)]'
            : 'border-text-muted/20 text-text-muted hover:border-neon-cyan/30 hover:text-neon-cyan/80'
          }
        `}
      >
        <Hash className="w-3.5 h-3.5" />
        全部
      </motion.button>

      {tags.map((tag, index) => (
        <motion.button
          key={tag.name}
          onClick={() => onToggleTag(tag.name)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-full border font-jetbrains text-sm
            transition-all duration-300
            ${selectedTags.includes(tag.name)
              ? activeMap[getColor(tag, index)]
              : colorMap[getColor(tag, index)]
            }
          `}
        >
          <Hash className="w-3.5 h-3.5" />
          {tag.name}
          <span className="text-xs opacity-60">{tag.count}</span>
        </motion.button>
      ))}
    </motion.div>
  )
}
