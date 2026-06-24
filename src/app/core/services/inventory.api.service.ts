import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from './api-client.service';
import {
  InventoryStock,
  CreateInventoryEntryDto,
  CreateInventoryAdjustmentDto,
  KardexMovement,
  KardexQueryParams,
} from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
  private api = inject(ApiClientService);

  /** Get all stock records */
  getStock(): Observable<InventoryStock[]> {
    return this.api.get<InventoryStock[]>('inventory/stock');
  }

  /** Get stock for a specific product */
  getStockByProduct(productId: string | number): Observable<InventoryStock> {
    return this.api.get<InventoryStock>(`inventory/stock/${productId}`);
  }

  /** Create an inventory entry (stock increase) */
  createEntry(body: CreateInventoryEntryDto): Observable<void> {
    return this.api.post<void>('inventory/entries', body);
  }

  /** Create an inventory adjustment */
  createAdjustment(body: CreateInventoryAdjustmentDto): Observable<void> {
    return this.api.post<void>('inventory/adjustments', body);
  }

  /** Get kardex movements for a product */
  getKardex(productId: string | number, params?: KardexQueryParams): Observable<KardexMovement[]> {
    const query: Record<string, string> = {};
    if (params?.page) query['page'] = String(params.page);
    if (params?.limit) query['limit'] = String(params.limit);
    if (params?.type) query['type'] = params.type;
    return this.api.get<KardexMovement[]>(`inventory/kardex/${productId}`, query);
  }
}
