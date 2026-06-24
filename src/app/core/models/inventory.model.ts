/** Inventory entity models for MISS-Frontend */

/** Stock record per product from GET /inventory/stock */
export interface InventoryStock {
  productId: string | number;
  productName: string;
  sku: string;
  barcode?: string;
  totalStock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  lots: InventoryLot[];
  nextExpiryDate?: string;
}

/** Individual lot/tracking record */
export interface InventoryLot {
  id: string;
  productId: string | number;
  quantity: number;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
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
export interface KardexMovement {
  id: string;
  productId: string | number;
  productName: string;
  sku: string;
  type: 'ENTRY' | 'ADJUSTMENT' | 'SALE' | 'CONSUMPTION' | 'RETURN';
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;
  unitCost?: number;
  batchNumber?: string;
  reference?: string;
  note?: string;
  performedBy?: string;
  createdAt: string;
}

/** Query params for kardex endpoint */
export interface KardexQueryParams {
  page?: number;
  limit?: number;
  type?: string;
}
