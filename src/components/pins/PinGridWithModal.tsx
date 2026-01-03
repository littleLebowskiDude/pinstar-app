'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import MasonryGrid from './MasonryGrid'
import PinDetailModal from './PinDetailModal'
import { Pin } from '@/lib/mock-data'

interface PinGridWithModalProps {
  pins: Pin[]
}

export default function PinGridWithModal({ pins }: PinGridWithModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const pinId = searchParams.get('pin')
    if (pinId) {
      // Handle both number and string (UUID) ids
      const pin = pins.find((p) => String(p.id) === pinId)
      if (pin) {
        setSelectedPin(pin)
        setIsModalOpen(true)
      }
    } else {
      setIsModalOpen(false)
      setSelectedPin(null)
    }
  }, [searchParams, pins])

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPin(null)
  }

  return (
    <>
      <MasonryGrid pins={pins} />
      {selectedPin && (
        <PinDetailModal
          pin={selectedPin}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  )
}
