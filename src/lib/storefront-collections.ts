export type BridalSilhouette = "a-line" | "mermaid" | "princess" | "straight";

export type StorefrontCollectionProduct = {
  name: string;
  slug: string;
  image: string;
  alt: string;
  silhouette?: BridalSilhouette;
};

export type StorefrontCollection = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  heroImage: string;
  heroAlt: string;
  products: StorefrontCollectionProduct[];
};

export const bridalCollection: StorefrontCollection = {
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
