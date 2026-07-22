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
  price,
  sizes,
  showCategory = true,
}: {
  href: string;
  image: string;
  alt: string;
  eyebrow: string;
  name: string;
  price?: string | null;
  sizes: string;
  showCategory?: boolean;
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
          {showCategory ? (
            <span className="storefront-collection-card__eyebrow">{eyebrow}</span>
          ) : null}
          <div className="storefront-collection-card__heading">
            <h3>{name}</h3>
            {price ? <span className="storefront-collection-card__price">{price}</span> : null}
          </div>
          <span className="storefront-blog-link-label storefront-collection-card__link-label">
            Разгледай
          </span>
        </div>
      </article>
    </Link>
  );
}
