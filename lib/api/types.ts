// Hand-authored types from the OpenAPI spec (components.schemas).
// Prices are in cents (USD). Dates are ISO 8601 strings.

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** Price in cents */
  price: number;
  currency: string;
  category: string;
  images: string[];
  /** Whether this product is featured on the homepage */
  featured: boolean;
  tags: string[];
  /** ISO 8601 date-time */
  createdAt: string;
}

export interface StockInfo {
  productId: string;
  /** Current stock quantity (changes on every request) */
  stock: number;
  inStock: boolean;
  /** True when stock is between 1 and 5 */
  lowStock: boolean;
}

export interface Category {
  slug: string;
  name: string;
  productCount: number;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  code: string;
  /** ISO 8601 date-time */
  validFrom: string;
  /** ISO 8601 date-time */
  validUntil: string;
  active: boolean;
}

export interface CartItemWithProduct {
  productId: string;
  quantity: number;
  /** ISO 8601 date-time */
  addedAt: string;
  product: Product;
  /** price * quantity in cents */
  lineTotal: number;
}

export interface CartWithProducts {
  token: string;
  items: CartItemWithProduct[];
  totalItems: number;
  /** Total in cents */
  subtotal: number;
  currency: string;
  /** ISO 8601 date-time */
  createdAt: string;
  /** ISO 8601 date-time */
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface StoreConfig {
  storeName: string;
  currency: string;
  features: {
    wishlist: boolean;
    productComparison: boolean;
    reviews: boolean;
    liveChat: boolean;
    recentlyViewed: boolean;
  };
  socialLinks: {
    twitter?: string;
    github?: string;
    discord?: string;
  };
  seo: {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
  };
}

// Request bodies

export interface AddToCartRequest {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  /** Set to 0 to remove the item */
  quantity: number;
}

// API envelope shapes (used internally by swagFetch, not exposed to callers)

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
