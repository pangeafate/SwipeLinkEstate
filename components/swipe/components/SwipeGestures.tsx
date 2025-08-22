'use client'

import React from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import PropertySwipeCard from './PropertySwipeCard'
import type { PropertyCardData } from '../types'

interface SwipeGesturesProps {
  property: PropertyCardData
  onDragEnd: (info: any) => void
  isProcessing: boolean
  showBadges?: boolean
}

export default function SwipeGestures({
  property,
  onDragEnd,
  isProcessing,
  showBadges = true
}: SwipeGesturesProps) {
  // Motion values for smooth drag
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotation = useTransform(x, [-300, 0, 300], [-12, 0, 12])
  const likeOpacity = useTransform(x, [0, 150], [0, 1])
  const nopeOpacity = useTransform(x, [-150, 0], [1, 0])

  return (
    <motion.div
      className="absolute inset-0"
      style={{ x, y, rotate: rotation }}
      drag={!isProcessing}
      dragElastic={0.15}
      dragConstraints={{}}
      onDragEnd={(_, info) => onDragEnd(info)}
      whileDrag={{ cursor: 'grabbing' }}
    >
      <PropertySwipeCard property={property} />

      {/* LIKE/NOPE badges */}
      {showBadges && (
        <>
          <motion.div
            className="absolute top-8 right-8 bg-green-500 text-white font-bold text-2xl px-4 py-2 rounded-lg transform rotate-12"
            style={{ opacity: likeOpacity }}
          >
            LIKE
          </motion.div>

          <motion.div
            className="absolute top-8 left-8 bg-red-500 text-white font-bold text-2xl px-4 py-2 rounded-lg transform -rotate-12"
            style={{ opacity: nopeOpacity }}
          >
            NOPE
          </motion.div>
        </>
      )}
    </motion.div>
  )
}