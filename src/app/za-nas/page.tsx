import type { Metadata } from "next";
import { AboutPage } from "@/components/storefront/about-page";

export const metadata: Metadata = {
  title: "За Бутик Емоция | Над 20 години булчинска мода във Варна",
  description: "Историята на Бутик Емоция — бутиково пространство за булчински и официални рокли във Варна, създадено с опит, постоянство и лично отношение.",
  alternates: { canonical: "/za-nas" },
  openGraph: {
    title: "За Бутик Емоция | История, създадена с внимание",
    description: "Повече от две десетилетия опит, лично отношение и подбрани булчински и официални рокли във Варна.",
    images: [{ url: "/storefront/boutique.png", width: 1537, height: 1023, alt: "Историята на Бутик Емоция" }],
  },
};

export default function StorefrontAboutPage() {
  return <AboutPage />;
}
