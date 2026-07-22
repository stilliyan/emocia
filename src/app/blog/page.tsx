import type { Metadata } from "next";
import { StorefrontBlogPage } from "@/components/storefront/blog-page";

export const metadata: Metadata = {
  title: "Съвети за булката | Бутик Емоция",
  description: "Практични съвети за избора на рокля, пробата и сватбения ден от Бутик Емоция.",
};

export default function BlogPage() {
  return <StorefrontBlogPage />;
}
