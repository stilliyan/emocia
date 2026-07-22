import Image from "next/image";
import Link from "next/link";

export function StorefrontLogo({
  inverted = false,
  alternateSrc,
}: {
  inverted?: boolean;
  alternateSrc?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="Бутик Емоция — начална страница"
      className={`storefront-logo ${inverted ? "storefront-logo--inverted" : ""}`}
    >
      <Image className="storefront-logo__image storefront-logo__image--default" src="/storefront/logo.svg" alt="Бутик Емоция" width={308} height={105} loading="eager" />
      {alternateSrc ? (
        <Image
          aria-hidden="true"
          className="storefront-logo__image storefront-logo__image--alternate"
          src={alternateSrc}
          alt=""
          width={193}
          height={66}
          loading="eager"
        />
      ) : null}
    </Link>
  );
}
