import { Suspense } from "react";
import { getFeaturedProducts } from "@/lib/api/products";
import { getProduct } from "@/lib/api/products";
import { searchProducts } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { getStoreConfig } from "@/lib/api/config";
import { getStock } from "@/lib/api/stock";
import { getActivePromotion } from "@/lib/api/promotions";

// ---------------------------------------------------------------------------
// Cached endpoint components
// ---------------------------------------------------------------------------

async function FeaturedProductsResult() {
  const products = await getFeaturedProducts();
  return (
    <details>
      <summary>getFeaturedProducts()</summary>
      <pre>{JSON.stringify(products, null, 2)}</pre>
    </details>
  );
}

async function ProductResult() {
  const product = await getProduct("black-crewneck-t-shirt");
  return (
    <details>
      <summary>getProduct("black-crewneck-t-shirt")</summary>
      <pre>{JSON.stringify(product, null, 2)}</pre>
    </details>
  );
}

async function SearchResult() {
  const result = await searchProducts({ q: "tee", limit: 5 });
  return (
    <details>
      <summary>searchProducts({"{ q: \"tee\", limit: 5 }"})</summary>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </details>
  );
}

async function CategoriesResult() {
  const categories = await getCategories();
  return (
    <details>
      <summary>getCategories()</summary>
      <pre>{JSON.stringify(categories, null, 2)}</pre>
    </details>
  );
}

async function StoreConfigResult() {
  const config = await getStoreConfig();
  return (
    <details>
      <summary>getStoreConfig()</summary>
      <pre>{JSON.stringify(config, null, 2)}</pre>
    </details>
  );
}

// ---------------------------------------------------------------------------
// Dynamic endpoint components (must be wrapped in <Suspense>)
// ---------------------------------------------------------------------------

async function StockResult() {
  const stock = await getStock("black-crewneck-t-shirt");
  return (
    <details>
      <summary>getStock("black-crewneck-t-shirt") — dynamic</summary>
      <pre>{JSON.stringify(stock, null, 2)}</pre>
    </details>
  );
}

async function PromotionResult() {
  const promo = await getActivePromotion();
  return (
    <details>
      <summary>getActivePromotion() — dynamic</summary>
      <pre>{JSON.stringify(promo, null, 2)}</pre>
    </details>
  );
}

// ---------------------------------------------------------------------------
// Page — not marked "use cache" because it renders dynamic (Suspense) content
// ---------------------------------------------------------------------------

export default async function ApiTestPage() {
  // Fetch all cached endpoints in parallel
  const [featured, product, search, categories, config] = await Promise.all([
    getFeaturedProducts(),
    getProduct("black-crewneck-t-shirt"),
    searchProducts({ q: "tee", limit: 5 }),
    getCategories(),
    getStoreConfig(),
  ]);

  return (
    <main style={{ fontFamily: "monospace", padding: "2rem" }}>
      <h1>API Smoke Test</h1>
      <p>
        <strong>Environment:</strong> {process.env.NODE_ENV}
      </p>

      <h2>Cached endpoints</h2>

      <details>
        <summary>getFeaturedProducts()</summary>
        <pre>{JSON.stringify(featured, null, 2)}</pre>
      </details>

      <details>
        <summary>getProduct("black-crewneck-t-shirt")</summary>
        <pre>{JSON.stringify(product, null, 2)}</pre>
      </details>

      <details>
        <summary>{`searchProducts({ q: "tee", limit: 5 })`}</summary>
        <pre>{JSON.stringify(search, null, 2)}</pre>
      </details>

      <details>
        <summary>getCategories()</summary>
        <pre>{JSON.stringify(categories, null, 2)}</pre>
      </details>

      <details>
        <summary>getStoreConfig()</summary>
        <pre>{JSON.stringify(config, null, 2)}</pre>
      </details>

      <h2>Dynamic endpoints</h2>

      <Suspense fallback={<p>Loading dynamic results…</p>}>
        <StockResult />
        <PromotionResult />
      </Suspense>
    </main>
  );
}
