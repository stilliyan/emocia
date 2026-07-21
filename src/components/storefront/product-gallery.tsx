"use client";

import Image from "next/image";
import { Maximize2, X } from "lucide-react";
import { type MouseEvent, useRef, useState } from "react";
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
      Math.min(galleryViews.length - 1, Math.round(gallery.scrollLeft / gallery.clientWidth)),
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
        galleryViews.length - 1,
        Math.abs(distance) > 40
          ? startSlide + Math.sign(distance)
          : Math.round(gallery.scrollLeft / gallery.clientWidth),
      ),
    );
    gallery.scrollTo({ left: slide * gallery.clientWidth, behavior: "smooth" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="storefront-product-gallery-shell">
        <div
          ref={galleryRef}
          className="storefront-product-gallery"
          aria-label={`Галерия на ${product.name}`}
          onScroll={updateCurrentSlide}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={finishMouseDrag}
          onMouseLeave={finishMouseDrag}
        >
          {galleryViews.map((view, index) => (
            <button
              type="button"
              key={view.className}
              className={`storefront-product-gallery__item group ${view.className}`}
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
                src={product.image}
                alt={view.decorative ? "" : product.alt}
                fill
                priority={view.priority}
                draggable={false}
                sizes="(max-width: 768px) 100vw, 38vw"
              />
              <span className="storefront-product-gallery__zoom absolute right-4 bottom-4 z-10 grid size-11 place-items-center rounded-full bg-white/90 text-[#201b38] opacity-100 transition-[opacity,box-shadow] duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100" aria-hidden="true">
                <Maximize2 className="size-4" strokeWidth={1.5} />
              </span>
            </button>
          ))}
        </div>

        <p className="storefront-product-gallery__mobile-count" aria-live="polite" aria-atomic="true">
          {currentSlide + 1} / {galleryViews.length}
        </p>
        <div
          className="storefront-product-gallery__mobile-progress"
          role="progressbar"
          aria-label="Позиция в галерията"
          aria-valuemin={1}
          aria-valuemax={galleryViews.length}
          aria-valuenow={currentSlide + 1}
        >
          <span
            style={{
              width: `${100 / galleryViews.length}%`,
              transform: `translateX(${currentSlide * 100}%)`,
            }}
          />
        </div>
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
          {galleryViews.map((view, index) => (
            <button
              ref={(element) => {
                lightboxFramesRef.current[index] = element;
              }}
              type="button"
              key={view.className}
              className={`storefront-product-lightbox__frame ${view.className}`}
              aria-label={`Затвори голямото изображение ${index + 1} на ${product.name}`}
              onClick={() => setOpen(false)}
            >
              <Image
                src={product.image}
                alt={`${product.alt}, изображение ${index + 1}`}
                fill
                priority={index === lightboxSlide}
                sizes="100vw"
                draggable={false}
              />
            </button>
          ))}
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
