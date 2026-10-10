export type ThemeMode = 'light' | 'dark' | 'auto'
export type ResolvedTheme = 'light' | 'dark'

/**
 * Type guard for the three supported theme modes. Rejects anything that is not
 * exactly 'light', 'dark', or 'auto' (including null/undefined/other types).
 */
export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'auto'
}

/**
 * Resolve a mode into the concrete theme that should be painted. For 'auto' the
 * caller supplies the current `prefers-color-scheme: dark` status.
 */
export function resolveTheme(
  mode: ThemeMode,
  prefersDark: boolean,
): ResolvedTheme {
  if (mode === 'auto') {
    return prefersDark ? 'dark' : 'light'
  }
  return mode
}

/**
 * Cycle the mode in the order light -> dark -> auto -> light.
 */
export function getNextMode(mode: ThemeMode): ThemeMode {
  if (mode === 'light') {
    return 'dark'
  }
  if (mode === 'dark') {
    return 'auto'
  }
  return 'light'
}

/**
 * Read the persisted mode from a storage-like lookup. Missing or invalid values
 * fall back to 'auto'. The lookup is injected so this stays dependency-free.
 */
export function readStoredMode(
  getItem: (key: string) => string | null,
): ThemeMode {
  const stored = getItem('theme')
  return isThemeMode(stored) ? stored : 'auto'
}

/**
 * Apply a mode to a document element. Both concrete classes are cleared before
 * the resolved class is added, `data-theme` tracks explicit modes only, and
 * `colorScheme` is kept in sync so native form controls/scrollbars match.
 */
export function applyThemeToDocument(
  doc: Pick<Document, 'documentElement'>,
  mode: ThemeMode,
  prefersDark: boolean,
): void {
  const resolved = resolveTheme(mode, prefersDark)
  const root = doc.documentElement

  root.classList.remove('light', 'dark')
  root.classList.add(resolved)

  if (mode === 'auto') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', mode)
  }

  root.style.colorScheme = resolved
}
