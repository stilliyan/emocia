import { describe, expect, it } from "vitest";
import {
  shouldResetHomepageScroll,
  shouldResetHomepageScrollOnPageShow,
} from "./homepage-reload-scroll-reset";

describe("shouldResetHomepageScroll", () => {
  it("allows only a true reload without a hash", () => {
    expect(shouldResetHomepageScroll("reload", false)).toBe(true);
  });

  it.each(["navigate", "back_forward", "prerender", undefined])(
    "preserves scroll behavior for %s navigation",
    (navigationType) => {
      expect(shouldResetHomepageScroll(navigationType, false)).toBe(false);
    },
  );

  it("preserves hash navigation even when the document was reloaded", () => {
    expect(shouldResetHomepageScroll("reload", true)).toBe(false);
  });
});

describe("shouldResetHomepageScrollOnPageShow", () => {
  it("resets a non-persisted restored homepage document", () => {
    expect(shouldResetHomepageScrollOnPageShow("navigate", false, false)).toBe(true);
  });

  it.each([
    ["back_forward", false, false],
    ["navigate", true, false],
    ["reload", false, true],
  ])("preserves history and hash navigation", (navigationType, persisted, hasHash) => {
    expect(
      shouldResetHomepageScrollOnPageShow(navigationType, persisted, hasHash),
    ).toBe(false);
  });
});
