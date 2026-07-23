import Link from "next/link";
import { LegalBackButton } from "./legal-back-button";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import "./storefront.css";

export type LegalSection = {
  title: string;
  paragraphs?: readonly string[];
  items?: readonly string[];
};

type LegalPageProps = {
  title: string;
  intro: string;
  sections: readonly LegalSection[];
};

export function LegalPage({ title, intro, sections }: LegalPageProps) {
  return (
    <main className="storefront storefront-legal-page">
      <SiteHeader variant="light" />
      <article className="storefront-legal">
        <header className="storefront-legal__header">
          <LegalBackButton />
          <h1>{title}</h1>
          <p>{intro}</p>
          <span>Последна актуализация: 21 юли 2026 г.</span>
        </header>

        <div className="storefront-legal__body">
          {sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.items && (
                <ul>
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}

          <section>
            <h2>Контакт</h2>
            <p>
              За въпроси относно тази страница пишете на <a href="mailto:emocia_bg@abv.bg">emocia_bg@abv.bg</a>
              {" "}или посетете <Link href="/kontakti">страницата за контакти</Link>.
            </p>
          </section>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
