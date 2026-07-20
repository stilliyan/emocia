import type { Metadata, Viewport } from "next";
import { StorefrontHomepage } from "@/components/storefront/homepage";

export const metadata: Metadata = {
  title: "Бутик Емоция | Булчински и вечерни рокли във Варна",
  description: "Открийте булчински и вечерни рокли в Бутик Емоция, Варна. Запазете лична консултация и проба в спокойна бутикова атмосфера.",
  openGraph: {
    title: "Бутик Емоция | Роклята, в която сте себе си",
    description: "Булчински и вечерни рокли във Варна с лично внимание и внимателно подбрани модели.",
    images: [{ url: "/storefront/hero.png", width: 1535, height: 1024, alt: "Бутик Емоция" }],
  },
};

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
