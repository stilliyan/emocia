import { ArrowLeft, ArrowUpRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { accessoriesCollection, bridalCollection } from "@/lib/storefront-collections";
import type { StorefrontBlogArticle } from "@/lib/storefront-blog";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import "./storefront.css";

const recommendations = [
  ...bridalCollection.products.slice(0, 3).map((product) => ({
    ...product,
    href: `/${bridalCollection.slug}/${product.slug}`,
    eyebrow: "Булчински рокли",
  })),
  ...accessoriesCollection.products.slice(0, 1).map((product) => ({
    ...product,
    href: `/${accessoriesCollection.slug}/${product.slug}`,
    eyebrow: "Аксесоари",
  })),
];

export function StorefrontBlogArticlePage({ article }: { article: StorefrontBlogArticle }) {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    image: article.image,
    author: {
      "@type": "Organization",
      name: "Бутик Емоция",
    },
    publisher: {
      "@type": "Organization",
      name: "Бутик Емоция",
    },
  };

  return (
    <main className="storefront storefront-article-page">
      <SiteHeader variant="light" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />

      <article>
        <header className="storefront-article-header">
          <Link href="/blog" className="storefront-article-back">
            <ArrowLeft aria-hidden="true" />
            Всички съвети
          </Link>
          <p className="storefront-article-header__eyebrow">{article.category}</p>
          <h1>{article.title}</h1>
          <p className="storefront-article-header__excerpt">{article.excerpt}</p>
          <div className="storefront-blog-meta storefront-article-header__meta">
            <time dateTime={article.publishedAt}>{article.publishedLabel}</time>
            <span aria-hidden="true">·</span>
            <span>{article.readTime}</span>
          </div>
        </header>

        <figure className="storefront-article-hero-media">
          <Image
            src={article.image}
            alt={article.imageAlt}
            fill
            priority
            quality={90}
            sizes="(max-width: 768px) 100vw, 1180px"
          />
        </figure>

        <div className="storefront-article-prose">
          <p className="storefront-article-lead">{article.summary}</p>

          {article.sections.map((section, index) => (
            <div className="storefront-article-section" key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets ? (
                <ul>
                  {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              ) : null}

              {index === 0 ? (
                <figure className="storefront-article-inline-media">
                  <Image
                    src={article.inlineImage}
                    alt={article.inlineImageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 720px"
                  />
                </figure>
              ) : null}

              {index === 1 ? (
                <figure className="storefront-article-video-placeholder">
                  <Image src={article.videoPoster} alt="" fill sizes="(max-width: 768px) 100vw, 720px" />
                  <span className="storefront-article-video-placeholder__veil" aria-hidden="true" />
                  <figcaption>
                    <span className="storefront-article-video-placeholder__play" aria-hidden="true">
                      <Play />
                    </span>
                    <span>Видео съвет</span>
                    <small>Скоро</small>
                  </figcaption>
                </figure>
              ) : null}
            </div>
          ))}

          <blockquote>{article.quote}</blockquote>

          <aside className="storefront-article-appointment" aria-label="Запазване на час">
            <h2>Искате да открием вашата рокля заедно?</h2>
            <p>Ще подготвим лична селекция и спокойна проба, съобразена с вашето усещане.</p>
            <Link href="/kontakti" className="storefront-button storefront-button--dark">
              Запази час за проба
            </Link>
          </aside>
        </div>
      </article>

      <section className="storefront-article-recommendations" aria-labelledby="article-recommendations-title">
        <header>
          <p>Продължете откриването</p>
          <h2 id="article-recommendations-title">Подбрано за вас</h2>
        </header>
        <div className="storefront-article-recommendations__grid">
          {recommendations.map((item) => (
            <Link href={item.href} className="storefront-article-recommendation" key={item.href}>
              <div className="storefront-article-recommendation__media">
                <Image src={item.image} alt={item.alt} fill sizes="(max-width: 680px) 50vw, 25vw" />
              </div>
              <span>{item.eyebrow}</span>
              <h3>{item.name}</h3>
              <span className="storefront-blog-link-label">
                Разгледай <ArrowUpRight aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
