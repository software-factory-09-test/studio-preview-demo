import { useEffect, useState } from 'react'
import {
  WELCOME_MESSAGES,
  getNextMessageIndex,
  persistBannerDismissed,
  readBannerDismissed,
} from './notificationBanner'

const MESSAGE_ROTATION_MS = 6000
const EXIT_ANIMATION_MS = 320

function getInitialDismissed(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return readBannerDismissed((key) => window.localStorage.getItem(key))
}

export default function NotificationBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [dismissing, setDismissing] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    setDismissed(getInitialDismissed())
  }, [])

  useEffect(() => {
    if (dismissed) {
      return
    }

    const timer = window.setInterval(() => {
      setMessageIndex((current) =>
        getNextMessageIndex(current, WELCOME_MESSAGES.length),
      )
    }, MESSAGE_ROTATION_MS)

    return () => {
      window.clearInterval(timer)
    }
  }, [dismissed])

  useEffect(() => {
    if (!dismissing) {
      return
    }

    const timer = window.setTimeout(() => {
      setDismissed(true)
    }, EXIT_ANIMATION_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [dismissing])

  if (dismissed) {
    return null
  }

  function dismiss() {
    persistBannerDismissed((key, value) =>
      window.localStorage.setItem(key, value),
    )
    setDismissing(true)
  }

  const message = WELCOME_MESSAGES[messageIndex] ?? WELCOME_MESSAGES[0]

  return (
    <aside
      role="status"
      aria-live="polite"
      data-testid="notification-banner"
      className={`${
        dismissing ? 'banner-out' : 'banner-in'
      } flex flex-col gap-2 border-b border-[var(--line)] bg-[var(--chip-bg)] px-4 py-3 text-sm text-[var(--sea-ink)] sm:flex-row sm:items-center sm:justify-between sm:px-6`}
    >
      <p className="m-0">{message}</p>
      <button
        type="button"
        onClick={dismiss}
        data-testid="notification-banner-dismiss"
        aria-label="Dismiss welcome notification"
        className="self-start rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1 text-xs font-semibold text-[var(--sea-ink)] shadow-[0_8px_22px_rgba(30,90,72,0.08)] transition hover:-translate-y-0.5 sm:self-auto"
      >
        Dismiss
      </button>
    </aside>
  )
}
