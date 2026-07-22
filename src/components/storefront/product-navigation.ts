const PRODUCT_ORIGIN_KEY = "storefront-product-origin";
const PRODUCT_ORIGIN_MAX_AGE = 12 * 60 * 60 * 1000;

type ProductOrigin = {
  from: string;
  target: string;
  savedAt: number;
};

export function rememberProductOrigin(targetHref: string) {
  if (typeof window === "undefined") return;

  try {
    const origin: ProductOrigin = {
      from: `${window.location.pathname}${window.location.search}${window.location.hash}`,
      target: new URL(targetHref, window.location.origin).pathname,
      savedAt: Date.now(),
    };

    window.sessionStorage.setItem(PRODUCT_ORIGIN_KEY, JSON.stringify(origin));
  } catch {
    // Navigation must still work when storage is unavailable or blocked.
  }
}

export function hasMatchingProductOrigin(currentPath: string) {
  if (typeof window === "undefined") return false;

  try {
    const storedOrigin = window.sessionStorage.getItem(PRODUCT_ORIGIN_KEY);
    if (!storedOrigin) return false;

    const origin = JSON.parse(storedOrigin) as ProductOrigin;
    const isValid = typeof origin.from === "string"
      && typeof origin.target === "string"
      && typeof origin.savedAt === "number";

    if (!isValid) {
      window.sessionStorage.removeItem(PRODUCT_ORIGIN_KEY);
      return false;
    }

    const isRecent = Date.now() - origin.savedAt < PRODUCT_ORIGIN_MAX_AGE;
    const isDifferentPage = origin.from.split(/[?#]/)[0] !== currentPath;

    if (origin.target !== currentPath || !isRecent || !isDifferentPage) {
      window.sessionStorage.removeItem(PRODUCT_ORIGIN_KEY);
      return false;
    }

    return true;
  } catch {
    try {
      window.sessionStorage.removeItem(PRODUCT_ORIGIN_KEY);
    } catch {
      // Storage can be disabled by the browser.
    }
    return false;
  }
}

export function clearProductOrigin() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(PRODUCT_ORIGIN_KEY);
  } catch {
    // Storage can be disabled by the browser.
  }
}
