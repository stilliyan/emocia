"use client";

import Image from "next/image";
import { Maximize2, X } from "lucide-react";
import { useRef, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { StorefrontCollectionProduct } from "@/lib/storefront-collections";

type ProductGalleryProps = {
  product: StorefrontCollectionProduct;
};

const galleryViews = [
  { className: "storefront-product-gallery__item--primary", priority: true, decorative: false },
  { className: "storefront-product-gallery__item--detail", priority: false, decorative: true },
  { className: "storefront-product-gallery__item--close", priority: false, decorative: true },
  { className: "storefront-product-gallery__item--wide", priority: false, decorative: true },
] as const;

export function ProductGallery({ product }: ProductGalleryProps) {
  const [open, setOpen] = useState(false);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="storefront-product-gallery" aria-label={`Галерия на ${product.name}`}>
        {galleryViews.map((view, index) => (
          <button
            type="button"
            key={view.className}
            className={`storefront-product-gallery__item group ${view.className}`}
            aria-haspopup="dialog"
            aria-label={`Разгледай ${product.name} в голям размер, изображение ${index + 1}`}
            onClick={(event) => {
              lastTriggerRef.current = event.currentTarget;
              setOpen(true);
            }}
          >
            <Image
              src={product.image}
              alt={view.decorative ? "" : product.alt}
              fill
              priority={view.priority}
              sizes="(max-width: 768px) 100vw, 38vw"
            />
            <span className="storefront-product-gallery__zoom absolute right-4 bottom-4 z-10 grid size-11 place-items-center rounded-full bg-white/90 text-[#201b38] opacity-100 transition-[opacity,box-shadow] duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100" aria-hidden="true">
              <Maximize2 className="size-4" strokeWidth={1.5} />
            </span>
          </button>
        ))}
      </div>

      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/80 backdrop-blur-md"
        className="h-dvh w-screen max-w-none gap-0 rounded-none bg-[#111111] p-0 text-white ring-0 sm:max-w-none"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          lastTriggerRef.current?.focus({ preventScroll: true });
        }}
      >
        <DialogTitle className="sr-only">{product.name} в голям размер</DialogTitle>
        <div className="relative h-full min-h-0 w-full">
          <Image
            src={product.image}
            alt={product.alt}
            fill
            priority
            sizes="100vw"
            className="object-contain p-4 sm:p-8"
          />
        </div>
        <p className="pointer-events-none absolute bottom-5 left-5 text-sm font-light tracking-wide text-white/75 sm:bottom-7 sm:left-8">
          {product.name}
        </p>
        <DialogClose asChild>
          <button
            type="button"
            className="absolute top-4 right-4 z-10 grid size-12 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:top-6 sm:right-6"
            aria-label="Затвори голямото изображение"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
