"use client";

import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

type HorizontalDragRailProps = {
  children: ReactNode;
  className?: string;
  ariaLabel: string;
  keyboardStep?: number;
};

const DRAG_THRESHOLD = 5;

export function HorizontalDragRail({
  children,
  className = "",
  ariaLabel,
  keyboardStep = 360,
}: HorizontalDragRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    scrollLeft: 0,
    didDrag: false,
  });
  const [isDragging, setIsDragging] = useState(false);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0 || !railRef.current) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: railRef.current.scrollLeft,
      didDrag: false,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const rail = railRef.current;
    const drag = dragRef.current;

    if (!rail || drag.pointerId !== event.pointerId) return;

    const distance = event.clientX - drag.startX;
    if (!drag.didDrag && Math.abs(distance) < DRAG_THRESHOLD) return;

    if (!drag.didDrag) {
      drag.didDrag = true;
      setIsDragging(true);
      rail.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
    rail.scrollLeft = drag.scrollLeft - distance;
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    const rail = railRef.current;
    const didDrag = dragRef.current.didDrag;

    if (rail?.hasPointerCapture(event.pointerId)) {
      rail.releasePointerCapture(event.pointerId);
    }

    dragRef.current.pointerId = -1;
    setIsDragging(false);

    if (didDrag) {
      window.setTimeout(() => {
        dragRef.current.didDrag = false;
      }, 0);
    }
  }

  function cancelDrag(event: PointerEvent<HTMLDivElement>) {
    const rail = railRef.current;

    if (rail?.hasPointerCapture(event.pointerId)) {
      rail.releasePointerCapture(event.pointerId);
    }

    dragRef.current.pointerId = -1;
    dragRef.current.didDrag = false;
    setIsDragging(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    railRef.current?.scrollBy({
      left: event.key === "ArrowRight" ? keyboardStep : -keyboardStep,
      behavior: "smooth",
    });
  }

  return (
    <div
      ref={railRef}
      className={`${className}${isDragging ? " is-dragging" : ""}`}
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={cancelDrag}
      onClickCapture={(event) => {
        if (!dragRef.current.didDrag) return;
        event.preventDefault();
        event.stopPropagation();
        dragRef.current.didDrag = false;
      }}
      onDragStart={(event) => event.preventDefault()}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
