import type { Metadata, Viewport } from "next";
import { StorefrontHomepage } from "@/components/storefront/homepage";
import { getStorefrontContent, getStorefrontSettings } from "@/lib/storefront-data";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, content] = await Promise.all([getStorefrontSettings(), getStorefrontContent()]);
  const title = settings.default_seo_title || `${settings.shop_name} | Булчински и вечерни рокли във Варна`;
  const description = settings.default_meta_description || content.hero_description || "Открийте булчински и вечерни рокли в Бутик Емоция, Варна. Запазете лична консултация и проба в спокойна бутикова атмосфера.";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: "/storefront/hero.png", width: 1535, height: 1024, alt: settings.shop_name }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4A83AE" },
    { media: "(prefers-color-scheme: dark)", color: "#4A83AE" },
  ],
  viewportFit: "cover",
};

export default function Home() {
  return <StorefrontHomepage />;
}
