import Image from "next/image";
import Link from "next/link";

export function StorefrontLogo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Бутик Емоция — начална страница"
      className={`storefront-logo ${inverted ? "storefront-logo--inverted" : ""}`}
    >
      <Image className="storefront-logo__image" src="/storefront/logo.svg" alt="Бутик Емоция" width={308} height={105} priority />
    </Link>
  );
}
