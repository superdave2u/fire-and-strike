import { useEffect, useState } from 'react'

const MIN_WIDTH = 280
const MAX_WIDTH = 880
const PAGE_PADDING = 48

function measure(): number {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, window.innerWidth - PAGE_PADDING))
}

export function useViewportWidth(): number {
  const [width, setWidth] = useState<number>(measure)

  useEffect(() => {
    const onResize = (): void => setWidth(measure())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return width
}