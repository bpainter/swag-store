"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addItem, ensureCart, getCart, removeItem, updateItem } from "@/lib/api/cart";

// Server actions are public endpoints; the 1..100 cap is defense-in-depth
// regardless of what the UI sends.
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

  return { success: true };
}

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
}

const RemoveSchema = z.object({ itemId: z.string().min(1) });

export async function removeItemAction(itemId: string): Promise<void> {
  const parsed = RemoveSchema.safeParse({ itemId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  await removeItem(parsed.data.itemId);
}

// The API has no bulk-clear endpoint; remove one at a time. Per-item errors
// are swallowed so a partial-clear state still ends up consistent after
// revalidation.
export async function clearCartAction(): Promise<void> {
  const cart = await getCart();
  if (!cart) return;

  for (const item of cart.items) {
    try {
      await removeItem(item.productId);
    } catch {
      // see top-of-function comment
    }
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}
