export type BridalSilhouette = "a-line" | "mermaid" | "princess" | "straight";
export type AccessoryCategory = "veils" | "hair" | "jewellery" | "gloves" | "glasses" | "shoes" | "decorations";

export type StorefrontCollectionProduct = {
  name: string;
  slug: string;
  image: string;
  alt: string;
  silhouette?: BridalSilhouette;
  category?: AccessoryCategory;
  price?: number;
};

export type StorefrontCollection = {
  kind: "dresses" | "accessories";
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  heroImage: string;
  heroAlt: string;
  products: StorefrontCollectionProduct[];
};

export const bridalCollection: StorefrontCollection = {
  kind: "dresses",
  slug: "bulchinski-rokli",
  eyebrow: "Колекция 2026",
  title: "Булчински рокли",
  description: "Силуети, подбрани с внимание към движението, материята и усещането, което остава ваше.",
  heroImage: "/storefront/category-bridal.jpg",
  heroAlt: "Булка с елегантна рокля от колекцията на Бутик Емоция",
  products: [
    { name: "Рокля Линкълн", slug: "lincoln", image: "/storefront/product-lincoln.jpg", alt: "Булчинска рокля Линкълн", silhouette: "princess" },
    { name: "Рокля Ниа", slug: "nia", image: "/storefront/product-nia.jpg", alt: "Булчинска рокля Ниа", silhouette: "straight" },
    { name: "Рокля Арло", slug: "arlo", image: "/storefront/product-arlo.jpg", alt: "Булчинска рокля Арло", silhouette: "a-line" },
    { name: "Рокля Лоу", slug: "lowe", image: "/storefront/product-lowe.jpg", alt: "Булчинска рокля Лоу", silhouette: "princess" },
    { name: "Рокля Престън", slug: "preston", image: "/storefront/product-preston.jpg", alt: "Булчинска рокля Престън", silhouette: "mermaid" },
    { name: "Рокля Уилис", slug: "willis", image: "/storefront/product-willis.jpg", alt: "Булчинска рокля Уилис", silhouette: "a-line" },
    { name: "Рокля Емери", slug: "emery", image: "/storefront/product-emery.jpg", alt: "Булчинска рокля Емери", silhouette: "mermaid" },
    { name: "Рокля Аврора", slug: "aurora", image: "/storefront/product-lincoln.jpg", alt: "Булчинска рокля Аврора", silhouette: "princess" },
    { name: "Рокля Селин", slug: "celine", image: "/storefront/product-nia.jpg", alt: "Булчинска рокля Селин", silhouette: "straight" },
    { name: "Рокля Елиза", slug: "eliza", image: "/storefront/product-arlo.jpg", alt: "Булчинска рокля Елиза", silhouette: "a-line" },
    { name: "Рокля Ливия", slug: "livia", image: "/storefront/product-lowe.jpg", alt: "Булчинска рокля Ливия", silhouette: "princess" },
    { name: "Рокля Марсел", slug: "marcel", image: "/storefront/product-preston.jpg", alt: "Булчинска рокля Марсел", silhouette: "mermaid" },
    { name: "Рокля Ноел", slug: "noelle", image: "/storefront/product-willis.jpg", alt: "Булчинска рокля Ноел", silhouette: "a-line" },
    { name: "Рокля Оливия", slug: "olivia", image: "/storefront/product-emery.jpg", alt: "Булчинска рокля Оливия", silhouette: "mermaid" },
    { name: "Рокля Розали", slug: "rosalie", image: "/storefront/product-lincoln.jpg", alt: "Булчинска рокля Розали", silhouette: "princess" },
    { name: "Рокля Сиена", slug: "sienna", image: "/storefront/product-nia.jpg", alt: "Булчинска рокля Сиена", silhouette: "straight" },
    { name: "Рокля Теа", slug: "thea", image: "/storefront/product-arlo.jpg", alt: "Булчинска рокля Теа", silhouette: "a-line" },
    { name: "Рокля Валентина", slug: "valentina", image: "/storefront/product-lowe.jpg", alt: "Булчинска рокля Валентина", silhouette: "princess" },
    { name: "Рокля Виола", slug: "viola", image: "/storefront/product-preston.jpg", alt: "Булчинска рокля Виола", silhouette: "mermaid" },
    { name: "Рокля Зара", slug: "zara", image: "/storefront/product-willis.jpg", alt: "Булчинска рокля Зара", silhouette: "straight" },
  ],
};

