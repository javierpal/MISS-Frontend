import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from './api-client.service';
import { PageParams, PaginatedResponse } from '../models/pagination.model';
import { Product, CreateProductDto, UpdateProductDto, ProductSearchParams } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private api = inject(ApiClientService);

  list(params?: PageParams): Observable<PaginatedResponse<Product>> {
    return this.api.getPaginated<PaginatedResponse<Product>>('products', params);
  }

  getAll(): Observable<Product[]> {
    return this.api.get<Product[]>('products');
  }

  getById(id: number | string): Observable<Product> {
    return this.api.get<Product>(`products/${id}`);
  }

  create(body: CreateProductDto): Observable<Product> {
    return this.api.post<Product>('products', body);
  }

  update(id: number | string, body: UpdateProductDto): Observable<Product> {
    return this.api.put<Product>(`products/${id}`, body);
  }

  patch(id: number | string, body: UpdateProductDto): Observable<Product> {
    return this.api.patch<Product>(`products/${id}`, body);
  }

  delete(id: number | string): Observable<void> {
    return this.api.delete<void>(`products/${id}`);
  }

  search(params: ProductSearchParams): Observable<Product[]> {
    const query: Record<string, string> = {};
    if (params.query) query['query'] = params.query;
    if (params.sku) query['sku'] = params.sku;
    if (params.barcode) query['barcode'] = params.barcode;
    if (params.active !== undefined) query['active'] = String(params.active);
    return this.api.get<Product[]>('products/search', query);
  }
}
