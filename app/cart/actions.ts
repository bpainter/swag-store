"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addItem, ensureCart, removeItem, updateItem } from "@/lib/api/cart";

// FormData values arrive as strings, so quantity is coerced. The 1..100 cap is
// a defense-in-depth bound — the UI's quantity selector will be tighter still,
// but server actions are public endpoints and must validate on their own.
const AddSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(100),
});

type AddState = { error?: string; success?: boolean } | undefined;

export async function addToCartAction(
  prev: AddState,
  formData: FormData,
): Promise<AddState> {
  const parsed = AddSchema.safeParse({
    productId: formData.get("productId"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await ensureCart();
  await addItem(parsed.data.productId, parsed.data.quantity);

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { success: true };
}

// updateQuantity / remove are called directly from form actions or click
// handlers (no useActionState wrapper), so they don't take a prev-state arg.
const UpdateSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(0),
});

export async function updateQuantityAction(
  itemId: string,
  quantity: number,
): Promise<void> {
  const parsed = UpdateSchema.safeParse({ itemId, quantity });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  if (parsed.data.quantity === 0) {
    await removeItem(parsed.data.itemId);
  } else {
    await updateItem(parsed.data.itemId, parsed.data.quantity);
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

const RemoveSchema = z.object({ itemId: z.string().min(1) });

export async function removeItemAction(itemId: string): Promise<void> {
  const parsed = RemoveSchema.safeParse({ itemId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  await removeItem(parsed.data.itemId);

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}
