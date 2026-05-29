import { motion } from 'framer-motion'

function SectionHeader({ label, title, description, labelColor = 'text-cyan-400' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      className="text-center"
    >
      <p className={`text-xs font-semibold uppercase tracking-widest ${labelColor}`}>
        {label}
      </p>
      <h2 className="mt-4 text-balance text-3xl sm:text-4xl font-bold text-white">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-4 max-w-xl text-zinc-400 text-sm sm:text-base">
          {description}
        </p>
      )}
    </motion.div>
  )
}

export default SectionHeader
