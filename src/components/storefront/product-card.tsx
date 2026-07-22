"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { rememberProductOrigin } from "./product-navigation";

export function ProductCard({
  href,
  image,
  alt,
  eyebrow,
  name,
  sizes,
}: {
  href: string;
  image: string;
  alt: string;
  eyebrow: string;
  name: string;
  sizes: string;
}) {
  return (
    <Link
      href={href}
      className="storefront-collection-card-link"
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        if (!event.defaultPrevented) rememberProductOrigin(href);
      }}
    >
      <article className="storefront-collection-card">
        <div className="storefront-collection-card__media">
          <Image src={image} alt={alt} fill sizes={sizes} />
          <div className="storefront-collection-card__veil" aria-hidden="true" />
        </div>
        <div className="storefront-collection-card__copy">
          <span className="storefront-collection-card__eyebrow">{eyebrow}</span>
          <h3>{name}</h3>
          <span className="storefront-blog-link-label storefront-collection-card__link-label">
            Разгледай
          </span>
        </div>
      </article>
    </Link>
  );
}
