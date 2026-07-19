import Image from "next/image";
import Link from "next/link";

export function StorefrontLogo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Бутик Емоция — начална страница"
      className={`storefront-logo ${inverted ? "storefront-logo--inverted" : ""}`}
    >
      <span className="storefront-logo__small">бутик</span>
      <Image className="storefront-logo__wordmark" src="/storefront/logo-wordmark.svg" alt="Емоция" width={122} height={42} priority />
      <Image className="storefront-logo__heart" src="/storefront/logo-heart.svg" alt="" width={42} height={42} priority />
    </Link>
  );
}
