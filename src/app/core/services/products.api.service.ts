/** Map tax profile name to tax rate percentage */
function mapTaxProfileRate(taxProfileName?: string): number {
  if (!taxProfileName) return 0.16; // default fallback
  const name = taxProfileName.toUpperCase();
  if (name.includes('EXENTO')) return 0;
  if (name.includes('0') && name.includes('GENERAL')) return 0;
  if (name.includes('8')) return 0.08;
  if (name.includes('16')) return 0.16;
  return 0.16; // default fallback
}

import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiClientService } from './api-client.service';
import { PageParams, PaginatedResponse } from '../models/pagination.model';
import { Product, CreateProductDto, UpdateProductDto, ProductSearchParams } from '../models/product.model';

/** Map backend product response to frontend model */
function mapProduct(raw: any): Product {
  return {
    id: raw.id,
    sku: raw.sku,
    barcode: raw.barcode,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    category: raw.category,
    categoryId: raw.categoryId,
    categoryName: raw.categoryName,
    brand: raw.brand,
    manufacturer: raw.manufacturer,
    presentation: raw.presentation,
    unitOfMeasure: raw.unitOfMeasure,
    salePrice: Number(raw.salePrice),
    purchasePrice: raw.purchasePrice !== null && raw.purchasePrice !== undefined ? Number(raw.purchasePrice) : undefined,
    taxProfileId: raw.taxProfileId,
    taxProfileName: raw.taxProfileName,
    pricesIncludeTax: raw.pricesIncludeTax ?? false,
    taxRate: raw.taxProfile?.rate != null ? Number(raw.taxProfile.rate) : mapTaxProfileRate(raw.taxProfile?.code ?? raw.taxProfileName),
    minStock: Number(raw.minStock),
    maxStock: raw.maxStock !== null && raw.maxStock !== undefined ? Number(raw.maxStock) : undefined,
    requiresPrescription: raw.requiresPrescription ?? false,
    isControlled: raw.isControlled ?? false,
    isActive: raw.isActive ?? true,
    active: raw.isActive ?? true,
    currentStock: raw.currentStock !== undefined ? Number(raw.currentStock) : undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private api = inject(ApiClientService);

  list(params?: PageParams): Observable<PaginatedResponse<Product>> {
    return this.api.getPaginatedAdapted<any>('products', params).pipe(
      map((response) => ({
        ...response,
        items: response.items.map(mapProduct),
      }))
    );
  }

  getAll(): Observable<Product[]> {
    return this.api.get<any[]>('products').pipe(
      map((items) => items.map(mapProduct))
    );
  }

  getById(id: number | string): Observable<Product> {
    return this.api.get<any>(`products/${id}`).pipe(map(mapProduct));
  }

  create(body: CreateProductDto): Observable<Product> {
    return this.api.post<any>('products', body).pipe(map(mapProduct));
  }

  update(id: number | string, body: UpdateProductDto): Observable<Product> {
    return this.api.put<any>(`products/${id}`, body).pipe(map(mapProduct));
  }

  patch(id: number | string, body: UpdateProductDto): Observable<Product> {
    return this.api.patch<any>(`products/${id}`, body).pipe(map(mapProduct));
  }

  delete(id: number | string): Observable<void> {
    return this.api.delete<void>(`products/${id}`);
  }

  search(params: ProductSearchParams): Observable<PaginatedResponse<Product>> {
    const query: Record<string, string> = {};
    if (params.search) query['search'] = params.search;
    if (params.category !== undefined && params.category !== null) query['category'] = String(params.category);
    if (params.isActive !== undefined) query['isActive'] = String(params.isActive);
    return this.api.getPaginatedAdapted<any>('products', { page: params.page, limit: params.limit }, query).pipe(
      map((response) => ({
        ...response,
        items: response.items.map(mapProduct),
      }))
    );
  }
}
