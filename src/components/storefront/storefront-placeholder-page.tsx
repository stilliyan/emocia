import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import "./storefront.css";

type StorefrontPlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function StorefrontPlaceholderPage({ eyebrow, title, description }: StorefrontPlaceholderPageProps) {
  return (
    <main className="storefront storefront-placeholder-page">
      <section className="storefront-placeholder-page__hero">
        <SiteHeader />
        <div className="storefront-placeholder-page__intro">
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </section>
      <div className="storefront-content-stack">
        <SiteFooter />
      </div>
    </main>
  );
}
