import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  accessoriesCollection,
  bridalCollection,
  formalCollection,
  type AccessoryCategory,
  type BridalSilhouette,
  type StorefrontCollection,
  type StorefrontCollectionProduct,
} from "./storefront-collections";

export type StorefrontSettings = {
  shop_name: string;
  default_seo_title: string | null;
  default_meta_description: string | null;
  contact_phone: string;
  contact_email: string;
  address: string;
  working_hours: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  maps_url: string;
};

export type StorefrontContent = {
  hero_title: string | null;
  hero_description: string | null;
  hero_image_path: string | null;
  about_title: string | null;
  about_content: string | null;
};

type PublicCategoryRow = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  sort_order: number;
};

type PublicImageRow = {
  storage_path: string;
  alt_text: string;
  sort_order: number;
  is_cover: boolean;
};

type PublicProductRow = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  product_code: string | null;
  sizes: string[] | null;
  color: string | null;
  material: string | null;
  collection: string | null;
  year: number | null;
  seo_title: string | null;
  meta_description: string | null;
  featured: boolean;
  sort_order: number;
  price?: number | string | null;
  silhouette?: string | null;
  accessory_category?: string | null;
  categories: { id: string; name: string; slug: string; active: boolean } | Array<{ id: string; name: string; slug: string; active: boolean }> | null;
  product_images: PublicImageRow[] | null;
};

export const storefrontContact = {
  address: "гр. Варна, бул. Вл. Варненчик 69",
  phone: "+359 888 66 89 77",
  email: "emocia_bg@abv.bg",
  hours: "Понеделник – Събота: 10:00 – 19:00",
};

export const fallbackStorefrontSettings: StorefrontSettings = {
  shop_name: "Бутик Емоция",
  default_seo_title: "Бутик Емоция | Булчински и вечерни рокли във Варна",
  default_meta_description: "Открийте булчински и вечерни рокли в Бутик Емоция, Варна.",
  contact_phone: storefrontContact.phone,
  contact_email: storefrontContact.email,
  address: storefrontContact.address,
  working_hours: storefrontContact.hours,
  instagram_url: "https://www.instagram.com/butik.emocia/",
  facebook_url: "https://www.facebook.com/p/%D0%91%D1%83%D1%82%D0%B8%D0%BA-%D0%95%D0%BC%D0%BE%D1%86%D0%B8%D1%8F-100021298455926/?locale=bg_BG",
  tiktok_url: "https://www.tiktok.com/@emocia_butik",
  maps_url: "https://www.google.com/maps/@43.2121619,27.905135,3a,75y,203.77h,89.3t/data=!3m7!1e1!3m5!1sNS2LLaGNZbpyqNezIFknNw!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D0.6998632793665251%26panoid%3DNS2LLaGNZbpyqNezIFknNw%26yaw%3D203.77218534537914!7i16384!8i8192?entry=ttu",
};

export const fallbackStorefrontContent: StorefrontContent = {
  hero_title: null,
  hero_description: null,
  hero_image_path: null,
  about_title: null,
  about_content: null,
};

export const STOREFRONT_CACHE_TAGS = {
  settings: "storefront-settings",
  content: "storefront-content",
  categories: "storefront-categories",
  products: "storefront-products",
} as const;

const STOREFRONT_CACHE_TTL_SECONDS = 60;

let publicClient: SupabaseClient | null = null;

function hasPublicConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function getPublicClient() {
  if (!hasPublicConfig()) return null;
  if (!publicClient) {
    publicClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
    );
  }
  return publicClient;
}

function optional(value: string | null | undefined, fallback: string) {
  return value?.trim() || fallback;
}

function isMissingStorefrontColumns(error: { code?: string; message?: string } | null) {
  return error?.code === "42703" || error?.code === "PGRST204" || Boolean(error?.message?.includes("tiktok_url") || error?.message?.includes("accessory_category") || error?.message?.includes("silhouette") || error?.message?.includes("price"));
}

function storefrontReadError(resource: string, message: string) {
  return new Error(`${resource} не могат да бъдат заредени: ${message}`);
}

