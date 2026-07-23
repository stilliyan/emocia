import Image from "next/image";
import Link from "next/link";
import { blogArticles } from "@/lib/storefront-blog";
import { AnimatedHeroTitle } from "./animated-copy";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import "./storefront.css";

export function StorefrontBlogPage() {
  const [featuredArticle, ...articles] = blogArticles;

  return (
    <main className="storefront storefront-blog-page">
      <SiteHeader />

      <section className="storefront-blog-hero" aria-labelledby="blog-title">
        <Image
          src="/storefront/boutique.png"
          alt="Булка на морския бряг"
          fill
          preload
          quality={90}
          sizes="100vw"
          className="storefront-blog-hero__image"
        />
        <div className="storefront-blog-hero__veil" aria-hidden="true" />
        <div className="storefront-blog-hero__copy">
          <p>Наръчник за вашия ден</p>
          <AnimatedHeroTitle id="blog-title" text="Съвети за булката" />
        </div>
      </section>

      <div className="storefront-content-stack storefront-blog-content">
        <section className="storefront-blog-index" aria-labelledby="latest-advice-title">
          <header className="storefront-blog-index__header">
            <h2 id="latest-advice-title">Спокойни решения за всеки етап</h2>
            <p>
              Практични насоки от първата идея до последната проба — поднесени ясно, без строги правила.
            </p>
          </header>

          <Link href={`/blog/${featuredArticle.slug}`} className="storefront-blog-featured">
            <div className="storefront-blog-featured__media">
              <Image
                src={featuredArticle.image}
                alt={featuredArticle.imageAlt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 58vw"
              />
            </div>
            <article className="storefront-blog-featured__copy">
              <BlogMeta article={featuredArticle} />
              <div className="storefront-blog-featured__body">
                <h3>{featuredArticle.title}</h3>
                <p>{featuredArticle.excerpt}</p>
              </div>
              <span className="storefront-blog-link-label">Прочети статията</span>
            </article>
          </Link>

          <div className="storefront-blog-grid">
            {articles.map((article) => (
              <Link href={`/blog/${article.slug}`} className="storefront-blog-card" key={article.slug}>
                <div className="storefront-blog-card__media">
                  <Image
                    src={article.image}
                    alt={article.imageAlt}
                    fill
                    sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
                  />
                </div>
                <article className="storefront-blog-card__copy">
                  <BlogMeta article={article} />
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  <span className="storefront-blog-link-label">Прочети</span>
                </article>
              </Link>
            ))}
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  );
}

function BlogMeta({ article }: { article: (typeof blogArticles)[number] }) {
  return (
    <div className="storefront-blog-meta">
      <span>{article.category}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={article.publishedAt}>{article.publishedLabel}</time>
      <span aria-hidden="true">·</span>
      <span>{article.readTime}</span>
    </div>
  );
}
