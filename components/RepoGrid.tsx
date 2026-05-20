'use client'

import { motion } from 'framer-motion'
import RepoCard, { Repo } from './RepoCard'

interface RepoGridProps {
  repos: Repo[]
  onCardClick: (repo: Repo) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
}

export default function RepoGrid({ repos, onCardClick }: RepoGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {repos.map((repo, index) => (
        <motion.div key={repo.id} variants={itemVariants}>
          <RepoCard repo={repo} onClick={() => onCardClick(repo)} index={index} />
        </motion.div>
      ))}
    </motion.div>
  )
}
