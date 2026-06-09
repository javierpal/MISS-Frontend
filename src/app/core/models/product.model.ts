/** Product entity model for MISS-Frontend */
export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  categoryId: number | null;
  categoryName?: string;
  taxProfileId: number;
  taxProfileName?: string;
  salePrice: number;
  costPrice?: number;
  minStock: number;
  currentStock?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  sku: string;
  barcode: string;
  categoryId: number | null;
  taxProfileId: number;
  salePrice: number;
  costPrice?: number;
  minStock: number;
}

export interface UpdateProductDto {
  name?: string;
  sku?: string;
  barcode?: string;
  categoryId?: number | null;
  taxProfileId?: number;
  salePrice?: number;
  costPrice?: number;
  minStock?: number;
  active?: boolean;
}

/** Real backend query contract for products */
export interface ProductSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string | number;
  isActive?: boolean;
}
