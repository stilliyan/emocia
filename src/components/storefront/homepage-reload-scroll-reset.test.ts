import { describe, expect, it } from "vitest";
import { shouldResetHomepageScroll } from "./homepage-reload-scroll-reset";

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
