export const WELCOME_MESSAGES: readonly string[] = [
  'Welcome to TanStack Start — your new home for type-safe React.',
  'Use the theme toggle in the header to switch between light and dark.',
  'Head to the About page to see file-based route components in action.',
]

export const BANNER_DISMISSED_KEY = 'welcome-banner-dismissed'

const PERSISTED_DISMISSAL_MARKER = 'true'

/**
 * Advance to the next message index, wrapping back to 0 after the last one.
 * Non-positive or non-finite totals and invalid current indexes resolve to 0 so
 * callers never index outside the message list.
 */
export function getNextMessageIndex(current: number, total: number): number {
  if (!Number.isFinite(total) || total <= 0) {
    return 0
  }

  if (!Number.isFinite(current) || current < 0) {
    return 0
  }

  const index = Math.floor(current)

  if (index >= total - 1) {
    return 0
  }

  return index + 1
}

/**
 * Type guard for the persisted dismissal marker. Only the exact string 'true'
 * counts as dismissed; null/undefined/other strings do not.
 */
export function isPersistedDismissal(value: unknown): boolean {
  return value === PERSISTED_DISMISSAL_MARKER
}

/**
 * Read the persisted dismissal flag from an injected storage-like lookup.
 * Missing, blank, or invalid values fall back to false. Never throws, so it is
 * safe to call in SSR/private-mode where storage access can fail.
 */
export function readBannerDismissed(
  getItem: (key: string) => string | null,
): boolean {
  try {
    return isPersistedDismissal(getItem(BANNER_DISMISSED_KEY))
  } catch {
    return false
  }
}

/**
 * Persist the dismissal marker through an injected setter. Storage failures
 * (disabled cookies, private mode, SSR) are swallowed so dismissing the banner
 * never breaks the page for the current session.
 */
export function persistBannerDismissed(
  setItem: (key: string, value: string) => void,
): void {
  try {
    setItem(BANNER_DISMISSED_KEY, PERSISTED_DISMISSAL_MARKER)
  } catch {
    // Ignore storage failures; dismissal still applies for this session.
  }
}
