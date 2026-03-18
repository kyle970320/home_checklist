import type { Theme } from './theme'

const THEME_STORAGE_KEY = 'theme'

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark'
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

export function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(THEME_STORAGE_KEY)
  return isTheme(raw) ? raw : null
}

export function initializeTheme() {
  if (typeof window === 'undefined') return
  applyTheme(getStoredTheme() ?? 'dark')
}

export function persistTheme(theme: Theme) {
  applyTheme(theme)
  window.localStorage.setItem(THEME_STORAGE_KEY, theme)
}
