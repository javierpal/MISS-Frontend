import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiClientService } from './api-client.service';
import {
  InventoryStock,
  ProductStockResponse,
  CreateInventoryEntryDto,
  CreateInventoryAdjustmentDto,
  KardexResponse,
  KardexQueryParams,
  StockQueryParams,
  StockPaginatedResponse,
  InventoryLot,
  InventoryQueryParams,
  InventoryPaginatedResponse,
} from '../models/inventory.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
  private api = inject(ApiClientService);

  /** Get paginated stock records */
  getStock(params?: StockQueryParams): Observable<StockPaginatedResponse> {
    const query: Record<string, string> = {};
    if (params?.page) query['page'] = String(params.page);
    if (params?.limit) query['limit'] = String(params.limit);
    return this.api.get<StockPaginatedResponse>('inventory/stock', query);
  }

  /** Get stock for a specific product */
  getStockByProduct(productId: string | number): Observable<ProductStockResponse> {
    return this.api.get<ApiResponse<ProductStockResponse>>(`inventory/stock/${productId}`).pipe(
      map((res: ApiResponse<ProductStockResponse>) => res.data!),
    );
  }

  /** Create an inventory entry (stock increase) */
  createEntry(body: CreateInventoryEntryDto): Observable<void> {
    return this.api.post<void>('inventory/entries', body);
  }

  /** Create an inventory adjustment */
  createAdjustment(body: CreateInventoryAdjustmentDto): Observable<void> {
    return this.api.post<void>('inventory/adjustments', body);
  }

  /** Get kardex movements for a product (no pagination, optional filters) */
  getKardex(productId: string | number, params?: KardexQueryParams): Observable<KardexResponse> {
    const query: Record<string, string> = {};
    if (params?.type) query['type'] = params.type;
    if (params?.from) query['from'] = params.from;
    if (params?.to) query['to'] = params.to;
    return this.api.get<KardexResponse>(`inventory/kardex/${productId}`, query);
  }

  /** Get paginated inventory lots */
  getInventory(params?: InventoryQueryParams): Observable<InventoryPaginatedResponse> {
    const query: Record<string, string> = {};
    if (params?.page) query['page'] = String(params.page);
    if (params?.limit) query['limit'] = String(params.limit);
    if (params?.name) query['name'] = params.name;
    if (params?.productId) query['productId'] = String(params.productId);
    return this.api.get<InventoryPaginatedResponse>('inventory', query);
  }
}
