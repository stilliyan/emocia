import type { Metadata } from "next";
import { ContactPage } from "@/components/storefront/contact-page";

export const metadata: Metadata = {
  title: "Контакти | Бутик Емоция",
  description: "Свържете се с Бутик Емоция във Варна, запазете час за проба и намерете адрес, телефон и работно време.",
  openGraph: {
    title: "Контакти | Бутик Емоция",
    description: "Запазете час за лична проба в Бутик Емоция във Варна.",
    images: ["/storefront/contact-hero.webp"],
  },
};

export default function ContactsPage() {
  return <ContactPage />;
}
