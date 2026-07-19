export type StorefrontProduct = {
  name: string;
  price: string;
  image: string;
};

export const storefrontProducts: StorefrontProduct[] = [
  { name: "Рокля Линкълн", price: "11 990 лв.", image: "/storefront/product-lincoln.jpg" },
  { name: "Рокля Ниа", price: "9 990 лв.", image: "/storefront/product-nia.jpg" },
  { name: "Арло", price: "8 190 лв.", image: "/storefront/product-arlo.jpg" },
  { name: "Пола Лоу", price: "8 190 лв.", image: "/storefront/product-lowe.jpg" },
  { name: "Рокля Престън", price: "9 490 лв.", image: "/storefront/product-preston.jpg" },
  { name: "Рокля Уилис", price: "10 290 лв.", image: "/storefront/product-willis.jpg" },
  { name: "Рокля Емери", price: "8 990 лв.", image: "/storefront/product-emery.jpg" },
];

export const storefrontContact = {
  address: "гр. Варна, бул. Вл. Варненчик 69",
  phone: "+359 898 87 89 08",
  email: "emociabg@abv.bg",
  hours: "Понеделник – Събота: 10:00 – 19:00",
};
