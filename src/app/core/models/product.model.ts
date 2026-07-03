/** Product entity model for MISS-Frontend */
export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  slug?: string;
  description?: string;
  category?: string;
  categoryId?: string | null;
  categoryName?: string;
  brand?: string;
  manufacturer?: string;
  presentation?: string;
  unitOfMeasure?: string;
  salePrice: number;
  purchasePrice?: number | null;
  taxProfileId: string;
  taxProfileName?: string;
  pricesIncludeTax?: boolean;
  taxRate?: number;
  minStock: number;
  maxStock?: number | null;
  requiresPrescription?: boolean;
  isControlled?: boolean;
  isActive: boolean;
  active: boolean;
  currentStock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  salePrice: number;
  minStock: number;
  taxProfileId: string;
  barcode?: string;
  slug?: string;
  description?: string;
  category?: string;
  categoryId?: string | null;
  brand?: string;
  manufacturer?: string;
  presentation?: string;
  unitOfMeasure?: string;
  purchasePrice?: number;
  pricesIncludeTax?: boolean;
  taxRate?: number;
  maxStock?: number;
  requiresPrescription?: boolean;
  isControlled?: boolean;
  isActive?: boolean;
}

export interface UpdateProductDto {
  sku?: string;
  name?: string;
  salePrice?: number;
  minStock?: number;
  taxProfileId?: string;
  barcode?: string;
  slug?: string;
  description?: string;
  category?: string;
  categoryId?: string | null;
  brand?: string;
  manufacturer?: string;
  presentation?: string;
  unitOfMeasure?: string;
  purchasePrice?: number;
  pricesIncludeTax?: boolean;
  taxRate?: number;
  maxStock?: number;
  requiresPrescription?: boolean;
  isControlled?: boolean;
  isActive?: boolean;
}

/** Real backend query contract for products */
export interface ProductSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string | number;
  isActive?: boolean;
}
