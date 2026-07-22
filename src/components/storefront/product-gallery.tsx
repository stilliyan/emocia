"use client";

import Image from "next/image";
import { ImageIcon, Maximize2, X } from "lucide-react";
import { type MouseEvent, useRef, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { StorefrontCollectionProduct } from "@/lib/storefront-collections";
import { getProductGalleryImages, getProductGalleryLayout } from "./product-gallery-model";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

type ProductGalleryProps = {
  product: StorefrontCollectionProduct;
};

const galleryViewClassNames = [
  "storefront-product-gallery__item--primary",
  "storefront-product-gallery__item--detail",
  "storefront-product-gallery__item--close",
  "storefront-product-gallery__item--wide",
] as const;

export function ProductGallery({ product }: ProductGalleryProps) {
  const images = getProductGalleryImages(product);
  const imageCount = images.length;
  const layout = getProductGalleryLayout(imageCount);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxSlide, setLightboxSlide] = useState(0);
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const lightboxRef = useRef<HTMLDivElement | null>(null);
  const lightboxFramesRef = useRef<Array<HTMLButtonElement | null>>([]);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });
  const mouseDraggingRef = useRef(false);
  const draggedRef = useRef(false);
  const suppressClickRef = useRef(false);

  const updateCurrentSlide = () => {
    const gallery = galleryRef.current;
    if (!gallery?.clientWidth) return;

    const nextSlide = Math.max(
      0,
      Math.min(imageCount - 1, Math.round(gallery.scrollLeft / gallery.clientWidth)),
    );
    setCurrentSlide((previousSlide) => previousSlide === nextSlide ? previousSlide : nextSlide);
  };

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    const gallery = event.currentTarget;
    dragStartRef.current = { x: event.clientX, scrollLeft: gallery.scrollLeft };
    mouseDraggingRef.current = true;
    draggedRef.current = false;
    gallery.dataset.dragging = "true";
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!mouseDraggingRef.current) return;

    const distance = dragStartRef.current.x - event.clientX;
    if (Math.abs(distance) > 6) draggedRef.current = true;
    event.preventDefault();
    event.currentTarget.scrollLeft = dragStartRef.current.scrollLeft + distance;
  };

  const finishMouseDrag = (event: MouseEvent<HTMLDivElement>) => {
    const gallery = event.currentTarget;
    if (!mouseDraggingRef.current) return;

    mouseDraggingRef.current = false;
    delete gallery.dataset.dragging;
    if (!draggedRef.current) return;

    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
    const distance = dragStartRef.current.x - event.clientX;
    const startSlide = Math.round(dragStartRef.current.scrollLeft / gallery.clientWidth);
    const slide = Math.max(
      0,
      Math.min(
        imageCount - 1,
        Math.abs(distance) > 40
          ? startSlide + Math.sign(distance)
          : Math.round(gallery.scrollLeft / gallery.clientWidth),
      ),
    );
    gallery.scrollTo({
      left: slide * gallery.clientWidth,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="storefront-product-gallery-shell">
        <div
          ref={galleryRef}
          className={`storefront-product-gallery storefront-product-gallery--${layout}`}
          data-image-count={imageCount}
          data-layout={layout}
          aria-label={`Галерия на ${product.name}`}
          onScroll={updateCurrentSlide}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={finishMouseDrag}
          onMouseLeave={finishMouseDrag}
        >
          {images.map((image, index) => {
            const viewClassName = galleryViewClassNames[index] ?? "storefront-product-gallery__item--additional";

            return (
              <button
                type="button"
                key={`${image.src}-${index}`}
                className={`storefront-product-gallery__item group ${viewClassName}`}
                aria-haspopup="dialog"
                aria-label={`Разгледай ${product.name} в голям размер, изображение ${index + 1}`}
                onClick={(event) => {
                  if (suppressClickRef.current) {
                    suppressClickRef.current = false;
                    return;
                  }

                  lastTriggerRef.current = event.currentTarget;
                  setLightboxSlide(index);
                  setOpen(true);
                }}
              >
                <Image
                  src={image.src}
                  alt={image.alt ?? product.alt}
                  fill
                  preload={index === 0}
                  draggable={false}
                  sizes={layout === "single" ? "(max-width: 768px) 100vw, 62vw" : "(max-width: 768px) 100vw, 38vw"}
                />
                <span className="storefront-product-gallery__zoom absolute right-4 bottom-4 z-10 grid size-11 place-items-center rounded-full bg-white/90 text-[#201b38] opacity-100 transition-[opacity,box-shadow] duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100" aria-hidden="true">
                  <Maximize2 className="size-4" strokeWidth={1.5} />
                </span>
              </button>
            );
          })}

          {layout === "empty" ? (
            <div className="storefront-product-gallery__empty" role="status">
              <ImageIcon aria-hidden="true" />
              <span>Все още няма снимки на този модел.</span>
            </div>
          ) : null}
        </div>

        {imageCount > 1 ? (
          <>
            <p className="storefront-product-gallery__mobile-count" aria-live="polite" aria-atomic="true">
              {currentSlide + 1} / {imageCount}
            </p>
            <div
              className="storefront-product-gallery__mobile-progress"
              role="progressbar"
              aria-label="Позиция в галерията"
              aria-valuemin={1}
              aria-valuemax={imageCount}
              aria-valuenow={currentSlide + 1}
            >
              <span
                style={{
                  width: `${100 / imageCount}%`,
                  transform: `translateX(${currentSlide * 100}%)`,
                }}
              />
            </div>
          </>
        ) : null}
      </div>

      <DialogContent
        ref={lightboxRef}
        showCloseButton={false}
        overlayClassName="bg-white"
        className="storefront-product-lightbox !inset-0 !top-0 !left-0 !block !h-dvh !w-screen !max-w-none !translate-x-0 !translate-y-0 !overflow-y-auto !rounded-none !bg-white !p-0 !text-[#201b38] !ring-0 sm:!max-w-none"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          window.requestAnimationFrame(() => {
            const frame = lightboxFramesRef.current[lightboxSlide];
            lightboxRef.current?.scrollTo({ top: frame?.offsetTop ?? 0, behavior: "instant" });
          });
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          lastTriggerRef.current?.focus({ preventScroll: true });
        }}
      >
        <DialogTitle className="sr-only">{product.name} в голям размер</DialogTitle>
        <div className="storefront-product-lightbox__stack">
          {images.map((image, index) => {
            const viewClassName = galleryViewClassNames[index] ?? "storefront-product-gallery__item--additional";

            return (
              <button
                ref={(element) => {
                  lightboxFramesRef.current[index] = element;
                }}
                type="button"
                key={`${image.src}-${index}`}
                className={`storefront-product-lightbox__frame ${viewClassName}`}
                aria-label={`Затвори голямото изображение ${index + 1} на ${product.name}`}
                onClick={() => setOpen(false)}
              >
                <Image
                  src={image.src}
                  alt={image.alt ?? `${product.alt}, изображение ${index + 1}`}
                  fill
                  loading={index === lightboxSlide ? "eager" : "lazy"}
                  sizes="100vw"
                  draggable={false}
                />
              </button>
            );
          })}
        </div>
        <DialogClose asChild>
          <button
            type="button"
            className="storefront-product-lightbox__close"
            aria-label="Затвори голямото изображение"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
