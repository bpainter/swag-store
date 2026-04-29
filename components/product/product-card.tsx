import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/api/types";
import { formatCents } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  return (
    <li>
      <Link href={`/products/${product.slug}`}>
        <Image src={product.images[0]} alt={product.name} width={400} height={400} />
        <p>{product.name}</p>
        <p>{formatCents(product.price, product.currency)}</p>
      </Link>
    </li>
  );
}
