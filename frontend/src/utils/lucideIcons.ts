import React from 'react'

export const initializeLucideIcons = () => Promise.resolve()

export const useLucideIcons = () => {
  React.useEffect(() => {
    initializeLucideIcons()
  }, [])
}
