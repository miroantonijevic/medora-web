import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'

type LexicalData = Parameters<typeof LexicalRichText>[0]['data']

interface Props {
  /** Lexical JSON content (Payload `data` convention — used by all scaffold blocks) */
  data?: LexicalData | null
  /** Alias for `data` — used by Medora-specific page components */
  content?: LexicalData | null
  className?: string
  /** When false, removes the max-width gutter wrapper (matches old scaffold API) */
  enableGutter?: boolean
  /** Kept for backward compatibility with scaffold blocks that pass this prop */
  enableProse?: boolean
}

function RichTextComponent({ data, content, className, enableGutter = true, enableProse: _enableProse }: Props) {
  const source = data ?? content
  if (!source) return null

  return (
    <div
      className={className}
      style={{
        lineHeight: 1.75,
        color: '#333',
        fontSize: 15,
        maxWidth: enableGutter ? '72ch' : undefined,
      }}
    >
      <LexicalRichText data={source} />
    </div>
  )
}

export { RichTextComponent as RichText }
export default RichTextComponent
