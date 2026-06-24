/** Inventory entity models for MISS-Frontend */

/** Product wrapper returned by GET /inventory/stock */
export interface InventoryProduct {
  id: string;
  sku: string;
  name: string;
  isActive: boolean;
}

/** Stock record per product from GET /inventory/stock */
export interface InventoryStock {
  product: InventoryProduct;
  stock: number;
  activeLots: number;
}

/** Single product stock from GET /inventory/stock/:productId */
export interface ProductStockResponse {
  product: InventoryProduct;
  stock: number;
  activeLots: number;
  message?: string;
}


/** Create an inventory entry (stock increase) */
export interface CreateInventoryEntryDto {
  productId: string | number;
  quantity: number;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: string;
  reference?: string;
  note?: string;
}

/** Manual inventory adjustment (can be positive or negative) */
export interface CreateInventoryAdjustmentDto {
  productId: string | number;
  adjustment: number; // positive = add, negative = remove
  reason: string; // mandatory
  reference?: string;
  note?: string;
}

/** Single kardex movement record */
export interface KardexLot {
  id: string;
  receivedAt: string;
}

export interface KardexMovement {
  id: string;
  productId: string;
  lotId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  unitCost?: number;
  note?: string | null;
  createdAt: string;
  lot: KardexLot;
}

export interface KardexProduct {
  id: string;
  sku: string;
  name: string;
  isActive: boolean;
}

export interface KardexFilters {
  type: string | null;
  from: string | null;
  to: string | null;
}

export interface KardexSortMeta {
  createdAt: 'asc' | 'desc';
}

export interface KardexMeta {
  total: number;
  sort: KardexSortMeta;
}

export interface KardexResponse {
  product: KardexProduct;
  filters: KardexFilters;
  data: KardexMovement[];
  meta: KardexMeta;
  message: string;
}

/** Query params for kardex endpoint (all optional, no pagination) */
export interface KardexQueryParams {
  type?: 'IN' | 'OUT' | 'ADJUSTMENT';
  from?: string;
  to?: string;
}

/** Query params for paginated stock endpoint */
export interface StockQueryParams {
  page?: number;
  limit?: number;
}

/** Paginated stock response with metadata */
export interface StockPaginatedResponse {
  data: InventoryStock[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Inventory lot record from GET /inventory */
export interface InventoryLot {
  id: string;
  productId: string | number;
  product: InventoryProduct;
  batchNumber?: string;
  expirationDate?: string;
  quantityReceived: number;
  quantityAvailable: number;
  unitCost: number;
  receivedAt?: string;
  createdAt: string;
  purchase?: unknown;
}

/** Query params for GET /inventory */
export interface InventoryQueryParams {
  page?: number;
  limit?: number;
  name?: string;
  productId?: string;
}

/** Paginated inventory lot response */
export interface InventoryPaginatedResponse {
  data: InventoryLot[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    filters: {
      name: string | null;
      productId: string | null;
    };
  };
}
