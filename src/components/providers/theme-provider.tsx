import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'
type Layout = 'web' | 'dashboard'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  layout?: Layout
}

interface ThemeProviderState {
  theme: Theme
  layout: Layout
  setTheme: (theme: Theme) => void
  setLayout: (layout: Layout) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  layout: 'web',
  setTheme: () => null,
  setLayout: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  layout = 'web',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  const [currentLayout, setCurrentLayout] = useState<Layout>(layout)

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    
    // 기존 레이아웃 클래스 제거
    root.classList.remove('web-theme', 'dashboard-theme')
    
    // 새 레이아웃 테마 적용
    if (currentLayout === 'web') {
      root.classList.add('web-theme')
    } else if (currentLayout === 'dashboard') {
      root.classList.add('dashboard-theme')
    }
  }, [currentLayout])

  const value = {
    theme,
    layout: currentLayout,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    setLayout: (layout: Layout) => {
      setCurrentLayout(layout)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
} 