export const formalCollection: StorefrontCollection = {
  kind: "dresses",
  slug: "oficialni-rokli",
  eyebrow: "Нова селекция",
  title: "Официални рокли",
  description: "Елегантни модели за балове, сватби и специални вечери, подбрани с внимание към силуета и движението.",
  heroImage: "/storefront/gallery/client-04.webp",
  heroAlt: "Елегантна официална рокля от селекцията на Бутик Емоция",
  products: [
    { name: "Рокля Амалия", slug: "amalia", image: "/storefront/gallery/client-03.webp", alt: "Официална рокля Амалия", silhouette: "straight" },
    { name: "Рокля Селеста", slug: "celesta", image: "/storefront/gallery/client-04.webp", alt: "Официална рокля Селеста", silhouette: "mermaid" },
    { name: "Рокля Елиана", slug: "eliana", image: "/storefront/gallery/client-05.webp", alt: "Официална рокля Елиана", silhouette: "straight" },
    { name: "Рокля Изабел", slug: "isabel", image: "/storefront/gallery/client-06.webp", alt: "Официална рокля Изабел", silhouette: "mermaid" },
    { name: "Рокля Лорена", slug: "lorena", image: "/storefront/gallery/client-07.webp", alt: "Официална рокля Лорена", silhouette: "a-line" },
    { name: "Рокля Ноеми", slug: "noemi", image: "/storefront/gallery/client-10.webp", alt: "Официална рокля Ноеми", silhouette: "straight" },
    { name: "Рокля Рафаела", slug: "rafaela", image: "/storefront/gallery/client-11.webp", alt: "Официална рокля Рафаела", silhouette: "mermaid" },
    { name: "Рокля Сабрина", slug: "sabrina", image: "/storefront/gallery/client-12.webp", alt: "Официална рокля Сабрина", silhouette: "straight" },
    { name: "Рокля Виолета", slug: "violeta", image: "/storefront/gallery/client-13.webp", alt: "Официална рокля Виолета", silhouette: "a-line" },
  ],
};

export const accessoriesCollection: StorefrontCollection = {
  kind: "accessories",
  slug: "aksesoari",
  eyebrow: "Финални детайли",
  title: "Аксесоари",
  description: "Подбрани акценти, които завършват визията ви с лекота и лично усещане.",
  heroImage: "/storefront/gallery/client-08.webp",
  heroAlt: "Булчински аксесоари от селекцията на Бутик Емоция",
  products: [
    { name: "Воал Ефир", slug: "voal-efir", image: "/storefront/gallery/client-01.webp", alt: "Булчински воал Ефир", category: "veils", price: 149 },
    { name: "Тиара Луна", slug: "tiara-luna", image: "/storefront/gallery/client-02.webp", alt: "Булчинска тиара Луна", category: "hair", price: 89 },
    { name: "Фиба Перла", slug: "fiba-perla", image: "/storefront/gallery/client-08.webp", alt: "Булчинска фиба Перла", category: "hair", price: 49 },
    { name: "Колие Сияние", slug: "kolie-siyanie", image: "/storefront/gallery/client-03.webp", alt: "Елегантно колие Сияние", category: "jewellery", price: 79 },
    { name: "Обеци Аурора", slug: "obeci-aurora", image: "/storefront/gallery/client-04.webp", alt: "Елегантни обеци Аурора", category: "jewellery", price: 59 },
    { name: "Ръкавици Селин", slug: "rukavici-celine", image: "/storefront/gallery/client-07.webp", alt: "Булчински ръкавици Селин", category: "gloves", price: 69 },
  ],
};

export const accessoryCategoryLabels: Record<AccessoryCategory, string> = {
  veils: "Воали",
  hair: "Украси за коса",
  jewellery: "Обеци и бижута",
  gloves: "Ръкавици",
  glasses: "Чаши",
  shoes: "Обувки",
  decorations: "Украси",
};

export function formatStorefrontPrice(price?: number) {
  if (price === undefined) return null;
  return `${new Intl.NumberFormat("bg-BG", { maximumFractionDigits: 0 }).format(price)} лв.`;
}
