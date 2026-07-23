"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function LegalBackButton() {
  const router = useRouter();

  function handleBack() {
    const referrer = document.referrer ? new URL(document.referrer) : null;
    const canGoBack = referrer?.origin === window.location.origin && window.history.length > 1;

    if (canGoBack) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <button type="button" className="storefront-legal__back" onClick={handleBack}>
      <ChevronLeft aria-hidden="true" />
      Назад
    </button>
  );
}
