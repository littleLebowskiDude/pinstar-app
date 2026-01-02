'use client'

import { trpc } from '@/lib/trpc/client'
import PinGridWithModal from './PinGridWithModal'
import { MasonryGridSkeleton } from '@/components/ui/Skeleton'
import { NoPinsEmptyState } from '@/components/ui/EmptyState'

export default function PinFeed() {
  const { data: pins = [], isLoading } = trpc.pins.getAll.useQuery({ limit: 50 })

  if (isLoading) {
    return <MasonryGridSkeleton count={12} />
  }

  if (pins.length === 0) {
    return <NoPinsEmptyState />
  }

  // Transform pins to match the Pin interface
  const transformedPins = pins.map((pin: any) => ({
    id: parseInt(pin.id) || 0, // Convert UUID to number for compatibility
    title: pin.title,
    description: pin.description,
    imageUrl: pin.image_url,
    width: pin.image_width,
    height: pin.image_height,
    userId: pin.created_by,
    sourceUrl: pin.source_url,
    source: pin.source,
    attribution: pin.attribution,
    createdAt: new Date(pin.created_at),
  }))

  return <PinGridWithModal pins={transformedPins} />
}
