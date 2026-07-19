import { describe, expect, it } from "vitest";
import { productCopyInputSchema, productCopyOutputSchema } from "./product-copy";
import { beginAiRequest, finishAiRequest } from "./rate-limit";

const validOutput = {
  title: "Булчинска рокля Тест",
  shortDescription: "Елегантен булчински модел с изчистено излъчване, създаден за спокойна и естествена визия в специалния ден.",
  description: "Моделът следва изчистена линия и поставя фокус върху цялостния силует. Описанието използва само предоставените продуктови данни.\n\nЗа повече информация и консултация посетете бутик „Емоция“.",
  altText: "Булчинска рокля Тест в бяло",
  seoTitle: "Булчинска рокля Тест | Бутик Емоция София",
  seoDescription: "Разгледайте булчинска рокля Тест в бутик „Емоция“. Изчистен модел за булчинска визия, представен с ясна и полезна продуктова информация.",
  keywords: ["булчинска рокля", "бутик Емоция"],
};

describe("AI product copy schemas", () => {
  it("requires a product name and category", () => {
    expect(productCopyInputSchema.safeParse({ name: "", categoryName: "" }).success).toBe(false);
  });

  it("accepts valid structured Bulgarian output", () => {
    expect(productCopyOutputSchema.safeParse(validOutput).success).toBe(true);
  });

  it("rejects oversized SEO fields", () => {
    expect(productCopyOutputSchema.safeParse({ ...validOutput, seoTitle: "A".repeat(61), seoDescription: "B".repeat(161) }).success).toBe(false);
  });
});

describe("AI request limiting", () => {
  it("blocks a parallel request and releases the lock", () => {
    const userId = crypto.randomUUID();
    expect(beginAiRequest(userId)).toBe("acquired");
    expect(beginAiRequest(userId)).toBe("active");
    finishAiRequest(userId);
    expect(beginAiRequest(userId)).toBe("acquired");
    finishAiRequest(userId);
  });
});
