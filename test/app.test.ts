import test from "node:test";
import assert from "node:assert/strict";
import * as theme from "../src/components/theme.ts";

test("sanity check", () => {
  assert.equal(1 + 1, 2);
});

test("theme module exposes its pure helper surface", () => {
  for (const name of [
    "isThemeMode",
    "resolveTheme",
    "getNextMode",
    "readStoredMode",
    "applyThemeToDocument",
  ] as const) {
    assert.equal(typeof theme[name], "function", `${name} should be a function`);
  }
});
