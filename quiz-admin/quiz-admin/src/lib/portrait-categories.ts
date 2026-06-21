import { PortraitCategory } from '@prisma/client'

export const PORTRAIT_CATEGORIES: { value: PortraitCategory; label: string }[] = [
  { value: 'PENCIL_PORTRAITS', label: 'Pencil Portraits' },
  { value: 'PAINTING', label: 'Painting' },
  { value: 'OIL_ACRYLIC_PORTRAITS', label: 'Oil & Acrylic Portraits' },
]

export function categoryLabel(category: PortraitCategory) {
  return PORTRAIT_CATEGORIES.find((c) => c.value === category)?.label ?? category
}