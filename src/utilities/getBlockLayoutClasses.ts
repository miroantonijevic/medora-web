import { cn } from '@/utilities/ui'

export type BlockWidth = 'standard' | 'narrow' | 'full'
export type BlockSpacing = 'none' | 'small' | 'standard' | 'large'
export type BlockAlignment = 'left' | 'center'
export type BlockBackground = 'none' | 'light' | 'dark'

export type LayoutSettings =
  | {
      width?: BlockWidth | null
      spacing?: BlockSpacing | null
      alignment?: BlockAlignment | null
      background?: BlockBackground | null
    }
  | null
  | undefined

const spacingClasses: Record<BlockSpacing, string> = {
  none: '',
  small: 'my-6',
  standard: 'my-16',
  large: 'my-28',
}

const backgroundClasses: Record<BlockBackground, string> = {
  none: '',
  light: 'bg-gray-50 py-12',
  dark: 'bg-[#012B59] text-white py-12',
}

const alignmentClasses: Record<BlockAlignment, string> = {
  left: '',
  center: 'text-center',
}

// Spacing/background/alignment are applied by the block wrapper in RenderBlocks.
export function getWrapperClassName(layoutSettings?: LayoutSettings) {
  const spacing = layoutSettings?.spacing ?? 'standard'
  const background = layoutSettings?.background ?? 'none'
  const alignment = layoutSettings?.alignment ?? 'left'

  return cn(spacingClasses[spacing], backgroundClasses[background], alignmentClasses[alignment])
}

// Width is applied inside each block, since the "standard" max-width differs per block.
export function getWidthClassName(width: BlockWidth | null | undefined, standardClassName: string) {
  if (width === 'full') return 'w-full'
  if (width === 'narrow') return 'max-w-180 mx-auto'
  return standardClassName
}