async function loadStorefrontSettings(): Promise<StorefrontSettings> {
  const supabase = getPublicClient();
  if (!supabase) return fallbackStorefrontSettings;

  let settingsResult = await supabase
    .from("site_settings")
    .select("shop_name,default_seo_title,default_meta_description,contact_phone,contact_email,address,working_hours,instagram_url,facebook_url,tiktok_url,maps_url")
    .eq("id", true)
    .maybeSingle();

  if (isMissingStorefrontColumns(settingsResult.error)) {
    settingsResult = await supabase
      .from("site_settings")
      .select("shop_name,default_seo_title,default_meta_description,contact_phone,contact_email,address,working_hours,instagram_url,facebook_url,maps_url")
      .eq("id", true)
      .maybeSingle() as typeof settingsResult;
  }

  if (settingsResult.error) {
    throw storefrontReadError("Настройките на сайта", settingsResult.error.message);
  }

  const rawSettings = settingsResult.data as Partial<StorefrontSettings> | null;
  return {
    shop_name: optional(rawSettings?.shop_name, fallbackStorefrontSettings.shop_name),
    default_seo_title: rawSettings?.default_seo_title?.trim() || fallbackStorefrontSettings.default_seo_title,
    default_meta_description: rawSettings?.default_meta_description?.trim() || fallbackStorefrontSettings.default_meta_description,
    contact_phone: optional(rawSettings?.contact_phone, fallbackStorefrontSettings.contact_phone),
    contact_email: optional(rawSettings?.contact_email, fallbackStorefrontSettings.contact_email),
    address: optional(rawSettings?.address, fallbackStorefrontSettings.address),
    working_hours: optional(rawSettings?.working_hours, fallbackStorefrontSettings.working_hours),
    instagram_url: optional(rawSettings?.instagram_url, fallbackStorefrontSettings.instagram_url),
    facebook_url: optional(rawSettings?.facebook_url, fallbackStorefrontSettings.facebook_url),
    tiktok_url: optional(rawSettings?.tiktok_url, fallbackStorefrontSettings.tiktok_url),
    maps_url: optional(rawSettings?.maps_url, fallbackStorefrontSettings.maps_url),
  };
}

const getCachedStorefrontSettings = unstable_cache(
  loadStorefrontSettings,
  ["storefront-settings-v1"],
  { revalidate: STOREFRONT_CACHE_TTL_SECONDS, tags: [STOREFRONT_CACHE_TAGS.settings] },
);

async function loadStorefrontContent(): Promise<StorefrontContent> {
  const supabase = getPublicClient();
  if (!supabase) return fallbackStorefrontContent;

  const contentResult = await supabase
    .from("site_content")
    .select("hero_title,hero_description,hero_image_path,about_title,about_content")
    .eq("id", true)
    .maybeSingle();

  if (contentResult.error) {
    throw storefrontReadError("Съдържанието на сайта", contentResult.error.message);
  }

  return { ...fallbackStorefrontContent, ...(contentResult.data as StorefrontContent | null) };
}

const getCachedStorefrontContent = unstable_cache(
  loadStorefrontContent,
  ["storefront-content-v1"],
  { revalidate: STOREFRONT_CACHE_TTL_SECONDS, tags: [STOREFRONT_CACHE_TAGS.content] },
);

async function loadStorefrontCategories(): Promise<PublicCategoryRow[] | null> {
  const supabase = getPublicClient();
  if (!supabase) return null;

  const categoriesResult = await supabase
    .from("categories")
    .select("id,name,slug,active,sort_order")
    .eq("active", true)
    .order("sort_order");

  if (categoriesResult.error) {
    throw storefrontReadError("Категориите", categoriesResult.error.message);
  }

  return (categoriesResult.data ?? []) as PublicCategoryRow[];
}

const getCachedStorefrontCategories = unstable_cache(
  loadStorefrontCategories,
  ["storefront-categories-v2"],
  { revalidate: STOREFRONT_CACHE_TTL_SECONDS, tags: [STOREFRONT_CACHE_TAGS.categories] },
);

async function loadStorefrontProducts(): Promise<PublicProductRow[] | null> {
  const supabase = getPublicClient();
  if (!supabase) return null;

  const extendedProductColumns = "id,name,slug,short_description,description,product_code,sizes,color,material,collection,year,seo_title,meta_description,featured,sort_order,price,silhouette,accessory_category,categories!inner(id,name,slug,active),product_images(storage_path,alt_text,sort_order,is_cover)";
  const baseProductColumns = "id,name,slug,short_description,description,product_code,sizes,color,material,collection,year,seo_title,meta_description,featured,sort_order,categories!inner(id,name,slug,active),product_images(storage_path,alt_text,sort_order,is_cover)";

  let productsResult = await supabase
    .from("products")
    .select(extendedProductColumns)
    .eq("status", "published")
    .eq("categories.active", true)
    .order("sort_order")
    .order("sort_order", { referencedTable: "product_images" });

  if (isMissingStorefrontColumns(productsResult.error)) {
    productsResult = await supabase
      .from("products")
      .select(baseProductColumns)
      .eq("status", "published")
      .eq("categories.active", true)
      .order("sort_order")
      .order("sort_order", { referencedTable: "product_images" }) as typeof productsResult;
  }

  if (productsResult.error) {
    throw storefrontReadError("Продуктите", productsResult.error.message);
  }

  return (productsResult.data ?? []) as unknown as PublicProductRow[];
}

