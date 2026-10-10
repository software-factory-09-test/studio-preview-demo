import test from "node:test";
import assert from "node:assert/strict";
import {
  BANNER_DISMISSED_KEY,
  WELCOME_MESSAGES,
  getNextMessageIndex,
  isPersistedDismissal,
  persistBannerDismissed,
  readBannerDismissed,
} from "../src/components/notificationBanner.ts";

test("WELCOME_MESSAGES exposes at least three non-empty strings", () => {
  assert.equal(Array.isArray(WELCOME_MESSAGES), true);
  assert.ok(WELCOME_MESSAGES.length >= 3, "expected at least 3 messages");
  for (const message of WELCOME_MESSAGES) {
    assert.equal(typeof message, "string");
    assert.ok(message.trim().length > 0, "messages must not be blank");
  }
});

test("getNextMessageIndex advances to the following message", () => {
  assert.equal(getNextMessageIndex(0, 3), 1);
  assert.equal(getNextMessageIndex(1, 3), 2);
});

test("getNextMessageIndex wraps from the last index back to 0", () => {
  assert.equal(getNextMessageIndex(2, 3), 0);
  assert.equal(getNextMessageIndex(0, 1), 0);
});

test("getNextMessageIndex returns 0 for non-positive or invalid totals", () => {
  assert.equal(getNextMessageIndex(0, 0), 0);
  assert.equal(getNextMessageIndex(5, -1), 0);
  assert.equal(getNextMessageIndex(0, Number.NaN), 0);
  assert.equal(getNextMessageIndex(0, Number.POSITIVE_INFINITY), 0);
});

test("getNextMessageIndex returns 0 for invalid current indexes", () => {
  assert.equal(getNextMessageIndex(-1, 3), 0);
  assert.equal(getNextMessageIndex(Number.NaN, 3), 0);
});

test("isPersistedDismissal accepts the persisted marker", () => {
  assert.equal(isPersistedDismissal("true"), true);
});

test("isPersistedDismissal rejects null, undefined and other values", () => {
  assert.equal(isPersistedDismissal(null), false);
  assert.equal(isPersistedDismissal(undefined), false);
  assert.equal(isPersistedDismissal(""), false);
  assert.equal(isPersistedDismissal("false"), false);
  assert.equal(isPersistedDismissal(true), false);
  assert.equal(isPersistedDismissal(1), false);
});

test("readBannerDismissed returns false for missing or invalid values", () => {
  assert.equal(readBannerDismissed(() => null), false);
  assert.equal(readBannerDismissed(() => ""), false);
  assert.equal(readBannerDismissed(() => "false"), false);
  assert.equal(readBannerDismissed(() => "nope"), false);
});

test("readBannerDismissed returns true for the persisted marker", () => {
  assert.equal(readBannerDismissed(() => "true"), true);
});

test("readBannerDismissed queries the expected storage key", () => {
  let seenKey = "";
  readBannerDismissed((key) => {
    seenKey = key;
    return null;
  });
  assert.equal(seenKey, "welcome-banner-dismissed");
  assert.equal(BANNER_DISMISSED_KEY, "welcome-banner-dismissed");
});

test("readBannerDismissed does not throw when the getter throws", () => {
  assert.doesNotThrow(() => {
    readBannerDismissed(() => {
      throw new Error("storage unavailable");
    });
  });
  assert.equal(
    readBannerDismissed(() => {
      throw new Error("storage unavailable");
    }),
    false,
  );
});

test("persistBannerDismissed writes the marker under the expected key", () => {
  let seenKey = "";
  let seenValue = "";
  persistBannerDismissed((key, value) => {
    seenKey = key;
    seenValue = value;
  });
  assert.equal(seenKey, "welcome-banner-dismissed");
  assert.equal(seenValue, "true");
});

test("persistBannerDismissed does not throw when the setter throws", () => {
  assert.doesNotThrow(() => {
    persistBannerDismissed(() => {
      throw new Error("quota exceeded");
    });
  });
});

test("notificationBanner module exposes its pure helper surface", () => {
  for (const name of [
    "getNextMessageIndex",
    "isPersistedDismissal",
    "readBannerDismissed",
    "persistBannerDismissed",
  ] as const) {
    assert.equal(
      typeof (
        {
          getNextMessageIndex,
          isPersistedDismissal,
          readBannerDismissed,
          persistBannerDismissed,
        }[name]
      ),
      "function",
      `${name} should be a function`,
    );
  }
});
