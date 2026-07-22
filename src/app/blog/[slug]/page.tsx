import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StorefrontBlogArticlePage } from "@/components/storefront/blog-article-page";
import { blogArticles, getBlogArticle } from "@/lib/storefront-blog";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticle(slug);

  if (!article) return {};

  return {
    title: `${article.title} | Бутик Емоция`,
    description: article.excerpt,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt,
      images: [{ url: article.image, alt: article.imageAlt }],
    },
  };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const article = getBlogArticle(slug);

  if (!article) notFound();

  return <StorefrontBlogArticlePage article={article} />;
}