const getCachedStorefrontProducts = unstable_cache(
  loadStorefrontProducts,
  ["storefront-products-v2"],
  { revalidate: STOREFRONT_CACHE_TTL_SECONDS, tags: [STOREFRONT_CACHE_TAGS.products] },
);

export async function getStorefrontSettings() {
  return getCachedStorefrontSettings();
}

export async function getStorefrontContent() {
  return getCachedStorefrontContent();
}

const collectionAliases: Record<string, string[]> = {
  "bulchinski-rokli": ["bulchinski-rokli"],
  "oficialni-rokli": ["oficialni-rokli", "vecherni-rokli", "ofitsialni-rokli"],
  aksesoari: ["aksesoari"],
};

function isSilhouette(value: string | null | undefined): value is BridalSilhouette {
  return value === "a-line" || value === "mermaid" || value === "princess" || value === "straight";
}

function isAccessoryCategory(value: string | null | undefined): value is AccessoryCategory {
  return value === "veils" || value === "hair" || value === "jewellery" || value === "gloves" || value === "glasses" || value === "shoes" || value === "decorations";
}

function storageUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return path;
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/product-images/${encodedPath}`;
}

export function getStorefrontMediaUrl(path: string | null | undefined) {
  return path ? storageUrl(path) : null;
}

function categoryOf(product: PublicProductRow) {
  return Array.isArray(product.categories) ? product.categories[0] : product.categories;
}

function mapPublicProduct(row: PublicProductRow, fallback: StorefrontCollectionProduct | undefined): StorefrontCollectionProduct {
  const images = [...(row.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const cover = images.find((image) => image.is_cover) ?? images[0];
  const mappedImages = images.map((image) => ({ src: storageUrl(image.storage_path), alt: image.alt_text || row.name }));
  const parsedPrice = row.price === null || row.price === undefined || row.price === "" ? undefined : Number(row.price);

  return {
    ...fallback,
    id: row.id,
    name: row.name,
    slug: row.slug,
    image: cover ? storageUrl(cover.storage_path) : "",
    alt: cover?.alt_text || row.name,
    images: mappedImages,
    silhouette: isSilhouette(row.silhouette) ? row.silhouette : fallback?.silhouette,
    category: isAccessoryCategory(row.accessory_category) ? row.accessory_category : fallback?.category,
    price: Number.isFinite(parsedPrice) ? parsedPrice : fallback?.price,
    shortDescription: row.short_description?.trim() || fallback?.shortDescription,
    description: row.description?.trim() || fallback?.description,
    productCode: row.product_code?.trim() || fallback?.productCode,
    sizes: row.sizes?.length ? row.sizes : fallback?.sizes,
    color: row.color?.trim() || fallback?.color,
    material: row.material?.trim() || fallback?.material,
    collection: row.collection?.trim() || fallback?.collection,
    year: row.year ?? fallback?.year,
    seoTitle: row.seo_title?.trim() || fallback?.seoTitle,
    metaDescription: row.meta_description?.trim() || fallback?.metaDescription,
    featured: row.featured,
  };
}

export function buildStorefrontCollection(
  fallback: StorefrontCollection,
  categories: PublicCategoryRow[] | null,
  products: PublicProductRow[] | null,
): StorefrontCollection {
  if (categories === null || products === null) return fallback;

  const aliases = collectionAliases[fallback.slug] ?? [fallback.slug];
  const category = categories.find((item) => aliases.includes(item.slug));
  const rows = products
    .filter((product) => {
      const productCategory = categoryOf(product);
      return Boolean(productCategory?.active && aliases.includes(productCategory.slug));
    })
    .sort((a, b) => a.sort_order - b.sort_order);

  return {
    ...fallback,
    title: category?.name || fallback.title,
    products: rows.map((row) => mapPublicProduct(row, fallback.products.find((item) => item.slug === row.slug))),
  };
}

export async function getStorefrontCollection(fallback: StorefrontCollection): Promise<StorefrontCollection> {
  const [categories, products] = await Promise.all([
    getCachedStorefrontCategories(),
    getCachedStorefrontProducts(),
  ]);
  return buildStorefrontCollection(fallback, categories, products);
}

export async function getAllStorefrontCollections() {
  const [categories, products] = await Promise.all([
    getCachedStorefrontCategories(),
    getCachedStorefrontProducts(),
  ]);
  return [
    buildStorefrontCollection(bridalCollection, categories, products),
    buildStorefrontCollection(formalCollection, categories, products),
    buildStorefrontCollection(accessoriesCollection, categories, products),
  ] as const;
}
