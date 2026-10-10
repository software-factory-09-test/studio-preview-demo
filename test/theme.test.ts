import test from 'node:test'
import assert from 'node:assert/strict'
import {
  applyThemeToDocument,
  getNextMode,
  isThemeMode,
  readStoredMode,
  resolveTheme,
  type ThemeMode,
} from '../src/components/theme.ts'

type FakeDocument = {
  documentElement: {
    classList: {
      add: (...tokens: string[]) => void
      remove: (...tokens: string[]) => void
      contains: (token: string) => boolean
    }
    setAttribute: (name: string, value: string) => void
    removeAttribute: (name: string) => void
    style: { colorScheme?: string }
  }
  classes: Set<string>
  attributes: Record<string, string>
  style: { colorScheme?: string }
}

function createFakeDocument(): FakeDocument {
  const classes = new Set<string>()
  const attributes: Record<string, string> = {}
  const style: { colorScheme?: string } = {}

  const classList = {
    add(...tokens: string[]) {
      for (const token of tokens) {
        classes.add(token)
      }
    },
    remove(...tokens: string[]) {
      for (const token of tokens) {
        classes.delete(token)
      }
    },
    contains(token: string) {
      return classes.has(token)
    },
  }

  const documentElement = {
    classList,
    setAttribute(name: string, value: string) {
      attributes[name] = value
    },
    removeAttribute(name: string) {
      delete attributes[name]
    },
    style,
  }

  return { documentElement, classes, attributes, style }
}

function apply(
  fake: FakeDocument,
  mode: ThemeMode,
  prefersDark: boolean,
): void {
  applyThemeToDocument(
    fake as unknown as Pick<Document, 'documentElement'>,
    mode,
    prefersDark,
  )
}

test('resolveTheme returns the explicit mode regardless of system preference', () => {
  assert.equal(resolveTheme('light', true), 'light')
  assert.equal(resolveTheme('light', false), 'light')
  assert.equal(resolveTheme('dark', true), 'dark')
  assert.equal(resolveTheme('dark', false), 'dark')
})

test('resolveTheme follows the system preference in auto mode', () => {
  assert.equal(resolveTheme('auto', true), 'dark')
  assert.equal(resolveTheme('auto', false), 'light')
})

test('getNextMode cycles light -> dark -> auto -> light', () => {
  assert.equal(getNextMode('light'), 'dark')
  assert.equal(getNextMode('dark'), 'auto')
  assert.equal(getNextMode('auto'), 'light')
})

test('getNextMode returns to the starting mode after three calls', () => {
  const start: ThemeMode = 'light'
  const once = getNextMode(start)
  const twice = getNextMode(once)
  const thrice = getNextMode(twice)
  assert.equal(thrice, start)

  const autoStart: ThemeMode = 'auto'
  assert.equal(getNextMode(getNextMode(getNextMode(autoStart))), autoStart)
})

test('isThemeMode accepts the three known modes', () => {
  assert.equal(isThemeMode('light'), true)
  assert.equal(isThemeMode('dark'), true)
  assert.equal(isThemeMode('auto'), true)
})

test('isThemeMode rejects unknown values', () => {
  assert.equal(isThemeMode(''), false)
  assert.equal(isThemeMode('system'), false)
  assert.equal(isThemeMode(null), false)
  assert.equal(isThemeMode(undefined), false)
})

test('readStoredMode returns valid stored values', () => {
  for (const mode of ['light', 'dark', 'auto'] as const) {
    assert.equal(readStoredMode(() => mode), mode)
  }
})

test('readStoredMode falls back to auto for invalid or missing values', () => {
  assert.equal(readStoredMode(() => 'system'), 'auto')
  assert.equal(readStoredMode(() => ''), 'auto')
  assert.equal(readStoredMode(() => null), 'auto')
})

test('readStoredMode queries the theme key', () => {
  let seenKey = ''
  readStoredMode((key) => {
    seenKey = key
    return null
  })
  assert.equal(seenKey, 'theme')
})

test('applyThemeToDocument sets explicit light theme', () => {
  const fake = createFakeDocument()
  apply(fake, 'light', true)

  assert.equal(fake.classes.has('light'), true)
  assert.equal(fake.classes.has('dark'), false)
  assert.equal(fake.attributes['data-theme'], 'light')
  assert.equal(fake.style.colorScheme, 'light')
})

test('applyThemeToDocument sets explicit dark theme', () => {
  const fake = createFakeDocument()
  apply(fake, 'dark', false)

  assert.equal(fake.classes.has('dark'), true)
  assert.equal(fake.classes.has('light'), false)
  assert.equal(fake.attributes['data-theme'], 'dark')
  assert.equal(fake.style.colorScheme, 'dark')
})

test('applyThemeToDocument resolves auto mode and removes data-theme', () => {
  const darkFake = createFakeDocument()
  apply(darkFake, 'auto', true)

  assert.equal(darkFake.classes.has('dark'), true)
  assert.equal(darkFake.classes.has('light'), false)
  assert.equal('data-theme' in darkFake.attributes, false)
  assert.equal(darkFake.style.colorScheme, 'dark')

  const lightFake = createFakeDocument()
  apply(lightFake, 'auto', false)

  assert.equal(lightFake.classes.has('light'), true)
  assert.equal(lightFake.classes.has('dark'), false)
  assert.equal('data-theme' in lightFake.attributes, false)
  assert.equal(lightFake.style.colorScheme, 'light')
})

test('applyThemeToDocument clears the previous theme class when switching', () => {
  const fake = createFakeDocument()
  apply(fake, 'dark', false)
  assert.equal(fake.classes.has('dark'), true)

  apply(fake, 'light', false)
  assert.equal(fake.classes.has('light'), true)
  assert.equal(fake.classes.has('dark'), false)

  apply(fake, 'auto', false)
  assert.equal(fake.classes.has('light'), true)
  assert.equal(fake.classes.has('dark'), false)
  assert.equal('data-theme' in fake.attributes, false)
})
