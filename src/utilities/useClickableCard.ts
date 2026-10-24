'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

type UseClickableCardType<T extends HTMLElement> = {
  card: {
    attach: (node: T | null) => void
  }
  link: {
    attach: (node: HTMLAnchorElement | null) => void
  }
}

interface Props {
  external?: boolean
  newTab?: boolean
  scroll?: boolean
}

// The nodes are kept in state through callback refs so the listeners are attached
// once the card is actually mounted, and no ref object is read during render.
function useClickableCard<T extends HTMLElement>({
  external = false,
  newTab = false,
  scroll = true,
}: Props): UseClickableCardType<T> {
  const router = useRouter()
  const [cardNode, setCardNode] = useState<T | null>(null)
  const [linkNode, setLinkNode] = useState<HTMLAnchorElement | null>(null)
  const timeDown = useRef<number>(0)
  const hasActiveParent = useRef<boolean>(false)
  const pressedButton = useRef<number>(0)

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.target) {
      const target = e.target as Element

      const timeNow = +new Date()
      const parent = target?.closest('a')

      pressedButton.current = e.button

      if (!parent) {
        hasActiveParent.current = false
        timeDown.current = timeNow
      } else {
        hasActiveParent.current = true
      }
    }
  }, [])

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (linkNode?.href) {
        const timeNow = +new Date()
        const difference = timeNow - timeDown.current

        if (difference <= 250) {
          if (!hasActiveParent.current && pressedButton.current === 0 && !e.ctrlKey) {
            if (external) {
              const target = newTab ? '_blank' : '_self'
              window.open(linkNode.href, target)
            } else {
              router.push(linkNode.href, { scroll })
            }
          }
        }
      }
    },
    [linkNode, external, newTab, router, scroll],
  )

  useEffect(() => {
    if (!cardNode) return

    const abortController = new AbortController()
    cardNode.addEventListener('mousedown', handleMouseDown, { signal: abortController.signal })
    cardNode.addEventListener('mouseup', handleMouseUp, { signal: abortController.signal })

    return () => {
      abortController.abort()
    }
  }, [cardNode, handleMouseDown, handleMouseUp])

  return {
    card: {
      attach: setCardNode,
    },
    link: {
      attach: setLinkNode,
    },
  }
}

export default useClickableCard
