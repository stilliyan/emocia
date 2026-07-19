import { z } from "zod";

export const productCopyInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  categoryName: z.string().trim().min(2).max(100),
  shortDescription: z.string().trim().max(320).default(""),
  description: z.string().trim().max(5000).default(""),
  color: z.string().trim().max(100).default(""),
  material: z.string().trim().max(160).default(""),
  sizes: z.string().trim().max(300).default(""),
  collection: z.string().trim().max(120).default(""),
  year: z.string().trim().max(4).default(""),
  featured: z.boolean().default(false),
  seoTitle: z.string().trim().max(60).default(""),
  seoDescription: z.string().trim().max(160).default(""),
  imageContext: z.array(z.string().trim().max(200)).max(20).default([]),
});

export const productCopyOutputSchema = z.object({
  title: z.string().trim().min(2).max(160),
  shortDescription: z.string().trim().min(80).max(240),
  description: z.string().trim().min(80).max(3000),
  altText: z.string().trim().min(5).max(160),
  seoTitle: z.string().trim().min(20).max(60),
  seoDescription: z.string().trim().min(80).max(160),
  keywords: z.array(z.string().trim().min(2).max(50)).max(10),
});

export type ProductCopyInput = z.infer<typeof productCopyInputSchema>;
export type ProductCopyOutput = z.infer<typeof productCopyOutputSchema>;

export const PRODUCT_COPY_SYSTEM_PROMPT = `Пишеш естествени продуктови текстове на български за бутика за булчински и официални рокли „Емоция“.
Използвай само предоставените данни. Не измисляй характеристики, материали, размери, кройка, декорации, наличност, произход, сертификати или други факти.
Ако има имена или alt текстове на изображения, използвай ги само като текстов контекст. Не твърди, че си анализирал изображение.
Тонът е елегантен, професионален, бутиков и ясен. Без emoji, markdown, кухи клишета, прекалени суперлативи или неаргументирани обещания.
Не използвай фразите „уникално изживяване“, „високо качество“ и „перфектният избор“, освен ако предоставените данни реално ги доказват.
Не споменавай цена, наличност или доставка, освен ако са изрично предоставени.
Не повтаряй една и съща информация в краткото и пълното описание.
Заглавието е ясно и конкретно. Краткото описание е приблизително 120–220 знака. Пълното описание е 2–4 кратки абзаца.
SEO заглавието е около 50–60 знака и никога над 60. SEO описанието е около 140–160 знака и никога над 160.
Alt текстът описва продукта естествено без keyword stuffing. Keywords са кратки и релевантни.
Върни само валиден JSON, който съответства точно на зададената схема.`;

