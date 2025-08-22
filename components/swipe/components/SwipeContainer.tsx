'use client'

import React from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import PropertySwipeCard from './PropertySwipeCard'
import type { PropertyCardData } from '../types'

interface SwipeContainerProps {
  visibleCards: PropertyCardData[]
  currentIndex: number
  isProcessing: boolean
  onDragEnd: (info: any) => void
}

const ROTATION_RANGE = 12 // degrees

export default function SwipeContainer({
  visibleCards,
  currentIndex,
  isProcessing,
  onDragEnd
}: SwipeContainerProps) {
  // Motion values for the top card
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  // Derived values for effects
  const rotation = useTransform(x, [-300, 0, 300], [-ROTATION_RANGE, 0, ROTATION_RANGE])
  const likeOpacity = useTransform(x, [0, 150], [0, 1])
  const nopeOpacity = useTransform(x, [-150, 0], [1, 0])

  return (
    <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="relative w-full max-w-sm h-96">
        <AnimatePresence>
          {visibleCards.map((property, index) => (
            <motion.div
              key={property.id}
              className="absolute inset-0"
              data-testid="tinder-card"
              style={{
                zIndex: visibleCards.length - index,
                // Only top card gets motion values
                x: index === 0 ? x : 0,
                y: index === 0 ? y : 0,
                rotate: index === 0 ? rotation : 0
              }}
              initial={{ scale: 0.95, y: 10 * index }}
              animate={{ 
                scale: 1 - (index * 0.05), // Subtle scaling for stack effect
                y: index * 4 // Slight vertical offset
              }}
              exit={{
                x: 0,
                y: 0,
                rotate: 0,
                opacity: 0,
                transition: { duration: 0.15 }
              }}
              drag={index === 0 && !isProcessing}
              dragElastic={0.15}
              dragConstraints={{}}
              onDragEnd={index === 0 ? (_, info) => onDragEnd(info) : undefined}
              whileDrag={index === 0 ? { cursor: 'grabbing' } : undefined}
            >
              <PropertySwipeCard property={property} />

              {/* LIKE/NOPE badges - only on top card */}
              {index === 0 && (
                <>
                  {/* LIKE badge */}
                  <motion.div
                    className="absolute top-8 right-8 bg-green-500 text-white font-bold text-2xl px-4 py-2 rounded-lg transform rotate-12"
                    style={{ opacity: likeOpacity }}
                  >
                    LIKE
                  </motion.div>

                  {/* NOPE badge */}
                  <motion.div
                    className="absolute top-8 left-8 bg-red-500 text-white font-bold text-2xl px-4 py-2 rounded-lg transform -rotate-12"
                    style={{ opacity: nopeOpacity }}
                  >
                    NOPE
                  </motion.div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center z-50" role="status">
            <div className="bg-white rounded-full p-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}