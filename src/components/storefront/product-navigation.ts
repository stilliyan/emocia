const PRODUCT_ORIGIN_KEY = "storefront-product-origin";
const PRODUCT_ORIGIN_MAX_AGE = 12 * 60 * 60 * 1000;

type ProductOrigin = {
  from: string;
  target: string;
  scrollY: number;
  savedAt: number;
};

const PRODUCT_ORIGIN_RESTORE_KEY = "storefront-product-origin-restore";

function getCurrentLocation() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function readProductOrigin(key: string) {
  try {
    const storedOrigin = window.sessionStorage.getItem(key);
    if (!storedOrigin) return null;

    const origin = JSON.parse(storedOrigin) as ProductOrigin;
    const isValid = typeof origin.from === "string"
      && typeof origin.target === "string"
      && typeof origin.scrollY === "number"
      && typeof origin.savedAt === "number";

    if (!isValid || Date.now() - origin.savedAt >= PRODUCT_ORIGIN_MAX_AGE) {
      window.sessionStorage.removeItem(key);
      return null;
    }

    return origin;
  } catch {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Storage can be disabled by the browser.
    }
    return null;
  }
}

export function rememberProductOrigin(targetHref: string) {
  if (typeof window === "undefined") return;

  try {
    const origin: ProductOrigin = {
      from: getCurrentLocation(),
      target: new URL(targetHref, window.location.origin).pathname,
      scrollY: window.scrollY,
      savedAt: Date.now(),
    };

    window.sessionStorage.setItem(PRODUCT_ORIGIN_KEY, JSON.stringify(origin));
  } catch {
    // Navigation must still work when storage is unavailable or blocked.
  }
}

export function hasMatchingProductOrigin(currentPath: string) {
  if (typeof window === "undefined") return false;

  const origin = readProductOrigin(PRODUCT_ORIGIN_KEY);
  const isDifferentPage = origin?.from.split(/[?#]/)[0] !== currentPath;

  if (!origin || origin.target !== currentPath || !isDifferentPage) {
    clearProductOrigin();
    return false;
  }

  return true;
}

export function prepareProductOriginRestore(currentPath: string) {
  if (!hasMatchingProductOrigin(currentPath)) return null;

  const origin = readProductOrigin(PRODUCT_ORIGIN_KEY);
  if (!origin) return null;

  try {
    window.sessionStorage.setItem(PRODUCT_ORIGIN_RESTORE_KEY, JSON.stringify(origin));
  } catch {
    // The regular browser restoration still provides a safe fallback.
  }

  clearProductOrigin();
  return origin;
}

export function consumeProductOriginRestore() {
  if (typeof window === "undefined") return null;

  const origin = readProductOrigin(PRODUCT_ORIGIN_RESTORE_KEY);
  if (!origin) return null;

  try {
    window.sessionStorage.removeItem(PRODUCT_ORIGIN_RESTORE_KEY);
  } catch {
    // Storage can be disabled by the browser.
  }

  return origin.from === getCurrentLocation() ? origin.scrollY : null;
}

export function clearProductOrigin() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(PRODUCT_ORIGIN_KEY);
  } catch {
    // Storage can be disabled by the browser.
  }
}
