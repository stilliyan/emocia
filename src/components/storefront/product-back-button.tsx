"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { prepareProductOriginRestore } from "./product-navigation";

type ProductBackButtonProps = {
  fallbackHref: string;
  label: string;
  className?: string;
};

export function ProductBackButton({ fallbackHref, label, className }: ProductBackButtonProps) {
  const router = useRouter();

  function handleBack() {
    const origin = prepareProductOriginRestore(window.location.pathname);

    if (origin && window.history.length > 1) {
      router.back();
      return;
    }

    if (origin) {
      router.push(origin.from, { scroll: false });
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      className={["storefront-product-info__back", className].filter(Boolean).join(" ")}
      onClick={handleBack}
    >
      <ChevronLeft aria-hidden="true" />
      {label}
    </button>
  );
}
