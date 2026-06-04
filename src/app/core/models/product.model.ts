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

/** DTO for creating a product (server may omit id, timestamps) */
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

/** DTO for updating a product */
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

/** Search params for the products search endpoint */
export interface ProductSearchParams {
  query?: string;
  sku?: string;
  barcode?: string;
  active?: boolean;
}
