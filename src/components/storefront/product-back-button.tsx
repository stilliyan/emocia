"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearProductOrigin, hasMatchingProductOrigin } from "./product-navigation";

type ProductBackButtonProps = {
  fallbackHref: string;
  label: string;
};

export function ProductBackButton({ fallbackHref, label }: ProductBackButtonProps) {
  const router = useRouter();

  function handleBack() {
    const canReturnToOrigin = hasMatchingProductOrigin(window.location.pathname)
      && window.history.length > 1;

    clearProductOrigin();

    if (canReturnToOrigin) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button type="button" className="storefront-product-info__back" onClick={handleBack}>
      <ChevronLeft aria-hidden="true" />
      {label}
    </button>
  );
}
