import { describe, expect, it } from "vitest";
import { siteContentSchema, siteSettingsSchema } from "./schemas";

describe("site settings validation", () => {
  it("accepts the CMS settings payload", () => {
    expect(siteSettingsSchema.safeParse({
      shop_name: "Емоция", address: "", working_hours: "", contact_phone: "", contact_email: "",
      instagram_url: "", facebook_url: "", maps_url: "", default_seo_title: "", default_meta_description: "",
    }).success).toBe(true);
  });

  it("keeps the default SEO limits", () => {
    expect(siteSettingsSchema.safeParse({
      shop_name: "Емоция", address: "", working_hours: "", contact_phone: "", contact_email: "",
      instagram_url: "", facebook_url: "", maps_url: "", default_seo_title: "x".repeat(61), default_meta_description: "",
    }).success).toBe(false);
  });
});

describe("site content validation", () => {
  it("contains only editorial copy fields", () => {
    const parsed = siteContentSchema.parse({ hero_title: "Начало", hero_description: "Описание", about_title: "За нас", about_content: "Текст" });
    expect(Object.keys(parsed)).toEqual(["hero_title", "hero_description", "about_title", "about_content"]);
  });
});
