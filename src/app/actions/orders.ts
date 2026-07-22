"use server";

import { accessoriesCollection } from "@/lib/storefront-collections";
import { orderRequestSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";

export type OrderRequestState = { error?: string; success?: string; id?: string };

const text = (form: FormData, key: string) => String(form.get(key) ?? "");

export async function submitOrderRequest(form: FormData): Promise<OrderRequestState> {
  const parsed = orderRequestSchema.safeParse({
    name: text(form, "name"),
    phone: text(form, "phone"),
    delivery_details: text(form, "delivery_details"),
    message: text(form, "message"),
    product_slug: text(form, "product_slug"),
    website: text(form, "website"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (parsed.data.website) return { success: "Получихме вашата заявка." };

  const product = accessoriesCollection.products.find((item) => item.slug === parsed.data.product_slug);
  if (!product || product.price === undefined) return { error: "Този артикул вече не е наличен за поръчка." };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("submit_order_request", {
      p_name: parsed.data.name,
      p_phone: parsed.data.phone,
      p_delivery_details: parsed.data.delivery_details,
      p_message: parsed.data.message || null,
      p_product_slug: product.slug,
      p_product_name: product.name,
      p_unit_price: product.price,
    });

    if (error) {
      if (error.message.includes("rate_limit")) return { error: "Изпратихте няколко заявки. Изчакайте малко и опитайте отново." };
      if (error.code === "PGRST202" || error.code === "42883") return { error: "Поръчките временно не са настроени." };
      return { error: "Заявката не можа да бъде изпратена. Опитайте отново." };
    }

    return {
      id: String(data),
      success: "Получихме заявката. Ще ви се обадим, за да потвърдим наличността, доставката и крайната сума.",
    };
  } catch {
    return { error: "Заявката не можа да бъде изпратена. Опитайте отново." };
  }
}
